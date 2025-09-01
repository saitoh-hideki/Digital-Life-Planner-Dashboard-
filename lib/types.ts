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

// メイン補助金・助成金型（subsidies_sheet テーブル基準）
export interface Subsidy {
  row_id: string
  id?: string
  name: string
  organization?: string
  summary?: string
  period?: string
  purpose?: string
  target_audience?: string
  amount?: string
  url?: string
  status?: string
  created_at: string
}

// スプレッドシート準拠の補助金・助成金（CSV取り込み用）
export interface SubsidySheet {
  row_id: string
  id?: string
  name: string
  organization?: string
  summary?: string
  period?: string
  purpose?: string
  target_audience?: string
  amount?: string
  url?: string
  status?: string
  created_at: string
}

// 正規化済みの補助金・助成金（アプリ表示用）
export interface SubsidyNormalized {
  id: string
  source_row_id: string
  name: string
  summary?: string
  issuer?: string
  audience?: string
  url?: string
  apply_start?: string
  apply_end?: string
  status: 'open' | 'closed' | 'coming_soon'
  prefecture?: string
  municipality?: string
  amount_text?: string
  amount_min?: number
  amount_max?: number
  created_at: string
  updated_at: string
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
  id: string
  prefecture: string
  municipality: string
  name: string
  summary?: string
  body?: string
  source_url?: string
  category: LocalNewsCategory
  created_at: string
}

export type LocalNewsCategory = 
  | '行政DX'
  | '教育・学習'
  | '防災・安全'
  | '福祉・子育て'
  | '産業・ビジネス'
  | 'イベント'
  | '環境・暮らし'
  | 'その他'

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
  category_minutes: Record<ActionCategory, number>
  total_hours: number
  total_minutes: number
  daily_average: number
  completed_count: number
}

// Supporter interface for confetti effect
export interface Supporter {
  id: string
  name: string
  avatar: string
  messages: string[]
  color: string
}

// ユーザー管理のための型定義
export interface UserRole {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'user'
  permissions: {
    can_manage_users?: boolean
    can_manage_content?: boolean
    can_access_admin?: boolean
    can_manage_roles?: boolean
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  display_name?: string
  avatar_url?: string
  prefecture?: string
  municipality?: string
  organization?: string
  bio?: string
  preferences: {
    theme?: 'light' | 'dark' | 'auto'
    language?: 'ja' | 'en'
    notifications?: {
      email?: boolean
      push?: boolean
      sms?: boolean
    }
    dashboard_layout?: 'grid' | 'list' | 'compact'
  }
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email?: string
  role: UserRole
  profile?: UserProfile
}