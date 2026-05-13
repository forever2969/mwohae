'use client'

import { useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DateSession, Couple } from '@/types'

export function useRealtimeSession(
  sessionId: string | null,
  onUpdate: (session: DateSession) => void
) {
  const supabase = useMemo(() => createClient(), [])
  const callbackRef = useRef(onUpdate)
  useEffect(() => { callbackRef.current = onUpdate })

  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'date_sessions', filter: `id=eq.${sessionId}` },
        (payload) => callbackRef.current(payload.new as DateSession)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId, supabase])
}

export function useRealtimeCouple(
  userId: string | null,
  coupleId: string | null,
  onUpdate: () => void
) {
  const supabase = useMemo(() => createClient(), [])
  const callbackRef = useRef(onUpdate)
  useEffect(() => { callbackRef.current = onUpdate })

  useEffect(() => {
    if (!userId) return

    const channels: ReturnType<typeof supabase.channel>[] = []

    // 새 커플 신청 수신 감지
    channels.push(
      supabase
        .channel(`couple-new-${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'couples', filter: `receiver_id=eq.${userId}` },
          () => callbackRef.current()
        )
        .subscribe()
    )

    // 기존 커플 상태 변경 감지
    if (coupleId) {
      channels.push(
        supabase
          .channel(`couple-upd-${coupleId}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'couples', filter: `id=eq.${coupleId}` },
            () => callbackRef.current()
          )
          .subscribe()
      )
    }

    return () => { channels.forEach((ch) => supabase.removeChannel(ch)) }
  }, [userId, coupleId, supabase])
}
