'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SubsidySheet, SubsidyNormalized } from '@/lib/types'
import { Upload, Download, RefreshCw, FileText, Database, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminSubsidiesPage() {
  const [sheetData, setSheetData] = useState<SubsidySheet[]>([])
  const [normalizedData, setNormalizedData] = useState<SubsidyNormalized[]>([])
  const [loading, setLoading] = useState(false)
  const [etlLoading, setEtlLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // subsidies_sheetからデータ取得
      const { data: sheetData, error: sheetError } = await supabase
        .from('subsidies_sheet')
        .select('*')
        .order('created_at', { ascending: false })

      if (sheetError) throw sheetError

      // subsidies_normalizedからデータ取得
      const { data: normalizedData, error: normalizedError } = await supabase
        .from('subsidies_normalized')
        .select('*')
        .order('created_at', { ascending: false })

      if (normalizedError) throw normalizedError

      setSheetData(sheetData || [])
      setNormalizedData(normalizedData || [])
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
      const expectedHeaders = ['id', 'name', 'organization', 'summary', 'period', 'purpose', 'target_audience', 'amount', 'url', 'status']
      
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
          id: values[0] || undefined,
          name: values[1] || '',
          organization: values[2] || undefined,
          summary: values[3] || undefined,
          period: values[4] || undefined,
          purpose: values[5] || undefined,
          target_audience: values[6] || undefined,
          amount: values[7] || undefined,
          url: values[8] || undefined,
          status: values[9] || undefined
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
      setMessage({ type: 'error', text: `CSVインポートに失敗しました: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const runETL = async () => {
    setEtlLoading(true)
    try {
      const response = await fetch('/api/etl-subsidies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`ETL failed: ${response.status}`)
      }

      const result = await response.json()
      setMessage({ 
        type: 'success', 
        text: `ETL完了: ${result.processed}件処理、期間解析成功率${result.periodParseRate}%、金額解析成功率${result.amountParseRate}%` 
      })
      
      // データを再読み込み
      await loadData()
      
    } catch (error) {
      console.error('ETL error:', error)
      setMessage({ type: 'error', text: `ETL実行に失敗しました: ${error.message}` })
    } finally {
      setEtlLoading(false)
    }
  }

  const clearData = async () => {
    if (!confirm('すべてのデータを削除しますか？この操作は元に戻せません。')) return

    setLoading(true)
    try {
      // 正規化テーブルから削除
      const { error: normalizedError } = await supabase
        .from('subsidies_normalized')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (normalizedError) throw normalizedError

      // シートテーブルから削除
      const { error: sheetError } = await supabase
        .from('subsidies_sheet')
        .delete()
        .neq('row_id', '00000000-0000-0000-0000-000000000000')

      if (sheetError) throw sheetError

      setMessage({ type: 'success', text: 'すべてのデータを削除しました' })
      await loadData()
      
    } catch (error) {
      console.error('Clear data error:', error)
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
          <p className="text-slate-600">スプレッドシート準拠のデータ管理とETL処理</p>
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

          {/* ETL Process */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">ETL実行</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              シートデータを正規化テーブルに変換
            </p>
            
            <button
              onClick={runETL}
              disabled={etlLoading || sheetData.length === 0}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {etlLoading ? '処理中...' : 'ETL実行'}
            </button>
          </div>

          {/* Data Clear */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900">データクリア</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              全データを削除
            </p>
            
            <button
              onClick={clearData}
              disabled={loading || (sheetData.length === 0 && normalizedData.length === 0)}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              全削除
            </button>
          </div>

          {/* Refresh */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-slate-600" />
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

        {/* Data Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sheet Data */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">シートデータ (subsidies_sheet)</h3>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                CSVから直接インポートされた生データ
              </p>
            </div>
            
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{sheetData.length}</div>
              <div className="text-sm text-slate-600">件のレコード</div>
              
              {sheetData.length > 0 && (
                <div className="mt-4 space-y-2">
                  {sheetData.slice(0, 5).map((record, index) => (
                    <div key={record.row_id} className="text-sm p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium text-slate-900">{record.name}</div>
                      <div className="text-slate-600 text-xs">
                        {record.organization && `${record.organization} • `}
                        {record.period && `${record.period} • `}
                        {record.status || 'ステータス未設定'}
                      </div>
                    </div>
                  ))}
                  {sheetData.length > 5 && (
                    <div className="text-sm text-slate-500 text-center py-2">
                      他 {sheetData.length - 5} 件...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Normalized Data */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-slate-900">正規化データ (subsidies_normalized)</h3>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                ETL処理で生成された表示用データ
              </p>
            </div>
            
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{normalizedData.length}</div>
              <div className="text-sm text-slate-600">件のレコード</div>
              
              {normalizedData.length > 0 && (
                <div className="mt-4 space-y-2">
                  {normalizedData.slice(0, 5).map((record, index) => (
                    <div key={record.id} className="text-sm p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium text-slate-900">{record.name}</div>
                      <div className="text-slate-600 text-xs">
                        {record.issuer && `${record.issuer} • `}
                        {record.apply_start && record.apply_end && `${record.apply_start} ～ ${record.apply_end} • `}
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.status === 'open' ? 'bg-green-100 text-green-800' :
                          record.status === 'coming_soon' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status === 'open' ? '公募中' : 
                           record.status === 'coming_soon' ? '公募予定' : '終了'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {normalizedData.length > 5 && (
                    <div className="text-sm text-slate-500 text-center py-2">
                      他 {normalizedData.length - 5} 件...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}