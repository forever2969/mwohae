'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SUBWAY_LINES } from '@/lib/data/subway'
import type { DateSession } from '@/types'

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']

function formatKo(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_KO[d.getDay()]})`
}

const ITEM_ROWS = [
  { key: 'lunch' as const, label: '🍽️ 점심' },
  { key: 'dessert' as const, label: '🍰 디저트' },
  { key: 'activity' as const, label: '🎮 오후' },
  { key: 'dinner' as const, label: '🌙 저녁' },
]

interface Props {
  sessions: DateSession[]
}

export function DateHistoryList({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-24"
      >
        <span className="text-6xl">🗓</span>
        <p className="text-[#8E8E93] leading-relaxed">
          아직 완료된 데이트가 없어요<br />첫 번째 데이트를 시작해보세요!
        </p>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((s, i) => {
        const lineData = SUBWAY_LINES.find((l) => l.line === s.line)
        const directionLabel = s.direction === 'left' ? '왼쪽 방향' : '오른쪽 방향'

        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
          >
            <Link href={`/date/${s.id}`}>
              <div className="bg-white rounded-3xl border border-[#F2F2F7] shadow-sm overflow-hidden active:scale-[0.98] transition-transform">
                {/* 상단: 호선 색상 바 + 날짜 */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: lineData?.color ?? '#FF6B9D' }}
                />
                <div className="px-5 pt-4 pb-5 flex flex-col gap-4">
                  {/* 제목 행 */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-bold text-[#1C1C1E] text-base">
                        {s.station_name}역 데이트
                      </h3>
                      <p className="text-xs text-[#8E8E93]">{formatKo(s.date)}</p>
                    </div>
                    {lineData && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: lineData.color }}
                      >
                        {lineData.line}호선
                      </span>
                    )}
                  </div>

                  {/* 방향 */}
                  <p className="text-xs text-[#8E8E93] -mt-2">{directionLabel}</p>

                  {/* 아이템 그리드 */}
                  <div className="grid grid-cols-2 gap-2">
                    {ITEM_ROWS.map(({ key, label }) =>
                      s[key] ? (
                        <div key={key} className="bg-[#F8F8F8] rounded-2xl px-3 py-2.5">
                          <p className="text-[10px] text-[#8E8E93] font-medium mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-[#1C1C1E] truncate">{s[key]}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
