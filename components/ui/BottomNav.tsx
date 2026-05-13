'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useNavigationStore } from '@/store/navigationStore'

const navItems = [
  {
    href: '/home',
    label: '홈',
    icon: (active: boolean) => (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"
          stroke={active ? '#FF6B9D' : '#C7C7CC'}
          strokeWidth="1.8"
          fill={active ? '#FFE8F0' : 'none'}
        />
        <path d="M9 21V12h6v9" stroke={active ? '#FF6B9D' : '#C7C7CC'} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: '/couple',
    label: '커플',
    icon: (active: boolean) => (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 21C12 21 3.5 15.5 3.5 9.5a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2C20.5 15.5 12 21 12 21z"
          stroke={active ? '#FF6B9D' : '#C7C7CC'}
          strokeWidth="1.8"
          fill={active ? '#FF6B9D' : 'none'}
        />
      </svg>
    ),
  },
  {
    href: '/date/history',
    label: '기록',
    icon: (active: boolean) => (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="3"
          stroke={active ? '#FF6B9D' : '#C7C7CC'} strokeWidth="1.8"
          fill={active ? '#FFE8F0' : 'none'}
        />
        <path d="M8 2v4M16 2v4M3 10h18"
          stroke={active ? '#FF6B9D' : '#C7C7CC'} strokeWidth="1.8" strokeLinecap="round"
        />
        <circle cx="8" cy="15" r="1" fill={active ? '#FF6B9D' : '#C7C7CC'} />
        <circle cx="12" cy="15" r="1" fill={active ? '#FF6B9D' : '#C7C7CC'} />
        <circle cx="16" cy="15" r="1" fill={active ? '#FF6B9D' : '#C7C7CC'} />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: '프로필',
    icon: (active: boolean) => (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"
          stroke={active ? '#FF6B9D' : '#C7C7CC'} strokeWidth="1.8"
          fill={active ? '#FFE8F0' : 'none'}
        />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke={active ? '#FF6B9D' : '#C7C7CC'} strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { startNavigation } = useNavigationStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#F2F2F7] pb-safe z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <motion.div key={href} whileTap={{ scale: 0.8 }} transition={{ duration: 0.1 }}>
              <Link
                href={href}
                onClick={() => { if (!active) startNavigation() }}
                className="flex flex-col items-center gap-1 px-4 py-2"
              >
                {icon(active)}
                <span className={`text-[10px] font-medium ${active ? 'text-[#FF6B9D]' : 'text-[#C7C7CC]'}`}>
                  {label}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
