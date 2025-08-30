'use client'

import { MonthlySummary, ActionCategory } from '@/lib/types'
import { getCategoryConfig, ACTION_CATEGORIES } from '@/lib/actionCategories'
import { BarChart3, Download, TrendingUp } from 'lucide-react'

interface MonthlySummaryCardProps {
  summary: MonthlySummary
}

export default function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  const exportToCSV = () => {
    const headers = ['カテゴリ', '時間（h）', '分', '割合（%）']
    const data = ACTION_CATEGORIES.map(config => {
      const minutes = summary.category_minutes[config.key] || 0
      const hours = minutes / 60
      const percentage = summary.total_minutes > 0 ? (minutes / summary.total_minutes) * 100 : 0
      return [config.label, hours.toFixed(1), minutes, percentage.toFixed(1)]
    })

    const csvContent = [headers, ...data]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `actions_summary_${summary.year}_${summary.month}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // カテゴリごとの色を定義
  const getCategoryStyle = (categoryKey: ActionCategory) => {
    switch (categoryKey) {
      case 'discussion':
        return { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-600' }
      case 'round':
        return { bg: 'bg-sky-100', border: 'border-sky-200', text: 'text-sky-600' }
      case 'fas_preparation':
        return { bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-600' }
      case 'appointment':
        return { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-600' }
      case 'clinic_related':
        return { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-600' }
      case 'media_promotion':
        return { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-600' }
      case 'meeting':
        return { bg: 'bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-600' }
      case 'roleplay':
        return { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-600' }
      case 'documentation':
        return { bg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-600' }
      case 'interview':
        return { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' }
      case 'academic_circle':
        return { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-600' }
      case 'ao_school_lecturer':
        return { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600' }
      case 'facility_preparation':
        return { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-600' }
      case 'layout_change':
        return { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-600' }
      case 'skill_learning':
        return { bg: 'bg-lime-100', border: 'border-lime-200', text: 'text-lime-600' }
      case 'other':
        return { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700' }
      default:
        return { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700' }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          月次サマリー
        </h2>
        <button
          onClick={exportToCSV}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>

      {/* カテゴリ別進捗状況 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          カテゴリ別進捗状況
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {ACTION_CATEGORIES.map((categoryConfig) => {
            const minutes = summary.category_minutes[categoryConfig.key] || 0
            const hours = minutes / 60
            const percentage = summary.total_minutes > 0 ? (minutes / summary.total_minutes) * 100 : 0
            const style = getCategoryStyle(categoryConfig.key)
            
            return (
              <div 
                key={categoryConfig.key} 
                className={`
                  flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-lg h-24
                  ${style.bg} ${style.border} ${style.text}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base">
                    {categoryConfig.label}
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-base">
                    {minutes > 0 ? (
                      <>
                        {hours >= 1 ? `${Math.floor(hours)}時間` : ''}
                        {minutes % 60 > 0 ? `${minutes % 60}分` : ''}
                        {hours >= 1 && minutes % 60 > 0 ? ' ' : ''}
                        <span className="text-sm text-gray-600">
                          ({hours.toFixed(1)}h)
                        </span>
                      </>
                    ) : (
                      '未実施'
                    )}
                  </div>
                  {minutes > 0 ? (
                    <div className="text-sm text-gray-600 font-medium">
                      割合: {percentage.toFixed(1)}%
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 font-medium">
                      今月は実施なし
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
