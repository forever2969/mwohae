'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

async function subscribeAndSave() {
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    })
  }
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub.toJSON()),
  })
}

export function PushNotificationSetup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window) ||
      !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    ) return

    // 이미 결정된 경우
    if (Notification.permission === 'granted') {
      subscribeAndSave().catch(console.error)
      return
    }
    if (Notification.permission === 'denied') return

    // default 상태 → 배너 표시
    setShow(true)
  }, [])

  async function handleAllow() {
    setShow(false)
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      subscribeAndSave().catch(console.error)
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-4 right-4 z-[100] max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-[#FFE8F0] px-4 py-3 flex items-center gap-3"
        >
          <span className="text-2xl shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1C1C1E]">알림 받기</p>
            <p className="text-xs text-[#8E8E93] truncate">뽑기 차례, 커플 신청 알림을 받아요</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShow(false)}
              className="text-xs text-[#8E8E93] px-2 py-1"
            >
              나중에
            </button>
            <button
              onClick={handleAllow}
              className="text-xs font-semibold text-white bg-[#FF6B9D] px-3 py-1.5 rounded-xl"
            >
              허용
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
