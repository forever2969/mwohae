'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface StartDateButtonProps {
  coupleId: string
  userId: string
}

export function StartDateButton({ coupleId, userId }: StartDateButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleStart() {
    setLoading(true)
    try {
      const { data: existing } = await supabase
        .from('date_sessions')
        .select('id')
        .eq('couple_id', coupleId)
        .eq('status', 'in_progress')
        .maybeSingle()

      if (existing) {
        router.push(`/date/${existing.id}`)
        return
      }

      const { data: session, error } = await supabase
        .from('date_sessions')
        .insert({
          couple_id: coupleId,
          date: new Date().toISOString().split('T')[0],
          current_turn: userId,
          current_step: 0,
          status: 'in_progress',
        })
        .select('id')
        .single()

      if (error || !session) throw error
      router.push(`/date/${session.id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="bg-white text-[#FF6B9D] font-bold px-6 py-3 rounded-2xl text-base w-full active:scale-[0.97] transition-transform disabled:opacity-60"
    >
      {loading ? '시작 중...' : '뽑기 시작하기 🎲'}
    </button>
  )
}
