'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Subsidy } from '@/lib/types'
import { DollarSign, Plus, Edit, Trash2, Save, X, Calendar } from 'lucide-react'
import Link from 'next/link'

interface SubsidyFormData {
  name: string
  summary: string
  audience: string
  apply_start: string
  apply_end: string
}

export default function SubsidiesAdminPage() {
  const [subsidies, setSubsidies] = useState<Subsidy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [formData, setFormData] = useState<SubsidyFormData>({
    name: '',
    summary: '',
    audience: '',
    apply_start: '',
    apply_end: ''
  })

  useEffect(() => {
    fetchSubsidies()
  }, [])

  const fetchSubsidies = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('subsidies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubsidies(data || [])
    } catch (error) {
      console.error('Error fetching subsidies:', error)
      setError('データの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setError(null)
      
      if (isEditing) {
        // 更新
        const { error } = await supabase
          .from('subsidies')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', isEditing)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('subsidies')
          .insert([formData])

        if (error) throw error
      }

      // フォームをリセット
      setFormData({ name: '', summary: '', audience: '', apply_start: '', apply_end: '' })
      setIsEditing(null)
      
      // データを再取得
      await fetchSubsidies()
    } catch (error) {
      console.error('Error saving subsidy:', error)
      setError('データの保存中にエラーが発生しました')
    }
  }

  const handleEdit = (item: Subsidy) => {
    setIsEditing(item.id)
    setFormData({
      name: item.name || '',
      summary: item.summary || '',
      audience: item.audience || '',
      apply_start: item.apply_start ? new Date(item.apply_start).toISOString().split('T')[0] : '',
      apply_end: item.apply_end ? new Date(item.apply_end).toISOString().split('T')[0] : ''
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この補助金・助成金を削除しますか？')) return

    try {
      setError(null)
      const { error } = await supabase
        .from('subsidies')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await fetchSubsidies()
    } catch (error) {
      console.error('Error deleting subsidy:', error)
      setError('データの削除中にエラーが発生しました')
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setFormData({ name: '', summary: '', audience: '', apply_start: '', apply_end: '' })
  }

  const getStatusBadge = (endDate: string | null) => {
    if (!endDate) return { text: '情報なし', color: 'bg-gray-100 text-gray-800' }
    
    const now = new Date()
    const end = new Date(endDate)
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: '終了', color: 'bg-gray-100 text-gray-800' }
    if (diffDays <= 7) return { text: '締切間近', color: 'bg-orange-100 text-orange-800' }
    return { text: '余裕あり', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-500">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">補助金・助成金管理</h1>
          <p className="text-slate-600 mt-2">地域の補助金・助成金情報を管理します</p>
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
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {isEditing ? '補助金・助成金を編集' : '新しい補助金・助成金を追加'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              名称 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: 創業支援補助金"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              概要 *
            </label>
            <textarea
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="補助金・助成金の詳細な説明"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                対象者
              </label>
              <input
                type="text"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="例: 中小企業、個人事業主"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                申請開始日
              </label>
              <input
                type="date"
                value={formData.apply_start}
                onChange={(e) => setFormData({ ...formData, apply_start: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                申請終了日
              </label>
              <input
                type="date"
                value={formData.apply_end}
                onChange={(e) => setFormData({ ...formData, apply_end: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  更新
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  追加
                </>
              )}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-300 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                キャンセル
              </button>
            )}
          </div>
        </form>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* 補助金・助成金一覧 */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">補助金・助成金一覧</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  概要
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  対象者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  申請期間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {subsidies.map((item) => {
                const status = getStatusBadge(item.apply_end)
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {item.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                      <div className="truncate" title={item.summary}>
                        {item.summary || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.audience || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          {item.apply_start ? new Date(item.apply_start).toLocaleDateString('ja-JP') : '-'}
                          {' → '}
                          {item.apply_end ? new Date(item.apply_end).toLocaleDateString('ja-JP') : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="編集"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {subsidies.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">補助金・助成金情報はまだありません</p>
            <p className="text-slate-400 text-sm mt-2">新しい補助金・助成金を追加してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
