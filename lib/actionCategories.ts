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
  bgColor: string
  borderColor: string
  textColor: string
}

export const ACTION_CATEGORIES: ActionCategoryConfig[] = [
  {
    key: 'discussion',
    label: 'ディスカッション',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    textColor: 'text-blue-600'
  },
  {
    key: 'round',
    label: 'ラウンド',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    textColor: 'text-emerald-600'
  },
  {
    key: 'fas_preparation',
    label: 'FAS拡張準備',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-100',
    textColor: 'text-violet-600'
  },
  {
    key: 'appointment',
    label: 'アポイント',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    textColor: 'text-amber-600'
  },
  {
    key: 'clinic_related',
    label: 'クリニック関連',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100',
    textColor: 'text-rose-600'
  },
  {
    key: 'media_promotion',
    label: 'メディア・販促制作',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-100',
    textColor: 'text-fuchsia-600'
  },
  {
    key: 'meeting',
    label: 'MTG',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    textColor: 'text-indigo-600'
  },
  {
    key: 'roleplay',
    label: 'ロールプレイング',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-100',
    textColor: 'text-teal-600'
  },
  {
    key: 'documentation',
    label: '資料作成',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-100',
    textColor: 'text-yellow-600'
  },
  {
    key: 'interview',
    label: '取材活動',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-100',
    textColor: 'text-cyan-600'
  },
  {
    key: 'academic_circle',
    label: 'アカデミックサークル',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    textColor: 'text-green-600'
  },
  {
    key: 'ao_school_lecturer',
    label: 'AO校講師活動',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    textColor: 'text-purple-600'
  },
  {
    key: 'facility_preparation',
    label: '施設準備',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-100',
    textColor: 'text-pink-600'
  },
  {
    key: 'layout_change',
    label: 'レイアウト変更',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-100',
    textColor: 'text-sky-600'
  },
  {
    key: 'skill_learning',
    label: 'スキルラーニング',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-100',
    textColor: 'text-lime-600'
  },
  {
    key: 'other',
    label: 'その他',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-100',
    textColor: 'text-slate-600'
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
