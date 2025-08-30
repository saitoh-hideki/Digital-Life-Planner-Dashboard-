-- Create action_tasks table for Actions functionality
CREATE TABLE IF NOT EXISTS action_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  memo TEXT,
  category TEXT NOT NULL CHECK (
    category IN (
      'discussion', 'round', 'fas_preparation', 'appointment',
      'clinic_related', 'media_promotion', 'meeting', 'roleplay',
      'documentation', 'interview', 'academic_circle', 'ao_school_lecturer',
      'facility_preparation', 'layout_change', 'skill_learning', 'other'
    )
  ),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_action_tasks_date ON action_tasks (DATE(start_time));
CREATE INDEX IF NOT EXISTS idx_action_tasks_category ON action_tasks (category);
CREATE INDEX IF NOT EXISTS idx_action_tasks_completed ON action_tasks (is_completed);
CREATE INDEX IF NOT EXISTS idx_action_tasks_priority ON action_tasks (priority);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_action_tasks_updated_at
  BEFORE UPDATE ON action_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE action_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read/write access (for demo purposes)
-- In production, you should implement proper user authentication
CREATE POLICY "Allow public access to action_tasks" ON action_tasks
  FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO action_tasks (title, memo, category, start_time, end_time, priority, is_completed) VALUES
  ('朝のMTG', 'チーム全体での進捗確認', 'meeting', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 'high', false),
  ('資料作成', 'プレゼン資料の準備', 'documentation', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '4 hours', 'medium', false),
  ('スキル学習', 'Reactの新しい機能を学習', 'skill_learning', NOW() + INTERVAL '5 hours', NOW() + INTERVAL '6 hours', 'low', false);
