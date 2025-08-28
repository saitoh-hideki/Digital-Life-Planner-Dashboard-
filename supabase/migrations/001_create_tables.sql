-- 地域マスタ
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- 補助金・助成金
CREATE TABLE IF NOT EXISTS subsidies (
  id SERIAL PRIMARY KEY,
  prefecture VARCHAR(50) NOT NULL,
  municipality VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  summary TEXT,
  issuer VARCHAR(200),
  audience VARCHAR(200),
  url TEXT,
  apply_start DATE,
  apply_end DATE,
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RSSトピック
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  headline VARCHAR(500) NOT NULL,
  summary TEXT,
  source_name VARCHAR(200),
  source_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_today BOOLEAN DEFAULT false,
  ai_summary TEXT,
  dlp_insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 地域ニュース（手動）
CREATE TABLE IF NOT EXISTS local_news (
  id SERIAL PRIMARY KEY,
  prefecture VARCHAR(50) NOT NULL,
  municipality VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  summary TEXT,
  body TEXT,
  source_name VARCHAR(200),
  source_url TEXT,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- アカデミックサークルイベント
CREATE TABLE IF NOT EXISTS academic_circle_events (
  id SERIAL PRIMARY KEY,
  region_id INTEGER REFERENCES regions(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  venue VARCHAR(300),
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE,
  rsvp_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 地域媒体ナレッジ
CREATE TABLE IF NOT EXISTS local_media_knowledge (
  id SERIAL PRIMARY KEY,
  region_id INTEGER REFERENCES regions(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  media_type VARCHAR(50),
  url TEXT,
  issued_on DATE,
  author VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックス作成
CREATE INDEX idx_subsidies_prefecture ON subsidies(prefecture);
CREATE INDEX idx_subsidies_apply_end ON subsidies(apply_end);
CREATE INDEX idx_topics_published_at ON topics(published_at DESC);
CREATE INDEX idx_topics_is_today ON topics(is_today);
CREATE INDEX idx_local_news_prefecture ON local_news(prefecture);
CREATE INDEX idx_local_news_status ON local_news(status);
CREATE INDEX idx_local_news_published_at ON local_news(published_at DESC);
CREATE INDEX idx_academic_circle_events_start_at ON academic_circle_events(start_at);

-- ニュースアーカイブ統合ビュー
CREATE OR REPLACE VIEW v_news_archive AS
SELECT 
  'topic' as kind,
  id,
  headline as title,
  summary,
  source_name,
  source_url,
  published_at,
  NULL as prefecture,
  NULL as municipality,
  NULL::text[] as tags
FROM topics
WHERE is_today = true OR published_at >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT 
  'local' as kind,
  id,
  name as title,
  summary,
  source_name,
  source_url,
  published_at,
  prefecture,
  municipality,
  tags
FROM local_news
WHERE status = 'published'
ORDER BY published_at DESC;

-- 更新日時自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルに更新日時トリガーを設定
CREATE TRIGGER update_subsidies_updated_at BEFORE UPDATE ON subsidies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_news_updated_at BEFORE UPDATE ON local_news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_circle_events_updated_at BEFORE UPDATE ON academic_circle_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_media_knowledge_updated_at BEFORE UPDATE ON local_media_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();