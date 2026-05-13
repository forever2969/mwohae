'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigationStore } from '@/store/navigationStore'

export function NavigationLoader() {
  const { isNavigating, endNavigation } = useNavigationStore()
  const pathname = usePathname()

  // pathname 바뀌면 → 이동 완료
  useEffect(() => {
    endNavigation()
  }, [pathname, endNavigation])

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-white/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 pointer-events-none"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl"
          >
            💗
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-sm font-semibold text-[#FF6B9D]"
          >
            이동 중이에요
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
