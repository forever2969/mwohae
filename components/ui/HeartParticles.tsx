'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

function rng(seed: number, scale: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280 * scale
}

interface HeartParticlesProps {
  active: boolean
}

export function HeartParticles({ active }: HeartParticlesProps) {
  const hearts = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: 5 + rng(i * 7 + 1, 90),
        delay: rng(i * 3 + 2, 1.2),
        size: 18 + rng(i * 5 + 3, 18),
        duration: 1.6 + rng(i * 11 + 4, 1.0),
        driftX: (rng(i * 13 + 5, 60) - 30),
      })),
    []
  )

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ x: `${h.x}vw`, y: '65vh', scale: 0, opacity: 0 }}
          animate={{
            y: '-15vh',
            x: `calc(${h.x}vw + ${h.driftX}px)`,
            scale: [0, 1, 1, 0.7],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: h.duration, delay: h.delay, ease: 'easeOut' }}
          style={{ position: 'absolute', fontSize: h.size }}
        >
          💗
        </motion.div>
      ))}
    </div>
  )
}
