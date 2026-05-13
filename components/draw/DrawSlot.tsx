'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface DrawSlotProps {
  items: string[]
  result: string
  onComplete: () => void
}

export function DrawSlot({ items, result, onComplete }: DrawSlotProps) {
  const [offset, setOffset] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultIdx = Math.max(items.findIndex((item) => item === result), 0)

  useEffect(() => {
    let frame = 0
    let currentOffset = 0

    function step() {
      frame++

      if (frame < 22) {
        currentOffset = (currentOffset + 1) % items.length
        setOffset(currentOffset)
        timerRef.current = setTimeout(step, 55 + frame * 1.5)
      } else if (frame < 36) {
        currentOffset = (currentOffset + 1) % items.length
        setOffset(currentOffset)
        timerRef.current = setTimeout(step, 90 + (frame - 22) * 38)
      } else {
        setIsDone(true)
        setOffset(resultIdx)
        timerRef.current = setTimeout(onComplete, 750)
      }
    }

    timerRef.current = setTimeout(step, 60)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, []) // intentionally run once on mount

  return (
    <div className="relative h-20 overflow-hidden rounded-2xl bg-white border-2 border-[#FF6B9D]/25 shadow-inner flex items-center justify-center">
      <motion.p
        key={`${offset}-${isDone}`}
        initial={{ y: isDone ? -6 : -14, opacity: isDone ? 0.5 : 0.55 }}
        animate={{ y: 0, opacity: 1, scale: isDone ? 1.08 : 1 }}
        transition={{
          duration: isDone ? 0.45 : 0.07,
          ease: isDone ? [0.34, 1.56, 0.64, 1] : 'linear',
        }}
        className={`text-xl font-bold px-4 text-center leading-snug ${
          isDone ? 'text-[#FF6B9D]' : 'text-[#3A3A3C]'
        }`}
      >
        {items[offset] ?? result}
      </motion.p>
      <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
    </div>
  )
}
