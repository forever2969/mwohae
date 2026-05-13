'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleKakaoLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: 'profile_nickname profile_image',
      },
    })
    if (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col flex-1 items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-white px-6">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        {/* 로고 영역 */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">💑</div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            오늘은 뭐해?
          </h1>
          <p className="text-gray-500 text-center text-sm leading-relaxed">
            커플이 함께 랜덤으로<br />데이트 코스를 뽑아보세요
          </p>
        </div>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-[#FEE500] text-[#3A1D1D] font-semibold text-base transition-opacity disabled:opacity-60 active:opacity-80"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-[#3A1D1D]/30 border-t-[#3A1D1D] rounded-full animate-spin" />
          ) : (
            <KakaoIcon />
          )}
          카카오로 시작하기
        </button>

        <p className="text-xs text-gray-400 text-center">
          로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다
        </p>
      </div>
    </main>
  )
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C5.582 2 2 4.925 2 8.523c0 2.26 1.413 4.247 3.556 5.427L4.74 17.1a.3.3 0 0 0 .434.337l4.05-2.7A9.3 9.3 0 0 0 10 14.9c4.418 0 8-2.925 8-6.523S14.418 2 10 2z"
        fill="#3A1D1D"
      />
    </svg>
  )
}
