-- comments 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('junior', 'senior')),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, post_type);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- RLS 활성화
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 댓글 조회 가능
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

-- RLS 정책: 인증된 사용자만 댓글 작성 가능
CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS 정책: 본인 댓글만 수정/삭제 가능
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
