// ActionCategoryの型定義を直接記述して循環インポートを回避
type ActionCategory = 
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

interface ActionCategoryConfig {
  key: ActionCategory
  label: string
  color: string
  bgColor: string
  borderColor: string
}

export const ACTION_CATEGORIES: ActionCategoryConfig[] = [
  {
    key: 'discussion',
    label: 'ディスカッション',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    key: 'round',
    label: 'ラウンド',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    key: 'fas_preparation',
    label: 'FAS拡張準備',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    key: 'appointment',
    label: 'アポイント',
    color: 'bg-orange-100 text-orange-800',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    key: 'clinic_related',
    label: 'クリニック関連',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    key: 'media_promotion',
    label: 'メディア・販促制作',
    color: 'bg-pink-100 text-pink-800',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  {
    key: 'meeting',
    label: 'MTG',
    color: 'bg-indigo-100 text-indigo-800',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  {
    key: 'roleplay',
    label: 'ロールプレイング',
    color: 'bg-teal-100 text-teal-800',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'documentation',
    label: '資料作成',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    key: 'interview',
    label: '取材活動',
    color: 'bg-cyan-100 text-cyan-800',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200'
  },
  {
    key: 'academic_circle',
    label: 'アカデミックサークル',
    color: 'bg-emerald-100 text-emerald-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'ao_school_lecturer',
    label: 'AO校講師活動',
    color: 'bg-violet-100 text-violet-800',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200'
  },
  {
    key: 'facility_preparation',
    label: '施設準備',
    color: 'bg-rose-100 text-rose-800',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200'
  },
  {
    key: 'layout_change',
    label: 'レイアウト変更',
    color: 'bg-sky-100 text-sky-800',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200'
  },
  {
    key: 'skill_learning',
    label: 'スキルラーニング',
    color: 'bg-lime-100 text-lime-800',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-200'
  },
  {
    key: 'other',
    label: 'その他',
    color: 'bg-gray-100 text-gray-800',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
]

export function getCategoryConfig(category: ActionCategory): ActionCategoryConfig {
  return ACTION_CATEGORIES.find(config => config.key === category) || ACTION_CATEGORIES[ACTION_CATEGORIES.length - 1]
}

export function getCategoryLabel(category: ActionCategory): string {
  return getCategoryConfig(category).label
}

// 型をエクスポート
export type { ActionCategory, ActionCategoryConfig }
