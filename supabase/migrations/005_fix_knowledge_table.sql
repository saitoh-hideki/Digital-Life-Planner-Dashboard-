-- 地域媒体ナレッジテーブルの修正
-- region_idをregion（文字列）に変更し、file_nameフィールドを追加

-- 既存のテーブルを削除（データがある場合は注意）
DROP TABLE IF EXISTS local_media_knowledge CASCADE;

-- 新しい構造でテーブルを作成
CREATE TABLE IF NOT EXISTS local_media_knowledge (
  id SERIAL PRIMARY KEY,
  region VARCHAR(100), -- 地域名（文字列）
  title VARCHAR(200) NOT NULL,
  description TEXT,
  media_type VARCHAR(50),
  url TEXT, -- ファイルのURL
  file_name VARCHAR(255), -- ファイル名
  issued_on DATE,
  author VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックス作成
CREATE INDEX idx_local_media_knowledge_region ON local_media_knowledge(region);
CREATE INDEX idx_local_media_knowledge_created_at ON local_media_knowledge(created_at DESC);

-- 更新日時トリガーを設定
CREATE TRIGGER update_local_media_knowledge_updated_at BEFORE UPDATE ON local_media_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
