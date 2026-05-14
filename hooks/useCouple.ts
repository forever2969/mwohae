'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeCouple } from '@/hooks/useRealtime'
import { sendPushNotification } from '@/lib/utils/notify'
import type { Couple, Profile } from '@/types'

interface UseCoupleReturn {
  couple: Couple | null
  partner: Profile | null
  myProfile: Profile | null
  loading: boolean
  error: string | null
  sendRequest: (code: string) => Promise<void>
  acceptRequest: () => Promise<void>
  rejectRequest: () => Promise<void>
  cancelRequest: () => Promise<void>
  dissolveCouple: () => Promise<void>
  refresh: () => void
}

export function useCouple(): UseCoupleReturn {
  const [couple, setCouple] = useState<Couple | null>(null)
  const [partner, setPartner] = useState<Profile | null>(null)
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setMyProfile(profile)

      const { data: coupleData } = await supabase
        .from('couples')
        .select('*')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .neq('status', 'dissolved')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setCouple(coupleData)

      if (coupleData) {
        const partnerId =
          coupleData.requester_id === user.id
            ? coupleData.receiver_id
            : coupleData.requester_id

        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .single()
        setPartner(partnerProfile)
      } else {
        setPartner(null)
      }
    } catch (e) {
      setError('데이터를 불러오는 중 오류가 발생했어요')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Realtime 구독 — 커플 신청/수락/거절 즉시 반영
  useRealtimeCouple(myProfile?.id ?? null, couple?.id ?? null, fetchData)

  async function sendRequest(code: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('로그인이 필요해요')

    const trimmed = code.trim().toUpperCase()
    if (trimmed === myProfile?.unique_code) {
      throw new Error('자신에게 신청할 수 없어요')
    }

    const { data: target, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('unique_code', trimmed)
      .maybeSingle()

    if (profileError || !target) {
      throw new Error('해당 코드의 사용자를 찾을 수 없어요')
    }

    const { data: existingCouple } = await supabase
      .from('couples')
      .select('id')
      .or(`requester_id.eq.${target.id},receiver_id.eq.${target.id}`)
      .neq('status', 'dissolved')
      .maybeSingle()

    if (existingCouple) {
      throw new Error('상대방이 이미 다른 커플 관계에 있어요')
    }

    const { error: insertError } = await supabase.from('couples').insert({
      requester_id: user.id,
      receiver_id: target.id,
    })

    if (insertError) throw new Error('커플 신청에 실패했어요')

    await sendPushNotification({
      targetUserId: target.id,
      title: '💌 커플 신청이 왔어요!',
      body: `${myProfile?.kakao_nickname ?? '누군가'}가 커플 신청을 보냈어요`,
      url: '/couple',
    })

    await fetchData()
  }

  async function acceptRequest() {
    if (!couple) return
    const { error } = await supabase
      .from('couples')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', couple.id)
    if (error) throw new Error('수락에 실패했어요')

    await sendPushNotification({
      targetUserId: couple.requester_id,
      title: '💗 커플 신청이 수락됐어요!',
      body: `${myProfile?.kakao_nickname ?? '상대방'}이 커플을 수락했어요`,
      url: '/couple',
    })

    await fetchData()
  }

  async function rejectRequest() {
    if (!couple) return
    const { error } = await supabase
      .from('couples')
      .update({ status: 'dissolved', dissolved_at: new Date().toISOString() })
      .eq('id', couple.id)
    if (error) throw new Error('거절에 실패했어요')
    await fetchData()
  }

  async function cancelRequest() {
    if (!couple) return
    const { error } = await supabase
      .from('couples')
      .update({ status: 'dissolved', dissolved_at: new Date().toISOString() })
      .eq('id', couple.id)
    if (error) throw new Error('취소에 실패했어요')
    await fetchData()
  }

  async function dissolveCouple() {
    if (!couple) return
    const { error } = await supabase
      .from('couples')
      .update({ status: 'dissolved', dissolved_at: new Date().toISOString() })
      .eq('id', couple.id)
    if (error) throw new Error('커플 해제에 실패했어요')
    await fetchData()
  }

  return {
    couple,
    partner,
    myProfile,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    dissolveCouple,
    refresh: fetchData,
  }
}
