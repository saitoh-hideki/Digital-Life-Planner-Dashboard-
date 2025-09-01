'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SubsidySheet } from '@/lib/types'
import { Upload, Download, Plus, Edit, Trash2, Database, FileText, CheckCircle, AlertCircle, Gift } from 'lucide-react'

export default function AdminSubsidiesPage() {
  const [sheetData, setSheetData] = useState<SubsidySheet[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSubsidy, setEditingSubsidy] = useState<SubsidySheet | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    summary: '',
    period: '',
    purpose: '',
    target_audience: '',
    amount: '',
    url: '',
    status: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: sheetData, error: sheetError } = await supabase
        .from('subsidies_sheet')
        .select('*')
        .order('created_at', { ascending: false })

      if (sheetError) throw sheetError
      setSheetData(sheetData || [])
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
      const expectedHeaders = ['name', 'organization', 'summary', 'period', 'purpose', 'target_audience', 'amount', 'url', 'status']
      
      // ヘッダー検証
      if (!expectedHeaders.every(h => headers.includes(h))) {
        throw new Error('CSVのヘッダーが期待される形式と一致しません')
      }

      const records: Partial<SubsidySheet>[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        if (values.length < headers.length) continue

        const record: Partial<SubsidySheet> = {
          name: values[0] || '',
          organization: values[1] || undefined,
          summary: values[2] || undefined,
          period: values[3] || undefined,
          purpose: values[4] || undefined,
          target_audience: values[5] || undefined,
          amount: values[6] || undefined,
          url: values[7] || undefined,
          status: values[8] || undefined
        }

        // nameが空のレコードはスキップ
        if (!record.name) continue

        records.push(record)
      }

      if (records.length === 0) {
        throw new Error('有効なデータが見つかりませんでした')
      }

      // データベースに挿入
      const { error: insertError } = await supabase
        .from('subsidies_sheet')
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
      if (editingSubsidy) {
        // 更新
        const { error } = await supabase
          .from('subsidies_sheet')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('row_id', editingSubsidy.row_id)

        if (error) throw error
        setMessage({ type: 'success', text: '補助金・助成金を更新しました' })
      } else {
        // 新規作成
        const { error } = await supabase
          .from('subsidies_sheet')
          .insert([formData])

        if (error) throw error
        setMessage({ type: 'success', text: '補助金・助成金を追加しました' })
      }

      setShowForm(false)
      setEditingSubsidy(null)
      resetForm()
      await loadData()
    } catch (error) {
      console.error('Error saving subsidy:', error)
      setMessage({ type: 'error', text: '補助金・助成金の保存に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (subsidy: SubsidySheet) => {
    setEditingSubsidy(subsidy)
    setFormData({
      name: subsidy.name || '',
      organization: subsidy.organization || '',
      summary: subsidy.summary || '',
      period: subsidy.period || '',
      purpose: subsidy.purpose || '',
      target_audience: subsidy.target_audience || '',
      amount: subsidy.amount || '',
      url: subsidy.url || '',
      status: subsidy.status || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (rowId: string) => {
    if (!confirm('この補助金・助成金を削除しますか？')) return

    try {
      const { error } = await supabase
        .from('subsidies_sheet')
        .delete()
        .eq('row_id', rowId)

      if (error) throw error

      setMessage({ type: 'success', text: '補助金・助成金を削除しました' })
      await loadData()
    } catch (error) {
      console.error('Error deleting subsidy:', error)
      setMessage({ type: 'error', text: '補助金・助成金の削除に失敗しました' })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      organization: '',
      summary: '',
      period: '',
      purpose: '',
      target_audience: '',
      amount: '',
      url: '',
      status: ''
    })
  }

  const exportCSV = () => {
    const headers = ['name', 'organization', 'summary', 'period', 'purpose', 'target_audience', 'amount', 'url', 'status']
    const csvContent = [
      headers.join(','),
      ...sheetData.map(item => [
        item.name,
        item.organization || '',
        item.summary || '',
        item.period || '',
        item.purpose || '',
        item.target_audience || '',
        item.amount || '',
        item.url || '',
        item.status || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'subsidies_sheet.csv'
    link.click()
  }

  const clearData = async () => {
    if (!confirm('すべてのデータを削除しますか？この操作は取り消せません。')) return

    setLoading(true)
    try {
      const { error: sheetError } = await supabase
        .from('subsidies_sheet')
        .delete()
        .neq('row_id', '00000000-0000-0000-0000-000000000000')

      if (sheetError) throw sheetError

      setMessage({ type: 'success', text: 'すべてのデータを削除しました' })
      await loadData()
    } catch (error) {
      console.error('Error clearing data:', error)
      setMessage({ type: 'error', text: 'データの削除に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">補助金・助成金管理</h1>
          <p className="text-slate-600">スプレッドシート準拠の補助金・助成金データの管理</p>
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
              新しい補助金・助成金を手動で追加
            </p>
            
            <button
              onClick={() => {
                setShowForm(true)
                setEditingSubsidy(null)
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
              disabled={loading || sheetData.length === 0}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              出力
            </button>
          </div>

          {/* Clear Data */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900">データクリア</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              すべてのデータを削除
            </p>
            
            <button
              onClick={clearData}
              disabled={loading || sheetData.length === 0}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              クリア
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">補助金・助成金一覧</h3>
              <span className="text-sm text-slate-500">({sheetData.length}件)</span>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">制度名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">実施機関</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">概要</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">期間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">対象者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sheetData.map((item) => (
                  <tr key={item.row_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{item.name}</div>
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          リンク
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.organization || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate">
                        {item.summary || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.period || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.target_audience || '-'}
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
                          onClick={() => handleDelete(item.row_id)}
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
                {editingSubsidy ? '補助金・助成金を編集' : '新しい補助金・助成金を追加'}
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    制度名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="制度の名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    実施機関
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="実施機関名"
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
                    placeholder="制度の概要"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      期間
                    </label>
                    <input
                      type="text"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 2024年度"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      金額
                    </label>
                    <input
                      type="text"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 最大100万円"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    目的
                  </label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="制度の目的"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    対象者
                  </label>
                  <input
                    type="text"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="対象となる事業者・団体"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      ステータス
                    </label>
                    <input
                      type="text"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 受付中、終了"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingSubsidy(null)
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
                    {loading ? '保存中...' : (editingSubsidy ? '更新' : '追加')}
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