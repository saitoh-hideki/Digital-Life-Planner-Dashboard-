-- 補助金・助成金テーブル作成
CREATE TABLE IF NOT EXISTS public.subsidies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    prefecture text,
    municipality text,
    name text NOT NULL,
    summary text,
    issuer text,
    audience text,
    url text,
    apply_start date,
    apply_end date,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'coming_soon')),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_subsidies_prefecture_municipality ON public.subsidies(prefecture, municipality);
CREATE INDEX IF NOT EXISTS idx_subsidies_apply_end ON public.subsidies(apply_end);
CREATE INDEX IF NOT EXISTS idx_subsidies_status ON public.subsidies(status);

-- 全文検索用のGINインデックス（日本語対応）
CREATE INDEX IF NOT EXISTS idx_subsidies_fulltext ON public.subsidies 
USING gin(to_tsvector('japanese', COALESCE(name, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(issuer, '') || ' ' || COALESCE(audience, '')));

-- RLSポリシー設定
ALTER TABLE public.subsidies ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Anyone can view subsidies" ON public.subsidies
    FOR SELECT USING (true);

-- 認証済みユーザーのみ挿入・更新・削除可能（管理用）
CREATE POLICY "Authenticated users can insert subsidies" ON public.subsidies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update subsidies" ON public.subsidies
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete subsidies" ON public.subsidies
    FOR DELETE USING (auth.role() = 'authenticated');

-- サンプルデータ挿入
INSERT INTO public.subsidies (
    prefecture, municipality, name, summary, issuer, audience, url, apply_start, apply_end, status
) VALUES
    (
        '神奈川県',
        '横浜市',
        'スタートアップ支援補助金',
        '新規事業を立ち上げる中小企業・個人事業主を対象とした補助金制度です。最大300万円まで支援します。',
        '横浜市経済局',
        '中小企業、個人事業主',
        'https://example.com/startup-subsidy',
        '2024-04-01',
        '2024-12-31',
        'open'
    ),
    (
        '東京都',
        '渋谷区',
        'デジタル化推進助成金',
        'ITシステム導入やDX推進を支援する助成金です。対象経費の2/3、最大200万円まで補助します。',
        '渋谷区産業振興部',
        '区内中小企業',
        'https://example.com/digital-subsidy',
        '2024-05-01',
        '2024-11-30',
        'open'
    ),
    (
        '大阪府',
        '大阪市',
        '環境配慮型事業補助金',
        '環境負荷軽減に取り組む事業者への補助金制度です。省エネ設備導入費用を支援します。',
        '大阪市環境局',
        '市内事業者',
        'https://example.com/eco-subsidy',
        '2024-03-01',
        '2024-10-31',
        'open'
    ),
    (
        '愛知県',
        '名古屋市',
        '観光事業者支援金',
        'コロナ禍で影響を受けた観光関連事業者への支援金です。事業継続と雇用維持を支援します。',
        '名古屋市観光文化交流局',
        '観光関連事業者',
        'https://example.com/tourism-support',
        '2024-02-01',
        '2024-09-30',
        'closed'
    ),
    (
        '福岡県',
        '福岡市',
        '次世代産業育成補助金',
        'AI、IoT、バイオテクノロジーなど次世代産業分野の研究開発を支援する補助金です。',
        '福岡市経済観光文化局',
        '市内企業、研究機関',
        'https://example.com/nextgen-industry',
        '2024-06-01',
        '2025-01-31',
        'coming_soon'
    );

-- コメント追加
COMMENT ON TABLE public.subsidies IS '補助金・助成金情報を管理するテーブル';
COMMENT ON COLUMN public.subsidies.id IS '一意識別子';
COMMENT ON COLUMN public.subsidies.prefecture IS '都道府県';
COMMENT ON COLUMN public.subsidies.municipality IS '市区町村';
COMMENT ON COLUMN public.subsidies.name IS '補助金・助成金名';
COMMENT ON COLUMN public.subsidies.summary IS '概要';
COMMENT ON COLUMN public.subsidies.issuer IS '発行者・担当部署';
COMMENT ON COLUMN public.subsidies.audience IS '対象者';
COMMENT ON COLUMN public.subsidies.url IS '公式ページURL';
COMMENT ON COLUMN public.subsidies.apply_start IS '申請開始日';
COMMENT ON COLUMN public.subsidies.apply_end IS '申請終了日';
COMMENT ON COLUMN public.subsidies.status IS 'ステータス: open(公募中), closed(終了), coming_soon(公募予定)';
COMMENT ON COLUMN public.subsidies.created_at IS '作成日時';