import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { StartDateButton } from '@/components/date/StartDateButton'
import { formatDate } from '@/lib/utils/date'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'accepted')
    .maybeSingle()

  const { data: recentSessions } = couple
    ? await supabase
        .from('date_sessions')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(3)
    : { data: null }

  const { data: inProgress } = couple
    ? await supabase
        .from('date_sessions')
        .select('id')
        .eq('couple_id', couple.id)
        .eq('status', 'in_progress')
        .maybeSingle()
    : { data: null }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-5 py-6 gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#8E8E93]">안녕하세요 👋</p>
          <h1 className="text-xl font-bold text-[#1C1C1E]">{profile?.kakao_nickname ?? '사용자'}님</h1>
        </div>
        {profile?.avatar_url && (
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFE8F0]">
            <Image src={profile.avatar_url} alt={profile.kakao_nickname ?? ''} width={40} height={40} className="object-cover" />
          </div>
        )}
      </div>

      {/* 커플 없는 경우 */}
      {!couple && (
        <div className="flex flex-col items-center justify-center flex-1 gap-6 text-center py-12">
          <div className="w-28 h-28 rounded-full bg-[#FFE8F0] flex items-center justify-center text-6xl">💑</div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#1C1C1E]">아직 커플이 없어요</h2>
            <p className="text-[#8E8E93] text-sm leading-relaxed">
              커플을 연결하면<br />함께 데이트 코스를 뽑을 수 있어요
            </p>
          </div>
          <Link
            href="/couple"
            className="bg-[#FF6B9D] text-white font-semibold px-8 py-4 rounded-2xl shadow-sm shadow-[#FF6B9D]/30 active:scale-[0.97] transition-transform"
          >
            커플 연결하기
          </Link>
        </div>
      )}

      {/* 커플 있는 경우 */}
      {couple && (
        <div className="flex flex-col gap-5">
          {/* 진행 중인 세션 있으면 배너 표시 */}
          {inProgress && (
            <Link
              href={`/date/${inProgress.id}`}
              className="flex items-center justify-between bg-[#FFE8F0] border border-[#FFD4E8] rounded-2xl px-5 py-4"
            >
              <div>
                <p className="text-xs text-[#FF6B9D] font-semibold">진행 중인 데이트</p>
                <p className="text-sm font-bold text-[#1C1C1E] mt-0.5">이어서 뽑으러 가기 →</p>
              </div>
              <span className="text-2xl">🎲</span>
            </Link>
          )}

          {/* 데이트 시작 버튼 */}
          <div className="bg-gradient-to-br from-[#FF6B9D] to-[#FF8E53] rounded-3xl p-6 text-white shadow-md shadow-[#FF6B9D]/30">
            <p className="text-sm font-medium opacity-80 mb-1">오늘은 어디로 갈까요?</p>
            <h2 className="text-2xl font-bold mb-5">데이트 코스 뽑기</h2>
            <StartDateButton
              coupleId={couple.id}
              userId={user.id}
              partnerId={couple.requester_id === user.id ? couple.receiver_id : couple.requester_id}
              myName={profile?.kakao_nickname ?? undefined}
            />
          </div>

          {/* 최근 데이트 기록 */}
          <div className="bg-white rounded-3xl p-5 border border-[#F2F2F7] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1C1C1E]">최근 데이트</h3>
              <Link href="/date/history" className="text-xs text-[#FF6B9D] font-medium">전체보기</Link>
            </div>
            {recentSessions && recentSessions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#F2F2F7] last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-[#1C1C1E]">{s.station_name}역 데이트</p>
                      <p className="text-xs text-[#8E8E93] mt-0.5">{formatDate(s.date)}</p>
                    </div>
                    <span className="text-lg">📍</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 gap-2 text-center">
                <span className="text-3xl">🗓</span>
                <p className="text-sm text-[#8E8E93]">첫 번째 데이트를 시작해보세요!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
