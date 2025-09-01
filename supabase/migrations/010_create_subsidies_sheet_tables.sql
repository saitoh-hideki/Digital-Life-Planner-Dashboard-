-- スプレッドシート準拠の補助金・助成金テーブル（CSV取り込み用）
CREATE TABLE IF NOT EXISTS public.subsidies_sheet (
    row_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id text, -- シートID（任意）
    name text NOT NULL, -- 制度名
    organization text, -- 実施機関
    summary text, -- 概要
    period text, -- 期間（文字列のまま保持）
    purpose text, -- 目的
    target_audience text, -- 対象者
    amount text, -- 金額（テキストのまま）
    url text, -- 公式リンク
    status text, -- 任意（原文そのまま保持）
    created_at timestamptz DEFAULT now()
);

-- 正規化済みの補助金・助成金テーブル（アプリ表示用）
CREATE TABLE IF NOT EXISTS public.subsidies_normalized (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_row_id uuid REFERENCES public.subsidies_sheet(row_id) ON DELETE CASCADE,
    name text NOT NULL,
    summary text,
    issuer text, -- (= organization)
    audience text, -- (= target_audience)
    url text,
    apply_start date NULL, -- periodを解析して得られれば日付
    apply_end date NULL,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'coming_soon')),
    prefecture text NULL, -- 将来利用、現状は空
    municipality text NULL, -- 将来利用、現状は空
    amount_text text, -- (= amount 原文保持)
    amount_min numeric NULL, -- 可能なら抽出
    amount_max numeric NULL, -- 可能なら抽出
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 一意性制約（idempotency用）
CREATE UNIQUE INDEX IF NOT EXISTS idx_subsidies_normalized_unique 
ON public.subsidies_normalized (name, issuer, COALESCE(apply_start::text, ''));

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_subsidies_normalized_apply_end ON public.subsidies_normalized(apply_end ASC);
CREATE INDEX IF NOT EXISTS idx_subsidies_normalized_status ON public.subsidies_normalized(status);
CREATE INDEX IF NOT EXISTS idx_subsidies_normalized_source_row_id ON public.subsidies_normalized(source_row_id);

-- 全文検索用のGINインデックス（日本語対応）
CREATE INDEX IF NOT EXISTS idx_subsidies_normalized_fulltext ON public.subsidies_normalized 
USING gin(to_tsvector('japanese', COALESCE(name, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(issuer, '') || ' ' || COALESCE(audience, '')));

-- RLSポリシー設定
ALTER TABLE public.subsidies_sheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidies_normalized ENABLE ROW LEVEL SECURITY;

-- subsidies_sheet: 匿名SELECT可、INSERT/UPDATEは管理者UI（Edge Function経由）
CREATE POLICY "Anyone can view subsidies_sheet" ON public.subsidies_sheet
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert subsidies_sheet" ON public.subsidies_sheet
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update subsidies_sheet" ON public.subsidies_sheet
    FOR UPDATE USING (auth.role() = 'authenticated');

-- subsidies_normalized: 匿名SELECT可
CREATE POLICY "Anyone can view subsidies_normalized" ON public.subsidies_normalized
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert subsidies_normalized" ON public.subsidies_normalized
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update subsidies_normalized" ON public.subsidies_normalized
    FOR UPDATE USING (auth.role() = 'authenticated');

-- コメント追加
COMMENT ON TABLE public.subsidies_sheet IS 'スプレッドシート準拠の補助金・助成金テーブル（CSV取り込み用）';
COMMENT ON TABLE public.subsidies_normalized IS '正規化済みの補助金・助成金テーブル（アプリ表示用）';
COMMENT ON COLUMN public.subsidies_sheet.row_id IS '内部主キー';
COMMENT ON COLUMN public.subsidies_sheet.id IS 'シートID（任意）';
COMMENT ON COLUMN public.subsidies_sheet.name IS '制度名';
COMMENT ON COLUMN public.subsidies_sheet.organization IS '実施機関';
COMMENT ON COLUMN public.subsidies_sheet.summary IS '概要';
COMMENT ON COLUMN public.subsidies_sheet.period IS '期間（文字列のまま保持）';
COMMENT ON COLUMN public.subsidies_sheet.purpose IS '目的';
COMMENT ON COLUMN public.subsidies_sheet.target_audience IS '対象者';
COMMENT ON COLUMN public.subsidies_sheet.amount IS '金額（テキストのまま）';
COMMENT ON COLUMN public.subsidies_sheet.url IS '公式リンク';
COMMENT ON COLUMN public.subsidies_sheet.status IS 'ステータス（原文そのまま）';
COMMENT ON COLUMN public.subsidies_normalized.id IS '正規化テーブルの主キー';
COMMENT ON COLUMN public.subsidies_normalized.source_row_id IS '元データのrow_id';
COMMENT ON COLUMN public.subsidies_normalized.status IS '正規化済みステータス: open(公募中), closed(終了), coming_soon(公募予定)';
COMMENT ON COLUMN public.subsidies_normalized.apply_start IS '申請開始日（periodから解析）';
COMMENT ON COLUMN public.subsidies_normalized.apply_end IS '申請終了日（periodから解析）';
COMMENT ON COLUMN public.subsidies_normalized.amount_min IS '最小金額（amountから抽出）';
COMMENT ON COLUMN public.subsidies_normalized.amount_max IS '最大金額（amountから抽出）';
