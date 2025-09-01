'use client'

import { useState, useEffect } from 'react'
import { ActionTask, ActionCategory } from '@/lib/types'
import { ACTION_CATEGORIES } from '@/lib/actionCategories'
import { format, parseISO } from 'date-fns'
import { X, Save, Clock, Tag, AlertTriangle, FileText } from 'lucide-react'

interface ActionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: Omit<ActionTask, 'id' | 'created_at' | 'updated_at'>) => void
  onUpdate: (taskId: string, updates: Partial<ActionTask>) => void
  task: ActionTask | null
  selectedTime?: string // 選択された時間スロット
}

export default function ActionForm({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  task,
  selectedTime
}: ActionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    memo: '',
    category: 'meeting' as ActionCategory,
    start_time: '',
    end_time: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task) {
      // 編集モード
      setFormData({
        title: task.title,
        memo: task.memo || '',
        category: task.category,
        start_time: format(parseISO(task.start_time), 'HH:mm'),
        end_time: format(parseISO(task.end_time), 'HH:mm'),
        priority: task.priority
      })
    } else {
      // 新規作成モード
      const now = new Date()
      let currentTime = ''
      let nextHour = ''
      
      if (selectedTime) {
        // 選択された時間スロットがある場合
        currentTime = selectedTime
        // 選択された時間から30分後を計算
        const [hours, minutes] = selectedTime.split(':').map(Number)
        const selectedDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
        const nextHalfHourDateTime = new Date(selectedDateTime.getTime() + 30 * 60 * 1000)
        nextHour = format(nextHalfHourDateTime, 'HH:mm')
      } else {
        // 現在時刻を使用
        currentTime = format(now, 'HH:mm')
        nextHour = format(new Date(now.getTime() + 30 * 60 * 1000), 'HH:mm')
      }
      
      setFormData({
        title: '',
        memo: '',
        category: 'meeting',
        start_time: currentTime,
        end_time: nextHour,
        priority: 'medium'
      })
    }
    setErrors({})
  }, [task, selectedTime]) // selectedTimeを依存配列に戻す

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.start_time) {
      newErrors.start_time = '開始時刻を選択してください'
    }

    if (!formData.end_time) {
      newErrors.end_time = '終了時刻を選択してください'
    }

    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`)
      const end = new Date(`2000-01-01T${formData.end_time}`)
      
      if (start >= end) {
        newErrors.end_time = '終了時刻は開始時刻より後にしてください'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      
      // 時間の処理を修正
      const startDateTime = new Date(`${today}T${formData.start_time}:00`)
      const endDateTime = new Date(`${today}T${formData.end_time}:00`)
      
      // 終了時刻が開始時刻より前の場合は、次の日に設定
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1)
      }
      
      const taskData = {
        title: ACTION_CATEGORIES.find(cat => cat.key === formData.category)?.label || formData.category,
        memo: formData.memo.trim() || undefined,
        category: formData.category,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        priority: formData.priority,
        is_completed: false
      }

      if (task) {
        // 更新
        await onUpdate(task.id, taskData)
      } else {
        // 新規作成
        await onSubmit(taskData)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* ヘッダー */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {task ? 'タスク編集' : 'タスク作成'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* カテゴリ選択（タイトルとして使用） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            タスクタイトル（カテゴリ）*
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value as ActionCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {ACTION_CATEGORIES.map(category => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            選択したカテゴリがタスクのタイトルになります
          </p>
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メモ
          </label>
          <textarea
            value={formData.memo}
            onChange={(e) => handleInputChange('memo', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="タスクの詳細やメモを入力（任意）"
          />
        </div>

        {/* 時間設定 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              開始時刻 *
            </label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.start_time ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.start_time && (
              <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              終了時刻 *
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.end_time ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.end_time && (
              <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
            )}
          </div>
        </div>

        {/* 優先度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            優先度
          </label>
          <div className="flex gap-3">
            {[
              { value: 'high', label: '高', color: 'bg-red-100 text-red-800 border-red-300' },
              { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
              { value: 'low', label: '低', color: 'bg-green-100 text-green-800 border-green-300' }
            ].map((priority) => (
              <label
                key={priority.value}
                className={`flex-1 px-4 py-2 border-2 rounded-lg cursor-pointer text-center font-medium transition-colors ${
                  formData.priority === priority.value
                    ? priority.color
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => handleInputChange('priority', e.target.value as 'high' | 'medium' | 'low')}
                  className="sr-only"
                />
                {priority.label}
              </label>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {task ? '更新' : '作成'}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}
