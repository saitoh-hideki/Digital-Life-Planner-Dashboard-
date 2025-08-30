-- Create alerts table for police and consumer affairs RSS feeds
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(50) NOT NULL CHECK (source IN ('警察庁', '消費者庁')),
  title_original TEXT NOT NULL,
  summary_original TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  url TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('critical', 'high', 'info')),
  category VARCHAR(30) NOT NULL DEFAULT 'gov_notice' CHECK (category IN ('phishing', 'scam', 'recall', 'gov_notice')),
  title_ja TEXT,
  summary_ja TEXT,
  url_hash VARCHAR(32) UNIQUE NOT NULL, -- MD5 hash for duplicate prevention
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_alerts_source ON alerts(source);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_published_at ON alerts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_url_hash ON alerts(url_hash);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO alerts (source, title_original, summary_original, published_at, url, severity, category, title_ja, summary_ja, url_hash) VALUES
('消費者庁', '新型コロナウイルス感染症に関連した悪質商法にご注意ください', '新型コロナウイルス感染症に関連した悪質商法が発生しています。マスクや消毒液の高額販売、偽の治療薬の販売などにご注意ください。', '2024-01-15T10:00:00Z', 'https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_001.html', 'high', 'scam', '新型コロナウイルス感染症に関連した悪質商法にご注意ください', '新型コロナウイルス感染症に関連した悪質商法が発生しています。マスクや消毒液の高額販売、偽の治療薬の販売などにご注意ください。', 'abc123def456ghi789'),
('警察庁', 'フィッシング詐欺の手口と対策について', '銀行やクレジットカード会社を装ったフィッシング詐欺が増加しています。個人情報の入力を求められた場合は、必ず公式サイトで確認してください。', '2024-01-15T09:30:00Z', 'https://www.npa.go.jp/cyber/security/alert/phishing.html', 'critical', 'phishing', 'フィッシング詐欺の手口と対策について', '銀行やクレジットカード会社を装ったフィッシング詐欺が増加しています。個人情報の入力を求められた場合は、必ず公式サイトで確認してください。', 'def456ghi789abc123'),
('消費者庁', '食品リコール情報：特定の冷凍食品について', '一部の冷凍食品で品質に問題が見つかったため、リコールを実施します。該当商品をお持ちの方は、返品・交換をお願いします。', '2024-01-15T08:00:00Z', 'https://www.caa.go.jp/policies/policy/consumer_safety/recall/recall_001.html', 'high', 'recall', '食品リコール情報：特定の冷凍食品について', '一部の冷凍食品で品質に問題が見つかったため、リコールを実施します。該当商品をお持ちの方は、返品・交換をお願いします。', 'ghi789abc123def456');

-- Grant permissions
GRANT ALL ON alerts TO authenticated;
GRANT ALL ON alerts TO service_role;
