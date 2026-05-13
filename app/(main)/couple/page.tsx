'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCouple } from '@/hooks/useCouple'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { HeartParticles } from '@/components/ui/HeartParticles'

export default function CouplePage() {
  const { couple, partner, myProfile, loading, sendRequest, acceptRequest, rejectRequest, cancelRequest } =
    useCouple()
  const [code, setCode] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showHearts, setShowHearts] = useState(false)

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    setToast({ message, type })
  }

  async function handleAction(fn: () => Promise<void>, successMsg: string, withHearts = false) {
    setActionLoading(true)
    try {
      await fn()
      showToast(successMsg, 'success')
      if (withHearts) {
        setShowHearts(true)
        setTimeout(() => setShowHearts(false), 3000)
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : '오류가 발생했어요', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  function handleCopyCode() {
    if (!myProfile?.unique_code) return
    navigator.clipboard.writeText(myProfile.unique_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <CoupleSkeleton />

  return (
    <>
      <HeartParticles active={showHearts} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 수락된 커플 */}
      {couple?.status === 'accepted' && partner ? (
        <AcceptedView partner={partner} myProfile={myProfile} couple={couple} />
      ) : couple?.status === 'pending' && myProfile && couple.requester_id === myProfile.id ? (
        /* 신청 보낸 상태 */
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6 gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-full bg-[#FFE8F0] flex items-center justify-center text-4xl"
            >
              💌
            </motion.div>
            <h2 className="text-xl font-bold text-[#1C1C1E]">수락을 기다리고 있어요</h2>
            <p className="text-[#8E8E93] text-sm">
              상대방이 아직 신청을 확인하지 않았어요.<br />조금만 기다려주세요 💗
            </p>
            {partner && (
              <div className="flex items-center gap-2 bg-[#FFE8F0] px-5 py-3 rounded-2xl">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#FF6B9D]/20">
                  {partner.avatar_url ? (
                    <Image src={partner.avatar_url} alt={partner.kakao_nickname ?? ''} width={32} height={32} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#FF6B9D] text-sm">👤</div>
                  )}
                </div>
                <span className="text-sm font-semibold text-[#FF6B9D]">{partner.kakao_nickname}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="md"
            loading={actionLoading}
            onClick={() => handleAction(cancelRequest, '신청을 취소했어요')}
          >
            신청 취소
          </Button>
        </div>
      ) : couple?.status === 'pending' && myProfile && couple.receiver_id === myProfile.id ? (
        /* 신청 받은 상태 */
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6 gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl"
            >
              💝
            </motion.div>
            <h2 className="text-xl font-bold text-[#1C1C1E]">커플 신청이 왔어요!</h2>
            {partner && (
              <div className="flex items-center gap-3 bg-[#FFE8F0] px-6 py-4 rounded-2xl">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FF6B9D]/20">
                  {partner.avatar_url ? (
                    <Image src={partner.avatar_url} alt={partner.kakao_nickname ?? ''} width={48} height={48} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#FF6B9D]">👤</div>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#1C1C1E]">{partner.kakao_nickname}</p>
                  <p className="text-xs text-[#8E8E93]">커플을 신청했어요</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 w-full max-w-sm">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              loading={actionLoading}
              onClick={() => handleAction(rejectRequest, '신청을 거절했어요')}
            >
              거절
            </Button>
            <motion.div className="flex-1" whileTap={{ scale: 0.96 }}>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                loading={actionLoading}
                onClick={() => handleAction(acceptRequest, '커플이 됐어요 💗', true)}
              >
                수락하기
              </Button>
            </motion.div>
          </div>
        </div>
      ) : (
        /* 커플 없는 상태 */
        <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 gap-8">
          <div className="flex flex-col items-center gap-2 text-center pt-4">
            <div className="text-5xl mb-1">💔</div>
            <h2 className="text-xl font-bold text-[#1C1C1E]">아직 커플이 없어요</h2>
            <p className="text-[#8E8E93] text-sm">코드를 공유하거나 상대방 코드를 입력해보세요</p>
          </div>

          {/* 내 코드 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2F2F7]">
            <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-widest mb-3">내 코드</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold tracking-[0.2em] text-[#1C1C1E]">
                {myProfile?.unique_code ?? '------'}
              </span>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 bg-[#FFE8F0] text-[#FF6B9D] text-sm font-semibold px-4 py-2 rounded-xl"
              >
                {copied ? '✓ 복사됨' : '복사'}
              </motion.button>
            </div>
            <p className="text-xs text-[#8E8E93] mt-3">이 코드를 상대방에게 알려주세요</p>
          </div>

          {/* 코드 입력 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2F2F7]">
            <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-widest mb-3">상대방 코드</p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="코드 6자리 입력"
              maxLength={6}
              className="w-full text-2xl font-bold tracking-[0.2em] text-[#1C1C1E] placeholder:text-[#C7C7CC] placeholder:text-base placeholder:tracking-normal border-b-2 border-[#F2F2F7] focus:border-[#FF6B9D] outline-none pb-2 mb-4 transition-colors bg-transparent"
            />
            <Button
              variant="primary"
              size="lg"
              loading={actionLoading}
              disabled={code.trim().length !== 6}
              onClick={() => handleAction(() => sendRequest(code), '커플 신청을 보냈어요 💌')}
            >
              커플 신청하기
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

function AcceptedView({
  partner,
  myProfile,
  couple,
}: {
  partner: NonNullable<ReturnType<typeof useCouple>['partner']>
  myProfile: ReturnType<typeof useCouple>['myProfile']
  couple: NonNullable<ReturnType<typeof useCouple>['couple']>
}) {
  const acceptedAt = couple.accepted_at ? new Date(couple.accepted_at) : new Date(couple.created_at)
  const now = new Date()
  const days = Math.floor((now.getTime() - acceptedAt.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-5rem)] px-6 py-8">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-b from-[#FFE8F0] to-white rounded-3xl p-8 flex flex-col items-center gap-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#FFE8F0]">
                {myProfile?.avatar_url ? (
                  <Image src={myProfile.avatar_url} alt={myProfile.kakao_nickname ?? ''} width={80} height={80} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                )}
              </div>
              <span className="text-xs font-semibold text-[#1C1C1E]">{myProfile?.kakao_nickname}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-3xl"
              >
                💗
              </motion.span>
              <span className="text-xs text-[#FF6B9D] font-semibold">{days}일째</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#FFE8F0]">
                {partner.avatar_url ? (
                  <Image src={partner.avatar_url} alt={partner.kakao_nickname ?? ''} width={80} height={80} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                )}
              </div>
              <span className="text-xs font-semibold text-[#1C1C1E]">{partner.kakao_nickname}</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#8E8E93]">
              {acceptedAt.getFullYear()}년 {acceptedAt.getMonth() + 1}월 {acceptedAt.getDate()}일부터 함께해요
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function CoupleSkeleton() {
  return (
    <div className="flex flex-col px-6 py-8 gap-6 animate-pulse">
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="w-16 h-16 rounded-full bg-[#F2F2F7]" />
        <div className="w-32 h-5 rounded-full bg-[#F2F2F7]" />
        <div className="w-48 h-4 rounded-full bg-[#F2F2F7]" />
      </div>
      <div className="bg-white rounded-3xl p-6 border border-[#F2F2F7] gap-3 flex flex-col">
        <div className="w-16 h-3 rounded-full bg-[#F2F2F7]" />
        <div className="w-32 h-8 rounded-full bg-[#F2F2F7]" />
      </div>
      <div className="bg-white rounded-3xl p-6 border border-[#F2F2F7] gap-3 flex flex-col">
        <div className="w-16 h-3 rounded-full bg-[#F2F2F7]" />
        <div className="w-full h-10 rounded-xl bg-[#F2F2F7]" />
        <div className="w-full h-12 rounded-2xl bg-[#F2F2F7]" />
      </div>
    </div>
  )
}
