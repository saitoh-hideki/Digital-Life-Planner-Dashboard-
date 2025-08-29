'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LocalApp } from '@/lib/types'
import { Smartphone, Plus, Edit, Trash2, Save, X, Globe } from 'lucide-react'

interface AppFormData {
  name: string
  summary: string
  platform: string
  provider: string
}

export default function AppsAdminPage() {
  const [apps, setApps] = useState<LocalApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [formData, setFormData] = useState<AppFormData>({
    name: '',
    summary: '',
    platform: '',
    provider: ''
  })

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('local_apps')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error
      setApps(data || [])
    } catch (error) {
      console.error('Error fetching apps:', error)
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
          .from('local_apps')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', isEditing)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('local_apps')
          .insert([formData])

        if (error) throw error
      }

      // フォームをリセット
      setFormData({ name: '', summary: '', platform: '', provider: '' })
      setIsEditing(null)
      
      // データを再取得
      await fetchApps()
    } catch (error) {
      console.error('Error saving app:', error)
      setError('データの保存中にエラーが発生しました')
    }
  }

  const handleEdit = (item: LocalApp) => {
    setIsEditing(item.id)
    setFormData({
      name: item.name || '',
      summary: item.summary || '',
      platform: item.platform || '',
      provider: item.provider || ''
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このアプリを削除しますか？')) return

    try {
      setError(null)
      const { error } = await supabase
        .from('local_apps')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await fetchApps()
    } catch (error) {
      console.error('Error deleting app:', error)
      setError('データの削除中にエラーが発生しました')
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setFormData({ name: '', summary: '', platform: '', provider: '' })
  }

  const getPlatformBadge = (platform: string | null) => {
    if (!platform) return { text: '未設定', color: 'bg-gray-100 text-gray-800' }
    
    switch (platform.toLowerCase()) {
      case 'ios':
        return { text: 'iOS', color: 'bg-blue-100 text-blue-800' }
      case 'android':
        return { text: 'Android', color: 'bg-green-100 text-green-800' }
      case 'web':
        return { text: 'Web', color: 'bg-purple-100 text-purple-800' }
      case 'cross-platform':
        return { text: 'Cross-Platform', color: 'bg-indigo-100 text-indigo-800' }
      default:
        return { text: platform, color: 'bg-slate-100 text-slate-800' }
    }
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
          <h1 className="text-3xl font-bold text-slate-900">地域アプリ管理</h1>
          <p className="text-slate-600 mt-2">地域特化型アプリケーションの情報を管理します</p>
        </div>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          {isEditing ? 'アプリ情報を編集' : '新しいアプリを追加'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              アプリ名 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: 横浜市公式アプリ"
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
              placeholder="アプリの機能や特徴について説明"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                プラットフォーム
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">プラットフォームを選択</option>
                <option value="iOS">iOS</option>
                <option value="Android">Android</option>
                <option value="Web">Web</option>
                <option value="Cross-Platform">Cross-Platform</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                提供元
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="例: 横浜市役所、民間企業名"
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

      {/* アプリ一覧 */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">アプリ一覧</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  アプリ名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  概要
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  プラットフォーム
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  提供元
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {apps.map((item) => {
                const platformBadge = getPlatformBadge(item.platform)
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${platformBadge.color}`}>
                        {platformBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.provider || '-'}
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
        
        {apps.length === 0 && (
          <div className="text-center py-12">
            <Smartphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">地域アプリ情報はまだありません</p>
            <p className="text-slate-400 text-sm mt-2">新しいアプリを追加してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
