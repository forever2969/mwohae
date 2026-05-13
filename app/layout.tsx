import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { ServiceWorkerRegister } from '@/components/ui/ServiceWorkerRegister'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '오늘은 뭐해?',
  description: '커플이 함께 랜덤으로 데이트 코스를 뽑는 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '오늘은 뭐해?',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF6B9D',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white font-sans antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
