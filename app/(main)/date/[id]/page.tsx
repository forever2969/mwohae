'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useDate } from '@/hooks/useDate'
import { Button } from '@/components/ui/Button'
import { Confetti } from '@/components/ui/Confetti'
import { DrawSlot } from '@/components/draw/DrawSlot'
import { calculateDraw, type DrawResult } from '@/lib/utils/draw'
import { formatDate } from '@/lib/utils/date'
import { SUBWAY_LINES } from '@/lib/data/subway'

const STEP_LABELS = ['호선 뽑기', '방향 뽑기', '역 뽑기', '오늘의 역!', '점심 메뉴', '디저트', '오후 활동', '저녁 메뉴']
const STEP_EMOJIS = ['🚇', '🧭', '📍', '🎉', '🍽️', '🍰', '🎮', '🌙']
const STEP_DESC = [
  '몇 호선으로 갈까요?',
  '어느 방향으로 갈까요?',
  '몇 번째 역으로 갈까요?',
  '오늘의 데이트 장소가 결정됐어요!',
  '점심은 뭐 먹을까요?',
  '달콤한 디저트는?',
  '오후엔 뭐 할까요?',
  '마무리 저녁은 뭘로 할까요?',
]

export default function DatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { session, couple, isMyTurn, loading, drawing, error, saveDraw } = useDate(id)
  const [pendingResult, setPendingResult] = useState<DrawResult | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  if (loading) return <DrawSkeleton />

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] gap-4">
        <p className="text-[#8E8E93]">{error ?? '세션을 찾을 수 없어요'}</p>
        <Link href="/home" className="text-[#FF6B9D] font-semibold">홈으로</Link>
      </div>
    )
  }

  const step = session.current_step
  const isCompleted = session.status === 'completed'

  if (isCompleted) {
    return <CompletedView session={session} />
  }

  const lineName = session.line ? SUBWAY_LINES.find((l) => l.line === session.line)?.name : null
  const lineColor = session.line ? SUBWAY_LINES.find((l) => l.line === session.line)?.color : null
  const directionLabel = session.direction === 'left' ? '왼쪽 방향' : session.direction === 'right' ? '오른쪽 방향' : null
  const isStation3 = step === 3

  function handleDraw() {
    if (!session || !couple || !isMyTurn || isSpinning || drawing) return
    const result = calculateDraw(session, couple)
    if (!result) return

    if (!result.slotItems.length || !result.displayValue) {
      // No animation for confirm step
      saveDraw(result.updates)
    } else {
      setPendingResult(result)
      setIsSpinning(true)
    }
  }

  async function handleSlotComplete() {
    if (!pendingResult) return
    setIsSpinning(false)
    await saveDraw(pendingResult.updates)
    setPendingResult(null)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F2F2F7]">
        <Link href="/home" className="text-[#8E8E93] p-1">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <h1 className="font-bold text-[#1C1C1E] text-base">
            {session.date ? formatDate(session.date) : ''} 데이트
          </h1>
          <p className="text-xs text-[#8E8E93]">{step < 8 ? `${step + 1} / 8 단계` : '완료'}</p>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="flex items-center gap-1.5 px-5 py-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full flex-1"
            animate={{
              backgroundColor:
                i < step ? '#FF6B9D' : i === step ? 'rgba(255,107,157,0.4)' : '#F2F2F7',
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 px-5 pb-6 flex-1">
        {/* 완료된 단계 결과 */}
        {step > 0 && (
          <div className="flex flex-col gap-2">
            {session.line && (
              <ResultChip label="호선" value={`${session.line}호선`} color={lineColor ?? '#FF6B9D'} />
            )}
            {session.direction && (
              <ResultChip label="방향" value={directionLabel!} />
            )}
            {session.station_name && (
              <ResultChip label="📍 오늘의 장소" value={`${session.station_name}역`} highlight />
            )}
            {session.lunch && <ResultChip label="점심" value={session.lunch} />}
            {session.dessert && <ResultChip label="디저트" value={session.dessert} />}
            {session.activity && <ResultChip label="오후 활동" value={session.activity} />}
          </div>
        )}

        {/* 현재 단계 카드 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col items-center text-center rounded-3xl p-7 gap-5 mt-auto ${
              isStation3
                ? 'bg-gradient-to-b from-[#FFE8F0] to-white border border-[#FFD4E8]'
                : isMyTurn
                ? 'bg-gradient-to-b from-[#FFE8F0] to-white border border-[#FFD4E8]'
                : 'bg-[#F8F8F8] border border-[#F2F2F7]'
            }`}
          >
            <motion.div
              animate={isMyTurn && !isSpinning ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              {isStation3 ? '🎉' : STEP_EMOJIS[step]}
            </motion.div>

            {isStation3 ? (
              <>
                <div>
                  <p className="text-xs font-semibold text-[#FF6B9D] uppercase tracking-widest mb-2">오늘의 데이트 장소</p>
                  <h2 className="text-3xl font-bold text-[#1C1C1E]">{session.station_name}역</h2>
                  <p className="text-[#8E8E93] text-sm mt-1">{lineName} · {directionLabel}</p>
                </div>
                {isMyTurn ? (
                  <Button variant="primary" size="lg" loading={drawing} onClick={handleDraw}>
                    좋아, 계속하기!
                  </Button>
                ) : (
                  <WaitingPulse />
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-widest mb-1">
                    {STEP_LABELS[step]}
                  </p>
                  <p className="text-[#1C1C1E] font-medium">{STEP_DESC[step]}</p>
                </div>

                <AnimatePresence mode="wait">
                  {isSpinning && pendingResult ? (
                    <motion.div
                      key="slot"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="w-full"
                    >
                      <DrawSlot
                        items={pendingResult.slotItems}
                        result={pendingResult.displayValue}
                        onComplete={handleSlotComplete}
                      />
                    </motion.div>
                  ) : drawing ? (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-sm text-[#8E8E93]"
                    >
                      <span className="w-4 h-4 border-2 border-[#FF6B9D]/30 border-t-[#FF6B9D] rounded-full animate-spin" />
                      저장 중...
                    </motion.div>
                  ) : isMyTurn ? (
                    <motion.div
                      key="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2 w-full"
                    >
                      <p className="text-sm text-[#FF6B9D] font-semibold">내 차례예요!</p>
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="w-full"
                      >
                        <Button variant="primary" size="lg" onClick={handleDraw}>
                          🎲 뽑기!
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <WaitingPulse />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ResultChip({ label, value, color, highlight }: {
  label: string
  value: string
  color?: string
  highlight?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center justify-between px-4 py-3 rounded-2xl ${
        highlight ? 'bg-[#FFE8F0]' : 'bg-white border border-[#F2F2F7]'
      }`}
    >
      <span className={`text-xs font-medium ${highlight ? 'text-[#FF6B9D]' : 'text-[#8E8E93]'}`}>{label}</span>
      <span
        className={`font-bold text-sm ${highlight ? 'text-[#FF6B9D]' : 'text-[#1C1C1E]'}`}
        style={color ? { color } : {}}
      >
        {value}
      </span>
    </motion.div>
  )
}

function WaitingPulse() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[#FF6B9D]/50"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <p className="text-sm text-[#8E8E93]">상대방이 뽑고 있어요</p>
    </div>
  )
}

function CompletedView({ session }: { session: ReturnType<typeof useDate>['session'] }) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 200)
    const t2 = setTimeout(() => setShowConfetti(false), 4000)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])

  if (!session) return null

  const items = [
    { label: '📍 장소', value: `${session.station_name}역` },
    { label: '🍽️ 점심', value: session.lunch! },
    { label: '🍰 디저트', value: session.dessert! },
    { label: '🎮 오후 활동', value: session.activity! },
    { label: '🌙 저녁', value: session.dinner! },
  ]

  return (
    <>
      <Confetti active={showConfetti} />
      <div className="flex flex-col min-h-[calc(100vh-5rem)] px-5 py-6 gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center text-center gap-3 py-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl"
          >
            🎊
          </motion.div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">데이트 코스 완성!</h1>
          <p className="text-[#8E8E93] text-sm">{session.title}</p>
        </motion.div>

        <div className="bg-white rounded-3xl border border-[#F2F2F7] overflow-hidden shadow-sm">
          {items.map(({ label, value }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
              className={`flex items-center justify-between px-5 py-4 ${
                i < items.length - 1 ? 'border-b border-[#F2F2F7]' : ''
              }`}
            >
              <span className="text-sm text-[#8E8E93]">{label}</span>
              <span className="font-bold text-[#1C1C1E]">{value}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="flex flex-col gap-3"
        >
          <Link
            href="/home"
            className="flex items-center justify-center h-14 bg-[#FF6B9D] text-white font-bold rounded-2xl shadow-sm shadow-[#FF6B9D]/30 active:scale-[0.97] transition-transform"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/date/history"
            className="flex items-center justify-center h-12 text-[#8E8E93] text-sm font-medium active:opacity-60 transition-opacity"
          >
            데이트 기록 보기
          </Link>
        </motion.div>
      </div>
    </>
  )
}

function DrawSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 py-4 animate-pulse">
      <div className="flex gap-2 items-center py-2">
        <div className="w-6 h-6 rounded-full bg-[#F2F2F7]" />
        <div className="w-32 h-5 rounded-full bg-[#F2F2F7]" />
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-[#F2F2F7]" />
        ))}
      </div>
      <div className="h-64 rounded-3xl bg-[#F2F2F7] mt-4" />
    </div>
  )
}
