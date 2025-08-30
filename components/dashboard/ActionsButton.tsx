'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'
import Link from 'next/link'

export default function ActionsButton() {
  const [uncompletedCount, setUncompletedCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchUncompletedCount()
  }, [])

  const fetchUncompletedCount = async () => {
    try {
      setLoading(true)
      setError(false)
      
      // テーブルが存在するかチェック
      const { data: tableCheck, error: tableError } = await supabase
        .from('action_tasks')
        .select('id')
        .limit(1)

      if (tableError) {
        console.warn('action_tasks table not accessible:', tableError)
        setError(true)
        return
      }

      const today = format(new Date(), 'yyyy-MM-dd')
      
      const { count, error } = await supabase
        .from('action_tasks')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', `${today} 00:00`)
        .lte('start_time', `${today} 23:59`)
        .eq('is_completed', false)

      if (error) throw error
      setUncompletedCount(count || 0)
    } catch (error) {
      console.error('Error fetching uncompleted count:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link
      href="/actions"
      className="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      <Calendar className="w-4 h-4" />
      Actions
      
      {/* 未完了タスク数のバッジ */}
      {!error && uncompletedCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {uncompletedCount > 9 ? '9+' : uncompletedCount}
        </span>
      )}
      
      {/* ローディング状態 */}
      {!error && loading && (
        <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          ...
        </span>
      )}

      {/* エラー状態（テーブルが存在しない場合） */}
      {error && (
        <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          !
        </span>
      )}
    </Link>
  )
}
