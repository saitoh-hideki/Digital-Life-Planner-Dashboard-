'use client'

import { MonthlySummary, ActionCategory } from '@/lib/types'
import { getCategoryConfig } from '@/lib/actionCategories'
import { BarChart3, Download, TrendingUp, Clock } from 'lucide-react'

interface MonthlySummaryCardProps {
  summary: MonthlySummary
}

export default function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  // カテゴリ別時間を降順でソート
  const sortedCategories = Object.entries(summary.category_hours)
    .filter(([, hours]) => hours > 0)
    .sort(([, a], [, b]) => b - a)

  // カテゴリの偏りをチェック（40%超で黄色、60%超で赤）
  const getCategoryWarning = (hours: number) => {
    const percentage = (hours / summary.total_hours) * 100
    if (percentage > 60) return 'text-red-600 bg-red-50 border-red-200'
    if (percentage > 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const exportToCSV = () => {
    const headers = ['カテゴリ', '時間（h）', '割合（%）']
    const data = sortedCategories.map(([category, hours]) => {
      const percentage = ((hours / summary.total_hours) * 100).toFixed(1)
      const label = getCategoryConfig(category as ActionCategory).label
      return [label, hours.toFixed(1), percentage]
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

      {/* 基本統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{summary.total_hours}</div>
          <div className="text-sm text-blue-700">総作業時間（h）</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{summary.daily_average}</div>
          <div className="text-sm text-green-700">日平均（h）</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{summary.completed_count}</div>
          <div className="text-sm text-purple-700">完了タスク数</div>
        </div>
      </div>

      {/* カテゴリ別時間 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          カテゴリ別時間配分
        </h3>
        
        {sortedCategories.length > 0 ? (
          <div className="space-y-3">
            {sortedCategories.map(([category, hours]) => {
              const categoryConfig = getCategoryConfig(category as ActionCategory)
              const percentage = (hours / summary.total_hours) * 100
              const warningClass = getCategoryWarning(hours)
              
              return (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${categoryConfig.bgColor.replace('bg-', 'bg-')}`}></div>
                    <span className="font-medium text-gray-900">{categoryConfig.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{hours.toFixed(1)}h</div>
                      <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                    
                    {/* 警告表示 */}
                    {percentage > 40 && (
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${warningClass}`}>
                        {percentage > 60 ? '⚠️ 偏り大' : '⚠️ 偏り中'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>今月はまだ完了したタスクがありません</p>
          </div>
        )}
      </div>

      {/* グラフ表示（簡易版） */}
      {sortedCategories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">時間配分グラフ</h3>
          <div className="space-y-2">
            {sortedCategories.slice(0, 8).map(([category, hours]) => {
              const categoryConfig = getCategoryConfig(category as ActionCategory)
              const percentage = (hours / summary.total_hours) * 100
              
              return (
                <div key={category} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600 truncate">
                    {categoryConfig.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${categoryConfig.bgColor.replace('bg-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-600">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 分析・アドバイス */}
      {sortedCategories.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">今月の分析</h4>
          <div className="text-sm text-gray-700 space-y-2">
            {(() => {
              const topCategory = sortedCategories[0]
              const topPercentage = (topCategory[1] / summary.total_hours) * 100
              
              if (topPercentage > 60) {
                return (
                  <p>
                    <span className="font-medium text-red-600">注意:</span> 
                    {getCategoryConfig(topCategory[0] as ActionCategory).label}に時間が集中しています。
                    他のカテゴリにも時間を配分することをお勧めします。
                  </p>
                )
              } else if (topPercentage > 40) {
                return (
                  <p>
                    <span className="font-medium text-yellow-600">バランス:</span> 
                    時間配分は比較的バランスが取れています。
                    継続して多様な活動を行いましょう。
                  </p>
                )
              } else {
                return (
                  <p>
                    <span className="font-medium text-green-600">良好:</span> 
                    時間配分がバランス良く分散されています。
                    この調子で継続しましょう。
                  </p>
                )
              }
            })()}
            
            <p>
              <span className="font-medium text-blue-600">総評:</span> 
              今月は{summary.total_hours}時間の作業を完了し、
              日平均{summary.daily_average}時間の活動を行いました。
              {summary.completed_count}件のタスクを達成し、充実した月でした。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
