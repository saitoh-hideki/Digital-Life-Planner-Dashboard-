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

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_subsidies_sheet_created_at ON public.subsidies_sheet(created_at DESC);

-- 全文検索用のGINインデックス（英語対応）
CREATE INDEX IF NOT EXISTS idx_subsidies_sheet_fulltext ON public.subsidies_sheet 
USING gin(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(organization, '') || ' ' || COALESCE(target_audience, '')));

-- RLSポリシー設定
ALTER TABLE public.subsidies_sheet ENABLE ROW LEVEL SECURITY;

-- subsidies_sheet: 匿名SELECT可、INSERT/UPDATEは管理者UI（Edge Function経由）
CREATE POLICY "Anyone can view subsidies_sheet" ON public.subsidies_sheet
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert subsidies_sheet" ON public.subsidies_sheet
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update subsidies_sheet" ON public.subsidies_sheet
    FOR UPDATE USING (auth.role() = 'authenticated');

-- コメント追加
COMMENT ON TABLE public.subsidies_sheet IS 'スプレッドシート準拠の補助金・助成金テーブル（CSV取り込み用・表示用）';
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
