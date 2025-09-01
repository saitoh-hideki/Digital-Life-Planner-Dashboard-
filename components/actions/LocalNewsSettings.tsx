'use client'

import { useState, useEffect } from 'react'
import { LocalNews, LocalNewsCategory } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Save, X, Globe, MapPin, FileText, Link } from 'lucide-react'

interface LocalNewsSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_COLORS: Record<LocalNewsCategory, string> = {
  '行政DX': 'bg-blue-100 text-blue-800 border-blue-200',
  '教育・学習': 'bg-green-100 text-green-800 border-green-200',
  '防災・安全': 'bg-red-100 text-red-800 border-red-200',
  '福祉・子育て': 'bg-pink-100 text-pink-800 border-pink-200',
  '産業・ビジネス': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'イベント': 'bg-purple-100 text-purple-800 border-purple-200',
  '環境・暮らし': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'その他': 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function LocalNewsSettings({ isOpen, onClose }: LocalNewsSettingsProps) {
  const [news, setNews] = useState<LocalNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingNews, setEditingNews] = useState<LocalNews | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    prefecture: '',
    municipality: '',
    name: '',
    summary: '',
    body: '',
    source_url: '',
    category: '行政DX' as LocalNewsCategory
  })

  // ニュース一覧の取得
  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('local_news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNews(data || [])
    } catch (error) {
      console.error('Error fetching news:', error)
      setError('ニュースの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNews()
    }
  }, [isOpen])

  // フォームのリセット
  const resetForm = () => {
    setFormData({
      prefecture: '',
      municipality: '',
      name: '',
      summary: '',
      body: '',
      source_url: '',
      category: '行政DX'
    })
    setEditingNews(null)
  }

  // フォームの開閉
  const handleFormToggle = () => {
    if (isFormOpen) {
      resetForm()
    }
    setIsFormOpen(!isFormOpen)
  }

  // 編集開始
  const handleEdit = (newsItem: LocalNews) => {
    setEditingNews(newsItem)
    setFormData({
      prefecture: newsItem.prefecture,
      municipality: newsItem.municipality,
      name: newsItem.name,
      summary: newsItem.summary || '',
      body: newsItem.body || '',
      source_url: newsItem.source_url || '',
      category: newsItem.category
    })
    setIsFormOpen(true)
  }

  // ニュースの作成・更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingNews) {
        // 更新
        const { error } = await supabase
          .from('local_news')
          .update({
            prefecture: formData.prefecture,
            municipality: formData.municipality,
            name: formData.name,
            summary: formData.summary || null,
            body: formData.body || null,
            source_url: formData.source_url || null,
            category: formData.category
          })
          .eq('id', editingNews.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('local_news')
          .insert([{
            prefecture: formData.prefecture,
            municipality: formData.municipality,
            name: formData.name,
            summary: formData.summary || null,
            body: formData.body || null,
            source_url: formData.source_url || null,
            category: formData.category
          }])

        if (error) throw error
      }

      await fetchNews()
      resetForm()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error saving news:', error)
      setError('ニュースの保存に失敗しました')
    }
  }

  // ニュースの削除
  const handleDelete = async (id: string) => {
    if (!confirm('このニュースを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('local_news')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchNews()
    } catch (error) {
      console.error('Error deleting news:', error)
      setError('ニュースの削除に失敗しました')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            地域ニュース設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-full">
          {/* 左側：ニュース一覧 */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-700">ニュース一覧</h3>
              <button
                onClick={handleFormToggle}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {isFormOpen ? 'キャンセル' : '新規追加'}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((newsItem) => (
                  <div
                    key={newsItem.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[newsItem.category]}`}>
                            {newsItem.category}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {newsItem.prefecture} {newsItem.municipality}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{newsItem.name}</h4>
                        {newsItem.summary && (
                          <p className="text-sm text-gray-600 mb-2">{newsItem.summary}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(newsItem.created_at).toLocaleDateString('ja-JP')}</span>
                          {newsItem.source_url && (
                            <a
                              href={newsItem.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <Link className="w-3 h-3" />
                              出典
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(newsItem)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(newsItem.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右側：フォーム */}
          {isFormOpen && (
            <div className="w-1/3 p-6 border-l bg-gray-50 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {editingNews ? 'ニュース編集' : '新規ニュース追加'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    都道府県 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.prefecture}
                    onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    市区町村 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.municipality}
                    onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ニュースタイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリー <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as LocalNewsCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Object.keys(CATEGORY_COLORS).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    要約
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ダッシュボード/一覧用の要約"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    本文
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="詳細表示用の本文"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    出典URL
                  </label>
                  <input
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingNews ? '更新' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={handleFormToggle}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
