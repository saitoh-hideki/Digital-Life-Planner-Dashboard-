export interface Region {
  id: number
  code: string
  name: string
}

export interface LocalApp {
  id?: number
  prefecture: string
  municipality?: string
  name: string
  summary?: string
  url?: string
  platform?: string
  provider?: string
  updated_on?: string
}

export interface Subsidy {
  id?: number
  prefecture: string
  municipality?: string
  name: string
  summary?: string
  issuer?: string
  audience?: string
  url?: string
  apply_start?: string
  apply_end?: string
  status?: string
}

export interface Topic {
  id?: number
  headline: string
  summary?: string
  source_name?: string
  source_url?: string
  published_at: string
  is_today?: boolean
  ai_summary?: string
  dlp_insight?: string
}

export interface LocalNews {
  id?: number
  prefecture: string
  municipality?: string
  name: string
  summary?: string
  body?: string
  source_name?: string
  source_url?: string
  tags?: string[]
  published_at: string
  status: 'draft' | 'published'
  author_id?: string
  created_at?: string
  updated_at?: string
}

export interface AcademicCircleEvent {
  id: string
  event_date: string
  day_of_week: string
  start_time: string
  end_time: string
  event_category: string
  event_name: string
  delivery_type: string
  created_at: string
  updated_at: string
}

export interface LocalMediaKnowledge {
  id?: number
  region?: string
  title?: string
  description?: string
  url?: string
  file_name?: string
  created_at?: string
  updated_at?: string
}

export interface NewsArchive {
  id?: number
  kind: 'topic' | 'local'
  title: string
  summary?: string
  source_name?: string
  source_url?: string
  published_at: string
  prefecture?: string
  municipality?: string
  tags?: string[]
}

// Alerts interface for police and consumer affairs RSS feeds
export interface Alert {
  id: string
  source: '警察庁' | '消費者庁'
  title_original: string
  summary_original?: string
  published_at: string
  url: string
  severity: 'critical' | 'high' | 'info'
  category: 'phishing' | 'scam' | 'recall' | 'gov_notice'
  title_ja?: string
  summary_ja?: string
  url_hash: string
  is_read: boolean
  created_at: string
  updated_at: string
}

// 検索結果用の型
export interface SearchResult {
  id?: number
  name: string
  summary?: string
  prefecture: string
  municipality?: string
  source_name?: string
  url?: string
  tags?: string[]
  metadata?: Record<string, string | number | boolean | null>
}

// Actions（アクションズ）機能用の型定義
export interface ActionTask {
  id: string
  title: string
  memo?: string
  category: ActionCategory
  start_time: string // HH:mm形式
  end_time: string // HH:mm形式
  priority: 'high' | 'medium' | 'low'
  is_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export type ActionCategory = 
  | 'discussion'
  | 'round'
  | 'fas_preparation'
  | 'appointment'
  | 'clinic_related'
  | 'media_promotion'
  | 'meeting'
  | 'roleplay'
  | 'documentation'
  | 'interview'
  | 'academic_circle'
  | 'ao_school_lecturer'
  | 'facility_preparation'
  | 'layout_change'
  | 'skill_learning'
  | 'other'

export interface ActionCategoryConfig {
  key: ActionCategory
  label: string
  color: string
  bgColor: string
  borderColor: string
}

export interface DailySummary {
  date: string
  completed_count: number
  total_count: number
  completion_rate: number
  total_work_hours: number
}

export interface MonthlySummary {
  year: number
  month: number
  category_hours: Record<ActionCategory, number>
  total_hours: number
  daily_average: number
  completed_count: number
}