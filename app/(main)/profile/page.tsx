import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-5 py-6 gap-6">
      <h1 className="text-xl font-bold text-[#1C1C1E]">프로필</h1>

      <div className="flex flex-col items-center gap-4 py-6 bg-white rounded-3xl border border-[#F2F2F7] shadow-sm">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#FFE8F0] bg-[#FFE8F0]">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.kakao_nickname ?? ''} width={80} height={80} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
          )}
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-[#1C1C1E]">{profile?.kakao_nickname}</p>
          <p className="text-sm text-[#8E8E93] mt-1">내 코드: <span className="font-mono font-bold text-[#FF6B9D]">{profile?.unique_code}</span></p>
        </div>
      </div>

      <form action={handleSignOut}>
        <button
          type="submit"
          className="w-full py-4 rounded-2xl border border-red-200 text-red-500 font-semibold text-base active:scale-[0.97] transition-transform"
        >
          로그아웃
        </button>
      </form>
    </div>
  )
}
