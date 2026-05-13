'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeSession } from '@/hooks/useRealtime'
import type { Couple, DateSession, Profile } from '@/types'

interface UseDateReturn {
  session: DateSession | null
  couple: Couple | null
  myProfile: Profile | null
  isMyTurn: boolean
  isRequester: boolean
  loading: boolean
  drawing: boolean
  error: string | null
  saveDraw: (updates: Record<string, unknown>) => Promise<void>
  refresh: () => Promise<void>
}

export function useDate(sessionId: string): UseDateReturn {
  const [session, setSession] = useState<DateSession | null>(null)
  const [couple, setCouple] = useState<Couple | null>(null)
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const myIdRef = useRef<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchSession = useCallback(async () => {
    const { data } = await supabase
      .from('date_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    if (data) setSession(data)
    return data
  }, [sessionId, supabase])

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const [{ data: authData }, { data: sessionData }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from('date_sessions').select('*').eq('id', sessionId).single(),
        ])

        if (!authData.user || !sessionData) {
          setError('세션을 찾을 수 없어요')
          return
        }

        myIdRef.current = authData.user.id
        setSession(sessionData)

        const [{ data: profileData }, { data: coupleData }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', authData.user.id).single(),
          supabase.from('couples').select('*').eq('id', sessionData.couple_id).single(),
        ])

        setMyProfile(profileData)
        setCouple(coupleData)
      } catch {
        setError('데이터를 불러오는 중 오류가 발생했어요')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [sessionId, supabase])

  // Realtime 구독 — 상대방이 뽑으면 즉시 반영
  useRealtimeSession(sessionId, setSession)

  const isMyTurn = !!session && !!myIdRef.current && session.current_turn === myIdRef.current
  const isRequester = couple?.requester_id === myIdRef.current

  async function saveDraw(updates: Record<string, unknown>) {
    if (!session || drawing) return
    setDrawing(true)
    try {
      const { error: updateError } = await supabase
        .from('date_sessions')
        .update(updates)
        .eq('id', sessionId)
      if (updateError) throw updateError
      await fetchSession()
    } catch {
      setError('저장 중 오류가 발생했어요')
    } finally {
      setDrawing(false)
    }
  }

  return {
    session,
    couple,
    myProfile,
    isMyTurn,
    isRequester,
    loading,
    drawing,
    error,
    saveDraw,
    refresh: fetchSession,
  }
}
