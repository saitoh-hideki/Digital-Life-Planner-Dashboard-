'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LocalNews, LocalNewsCategory } from '@/lib/types'
import { Upload, Download, Plus, Edit, Trash2, Database, FileText, CheckCircle, AlertCircle } from 'lucide-react'

const NEWS_CATEGORIES: LocalNewsCategory[] = [
  '行政DX',
  '教育・学習',
  '防災・安全',
  '福祉・子育て',
  '産業・ビジネス',
  'イベント',
  '環境・暮らし',
  'その他'
]

export default function AdminNewsPage() {
  const [news, setNews] = useState<LocalNews[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<LocalNews | null>(null)
  const [formData, setFormData] = useState({
    prefecture: '',
    municipality: '',
    name: '',
    summary: '',
    body: '',
    source_url: '',
    category: 'その他' as LocalNewsCategory
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('local_news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNews(data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'データの読み込みに失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'CSVファイルを選択してください' })
      return
    }

    setCsvFile(file)
  }

  const importCSV = async () => {
    if (!csvFile) return

    setLoading(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n')
      
      if (lines.length < 2) {
        throw new Error('CSVファイルが空またはヘッダーのみです')
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const expectedHeaders = ['prefecture', 'municipality', 'name', 'summary', 'body', 'source_url', 'category']
      
      // ヘッダー検証
      if (!expectedHeaders.every(h => headers.includes(h))) {
        throw new Error('CSVのヘッダーが期待される形式と一致しません')
      }

      const records: Partial<LocalNews>[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        if (values.length < headers.length) continue

        const record: Partial<LocalNews> = {
          prefecture: values[0] || '',
          municipality: values[1] || undefined,
          name: values[2] || '',
          summary: values[3] || undefined,
          body: values[4] || undefined,
          source_url: values[5] || undefined,
          category: (values[6] as LocalNewsCategory) || 'その他'
        }

        // nameが空のレコードはスキップ
        if (!record.name || !record.prefecture) continue

        records.push(record)
      }

      if (records.length === 0) {
        throw new Error('有効なデータが見つかりませんでした')
      }

      // データベースに挿入
      const { error: insertError } = await supabase
        .from('local_news')
        .insert(records)

      if (insertError) throw insertError

      setMessage({ type: 'success', text: `${records.length}件のデータをインポートしました` })
      setCsvFile(null)
      
      // データを再読み込み
      await loadData()
      
    } catch (error) {
      console.error('CSV import error:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
      setMessage({ type: 'error', text: `CSVインポートに失敗しました: ${errorMessage}` })
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingNews) {
        // 更新
        const { error } = await supabase
          .from('local_news')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNews.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'ニュースを更新しました' })
      } else {
        // 新規作成
        const { error } = await supabase
          .from('local_news')
          .insert([formData])

        if (error) throw error
        setMessage({ type: 'success', text: 'ニュースを追加しました' })
      }

      setShowForm(false)
      setEditingNews(null)
      resetForm()
      await loadData()
    } catch (error) {
      console.error('Error saving news:', error)
      setMessage({ type: 'error', text: 'ニュースの保存に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (newsItem: LocalNews) => {
    setEditingNews(newsItem)
    setFormData({
      prefecture: newsItem.prefecture || '',
      municipality: newsItem.municipality || '',
      name: newsItem.name || '',
      summary: newsItem.summary || '',
      body: newsItem.body || '',
      source_url: newsItem.source_url || '',
      category: newsItem.category || 'その他'
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このニュースを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('local_news')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: 'ニュースを削除しました' })
      await loadData()
    } catch (error) {
      console.error('Error deleting news:', error)
      setMessage({ type: 'error', text: 'ニュースの削除に失敗しました' })
    }
  }

  const resetForm = () => {
    setFormData({
      prefecture: '',
      municipality: '',
      name: '',
      summary: '',
      body: '',
      source_url: '',
      category: 'その他'
    })
  }

  const exportCSV = () => {
    const headers = ['prefecture', 'municipality', 'name', 'summary', 'body', 'source_url', 'category']
    const csvContent = [
      headers.join(','),
      ...news.map(item => [
        item.prefecture,
        item.municipality || '',
        item.name,
        item.summary || '',
        item.body || '',
        item.source_url || '',
        item.category
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'local_news.csv'
    link.click()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">地域ニュース管理</h1>
          <p className="text-slate-600">地域のデジタル化関連ニュースの管理</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* CSV Upload */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">CSVインポート</h3>
            </div>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3"
            />
            
            {csvFile && (
              <button
                onClick={importCSV}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'インポート中...' : 'インポート実行'}
              </button>
            )}
          </div>

          {/* Manual Add */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">手動追加</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              新しいニュースを手動で追加
            </p>
            
            <button
              onClick={() => {
                setShowForm(true)
                setEditingNews(null)
                resetForm()
              }}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              追加
            </button>
          </div>

          {/* CSV Export */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">CSV出力</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              現在のデータをCSVで出力
            </p>
            
            <button
              onClick={exportCSV}
              disabled={loading || news.length === 0}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              出力
            </button>
          </div>

          {/* Refresh */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900">更新</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              データを再読み込み
            </p>
            
            <button
              onClick={loadData}
              disabled={loading}
              className="w-full bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              更新
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">地域ニュース一覧</h3>
              <span className="text-sm text-slate-500">({news.length}件)</span>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">地域</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">タイトル</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">概要</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">カテゴリ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">作成日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{item.prefecture}</div>
                      {item.municipality && (
                        <div className="text-sm text-slate-500">{item.municipality}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{item.name}</div>
                      {item.source_url && (
                        <div className="text-sm text-slate-500">出典: <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="underline">{item.source_url}</a></div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate">
                        {item.summary || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('ja-JP') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {editingNews ? 'ニュースを編集' : '新しいニュースを追加'}
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      都道府県 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.prefecture}
                      onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 東京都"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      市区町村
                    </label>
                    <input
                      type="text"
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 渋谷区"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ニュースのタイトル"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    概要
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ニュースの概要"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    本文
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ニュースの詳細内容"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      カテゴリ
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as LocalNewsCategory })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {NEWS_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      出典URL
                    </label>
                    <input
                      type="url"
                      value={formData.source_url}
                      onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingNews(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '保存中...' : (editingNews ? '更新' : '追加')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}