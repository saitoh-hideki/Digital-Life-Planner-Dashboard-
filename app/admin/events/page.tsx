'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AcademicCircleEvent } from '@/lib/types'
import { Upload, Download, Plus, Edit, Trash2, Database, FileText, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AcademicCircleEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AcademicCircleEvent | null>(null)
  const [formData, setFormData] = useState({
    event_date: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    event_category: '',
    event_name: '',
    delivery_type: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('academic_circle_events')
        .select('*')
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setEvents(data || [])
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
      const expectedHeaders = ['event_date', 'day_of_week', 'start_time', 'end_time', 'event_category', 'event_name', 'delivery_type']
      
      // ヘッダー検証
      if (!expectedHeaders.every(h => headers.includes(h))) {
        throw new Error('CSVのヘッダーが期待される形式と一致しません')
      }

      const records: Partial<AcademicCircleEvent>[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        if (values.length < headers.length) continue

        const record: Partial<AcademicCircleEvent> = {
          event_date: values[0] || '',
          day_of_week: values[1] || '',
          start_time: values[2] || '',
          end_time: values[3] || '',
          event_category: values[4] || '',
          event_name: values[5] || '',
          delivery_type: values[6] || ''
        }

        // 必須フィールドの検証
        if (!record.event_date || !record.event_name) continue

        records.push(record)
      }

      if (records.length === 0) {
        throw new Error('有効なデータが見つかりませんでした')
      }

      // データベースに挿入
      const { error: insertError } = await supabase
        .from('academic_circle_events')
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
      if (editingEvent) {
        // 更新
        const { error } = await supabase
          .from('academic_circle_events')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEvent.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'イベントを更新しました' })
      } else {
        // 新規作成
        const { error } = await supabase
          .from('academic_circle_events')
          .insert([formData])

        if (error) throw error
        setMessage({ type: 'success', text: 'イベントを追加しました' })
      }

      setShowForm(false)
      setEditingEvent(null)
      resetForm()
      await loadData()
    } catch (error) {
      console.error('Error saving event:', error)
      setMessage({ type: 'error', text: 'イベントの保存に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event: AcademicCircleEvent) => {
    setEditingEvent(event)
    setFormData({
      event_date: event.event_date || '',
      day_of_week: event.day_of_week || '',
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      event_category: event.event_category || '',
      event_name: event.event_name || '',
      delivery_type: event.delivery_type || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このイベントを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('academic_circle_events')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: 'イベントを削除しました' })
      await loadData()
    } catch (error) {
      console.error('Error deleting event:', error)
      setMessage({ type: 'error', text: 'イベントの削除に失敗しました' })
    }
  }

  const resetForm = () => {
    setFormData({
      event_date: '',
      day_of_week: '',
      start_time: '',
      end_time: '',
      event_category: '',
      event_name: '',
      delivery_type: ''
    })
  }

  const exportCSV = () => {
    const headers = ['event_date', 'day_of_week', 'start_time', 'end_time', 'event_category', 'event_name', 'delivery_type']
    const csvContent = [
      headers.join(','),
      ...events.map(event => [
        event.event_date,
        event.day_of_week,
        event.start_time,
        event.end_time,
        event.event_category,
        event.event_name,
        event.delivery_type
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'academic_circle_events.csv'
    link.click()
  }

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString)
    const days = ['日', '月', '火', '水', '木', '金', '土']
    return days[date.getDay()]
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">アカデミックサークルイベント管理</h1>
          <p className="text-slate-600">DLP関連イベントの管理</p>
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
              新しいイベントを手動で追加
            </p>
            
            <button
              onClick={() => {
                setShowForm(true)
                setEditingEvent(null)
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
              disabled={loading || events.length === 0}
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
              <h3 className="text-lg font-semibold text-slate-900">イベント一覧</h3>
              <span className="text-sm text-slate-500">({events.length}件)</span>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">日付</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">時間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">イベント名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">カテゴリ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">配信形式</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{event.event_date}</div>
                      <div className="text-sm text-slate-500">{event.day_of_week || getDayOfWeek(event.event_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {event.start_time} - {event.end_time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{event.event_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.event_category || '未分類'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {event.delivery_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
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
                {editingEvent ? 'イベントを編集' : '新しいイベントを追加'}
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      イベント日 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      曜日
                    </label>
                    <input
                      type="text"
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 月"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      開始時刻 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      終了時刻 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    イベント名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="イベントの名称"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      カテゴリ
                    </label>
                    <input
                      type="text"
                      value={formData.event_category}
                      onChange={(e) => setFormData({ ...formData, event_category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 勉強会、セミナー"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      配信形式
                    </label>
                    <input
                      type="text"
                      value={formData.delivery_type}
                      onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: オンライン、対面、ハイブリッド"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingEvent(null)
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
                    {loading ? '保存中...' : (editingEvent ? '更新' : '追加')}
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
