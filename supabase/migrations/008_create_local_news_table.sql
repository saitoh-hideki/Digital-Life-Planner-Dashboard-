-- 地域ニューステーブルの作成
CREATE TABLE IF NOT EXISTS public.local_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prefecture TEXT NOT NULL,
    municipality TEXT NOT NULL,
    name TEXT NOT NULL,
    summary TEXT,
    body TEXT,
    source_url TEXT,
    category TEXT NOT NULL CHECK (category IN (
        '行政DX',
        '教育・学習',
        '防災・安全',
        '福祉・子育て',
        '産業・ビジネス',
        'イベント',
        '環境・暮らし',
        'その他'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_local_news_prefecture ON public.local_news(prefecture);
CREATE INDEX IF NOT EXISTS idx_local_news_category ON public.local_news(category);
CREATE INDEX IF NOT EXISTS idx_local_news_created_at ON public.local_news(created_at);

-- RLSポリシーの設定
ALTER TABLE public.local_news ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Allow public read access" ON public.local_news
    FOR SELECT USING (true);

-- 認証済みユーザーのみ書き込み可能
CREATE POLICY "Allow authenticated insert" ON public.local_news
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.local_news
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.local_news
    FOR DELETE USING (auth.role() = 'authenticated');

-- サンプルデータは削除（必要に応じて後で追加）
