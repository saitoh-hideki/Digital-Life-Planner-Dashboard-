'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { MustDoItem as MustDoItemType, MustDoScope } from '@/lib/types'
import MustDoItem from './MustDoItem'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'

interface MustDoListProps {
  items: MustDoItemType[]
  scope: MustDoScope
  currentDate: Date
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onMoveToNext: (id: string, target: 'day' | 'week' | 'month') => void
  onReorder: (id: string, direction: 'up' | 'down') => void
  onAddItem: (title: string) => void
}

export default function MustDoList({
  items,
  scope,
  currentDate,
  onToggleComplete,
  onDelete,
  onMoveToNext,
  onReorder,
  onAddItem
}: MustDoListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleQuickAdd = () => {
    if (newTitle.trim()) {
      onAddItem(newTitle.trim())
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

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // 週ごとにグループ化
    const weeks: Date[][] = []
    let currentWeek: Date[] = []
    
    days.forEach((day, index) => {
      currentWeek.push(day)
      if ((index + 1) % 7 === 0 || index === days.length - 1) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
    })

    return (
      <div className="space-y-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const dayItems = items.filter(item => 
                item.scope === 'day' && 
                item.anchor_date === format(day, 'yyyy-MM-dd')
              ).slice(0, 3) // 最大3件表示
              
              const hasMore = items.filter(item => 
                item.scope === 'day' && 
                item.anchor_date === format(day, 'yyyy-MM-dd')
              ).length > 3

              return (
                <div
                  key={day.toISOString()}
                  className="min-h-[80px] p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    // TODO: その日の詳細ビューに切り替え
                    console.log('Switch to day view:', format(day, 'yyyy-MM-dd'))
                  }}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  {dayItems.length > 0 ? (
                    <div className="space-y-1">
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          className={`text-xs p-1 rounded ${
                            item.status === 'done'
                              ? 'bg-green-100 text-green-700 line-through'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {item.title}
                        </div>
                      ))}
                      {hasMore && (
                        <div className="text-xs text-gray-500 text-center">
                          ...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-8">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    // 週全体のタスク
    const weekItems = items.filter(item => 
      item.scope === 'week' && 
      item.anchor_date === format(weekStart, 'yyyy-MM-dd')
    ).sort((a, b) => a.order_index - b.order_index)

    return (
      <div className="space-y-4">
        {/* 週全体のタスク */}
        {weekItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3">週全体のやること</h3>
            <div className="space-y-2">
              {weekItems.map((item, index) => (
                <MustDoItem
                  key={item.id}
                  item={item}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onMoveToNext={onMoveToNext}
                  onMoveUp={() => onReorder(item.id, 'up')}
                  onMoveDown={() => onReorder(item.id, 'down')}
                  isFirst={index === 0}
                  isLast={index === weekItems.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* 曜日別のタスク */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayItems = items.filter(item => 
              item.scope === 'day' && 
              item.anchor_date === format(day, 'yyyy-MM-dd')
            ).sort((a, b) => a.order_index - b.order_index)

            return (
              <div key={day.toISOString()} className="space-y-2">
                <div className="text-sm font-medium text-gray-700 text-center">
                  {format(day, 'EEEE', { locale: ja })}
                </div>
                <div className="space-y-2">
                  {dayItems.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id}
                      className={`text-xs p-2 rounded border ${
                        item.status === 'done'
                          ? 'bg-green-100 text-green-700 line-through border-green-200'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {item.title}
                    </div>
                  ))}
                  {dayItems.length > 5 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayItems.length - 5}件
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dayItems = items.filter(item => 
      item.scope === 'day' && 
      item.anchor_date === format(currentDate, 'yyyy-MM-dd')
    ).sort((a, b) => a.order_index - b.order_index)

    const pinnedItems = dayItems.filter(item => item.order_index < 3)
    const regularItems = dayItems.filter(item => item.order_index >= 3)

    return (
      <div className="space-y-4">
        {/* ピン留めアイテム */}
        {pinnedItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-3">最重要（ピン留め）</h3>
            <div className="space-y-2">
              {pinnedItems.map((item, index) => (
                <MustDoItem
                  key={item.id}
                  item={item}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onMoveToNext={onMoveToNext}
                  onMoveUp={() => onReorder(item.id, 'up')}
                  onMoveDown={() => onReorder(item.id, 'down')}
                  isFirst={index === 0}
                  isLast={index === pinnedItems.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* 通常アイテム */}
        {regularItems.length > 0 && (
          <div className="space-y-2">
            {regularItems.map((item, index) => (
              <MustDoItem
                key={item.id}
                item={item}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onMoveToNext={onMoveToNext}
                onMoveUp={() => onReorder(item.id, 'up')}
                onMoveDown={() => onReorder(item.id, 'down')}
                isFirst={index === 0}
                isLast={index === regularItems.length - 1}
              />
            ))}
          </div>
        )}

        {/* 空状態または追加フォーム */}
        {dayItems.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <Plus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>ここにやることを追加</p>
          </div>
        )}

        {/* クイック追加フォーム */}
        {isAdding && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="やることを入力..."
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleQuickAdd}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                追加
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewTitle('')
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 追加ボタン */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="w-5 h-5 mx-auto mb-1" />
            やることを追加
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {scope === 'month' && renderMonthView()}
      {scope === 'week' && renderWeekView()}
      {scope === 'day' && renderDayView()}
    </div>
  )
}
