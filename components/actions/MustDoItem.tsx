'use client'

import { useState } from 'react'
import { Check, Trash2, RotateCcw, Calendar, Clock, ChevronUp, ChevronDown } from 'lucide-react'
import { MustDoItem as MustDoItemType } from '@/lib/types'

interface MustDoItemProps {
  item: MustDoItemType
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onMoveToNext: (id: string, target: 'day' | 'week' | 'month') => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  isFirst: boolean
  isLast: boolean
}

export default function MustDoItem({
  item,
  onToggleComplete,
  onDelete,
  onMoveToNext,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: MustDoItemProps) {
  const [showActions, setShowActions] = useState(false)

  const handleToggleComplete = () => {
    onToggleComplete(item.id)
  }

  const handleDelete = () => {
    onDelete(item.id)
  }

  const handleMoveToNext = (target: 'day' | 'week' | 'month') => {
    onMoveToNext(item.id, target)
  }

  return (
    <div
      className={`group flex items-center gap-3 p-3 bg-white border rounded-lg transition-all hover:shadow-sm ${
        item.status === 'done' ? 'opacity-50' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* チェックボックス */}
      <button
        onClick={handleToggleComplete}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
          item.status === 'done'
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
        }`}
        title={item.status === 'done' ? '完了を取り消し' : '完了にする'}
      >
        {item.status === 'done' && <Check className="w-3 h-3" />}
      </button>

      {/* タイトル */}
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm ${
            item.status === 'done'
              ? 'line-through text-gray-500'
              : 'text-gray-900'
          }`}
        >
          {item.title}
        </span>
      </div>

      {/* アクションボタン */}
      <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        {/* 並び替え */}
        <button
          onClick={() => onMoveUp(item.id)}
          disabled={isFirst}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
            isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
          }`}
          title="上に移動"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onMoveDown(item.id)}
          disabled={isLast}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
            isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
          }`}
          title="下に移動"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* 翌日/週/月に送る */}
        <button
          onClick={() => handleMoveToNext('day')}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          title="翌日に送る"
        >
          <Calendar className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleMoveToNext('week')}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          title="翌週に送る"
        >
          <Clock className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleMoveToNext('month')}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          title="翌月に送る"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* 削除 */}
        <button
          onClick={handleDelete}
          className="p-1.5 rounded hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
          title="削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
