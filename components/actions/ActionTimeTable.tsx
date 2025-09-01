'use client'

import { useState } from 'react'
import { ActionTask, ActionCategory } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Clock, CheckCircle, Edit, Trash2, Plus, Calendar, RotateCcw } from 'lucide-react'

interface ActionTimeTableProps {
  tasks: ActionTask[]
  selectedDate: Date
  onTimeSlotClick: (time: string) => void
  onTaskClick: (task: ActionTask) => void
  onTaskComplete: (taskId: string) => void
  onTaskDelete: (taskId: string) => void
  onResetTasks: () => void
}

export default function ActionTimeTable({
  tasks,
  selectedDate,
  onTimeSlotClick,
  onTaskClick,
  onTaskComplete,
  onTaskDelete,
  onResetTasks
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

  // 現在時刻をハイライト
  const isCurrentTime = (time: string) => {
    const currentTimeStr = format(currentTime, 'HH:mm')
    return currentTimeStr === time
  }

  // カテゴリごとの色を直接指定（淡い色）
  const getCategoryStyle = (category: ActionCategory) => {
    switch (category) {
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

  // カテゴリのラベルを取得
  const getCategoryLabel = (category: ActionCategory) => {
    switch (category) {
      case 'discussion': return 'ディスカッション'
      case 'round': return 'ラウンド'
      case 'fas_preparation': return 'FAS拡張準備'
      case 'appointment': return 'アポイント'
      case 'clinic_related': return 'クリニック関連'
      case 'media_promotion': return 'メディア・販促制作'
      case 'meeting': return 'MTG'
      case 'roleplay': return 'ロールプレイング'
      case 'documentation': return '資料作成'
      case 'interview': return '取材活動'
      case 'academic_circle': return 'アカデミックサークル'
      case 'ao_school_lecturer': return 'AO校講師活動'
      case 'facility_preparation': return '施設準備'
      case 'layout_change': return 'レイアウト変更'
      case 'skill_learning': return 'スキルラーニング'
      case 'other': return 'その他'
      default: return 'その他'
    }
  }

  // 時間スロットの背景色を決定
  const getTimeSlotBgColor = (time: string) => {
    if (isCurrentTime(time)) {
      return 'bg-blue-50 border-blue-200'
    }
    
    // タスクが継続中のスロットかチェック
    const continuingTask = tasks.find(task => {
      const taskStart = parseISO(task.start_time)
      const taskEnd = parseISO(task.end_time)
      const [hour, minute] = time.split(':').map(Number)
      const timeDate = new Date()
      timeDate.setHours(hour, minute, 0, 0)
      
      return timeDate > taskStart && timeDate < taskEnd
    })
    
    if (continuingTask) {
      const style = getCategoryStyle(continuingTask.category)
      return style.bg
    }
    
    return 'bg-white hover:bg-gray-50'
  }

  // タスクの表示方法を決定（重複を防ぐ）
  const getTaskDisplay = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)
    const timeDate = new Date()
    timeDate.setHours(hour, minute, 0, 0)
    
    // この時間スロットで開始するタスクを取得
    const startingTasks = tasks.filter(task => {
      const taskStart = parseISO(task.start_time)
      return format(taskStart, 'HH:mm') === time
    })
    
    // この時間スロットで継続中のタスクを取得（重複を防ぐ）
    const continuingTasks = tasks.filter(task => {
      const taskStart = parseISO(task.start_time)
      const taskEnd = parseISO(task.end_time)
      // 継続中のタスクは、この時間スロットが開始時刻と終了時刻の間にある場合
      // ただし、開始時刻と一致する場合は除外（開始タスクとして表示されるため）
      return timeDate >= taskStart && timeDate < taskEnd && format(taskStart, 'HH:mm') !== time
    })
    
    return { startingTasks, continuingTasks }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {format(selectedDate, 'yyyy年M月d日（EEEE）', { locale: ja })}の時間割（8:00〜20:00）
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              クリックしてタスクを追加、ドラッグで移動、リサイズで時間変更
            </p>
          </div>
          <button
            onClick={onResetTasks}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors hover:scale-105 shadow-sm"
            title="当日のタスクを全てクリア"
          >
            <RotateCcw className="w-4 h-4" />
            リセット
          </button>
        </div>
      </div>

      {/* 時間テーブル - スクロール可能なコンテナ */}
      <div className="overflow-x-auto">
        <div className="min-w-full max-h-[70vh] overflow-y-auto">
          {timeSlots.map((time) => {
            const { startingTasks, continuingTasks } = getTaskDisplay(time)
            const isCurrent = isCurrentTime(time)
            const hasTask = startingTasks.length > 0 || continuingTasks.length > 0
            
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
                  {!hasTask ? (
                    // 空のスロット
                    <button
                      onClick={() => onTimeSlotClick(time)}
                      className="w-full h-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="ml-2 text-sm">タスク追加</span>
                    </button>
                  ) : (
                    // タスク表示
                    <div className="space-y-2">
                      {/* 開始するタスクを表示 */}
                      {startingTasks.map((task) => {
                        const style = getCategoryStyle(task.category)
                        const isCompleted = task.is_completed
                        
                        return (
                          <div
                            key={task.id}
                            className={`
                              relative group cursor-pointer rounded-lg p-3 border transition-all
                              ${isCompleted 
                                ? 'opacity-60 bg-gray-50 border-gray-200' 
                                : `${style.bg} ${style.border}`
                              }
                              hover:shadow-md hover:scale-[1.02] transition-all
                            `}
                            onClick={() => onTaskClick(task)}
                          >
                            {/* カテゴリタグ */}
                            <div className="flex items-center justify-between mb-2">
                              <span className={`
                                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                ${isCompleted ? 'bg-gray-200 text-gray-600' : `${style.bg} ${style.text}`}
                              `}>
                                {getCategoryLabel(task.category)}
                              </span>
                              
                              {/* アクションボタン */}
                              <div className="flex items-center gap-2">
                                {!isCompleted && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onTaskComplete(task.id)
                                    }}
                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm"
                                    title="完了"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    完了
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onTaskClick(task)
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="編集"
                                >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onTaskDelete(task.id)
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
                      
                      {/* 継続中のタスクは背景色のみで表示（Googleカレンダー風） */}
                      {continuingTasks.length > 0 && startingTasks.length === 0 && (
                        <div className="h-8 flex items-center justify-center">
                          <div className="text-xs font-medium">
                            {/* 継続中のタスクの色でテキストを表示 */}
                            {continuingTasks[0] && (
                              <span className={getCategoryStyle(continuingTasks[0].category).text}>
                                タスク継続中
                              </span>
                            )}
                          </div>
                        </div>
                      )}
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
