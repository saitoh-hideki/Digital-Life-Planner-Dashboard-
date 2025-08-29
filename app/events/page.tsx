'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AcademicCircleEvent } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EventsPage() {
  const [events, setEvents] = useState<AcademicCircleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    fetchEvents()
  }, [selectedCategory, selectedDate])

  const fetchEvents = async () => {
    try {
      setError(null)
      let query = supabase
        .from('academic_circle_events')
        .select('*')
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (selectedCategory !== 'all') {
        query = query.eq('event_category', selectedCategory)
      }

      if (selectedDate) {
        query = query.eq('event_date', selectedDate)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('イベントの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getUniqueCategories = () => {
    const categories = events.map(event => event.event_category)
    return ['all', ...Array.from(new Set(categories))]
  }

  const getCategoryDisplayName = (category: string) => {
    if (category === 'all') return 'すべて'
    return category
  }

  const getDayOfWeekColor = (day: string) => {
    const colors: Record<string, string> = {
      '日': 'bg-red-100 text-red-800',
      '月': 'bg-blue-100 text-blue-800',
      '火': 'bg-red-100 text-red-800',
      '水': 'bg-green-100 text-green-800',
      '木': 'bg-yellow-100 text-yellow-800',
      '金': 'bg-purple-100 text-purple-800',
      '土': 'bg-indigo-100 text-indigo-800'
    }
    return colors[day] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-500">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">エラーが発生しました</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="btn-primary"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              ダッシュボードに戻る
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">イベントスケジュール</h1>
              <p className="text-slate-600 mt-1">アカデミックサークルのイベント一覧</p>
            </div>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">カテゴリ:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getUniqueCategories().map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">日付:</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              onClick={() => {
                setSelectedCategory('all')
                setSelectedDate('')
              }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              リセット
            </button>
          </div>
        </div>
      </div>

      {/* イベント一覧 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full min-h-[400px] max-h-[500px]"
              >
                {/* ヘッダー */}
                <div className="flex items-start justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDayOfWeekColor(event.day_of_week)}`}>
                      {event.day_of_week}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {event.delivery_type}
                    </span>
                  </div>
                </div>

                {/* イベント名 */}
                <h3 className="font-semibold text-slate-900 text-lg mb-2 line-clamp-3 flex-shrink-0">
                  {event.event_name}
                </h3>

                {/* カテゴリ */}
                <p className="text-slate-600 text-sm mb-4 flex-shrink-0">
                  {event.event_category}
                </p>

                {/* 日時・場所 */}
                <div className="space-y-2 mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{event.event_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}</span>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="mt-auto flex-shrink-0">
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                    詳細を見る
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 text-slate-300">
              <Calendar className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-slate-500 mb-2">イベントが見つかりません</h3>
            <p className="text-slate-400 text-sm">選択した条件に一致するイベントはありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
