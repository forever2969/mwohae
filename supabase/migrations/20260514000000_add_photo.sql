-- date_sessions에 사진 URL 컬럼 추가
ALTER TABLE date_sessions ADD COLUMN IF NOT EXISTS photo_url TEXT;
