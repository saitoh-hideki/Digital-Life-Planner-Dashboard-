'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addMonths, addWeeks, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MustDoScope } from '@/lib/types'

interface MustDoHeaderProps {
  currentDate: Date
  scope: MustDoScope
  onScopeChange: (scope: MustDoScope) => void
  onDateChange: (date: Date) => void
  onAddItem: () => void
}

export default function MustDoHeader({
  currentDate,
  scope,
  onScopeChange,
  onDateChange,
  onAddItem
}: MustDoHeaderProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handlePrevious = () => {
    let newDate: Date
    switch (scope) {
      case 'month':
        newDate = addMonths(currentDate, -1)
        break
      case 'week':
        newDate = addWeeks(currentDate, -1)
        break
      case 'day':
        newDate = addDays(currentDate, -1)
        break
    }
    onDateChange(newDate)
  }

  const handleNext = () => {
    let newDate: Date
    switch (scope) {
      case 'month':
        newDate = addMonths(currentDate, 1)
        break
      case 'week':
        newDate = addWeeks(currentDate, 1)
        break
      case 'day':
        newDate = addDays(currentDate, 1)
        break
    }
    onDateChange(newDate)
  }

  const getTitle = () => {
    switch (scope) {
      case 'month':
        return format(currentDate, 'yyyy年M月', { locale: ja })
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        return `${format(weekStart, 'M/d', { locale: ja })} - ${format(weekEnd, 'M/d', { locale: ja })}`
      case 'day':
        return format(currentDate, 'M月d日（EEEE）', { locale: ja })
    }
  }

  const handleQuickAdd = () => {
    if (newTitle.trim()) {
      // TODO: 実際の追加処理は親コンポーネントで実装
      console.log('Quick add:', newTitle)
      setNewTitle('')
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuickAdd()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTitle('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <div className="flex items-center justify-between">
        {/* ナビゲーション */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="前へ"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900 min-w-[120px] text-center">
            {getTitle()}
          </h2>
          
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="次へ"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* モード切替 */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'day'] as MustDoScope[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onScopeChange(mode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                scope === mode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode === 'month' ? '月' : mode === 'week' ? '週' : '日'}
            </button>
          ))}
        </div>

        {/* 追加ボタン */}
        <div className="flex items-center gap-2">
          {isAdding ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="やることを入力..."
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleQuickAdd}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                追加
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
