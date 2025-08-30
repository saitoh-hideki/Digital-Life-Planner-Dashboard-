'use client'

import { useState, useEffect, useCallback } from 'react'
import { ActionTask, ActionCategory, DailySummary, MonthlySummary } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { Calendar, Plus, ArrowLeft, Home, Heart } from 'lucide-react'
import Link from 'next/link'
import ActionTimeTable from '@/components/actions/ActionTimeTable'
import ActionForm from '@/components/actions/ActionForm'
import DailySummaryCard from '@/components/actions/DailySummaryCard'
import MonthlySummaryCard from '@/components/actions/MonthlySummaryCard'
import ConfettiEffect from '@/components/actions/ConfettiEffect'
import SupporterSelector from '@/components/actions/SupporterSelector'

// 応援者の型定義（簡素化）
interface Supporter {
  id: string
  name: string
  avatar: string
  customName: string
  color: string
}

export default function ActionsPage() {
  const [tasks, setTasks] = useState<ActionTask[]>([])
  const [selectedTask, setSelectedTask] = useState<ActionTask | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null)
  const [currentDate] = useState(new Date())
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSupporterSelectorOpen, setIsSupporterSelectorOpen] = useState(false)
  const [selectedSupporter, setSelectedSupporter] = useState<Supporter | null>(null)

  // 応援者設定の初期化
  useEffect(() => {
    const savedSupporter = localStorage.getItem('selectedSupporter')
    if (savedSupporter) {
      try {
        setSelectedSupporter(JSON.parse(savedSupporter))
      } catch (error) {
        console.error('Error parsing saved supporter:', error)
      }
    }
  }, [])

  // 応援者設定の変更ハンドラー
  const handleSupporterChange = (supporter: Supporter) => {
    setSelectedSupporter(supporter)
    localStorage.setItem('selectedSupporter', JSON.stringify(supporter))
  }

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const today = format(currentDate, 'yyyy-MM-dd')
      
      // 今日のタスクのみを取得（重複を防ぐ）
      const { data, error } = await supabase
        .from('action_tasks')
        .select('*')
        .gte('start_time', `${today} 00:00`)
        .lt('start_time', `${today} 23:59`)
        .order('start_time', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setError('タスクの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  const fetchSummaries = useCallback(async () => {
    try {
      // 日次サマリー
      const today = format(currentDate, 'yyyy-MM-dd')
      const todayTasks = tasks.filter(task => 
        format(parseISO(task.start_time), 'yyyy-MM-dd') === today
      )
      
      const completedCount = todayTasks.filter(task => task.is_completed).length
      const totalCount = todayTasks.length
      const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
      
      // 合計作業時間を計算
      const totalHours = todayTasks.reduce((total, task) => {
        if (task.is_completed) {
          const start = parseISO(task.start_time)
          const end = parseISO(task.end_time)
          const diffMs = end.getTime() - start.getTime()
          return total + (diffMs / (1000 * 60 * 60)) // 時間単位
        }
        return total
      }, 0)

      setDailySummary({
        date: today,
        completed_count: completedCount,
        total_count: totalCount,
        completion_rate: completionRate,
        total_work_hours: Math.round(totalHours * 10) / 10
      })

      // 月次サマリー（簡易版）
      const currentMonth = startOfMonth(currentDate)
      const monthTasks = tasks.filter(task => {
        const taskDate = parseISO(task.start_time)
        return taskDate >= currentMonth && taskDate <= endOfMonth(currentDate)
      })

      // すべてのカテゴリを確実に初期化
      const categoryHours: Record<ActionCategory, number> = {
        discussion: 0, round: 0, fas_preparation: 0, appointment: 0,
        clinic_related: 0, media_promotion: 0, meeting: 0, roleplay: 0,
        documentation: 0, interview: 0, academic_circle: 0, ao_school_lecturer: 0,
        facility_preparation: 0, layout_change: 0, skill_learning: 0, other: 0
      }

      const categoryMinutes: Record<ActionCategory, number> = {
        discussion: 0, round: 0, fas_preparation: 0, appointment: 0,
        clinic_related: 0, media_promotion: 0, meeting: 0, roleplay: 0,
        documentation: 0, interview: 0, academic_circle: 0, ao_school_lecturer: 0,
        facility_preparation: 0, layout_change: 0, skill_learning: 0, other: 0
      }

      monthTasks.forEach(task => {
        // 完了済みでなくても、すべてのタスクの時間を計算
        try {
          const start = parseISO(task.start_time)
          const end = parseISO(task.end_time)
          
          // 開始時刻と終了時刻が有効かチェック
          if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const diffMs = end.getTime() - start.getTime()
            
            // 負の値や異常に大きな値をチェック
            if (diffMs > 0 && diffMs < 24 * 60 * 60 * 1000) { // 24時間以内
              const hours = diffMs / (1000 * 60 * 60)
              const minutes = diffMs / (1000 * 60)
              
              // カテゴリが有効かチェック
              if (task.category && categoryHours.hasOwnProperty(task.category)) {
                categoryHours[task.category] += hours
                categoryMinutes[task.category] += minutes
              }
            }
          }
        } catch (error) {
          console.error('Error calculating time for task:', task.id, error)
        }
      })

      const totalMonthHours = Object.values(categoryHours).reduce((sum, hours) => sum + hours, 0)
      const totalMonthMinutes = Object.values(categoryMinutes).reduce((sum, minutes) => sum + minutes, 0)
      const daysInMonth = eachDayOfInterval({ start: currentMonth, end: endOfMonth(currentDate) }).length

      setMonthlySummary({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        category_hours: categoryHours,
        category_minutes: categoryMinutes,
        total_hours: Math.round(totalMonthHours * 10) / 10,
        total_minutes: Math.round(totalMonthMinutes),
        daily_average: daysInMonth > 0 ? Math.round((totalMonthHours / daysInMonth) * 10) / 10 : 0,
        completed_count: monthTasks.filter(task => task.is_completed).length
      })
    } catch (error) {
      console.error('Error calculating summaries:', error)
    }
  }, [tasks, currentDate])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (tasks.length > 0) {
      fetchSummaries()
    }
  }, [tasks, fetchSummaries])

  const handleTaskCreate = async (taskData: Omit<ActionTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('action_tasks')
        .insert([{
          ...taskData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      setTasks(prev => [...prev, data[0]])
      setIsFormOpen(false)
      fetchSummaries()
    } catch (error) {
      console.error('Error creating task:', error)
      setError('タスクの作成に失敗しました')
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<ActionTask>) => {
    try {
      const { error } = await supabase
        .from('action_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ))
      fetchSummaries()
    } catch (error) {
      console.error('Error updating task:', error)
      setError('タスクの更新に失敗しました')
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('action_tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== taskId))
      fetchSummaries()
    } catch (error) {
      console.error('Error deleting task:', error)
      setError('タスクの削除に失敗しました')
    }
  }

  const handleTaskComplete = async (taskId: string) => {
    await handleTaskUpdate(taskId, {
      is_completed: true,
      completed_at: new Date().toISOString()
    })
    
    // クラッカー演出を表示
    setShowConfetti(true)
  }

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time)
    setSelectedTask(null) // タスクを選択解除
    setIsFormOpen(true)
  }

  const handleTaskClick = (task: ActionTask) => {
    setSelectedTask(task)
    setIsFormOpen(true)
  }

  const handleConfettiComplete = () => {
    setShowConfetti(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* ダッシュボードに戻るボタン */}
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボード
            </Link>
            
            {/* ホームボタン */}
            <Link
              href="/"
              className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Actions（アクションズ）
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              今日の行動計画を管理し、時間を有効活用しましょう
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 応援者設定ボタン */}
            <button
              onClick={() => setIsSupporterSelectorOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Heart className="w-5 h-5" />
              応援者設定
            </button>
            
            {/* タスク追加ボタン */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              タスク追加
            </button>
          </div>
        </div>
      </div>

      {/* 日次サマリー */}
      {dailySummary && (
        <DailySummaryCard summary={dailySummary} />
      )}

      {/* 月次サマリー */}
      {monthlySummary && (
        <MonthlySummaryCard summary={monthlySummary} />
      )}

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 mt-8">
        {/* 左カラム：時間テーブル（70%） */}
        <div className="lg:col-span-5">
          <ActionTimeTable
            tasks={tasks}
            onTimeSlotClick={handleTimeSlotClick}
            onTaskClick={handleTaskClick}
            onTaskComplete={handleTaskComplete}
            onTaskDelete={handleTaskDelete}
          />
        </div>

        {/* 右カラム：タスク作成・編集（30%） */}
        <div className="lg:col-span-2">
          <ActionForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false)
              setSelectedTask(null)
              setSelectedTime('') // フォームを閉じるときに選択時間をリセット
            }}
            onSubmit={handleTaskCreate}
            onUpdate={handleTaskUpdate}
            task={selectedTask}
            selectedTime={selectedTime}
          />
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          {error}
        </div>
      )}

      {/* クラッカー演出 */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={handleConfettiComplete}
        selectedSupporter={selectedSupporter}
      />

      {/* 応援者設定モーダル */}
      <SupporterSelector
        isOpen={isSupporterSelectorOpen}
        onClose={() => setIsSupporterSelectorOpen(false)}
        onSupporterChange={handleSupporterChange}
        currentSupporter={selectedSupporter}
      />
    </div>
  )
}
