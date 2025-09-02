-- local_newsテーブルの修正
-- 1. idをUUIDに変更
-- 2. categoryカラムを追加
-- 3. published_atをオプショナルに変更

-- 既存のテーブルを削除（データがある場合は注意）
DROP TABLE IF EXISTS local_news CASCADE;

-- 新しいlocal_newsテーブルを作成
CREATE TABLE local_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefecture VARCHAR(50) NOT NULL,
  municipality VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  summary TEXT,
  body TEXT,
  source_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  category VARCHAR(50) CHECK (category IN (
    '行政DX',
    '教育・学習',
    '防災・安全',
    '福祉・子育て',
    '産業・ビジネス',
    'イベント',
    '環境・暮らし',
    'その他'
  )) DEFAULT 'その他',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックスを作成
CREATE INDEX idx_local_news_prefecture ON local_news(prefecture);
CREATE INDEX idx_local_news_category ON local_news(category);
CREATE INDEX idx_local_news_published_at ON local_news(published_at DESC);
CREATE INDEX idx_local_news_created_at ON local_news(created_at DESC);

-- 更新日時トリガーを設定
CREATE TRIGGER update_local_news_updated_at BEFORE UPDATE ON local_news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ニュースアーカイブビューを更新
CREATE OR REPLACE VIEW v_news_archive AS
SELECT 
  'topic' as kind,
  id::text,
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
  id::text,
  name as title,
  summary,
  NULL as source_name,
  source_url,
  published_at,
  prefecture,
  municipality,
  NULL::text[] as tags
FROM local_news
ORDER BY published_at DESC;
