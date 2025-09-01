'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LocalApp } from '@/lib/types'
import { Upload, Download, Plus, Edit, Trash2, Database, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminAppsPage() {
  const [apps, setApps] = useState<LocalApp[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingApp, setEditingApp] = useState<LocalApp | null>(null)
  const [formData, setFormData] = useState({
    prefecture: '',
    municipality: '',
    name: '',
    summary: '',
    url: '',
    platform: '',
    provider: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('local_apps')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApps(data || [])
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
      const expectedHeaders = ['prefecture', 'municipality', 'name', 'summary', 'url', 'platform', 'provider']
      
      // ヘッダー検証
      if (!expectedHeaders.every(h => headers.includes(h))) {
        throw new Error('CSVのヘッダーが期待される形式と一致しません')
      }

      const records: Partial<LocalApp>[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        if (values.length < headers.length) continue

        const record: Partial<LocalApp> = {
          prefecture: values[0] || '',
          municipality: values[1] || undefined,
          name: values[2] || '',
          summary: values[3] || undefined,
          url: values[4] || undefined,
          platform: values[5] || undefined,
          provider: values[6] || undefined
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
        .from('local_apps')
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
      if (editingApp) {
        // 更新
        const { error } = await supabase
          .from('local_apps')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingApp.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'アプリを更新しました' })
      } else {
        // 新規作成
        const { error } = await supabase
          .from('local_apps')
          .insert([formData])

        if (error) throw error
        setMessage({ type: 'success', text: 'アプリを追加しました' })
      }

      setShowForm(false)
      setEditingApp(null)
      resetForm()
      await loadData()
    } catch (error) {
      console.error('Error saving app:', error)
      setMessage({ type: 'error', text: 'アプリの保存に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (app: LocalApp) => {
    setEditingApp(app)
    setFormData({
      prefecture: app.prefecture || '',
      municipality: app.municipality || '',
      name: app.name || '',
      summary: app.summary || '',
      url: app.url || '',
      platform: app.platform || '',
      provider: app.provider || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このアプリを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('local_apps')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: 'アプリを削除しました' })
      await loadData()
    } catch (error) {
      console.error('Error deleting app:', error)
      setMessage({ type: 'error', text: 'アプリの削除に失敗しました' })
    }
  }

  const resetForm = () => {
    setFormData({
      prefecture: '',
      municipality: '',
      name: '',
      summary: '',
      url: '',
      platform: '',
      provider: ''
    })
  }

  const exportCSV = () => {
    const headers = ['prefecture', 'municipality', 'name', 'summary', 'url', 'platform', 'provider']
    const csvContent = [
      headers.join(','),
      ...apps.map(app => [
        app.prefecture,
        app.municipality || '',
        app.name,
        app.summary || '',
        app.url || '',
        app.platform || '',
        app.provider || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'local_apps.csv'
    link.click()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">地域アプリ管理</h1>
          <p className="text-slate-600">地域で活用できるアプリの管理</p>
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
              新しいアプリを手動で追加
            </p>
            
            <button
              onClick={() => {
                setShowForm(true)
                setEditingApp(null)
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
              disabled={loading || apps.length === 0}
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
              <h3 className="text-lg font-semibold text-slate-900">地域アプリ一覧</h3>
              <span className="text-sm text-slate-500">({apps.length}件)</span>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">地域</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">アプリ名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">概要</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">プラットフォーム</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">提供者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{app.prefecture}</div>
                      {app.municipality && (
                        <div className="text-sm text-slate-500">{app.municipality}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{app.name}</div>
                      {app.url && (
                        <a 
                          href={app.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          リンク
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate">
                        {app.summary || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {app.platform || '不明'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {app.provider || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(app)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id!)}
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
                {editingApp ? 'アプリを編集' : '新しいアプリを追加'}
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
                    アプリ名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="アプリの名称"
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
                    placeholder="アプリの概要や特徴"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      プラットフォーム
                    </label>
                    <input
                      type="text"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: iOS, Android, Web"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      提供者
                    </label>
                    <input
                      type="text"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="提供企業・団体名"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingApp(null)
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
                    {loading ? '保存中...' : (editingApp ? '更新' : '追加')}
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
