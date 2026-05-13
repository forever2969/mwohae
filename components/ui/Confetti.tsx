'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#FF6B9D', '#FF8FB1', '#FFD700', '#FF4081', '#7C3AED', '#00BCD4', '#FF9800']

function rng(seed: number, scale: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280 * scale
}

interface ConfettiProps {
  active: boolean
}

export function Confetti({ active }: ConfettiProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        id: i,
        x: rng(i * 7 + 1, 100),
        delay: rng(i * 3 + 2, 1.6),
        color: COLORS[i % COLORS.length],
        size: 6 + rng(i * 5 + 3, 10),
        rotateEnd: rng(i * 11 + 4, 360) * (i % 2 === 0 ? 1 : -1),
        duration: 1.6 + rng(i * 13 + 5, 1.4),
        isCircle: i % 3 !== 0,
      })),
    []
  )

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: '105vh',
            rotate: p.rotateEnd * 3,
            opacity: [1, 1, 0.9, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}
