export type CoupleStatus = 'pending' | 'accepted' | 'dissolved'
export type DateSessionStatus = 'in_progress' | 'completed'
export type Direction = 'left' | 'right'

export interface Profile {
  id: string
  kakao_nickname: string | null
  avatar_url: string | null
  unique_code: string
  created_at: string
}

export interface Couple {
  id: string
  requester_id: string
  receiver_id: string
  status: CoupleStatus
  created_at: string
  accepted_at: string | null
  dissolved_at: string | null
  keep_records: boolean
}

export interface DateSession {
  id: string
  couple_id: string
  title: string | null
  date: string
  line: number | null
  direction: Direction | null
  station_index: number | null
  station_name: string | null
  lunch: string | null
  dessert: string | null
  activity: string | null
  dinner: string | null
  current_turn: string | null
  current_step: number
  status: DateSessionStatus
  created_at: string
  completed_at: string | null
}

// 뽑기 단계 순서
export type DrawStep =
  | 'line'        // 0: [A] 호선 뽑기
  | 'direction'   // 1: [B] 방향 뽑기
  | 'station'     // 2: [A] 역 번호 뽑기
  | 'confirm'     // 3: 결과 확정
  | 'lunch'       // 4: [B] 점심 메뉴 뽑기
  | 'dessert'     // 5: [A] 디저트 뽑기
  | 'activity'    // 6: [B] 오후 활동 뽑기
  | 'dinner'      // 7: [A] 저녁 메뉴 뽑기

export const DRAW_STEPS: DrawStep[] = [
  'line', 'direction', 'station', 'confirm',
  'lunch', 'dessert', 'activity', 'dinner'
]
