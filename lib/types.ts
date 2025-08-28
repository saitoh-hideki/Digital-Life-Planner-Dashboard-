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
  id?: number
  region_id?: number
  title: string
  description?: string
  venue?: string
  start_at: string
  end_at?: string
  rsvp_url?: string
  regions?: Region
}

export interface LocalMediaKnowledge {
  id?: number
  region_id?: number
  title: string
  description?: string
  media_type?: string
  url?: string
  issued_on?: string
  author?: string
  regions?: Region
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