import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL ?? 'push@mwohae.app'),
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface PushPayload {
  targetUserId: string
  title: string
  body: string
  url?: string
}

// 서비스 롤 클라이언트 — RLS 우회하여 다른 유저 구독 조회
function createAdmin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { targetUserId, title, body, url } = (await request.json()) as PushPayload

  const admin = createAdmin()
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', targetUserId)

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  const payload = JSON.stringify({ title, body, url: url ?? '/' })
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  )

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length) {
    const expiredEndpoints = subs
      .filter((_, i) => {
        const r = results[i]
        return r.status === 'rejected'
      })
      .map((s) => s.endpoint)

    await admin
      .from('push_subscriptions')
      .delete()
      .in('endpoint', expiredEndpoints)
      .eq('user_id', targetUserId)
  }

  return NextResponse.json({ ok: true, sent: results.length - failed.length })
}
