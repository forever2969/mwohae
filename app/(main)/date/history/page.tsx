import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DateHistoryList } from '@/components/date/DateHistoryList'
import type { DateSession } from '@/types'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: couple } = await supabase
    .from('couples')
    .select('id')
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'accepted')
    .maybeSingle()

  const { data: sessions } = couple
    ? await supabase
        .from('date_sessions')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
    : { data: [] }

  const list = (sessions ?? []) as DateSession[]

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-5 py-6 gap-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-[#8E8E93] p-1 -ml-1">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-[#1C1C1E]">데이트 기록</h1>
        </div>
        {list.length > 0 && (
          <span className="text-sm text-[#8E8E93] font-medium">총 {list.length}번</span>
        )}
      </div>

      <DateHistoryList sessions={list} />
    </div>
  )
}
