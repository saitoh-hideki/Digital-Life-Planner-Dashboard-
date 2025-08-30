'use client'

import { useState } from 'react'
import { ActionTask } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { Clock, CheckCircle, Edit, Trash2, Plus } from 'lucide-react'
import { getCategoryConfig } from '@/lib/actionCategories'

interface ActionTimeTableProps {
  tasks: ActionTask[]
  onTimeSlotClick: (time: string) => void
  onTaskClick: (task: ActionTask) => void
  onTaskComplete: (taskId: string) => void
  onTaskDelete: (taskId: string) => void
}

export default function ActionTimeTable({
  tasks,
  onTimeSlotClick,
  onTaskClick,
  onTaskComplete,
  onTaskDelete
}: ActionTimeTableProps) {
  const [currentTime] = useState(new Date())
  
  // 8:00〜20:00の30分刻みの時間スロットを生成
  const timeSlots = []
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  // 各時間スロットに配置されるタスクを取得
  const getTasksForTimeSlot = (time: string) => {
    return tasks.filter(task => {
      const taskStart = format(parseISO(task.start_time), 'HH:mm')
      const taskEnd = format(parseISO(task.end_time), 'HH:mm')
      
      // 時間スロットがタスクの時間範囲内にあるかチェック
      const timeSlot = time
      const startTime = taskStart
      const endTime = taskEnd
      
      // タスクがその時間スロットに含まれる場合
      return timeSlot >= startTime && timeSlot < endTime
    })
  }

  // 現在時刻をハイライト
  const isCurrentTime = (time: string) => {
    const currentTimeStr = format(currentTime, 'HH:mm')
    return currentTimeStr === time
  }

  // 時間スロットの背景色を決定
  const getTimeSlotBgColor = (time: string) => {
    if (isCurrentTime(time)) {
      return 'bg-blue-50 border-blue-200'
    }
    return 'bg-white hover:bg-gray-50'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          今日の時間割（8:00〜20:00）
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          クリックしてタスクを追加、ドラッグで移動、リサイズで時間変更
        </p>
      </div>

      {/* 時間テーブル */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {timeSlots.map((time) => {
            const timeSlotTasks = getTasksForTimeSlot(time)
            const isCurrent = isCurrentTime(time)
            
            return (
              <div
                key={time}
                className={`
                  flex border-b border-gray-100 last:border-b-0 transition-colors
                  ${getTimeSlotBgColor(time)}
                  ${isCurrent ? 'ring-2 ring-blue-300' : ''}
                `}
              >
                {/* 時間表示 */}
                <div className="w-20 px-4 py-3 flex-shrink-0 border-r border-gray-100">
                  <div className="text-sm font-medium text-gray-700">
                    {time}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      現在
                    </div>
                  )}
                </div>

                {/* タスクエリア */}
                <div className="flex-1 px-4 py-3 min-h-[60px] relative">
                  {timeSlotTasks.length === 0 ? (
                    // 空のスロット
                    <button
                      onClick={() => onTimeSlotClick(time)}
                      className="w-full h-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="ml-2 text-sm">タスク追加</span>
                    </button>
                  ) : (
                    // タスクカード表示
                    <div className="space-y-2">
                      {timeSlotTasks.map((task) => {
                        const categoryConfig = getCategoryConfig(task.category)
                        const isCompleted = task.is_completed
                        
                        return (
                          <div
                            key={task.id}
                            className={`
                              relative group cursor-pointer rounded-lg p-3 border transition-all
                              ${isCompleted 
                                ? 'opacity-60 bg-gray-50 border-gray-200' 
                                : `${categoryConfig.bgColor} ${categoryConfig.borderColor}`
                              }
                              hover:shadow-md hover:scale-[1.02] transition-all
                            `}
                            onClick={() => onTaskClick(task)}
                          >
                            {/* カテゴリタグ */}
                            <div className="flex items-center justify-between mb-2">
                              <span className={`
                                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                ${isCompleted ? 'bg-gray-200 text-gray-600' : categoryConfig.color}
                              `}>
                                {categoryConfig.label}
                              </span>
                              
                              {/* アクションボタン */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isCompleted && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onTaskComplete(task.id)
                                    }}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    title="完了"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onTaskClick(task)
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="編集"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onTaskDelete(task.id)
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="削除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* タスクタイトル */}
                            <h3 className={`
                              font-medium text-sm mb-1
                              ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-900'}
                            `}>
                              {task.title}
                            </h3>

                            {/* メモ */}
                            {task.memo && (
                              <p className={`
                                text-xs mb-2
                                ${isCompleted ? 'text-gray-500' : 'text-gray-600'}
                              `}>
                                {task.memo}
                              </p>
                            )}

                            {/* 時間と優先度 */}
                            <div className="flex items-center justify-between text-xs">
                              <span className={`
                                ${isCompleted ? 'text-gray-500' : 'text-gray-600'}
                              `}>
                                {format(parseISO(task.start_time), 'HH:mm')} - {format(parseISO(task.end_time), 'HH:mm')}
                              </span>
                              
                              {/* 優先度バッジ */}
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-medium
                                ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'}
                              `}>
                                {task.priority === 'high' ? '高' :
                                 task.priority === 'medium' ? '中' : '低'}
                              </span>
                            </div>

                            {/* 完了済みの場合はチェックマーク */}
                            {isCompleted && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                            )}
                          </div>
                        )
                      })}
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
