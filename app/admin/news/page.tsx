'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { prefectures } from '@/lib/prefectures'
import { LocalNews } from '@/lib/types'

export default function AdminNewsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [authError, setAuthError] = useState('')
  
  const [formData, setFormData] = useState<Partial<LocalNews>>({
    prefecture: '',
    municipality: '',
    name: '',
    summary: '',
    body: '',
    source_name: '',
    source_url: '',
    tags: [],
    status: 'draft',
    published_at: new Date().toISOString()
  })
  
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    // プロトタイプ用の簡易認証
    if (passphrase === 'dlp_admin_2024') {
      setIsAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('パスフレーズが正しくありません')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    
    try {
      const { error } = await supabase
        .from('local_news')
        .insert([{
          ...formData,
          tags: tagInput ? tagInput.split(',').map(t => t.trim()) : [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
      
      if (error) throw error
      
      setMessage('ニュースを保存しました')
      // フォームをリセット
      setFormData({
        prefecture: '',
        municipality: '',
        name: '',
        summary: '',
        body: '',
        source_name: '',
        source_url: '',
        tags: [],
        status: 'draft',
        published_at: new Date().toISOString()
      })
      setTagInput('')
    } catch (error) {
      console.error('Save error:', error)
      setMessage('保存中にエラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              管理者認証
            </h2>
            <form onSubmit={handleAuth}>
              <div className="mb-4">
                <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 mb-2">
                  パスフレーズ
                </label>
                <input
                  type="password"
                  id="passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {authError && (
                <p className="text-red-600 text-sm mb-4">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                認証
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          ダッシュボードに戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          地域ニュース管理
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-1">
                都道府県 <span className="text-red-500">*</span>
              </label>
              <select
                id="prefecture"
                value={formData.prefecture}
                onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {prefectures.map(pref => (
                  <option key={pref.value} value={pref.value}>
                    {pref.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-1">
                市区町村
              </label>
              <input
                type="text"
                id="municipality"
                value={formData.municipality}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 渋谷区"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
              要約
            </label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
              本文
            </label>
            <textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="source_name" className="block text-sm font-medium text-gray-700 mb-1">
                出典名
              </label>
              <input
                type="text"
                id="source_name"
                value={formData.source_name}
                onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="source_url" className="block text-sm font-medium text-gray-700 mb-1">
                出典URL
              </label>
              <input
                type="url"
                id="source_url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: DX推進, 高齢者支援, イベント"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              ステータス <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="draft">下書き</option>
              <option value="published">公開</option>
            </select>
          </div>
          
          {message && (
            <div className={`p-4 rounded-md ${message.includes('エラー') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
              {message}
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}