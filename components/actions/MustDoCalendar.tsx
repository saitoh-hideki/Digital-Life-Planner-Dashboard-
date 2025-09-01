'use client'

import { useState, useEffect, useCallback } from 'react'
import { MustDoItem, MustDoScope } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, startOfWeek, addDays, addWeeks, addMonths } from 'date-fns'
import MustDoHeader from './MustDoHeader'
import MustDoList from './MustDoList'

interface MustDoCalendarProps {
  currentDate: Date
}

export default function MustDoCalendar({ currentDate }: MustDoCalendarProps) {
  const [items, setItems] = useState<MustDoItem[]>([])
  const [scope, setScope] = useState<MustDoScope>('day')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ローカルストレージからスコープを復元
  useEffect(() => {
    const savedScope = localStorage.getItem('mustDoScope') as MustDoScope
    if (savedScope && ['month', 'week', 'day'].includes(savedScope)) {
      setScope(savedScope)
    }
  }, [])

  // スコープ変更時にローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('mustDoScope', scope)
  }, [scope])

  // アイテムを取得
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let anchorDate: string
      switch (scope) {
        case 'month':
          anchorDate = format(startOfMonth(currentDate), 'yyyy-MM-dd')
          break
        case 'week':
          anchorDate = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
          break
        case 'day':
          anchorDate = format(currentDate, 'yyyy-MM-dd')
          break
      }

      const { data, error } = await supabase
        .from('must_do_items')
        .select('*')
        .eq('anchor_date', anchorDate)
        .order('order_index', { ascending: true })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching must-do items:', error)
      setError('アイテムの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [scope, currentDate])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // アイテムを追加
  const handleAddItem = async (title: string) => {
    try {
      let anchorDate: string
      switch (scope) {
        case 'month':
          anchorDate = format(startOfMonth(currentDate), 'yyyy-MM-dd')
          break
        case 'week':
          anchorDate = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
          break
        case 'day':
          anchorDate = format(currentDate, 'yyyy-MM-dd')
          break
      }

      const maxOrderIndex = items.length > 0 ? Math.max(...items.map(item => item.order_index)) : -1
      const newOrderIndex = maxOrderIndex + 1

      const { data, error } = await supabase
        .from('must_do_items')
        .insert({
          scope,
          anchor_date: anchorDate,
          title,
          status: 'todo',
          order_index: newOrderIndex
        })
        .select()
        .single()

      if (error) throw error

      setItems(prev => [...prev, data])
    } catch (error) {
      console.error('Error adding item:', error)
      setError('アイテムの追加に失敗しました')
    }
  }

  // 完了状態を切り替え
  const handleToggleComplete = async (id: string) => {
    try {
      const item = items.find(item => item.id === id)
      if (!item) return

      const newStatus = item.status === 'todo' ? 'done' : 'todo'
      const { error } = await supabase
        .from('must_do_items')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ))
    } catch (error) {
      console.error('Error toggling complete:', error)
      setError('状態の更新に失敗しました')
    }
  }

  // アイテムを削除
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('must_do_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting item:', error)
      setError('アイテムの削除に失敗しました')
    }
  }

  // 翌日/週/月に送る
  const handleMoveToNext = async (id: string, target: 'day' | 'week' | 'month') => {
    try {
      const item = items.find(item => item.id === id)
      if (!item) return

      let newAnchorDate: string
      let newScope: MustDoScope

      switch (target) {
        case 'day':
          newAnchorDate = format(addDays(new Date(item.anchor_date), 1), 'yyyy-MM-dd')
          newScope = 'day'
          break
        case 'week':
          newAnchorDate = format(addWeeks(new Date(item.anchor_date), 1), 'yyyy-MM-dd')
          newScope = 'week'
          break
        case 'month':
          newAnchorDate = format(addMonths(new Date(item.anchor_date), 1), 'yyyy-MM-dd')
          newScope = 'month'
          break
      }

      // 新しいアイテムを作成
      const { data, error } = await supabase
        .from('must_do_items')
        .insert({
          scope: newScope,
          anchor_date: newAnchorDate,
          title: item.title,
          status: 'todo',
          order_index: 0
        })
        .select()
        .single()

      if (error) throw error

      // 元のアイテムを削除
      await handleDelete(id)

      // 新しいスコープのアイテムを再取得
      fetchItems()
    } catch (error) {
      console.error('Error moving item:', error)
      setError('アイテムの移動に失敗しました')
    }
  }

  // 並び替え
  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = items.findIndex(item => item.id === id)
      if (currentIndex === -1) return

      let targetIndex: number
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1
      } else if (direction === 'down' && currentIndex < items.length - 1) {
        targetIndex = currentIndex + 1
      } else {
        return
      }

      const newItems = [...items]
      const [movedItem] = newItems.splice(currentIndex, 1)
      newItems.splice(targetIndex, 0, movedItem)

      // order_indexを更新
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order_index: index
      }))

      // データベースを更新
      for (const item of updatedItems) {
        const { error } = await supabase
          .from('must_do_items')
          .update({ order_index: item.order_index })
          .eq('id', item.id)

        if (error) throw error
      }

      setItems(updatedItems)
    } catch (error) {
      console.error('Error reordering items:', error)
      setError('並び替えに失敗しました')
    }
  }

  // スコープ変更
  const handleScopeChange = (newScope: MustDoScope) => {
    setScope(newScope)
  }

  // 日付変更
  const handleDateChange = (newDate: Date) => {
    // 親コンポーネントで日付を更新する必要があります
    // このコンポーネントでは現在の日付のみを管理
    console.log('Date changed to:', newDate)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <MustDoHeader
        currentDate={currentDate}
        scope={scope}
        onScopeChange={handleScopeChange}
        onDateChange={handleDateChange}
        onAddItem={() => {}} // ヘッダーでは使用しない
      />
      
      <div className="flex-1 overflow-y-auto">
        <MustDoList
          items={items}
          scope={scope}
          currentDate={currentDate}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          onMoveToNext={handleMoveToNext}
          onReorder={handleReorder}
          onAddItem={handleAddItem}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
