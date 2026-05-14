-- date_sessions에 사진 URL 컬럼 추가
ALTER TABLE date_sessions ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'date-photos',
  'date-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 정책: 인증된 사용자 업로드
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = '인증된 사용자 업로드'
  ) THEN
    CREATE POLICY "인증된 사용자 업로드" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'date-photos');
  END IF;
END $$;

-- Storage RLS 정책: 공개 조회
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = '공개 조회'
  ) THEN
    CREATE POLICY "공개 조회" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'date-photos');
  END IF;
END $$;

-- Storage RLS 정책: 본인 파일 덮어쓰기
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = '본인 파일 업데이트'
  ) THEN
    CREATE POLICY "본인 파일 업데이트" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'date-photos' AND owner = auth.uid());
  END IF;
END $$;
