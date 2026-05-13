# 오늘은 뭐해? (mwohae) — CLAUDE.md

## 프로젝트 개요

**앱 이름**: 오늘은 뭐해?  
**패키지명**: mwohae  
**타겟**: 한국인 커플  
**플랫폼**: PWA (Next.js 기반 모바일 웹)  
**목표**: 커플이 함께 랜덤으로 데이트 코스를 뽑고, 그 기록을 쌓아가는 앱

---

## 기술 스택

| 역할 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 스타일링 | Tailwind CSS v4 |
| 백엔드/DB | Supabase (PostgreSQL + Realtime + Auth + Storage) |
| 인증 | Supabase Auth + 카카오 OAuth |
| 배포 | Vercel |
| 언어 | TypeScript |
| 상태관리 | Zustand |
| 애니메이션 | Framer Motion |

---

## 프로젝트 구조

```
mwohae/
├── app/
│   ├── (auth)/
│   │   └── login/              # 카카오 로그인 페이지
│   ├── (main)/
│   │   ├── home/               # 메인 홈 (데이트 시작 버튼)
│   │   ├── couple/             # 커플 관리 (신청/수락/프로필)
│   │   ├── date/
│   │   │   ├── [id]/           # 데이트 상세 (뽑기 진행)
│   │   │   └── history/        # 데이트 기록 목록
│   │   └── profile/            # 내 프로필
│   ├── api/
│   │   └── auth/
│   │       └── callback/       # 카카오 OAuth 콜백
│   ├── layout.tsx
│   └── page.tsx                # 스플래쉬 → 라우팅
├── components/
│   ├── ui/                     # 공통 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   ├── Skeleton.tsx
│   │   └── Toast.tsx
│   ├── draw/                   # 뽑기 관련 컴포넌트
│   │   ├── DrawCard.tsx        # 뽑기 카드 (두근두근 애니메이션)
│   │   ├── DrawSlot.tsx        # 슬롯머신 스타일 연출
│   │   └── DrawResult.tsx      # 뽑기 결과 표시
│   ├── couple/                 # 커플 관련 컴포넌트
│   │   ├── CoupleRequest.tsx
│   │   └── CoupleProfile.tsx
│   └── date/                   # 데이트 관련 컴포넌트
│       ├── DateCard.tsx
│       └── DateHistory.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저용 Supabase 클라이언트
│   │   ├── server.ts           # 서버용 Supabase 클라이언트
│   │   └── middleware.ts
│   ├── data/
│   │   ├── subway.ts           # 1~9호선 역 데이터 (정렬된 배열)
│   │   ├── food.ts             # 음식 카테고리 데이터
│   │   └── activities.ts       # 활동 카테고리 데이터
│   └── utils/
│       ├── random.ts           # 랜덤 뽑기 유틸 함수
│       └── date.ts             # 날짜 포맷 유틸
├── hooks/
│   ├── useCouple.ts            # 커플 상태 관련 훅
│   ├── useDate.ts              # 데이트 세션 관련 훅
│   └── useRealtime.ts          # Supabase Realtime 구독 훅
├── store/
│   └── dateStore.ts            # Zustand 전역 상태 (뽑기 진행 상태)
├── types/
│   └── index.ts                # 전체 TypeScript 타입 정의
├── public/
│   ├── manifest.json           # PWA 매니페스트
│   └── icons/                  # PWA 아이콘
├── middleware.ts               # 인증 미들웨어 (보호된 라우트)
└── supabase/
    └── migrations/             # DB 마이그레이션 파일
```

---

## 핵심 기능 명세

### 1. 인증 (카카오 로그인)
- Supabase Auth + 카카오 OAuth Provider 사용
- 로그인 안 된 상태에서 보호된 라우트 접근 시 `/login`으로 리다이렉트
- middleware.ts에서 세션 체크 처리

### 2. 커플 시스템
- 한 명이 상대방 카카오 닉네임 또는 고유 코드로 커플 신청
- 상대방이 앱에서 알림을 받고 수락/거절
- 커플 상태: `pending` | `accepted` | `dissolved`
- 커플당 하나의 활성 관계만 허용

### 3. 데이트 세션 (핵심 기능)

#### 뽑기 순서 (번갈아가며 진행)
```
1. [A] 호선 뽑기        → 예) 2호선
2. [B] 방향 뽑기        → 예) 왼쪽부터
3. [A] 역 번호 뽑기     → 예) 13번째
4. 결과 확정            → "홍대입구역 데이트!"
5. [B] 점심 메뉴 뽑기   → 예) 일식
6. [A] 디저트 뽑기      → 예) 카페
7. [B] 오후 활동 뽑기   → 예) 영화
8. [A] 저녁 메뉴 뽑기   → 예) 한식
```
- 뽑기 버튼은 현재 차례인 사람만 활성화
- Supabase Realtime으로 상대방 화면에 실시간 반영
- 각 뽑기마다 두근두근 애니메이션 (슬롯 → 결과 공개)

#### 뽑기 결과 저장
- 모든 뽑기 완료 시 `date_sessions` 테이블에 저장
- 제목 자동 생성: `2026년 5월 11일 (월) - 홍대입구역 데이트`

### 4. 데이트 기록
- 완료된 데이트 목록 카드 형태로 표시
- 날짜, 역, 뽑힌 항목들 요약 표시

---

## Supabase DB 스키마

```sql
-- 유저 프로필 (Supabase Auth users와 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  kakao_nickname TEXT,
  avatar_url TEXT,
  unique_code TEXT UNIQUE NOT NULL, -- 커플 신청용 6자리 코드
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 커플 관계
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending', -- pending | accepted | dissolved
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  dissolved_at TIMESTAMPTZ,
  keep_records BOOLEAN DEFAULT TRUE -- 헤어질 때 기록 보관 여부
);

-- 데이트 세션
CREATE TABLE date_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id),
  title TEXT, -- "2026년 5월 11일 (월) - 홍대입구역 데이트"
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  line INTEGER, -- 지하철 호선 (1~9)
  direction TEXT, -- 'left' | 'right'
  station_index INTEGER,
  station_name TEXT,
  lunch TEXT,
  dessert TEXT,
  activity TEXT,
  dinner TEXT,
  current_turn UUID REFERENCES profiles(id), -- 현재 뽑기 차례
  current_step INTEGER DEFAULT 0, -- 0~7 뽑기 단계
  status TEXT DEFAULT 'in_progress', -- in_progress | completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

---

## 랜덤 뽑기 데이터

### 서울 지하철 1~9호선
- 각 호선별 역 배열을 `lib/data/subway.ts`에 정의
- 방향(left/right)에 따라 `array` 또는 `array.slice().reverse()` 사용
- 역 index로 역 이름 조회

### 뽑기 카테고리 (`lib/data/`)

**점심/저녁 메뉴**
- 한식, 일식, 양식, 중식, 베트남식, 멕시칸, 분식, 해산물

**디저트**
- 카페/커피, 과일, 수플레, 아이스크림, 빙수, 마카롱, 케이크

**오후 활동**
- 영화, 만화카페, 보드게임카페, 노래방, 볼링, 방탈출, 전시회, 산책

---

## 애니메이션 명세 (Framer Motion)

| 상황 | 애니메이션 |
|------|-----------|
| 스플래쉬 | 로고 페이드인 + 스케일업 후 메인으로 전환 |
| 뽑기 버튼 클릭 | 버튼 pulse 효과 |
| 슬롯 돌아가는 중 | 세로 스크롤 슬롯머신 효과 (blur 포함) |
| 결과 공개 | 카드 플립 + confetti 이펙트 |
| 상대방 뽑기 대기 | 심장박동 pulse 애니메이션 |
| 페이지 전환 | 슬라이드 업 트랜지션 |
| 커플 수락 | 하트 파티클 이펙트 |
| 데이트 완성 | 전체 결과 순차 페이드인 |

---

## UX 처리 명세

| 상황 | 처리 방법 |
|------|----------|
| 앱 첫 진입 | 스플래쉬 (로고 + 앱명) → 세션 체크 → 라우팅 |
| 데이터 로딩 | 스켈레톤 UI |
| 비동기 액션 | 로딩 스피너 (버튼 내부) |
| 에러 발생 | Toast 알림 (한국어 메시지) |
| 커플 없이 접근 | "아직 커플이 없어요 💔" 안내 + 신청 버튼 |
| 상대방 오프라인 | "상대방이 아직 앱을 열지 않았어요" 안내 |

---

## TODO (추후 구현 예정)

> 아래 기능들은 현재 구현하지 않으며, 코드에 `// TODO:` 주석으로 위치만 표시해둘 것

- [ ] **다시 뽑기** — 프리미엄 or 캐시 아이템으로 뽑기 1회 재시도
- [ ] **커플 해제 기록 보관** — 헤어질 때 데이트 기록을 개인 보관함에 저장 (프리미엄)
- [ ] **데이트 사진 업로드** — Supabase Storage 활용, 데이트 기록에 사진 첨부
- [ ] **커뮤니티** — 역별 추천 데이트 코스, 맛집 공유 기능
- [ ] **링크 공유** — 데이트 세션 링크로 초대

---

## 코딩 컨벤션

- 모든 UI 텍스트는 **한국어** (에러 메시지, 플레이스홀더, 버튼 등)
- 컴포넌트: PascalCase (`DrawCard.tsx`)
- 훅: camelCase (`useCouple.ts`)
- 타입: PascalCase + 명시적 정의 (`DateSession`, `CoupleStatus`)
- Supabase 쿼리는 반드시 에러 핸들링 포함
- 서버 컴포넌트 / 클라이언트 컴포넌트 명확히 구분 (`'use client'` 표기)
- 환경변수는 `.env.local`에 관리, 절대 하드코딩 금지

---

## 환경변수 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_KAKAO_CLIENT_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## PWA 설정

- `public/manifest.json` — 앱 이름: "오늘은 뭐해?", 테마 컬러 설정
- `next.config.ts` — `next-pwa` 플러그인 설정
- 오프라인 지원: 기본 캐싱 전략 적용
- 홈 화면 추가 프롬프트 지원

---

## 개발 순서 권장

1. Supabase 프로젝트 생성 + DB 마이그레이션
2. 카카오 OAuth 연동 + 로그인 페이지
3. 커플 신청/수락 시스템
4. 지하철 데이터 + 랜덤 유틸 함수
5. 데이트 세션 생성 + 뽑기 로직
6. Supabase Realtime 연동 (실시간 공유)
7. 뽑기 애니메이션 (Framer Motion)
8. 데이트 기록 페이지
9. PWA 설정 + Vercel 배포