'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface PhotoUploadProps {
  sessionId: string
  initialPhotoUrl: string | null
}

export function PhotoUpload({ sessionId, initialPhotoUrl }: PhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = useMemo(() => createClient(), [])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('사진 크기는 10MB 이하여야 해요')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요해요')

      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${sessionId}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('date-photos')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('date-photos')
        .getPublicUrl(path)

      const { error: updateError } = await supabase
        .from('date_sessions')
        .update({ photo_url: publicUrl })
        .eq('id', sessionId)
      if (updateError) throw updateError

      // 캐시 방지용 타임스탬프
      setPhotoUrl(`${publicUrl}?t=${Date.now()}`)
    } catch {
      setError('사진 업로드에 실패했어요')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {photoUrl ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden"
        >
          <Image src={photoUrl} alt="데이트 사진" fill className="object-cover" />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-xl active:opacity-70 transition-opacity disabled:opacity-50"
          >
            {uploading ? '업로드 중...' : '사진 변경'}
          </button>
        </motion.div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-2 w-full py-6 border-2 border-dashed border-[#FFD4E8] rounded-2xl bg-[#FFF5F9] disabled:opacity-60"
        >
          {uploading ? (
            <>
              <span className="w-5 h-5 border-2 border-[#FF6B9D]/30 border-t-[#FF6B9D] rounded-full animate-spin" />
              <span className="text-sm font-semibold text-[#FF6B9D]">업로드 중...</span>
            </>
          ) : (
            <>
              <span className="text-3xl">📷</span>
              <span className="text-sm font-semibold text-[#FF6B9D]">사진 추가하기</span>
              <span className="text-xs text-[#FF6B9D]/60">이 데이트의 추억을 남겨보세요</span>
            </>
          )}
        </motion.button>
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  )
}
