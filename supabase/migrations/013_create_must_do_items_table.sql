-- Create must_do_items table for Must-Do Calendar functionality
CREATE TABLE IF NOT EXISTS must_do_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('month', 'week', 'day')),
  anchor_date DATE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_must_do_items_scope ON must_do_items (scope);
CREATE INDEX IF NOT EXISTS idx_must_do_items_anchor_date ON must_do_items (anchor_date);
CREATE INDEX IF NOT EXISTS idx_must_do_items_status ON must_do_items (status);
CREATE INDEX IF NOT EXISTS idx_must_do_items_order ON must_do_items (order_index);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_must_do_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_must_do_items_updated_at
  BEFORE UPDATE ON must_do_items
  FOR EACH ROW
  EXECUTE FUNCTION update_must_do_items_updated_at();

-- Enable Row Level Security
ALTER TABLE must_do_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read/write access (for demo purposes)
-- In production, you should implement proper user authentication
CREATE POLICY "Allow public access to must_do_items" ON must_do_items
  FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO must_do_items (scope, anchor_date, title, status, order_index) VALUES
  ('day', CURRENT_DATE, '朝のメールチェック', 'todo', 0),
  ('day', CURRENT_DATE, '会議の準備', 'todo', 1),
  ('day', CURRENT_DATE, 'レポート提出', 'done', 2),
  ('week', DATE_TRUNC('week', CURRENT_DATE)::DATE, '週次レポート作成', 'todo', 0),
  ('week', DATE_TRUNC('week', CURRENT_DATE)::DATE, 'チームMTG', 'todo', 1),
  ('month', DATE_TRUNC('month', CURRENT_DATE)::DATE, '月次目標設定', 'todo', 0),
  ('month', DATE_TRUNC('month', CURRENT_DATE)::DATE, '予算見直し', 'todo', 1);
