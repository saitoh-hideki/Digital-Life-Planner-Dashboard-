'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Topic } from '@/lib/types'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function TopicsAdminPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('published_at', { ascending: false })
      
      if (error) throw error
      setTopics(data || [])
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTopic) return

    try {
      if (editingTopic.id) {
        // 更新
        const { error } = await supabase
          .from('topics')
          .update({
            headline: editingTopic.headline,
            ai_summary: editingTopic.ai_summary,
            source_name: editingTopic.source_name,
            is_today: editingTopic.is_today,
            published_at: editingTopic.published_at
          })
          .eq('id', editingTopic.id)
        
        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('topics')
          .insert([{
            headline: editingTopic.headline,
            ai_summary: editingTopic.ai_summary,
            source_name: editingTopic.source_name,
            is_today: editingTopic.is_today,
            published_at: editingTopic.published_at
          }])
        
        if (error) throw error
      }
      
      setEditingTopic(null)
      setShowForm(false)
      fetchTopics()
    } catch (error) {
      console.error('Error saving topic:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このトピックを削除しますか？')) return
    
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchTopics()
    } catch (error) {
      console.error('Error deleting topic:', error)
    }
  }

  const toggleToday = async (id: number, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_today: !currentValue })
        .eq('id', id)
      
      if (error) throw error
      fetchTopics()
    } catch (error) {
      console.error('Error updating topic:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">本日のトピック管理</h1>
          <p className="text-slate-600 mt-2">本日のトピック情報を管理します</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          ダッシュボードに戻る
        </Link>
      </div>

      {/* フォーム */}
      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingTopic?.id ? 'トピック編集' : '新規トピック追加'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                見出し
              </label>
              <input
                type="text"
                value={editingTopic?.headline || ''}
                onChange={(e) => setEditingTopic(prev => prev ? { ...prev, headline: e.target.value } : null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                AI要約
              </label>
              <textarea
                value={editingTopic?.ai_summary || ''}
                onChange={(e) => setEditingTopic(prev => prev ? { ...prev, ai_summary: e.target.value } : null)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                出典名
              </label>
              <input
                type="text"
                value={editingTopic?.source_name || ''}
                onChange={(e) => setEditingTopic(prev => prev ? { ...prev, source_name: e.target.value } : null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                発行日時
              </label>
              <input
                type="datetime-local"
                value={editingTopic?.published_at ? editingTopic.published_at.slice(0, 16) : ''}
                onChange={(e) => setEditingTopic(prev => prev ? { ...prev, published_at: e.target.value } : null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingTopic?.is_today || false}
                  onChange={(e) => setEditingTopic(prev => prev ? { ...prev, is_today: e.target.checked } : null)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">本日のトピックに表示</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTopic?.id ? '更新' : '作成'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingTopic(null)
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* トピック一覧 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  見出し
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  出典
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  発行日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  本日表示
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {topics.map((topic) => (
                <tr key={topic.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 max-w-xs truncate">
                      {topic.headline}
                    </div>
                    {topic.ai_summary && (
                      <div className="text-sm text-slate-500 max-w-xs truncate">
                        {topic.ai_summary}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {topic.source_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(topic.published_at).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleToday(topic.id, topic.is_today)}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        topic.is_today
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {topic.is_today ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {topic.is_today ? '表示中' : '非表示'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTopic(topic)
                          setShowForm(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
