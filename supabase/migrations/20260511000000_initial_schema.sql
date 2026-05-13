-- 유저 프로필 (Supabase Auth users와 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  kakao_nickname TEXT,
  avatar_url TEXT,
  unique_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 커플 관계
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dissolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  dissolved_at TIMESTAMPTZ,
  keep_records BOOLEAN DEFAULT TRUE
);

-- 데이트 세션
CREATE TABLE date_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id),
  title TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  line INTEGER CHECK (line BETWEEN 1 AND 9),
  direction TEXT CHECK (direction IN ('left', 'right')),
  station_index INTEGER,
  station_name TEXT,
  lunch TEXT,
  dessert TEXT,
  activity TEXT,
  dinner TEXT,
  current_turn UUID REFERENCES profiles(id),
  current_step INTEGER DEFAULT 0 CHECK (current_step BETWEEN 0 AND 7),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 신규 유저 프로필 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, kakao_nickname, avatar_url, unique_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url',
    upper(substring(md5(random()::text) FROM 1 FOR 6))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_sessions ENABLE ROW LEVEL SECURITY;

-- profiles RLS
CREATE POLICY "자신의 프로필 조회" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "커플 상대방 프로필 조회" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND receiver_id = profiles.id)
        OR (receiver_id = auth.uid() AND requester_id = profiles.id)
      )
    )
  );

CREATE POLICY "unique_code로 프로필 조회" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "자신의 프로필 수정" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- couples RLS
CREATE POLICY "자신의 커플 관계 조회" ON couples
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = receiver_id
  );

CREATE POLICY "커플 신청 생성" ON couples
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "커플 상태 수정" ON couples
  FOR UPDATE USING (
    auth.uid() = requester_id OR auth.uid() = receiver_id
  );

-- date_sessions RLS
CREATE POLICY "커플의 데이트 세션 조회" ON date_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = date_sessions.couple_id
      AND status = 'accepted'
      AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    )
  );

CREATE POLICY "커플의 데이트 세션 생성" ON date_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = date_sessions.couple_id
      AND status = 'accepted'
      AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    )
  );

CREATE POLICY "커플의 데이트 세션 수정" ON date_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = date_sessions.couple_id
      AND status = 'accepted'
      AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    )
  );

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE date_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE couples;
