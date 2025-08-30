'use client'

import { DailySummary } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface DailySummaryCardProps {
  summary: DailySummary
}

export default function DailySummaryCard({ summary }: DailySummaryCardProps) {
  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    if (rate >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getCompletionBgColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-100'
    if (rate >= 60) return 'bg-yellow-100'
    if (rate >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          今日のサマリー
        </h2>
        <div className="text-sm text-gray-500">
          {format(new Date(summary.date), 'M月d日 (EEEE)', { locale: ja })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 完了タスク数 */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.completed_count}</div>
          <div className="text-sm text-gray-600">完了タスク</div>
        </div>

        {/* 未完了タスク数 */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.total_count - summary.completed_count}</div>
          <div className="text-sm text-gray-600">未完了タスク</div>
        </div>

        {/* 完了率 */}
        <div className="text-center">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3 ${getCompletionBgColor(summary.completion_rate)}`}>
            <TrendingUp className={`w-6 h-6 ${getCompletionColor(summary.completion_rate)}`} />
          </div>
          <div className={`text-2xl font-bold ${getCompletionColor(summary.completion_rate)}`}>
            {summary.completion_rate}%
          </div>
          <div className="text-sm text-gray-600">完了率</div>
        </div>

        {/* 合計作業時間 */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.total_work_hours}</div>
          <div className="text-sm text-gray-600">合計時間（h）</div>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>進捗</span>
          <span>{summary.completed_count} / {summary.total_count}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              summary.completion_rate >= 80 ? 'bg-green-500' :
              summary.completion_rate >= 60 ? 'bg-yellow-500' :
              summary.completion_rate >= 40 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${summary.completion_rate}%` }}
          ></div>
        </div>
      </div>

      {/* 励ましメッセージ */}
      {summary.completion_rate > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            {summary.completion_rate >= 80 ? '🎉 素晴らしい！今日も充実した一日でした！' :
             summary.completion_rate >= 60 ? '👍 順調に進んでいます！残りも頑張りましょう！' :
             summary.completion_rate >= 40 ? '💪 着実に進んでいます！ペースを保ちましょう！' :
             '🚀 始めることができました！一歩ずつ進んでいきましょう！'}
          </p>
        </div>
      )}
    </div>
  )
}
