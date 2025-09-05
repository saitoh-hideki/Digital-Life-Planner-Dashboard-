'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LocalNews, LocalNewsCategory } from '@/lib/types'
import { Upload, Download, Plus, Edit, Trash2, Database, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog'

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
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    type: 'single' | 'bulk'
    itemId?: string
    itemName?: string
  }>({
    isOpen: false,
    type: 'single'
  })
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

  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0)
  }, [selectedItems])

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('Starting to load data...')
      
      // まず基本的なクエリでテスト
      const { data: testData, error: testError } = await supabase
        .from('local_news')
        .select('id')
        .limit(1)

      if (testError) {
        console.error('Basic test query error:', testError)
        throw testError
      }

      console.log('Basic test query successful:', testData)

      // カテゴリーを含むクエリ
      const { data, error } = await supabase
        .from('local_news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // カテゴリーなしで再試行
        console.log('Retrying without category...')
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('local_news')
          .select('id, prefecture, municipality, name, summary, body, source_url, created_at')
          .order('created_at', { ascending: false })
        
        if (fallbackError) {
          console.error('Fallback query error:', fallbackError)
          throw fallbackError
        }
        
        console.log('Fallback query successful:', fallbackData)
        setNews(fallbackData || [])
      } else {
        console.log('Loaded news data (with category):', data)
        if (data && data.length > 0) {
          console.log('Admin - First item body:', data[0].body)
          console.log('Admin - First item body type:', typeof data[0].body)
          console.log('Admin - First item body length:', data[0].body?.length)
          console.log('Admin - All items with body:', data.filter(item => item.body && item.body.length > 0).length)
          console.log('Admin - First item full data:', data[0])
          console.log('Admin - All items body data:', data.map(item => ({ id: item.id, name: item.name, body: item.body, bodyLength: item.body?.length })))
        }
        setNews(data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
      setMessage({ type: 'error', text: `データの読み込みに失敗しました: ${errorMessage}` })
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
      console.log('Starting CSV import...')
      console.log('File name:', csvFile.name)
      console.log('File size:', csvFile.size)
      
      const text = await csvFile.text()
      console.log('CSV text length:', text.length)
      console.log('First 500 characters:', text.substring(0, 500))
      
      const lines = text.split('\n')
      console.log('Number of lines:', lines.length)
      
      if (lines.length < 2) {
        throw new Error('CSVファイルが空またはヘッダーのみです')
      }

      // CSVの解析を改善（より堅牢なパース処理）
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        let i = 0
        
        while (i < line.length) {
          const char = line[i]
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              // エスケープされた引用符
              current += '"'
              i += 2
            } else {
              // 引用符の開始/終了
              inQuotes = !inQuotes
              i++
            }
          } else if (char === ',' && !inQuotes) {
            // フィールドの区切り
            result.push(current.trim())
            current = ''
            i++
          } else {
            current += char
            i++
          }
        }
        
        // 最後のフィールドを追加
        result.push(current.trim())
        return result
      }

      const headers = parseCSVLine(lines[0])
      const expectedHeaders = ['prefecture', 'municipality', 'name', 'summary', 'body', 'source_url', 'category']
      
      // ヘッダー検証（より柔軟に）
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        throw new Error(`CSVのヘッダーが期待される形式と一致しません。不足しているヘッダー: ${missingHeaders.join(', ')}。期待されるヘッダー: ${expectedHeaders.join(', ')}。実際のヘッダー: ${headers.join(', ')}`)
      }

      // ヘッダーのインデックスを取得
      const headerIndices = {
        prefecture: headers.indexOf('prefecture'),
        municipality: headers.indexOf('municipality'),
        name: headers.indexOf('name'),
        summary: headers.indexOf('summary'),
        body: headers.indexOf('body'),
        source_url: headers.indexOf('source_url'),
        category: headers.indexOf('category')
      }

      const records: Partial<LocalNews>[] = []
      const errors: string[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = parseCSVLine(line)
        
        // 列数が不足している場合は空文字で埋める
        while (values.length < headers.length) {
          values.push('')
        }

        // フィールドの値を適切に処理（完全に書き直し）
        const getFieldValue = (value: string | undefined, isRequired: boolean = false) => {
          if (!value) return isRequired ? '' : null
          const trimmed = value.trim()
          return trimmed || (isRequired ? '' : null)
        }

        const record: Partial<LocalNews> = {
          prefecture: getFieldValue(values[headerIndices.prefecture], true) || '',
          municipality: getFieldValue(values[headerIndices.municipality]) || undefined,
          name: getFieldValue(values[headerIndices.name], true) || '',
          summary: getFieldValue(values[headerIndices.summary]) || undefined,
          body: getFieldValue(values[headerIndices.body]) || undefined,
          source_url: getFieldValue(values[headerIndices.source_url]) || undefined,
          category: (getFieldValue(values[headerIndices.category]) as LocalNewsCategory) || 'その他'
        }

        // デバッグ情報を追加
        console.log(`行${i + 1}のパース結果:`, {
          originalValues: values,
          parsedRecord: record,
          bodyLength: record.body?.length || 0,
          categoryValue: record.category,
          sourceUrlValue: record.source_url,
          summaryLength: record.summary?.length || 0,
          municipalityValue: record.municipality
        })

        // nameが空のレコードはスキップ
        if (!record.name || !record.prefecture) {
          const missingFields = []
          if (!record.prefecture) missingFields.push('都道府県')
          if (!record.name) missingFields.push('タイトル')
          errors.push(`行${i + 1}: ${missingFields.join('と')}が必須です (都道府県: "${record.prefecture}", タイトル: "${record.name}")`)
          continue
        }

        // カテゴリの検証と正規化
        const normalizedCategory = record.category?.trim()
        if (normalizedCategory && !NEWS_CATEGORIES.includes(normalizedCategory as LocalNewsCategory)) {
          console.warn(`行${i + 1}: 無効なカテゴリ "${normalizedCategory}" を "その他" に変更`)
          record.category = 'その他'
        } else if (!normalizedCategory) {
          record.category = 'その他'
        }

        records.push(record)
      }

      if (records.length === 0) {
        // デバッグ情報を追加
        const debugInfo = lines.slice(0, 3).map((line, index) => 
          `行${index + 1}: ${line}`
        ).join('\n')
        
        const errorMessage = errors.length > 0 
          ? `データの検証エラー:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...他${errors.length - 5}件のエラー` : ''}\n\nデバッグ情報（最初の3行）:\n${debugInfo}`
          : '有効なデータが見つかりませんでした'
        throw new Error(errorMessage)
      }

      // データベースに挿入前の最終検証
      console.log('Inserting records:', records)
      console.log('Number of records to insert:', records.length)
      
      // 各レコードの詳細をログ出力
      records.forEach((record, index) => {
        console.log(`レコード ${index + 1}:`, {
          name: record.name,
          body: record.body ? `"${record.body.substring(0, 100)}..."` : 'null/undefined',
          bodyLength: record.body?.length || 0,
          category: record.category,
          summary: record.summary ? `"${record.summary.substring(0, 50)}..."` : 'null/undefined',
          source_url: record.source_url || 'null/undefined',
          municipality: record.municipality || 'null/undefined',
          prefecture: record.prefecture
        })
      })
      
      // データベース挿入前の最終的なデータクリーニング
      const cleanedRecords = records.map(record => {
        const cleaned: Record<string, string | null> = {}
        
        // 必須フィールド
        cleaned.prefecture = record.prefecture || ''
        cleaned.name = record.name || ''
        
        // オプショナルフィールド（null/undefinedを適切に処理）
        cleaned.municipality = record.municipality || null
        cleaned.summary = record.summary || null
        cleaned.body = record.body || null
        cleaned.source_url = record.source_url || null
        cleaned.category = record.category || 'その他'
        
        // タイムスタンプ（created_atのみ、updated_atは除外）
        cleaned.created_at = new Date().toISOString()
        
        return cleaned
      })

      console.log('Cleaned records for insertion:', cleanedRecords)

      // まず1件だけテスト挿入してテーブル構造を確認
      const testRecord = cleanedRecords[0]
      console.log('Testing with first record:', testRecord)

      const { data: insertData, error: insertError } = await supabase
        .from('local_news')
        .insert(cleanedRecords)
        .select()

      if (insertError) {
        console.error('Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        })
        
        // より詳細なエラー情報を提供
        let errorMessage = `データベース挿入エラー: ${insertError.message}`
        if (insertError.details) {
          errorMessage += ` (詳細: ${insertError.details})`
        }
        if (insertError.hint) {
          errorMessage += ` (ヒント: ${insertError.hint})`
        }
        
        // カラムが存在しないエラーの場合の特別な処理
        if (insertError.message.includes('column') && insertError.message.includes('not found')) {
          errorMessage += '\n\nテーブル構造の問題が検出されました。管理者にお問い合わせください。'
        }
        
        throw new Error(errorMessage)
      }
      
      console.log('Insert successful:', insertData)

      const successMessage = errors.length > 0 
        ? `${records.length}件のデータをインポートしました（${errors.length}件のエラーをスキップ）`
        : `${records.length}件のデータをインポートしました`
      
      setMessage({ type: 'success', text: successMessage })
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
      // フォームデータの正規化（完全に書き直し）
      const getFormFieldValue = (value: string, isRequired: boolean = false) => {
        if (!value) return isRequired ? '' : null
        const trimmed = value.trim()
        return trimmed || (isRequired ? '' : null)
      }

      const normalizedData = {
        ...formData,
        prefecture: getFormFieldValue(formData.prefecture, true) || '',
        municipality: getFormFieldValue(formData.municipality) || undefined,
        name: getFormFieldValue(formData.name, true) || '',
        summary: getFormFieldValue(formData.summary) || undefined,
        body: getFormFieldValue(formData.body) || undefined,
        source_url: getFormFieldValue(formData.source_url) || undefined,
        category: formData.category || 'その他'
      }

      console.log('Saving news data:', normalizedData)

      // データベース挿入前の最終的なデータクリーニング
      const cleanedData = {
        prefecture: normalizedData.prefecture || '',
        name: normalizedData.name || '',
        municipality: normalizedData.municipality || null,
        summary: normalizedData.summary || null,
        body: normalizedData.body || null,
        source_url: normalizedData.source_url || null,
        category: normalizedData.category || 'その他'
        // updated_atは除外（テーブルに存在しない可能性）
      }

      if (editingNews) {
        // 更新（updated_atは除外）
        const { error } = await supabase
          .from('local_news')
          .update(cleanedData)
          .eq('id', editingNews.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'ニュースを更新しました' })
      } else {
        // 新規作成
        const insertData = {
          ...cleanedData,
          created_at: new Date().toISOString()
        }
        
        const { error } = await supabase
          .from('local_news')
          .insert([insertData])

        if (error) throw error
        setMessage({ type: 'success', text: 'ニュースを追加しました' })
      }

      setShowForm(false)
      setEditingNews(null)
      resetForm()
      await loadData()
    } catch (error) {
      console.error('Error saving news:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
      setMessage({ type: 'error', text: `ニュースの保存に失敗しました: ${errorMessage}` })
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

  const handleDelete = (id: string) => {
    const newsItem = news.find(item => item.id === id)
    setDeleteDialog({
      isOpen: true,
      type: 'single',
      itemId: id,
      itemName: newsItem?.name || 'ニュース'
    })
  }

  const handleBulkDelete = () => {
    setDeleteDialog({
      isOpen: true,
      type: 'bulk'
    })
  }

  const confirmDelete = async () => {
    setLoading(true)
    try {
      if (deleteDialog.type === 'single' && deleteDialog.itemId) {
        const { error } = await supabase
          .from('local_news')
          .delete()
          .eq('id', deleteDialog.itemId)

        if (error) throw error
        setMessage({ type: 'success', text: 'ニュースを削除しました' })
      } else if (deleteDialog.type === 'bulk') {
        const { error } = await supabase
          .from('local_news')
          .delete()
          .in('id', selectedItems)

        if (error) throw error
        setMessage({ type: 'success', text: `${selectedItems.length}件のニュースを削除しました` })
        setSelectedItems([])
        setShowBulkActions(false)
      }

      setDeleteDialog({ isOpen: false, type: 'single' })
      await loadData()
    } catch (error) {
      console.error('Error deleting news:', error)
      setMessage({ type: 'error', text: '削除に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.length === news.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(news.map(item => item.id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
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

  const addTestData = async () => {
    setLoading(true)
    try {
      const testData = {
        prefecture: '東京都',
        municipality: '渋谷区',
        name: 'テストニュース - BODY表示確認',
        summary: 'これはテスト用のニュースです。BODYフィールドの表示を確認するためのものです。',
        body: 'これは詳細な本文です。\\n\\n複数行のテキストが正しく表示されるかを確認しています。\\n\\n- リスト項目1\\n- リスト項目2\\n- リスト項目3\\n\\n長いテキストが正しく表示されることを確認してください。改行も含めて、すべての内容が適切に表示されるはずです。',
        source_url: 'https://example.com',
        category: 'その他' as LocalNewsCategory
      }

      const { data, error } = await supabase
        .from('local_news')
        .insert([testData])
        .select()

      if (error) throw error

      setMessage({ type: 'success', text: 'テストデータを追加しました' })
      await loadData()
    } catch (error) {
      console.error('Error adding test data:', error)
      setMessage({ type: 'error', text: 'テストデータの追加に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const debugDatabase = async () => {
    setLoading(true)
    try {
      // データベースの全データを取得
      const { data, error } = await supabase
        .from('local_news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('=== データベースデバッグ情報 ===')
      console.log('総件数:', data?.length || 0)
      
      if (data && data.length > 0) {
        console.log('最初の3件のデータ:')
        data.slice(0, 3).forEach((item, index) => {
          console.log(`--- アイテム ${index + 1} ---`)
          console.log('ID:', item.id)
          console.log('タイトル:', item.name)
          console.log('BODY:', item.body)
          console.log('BODY型:', typeof item.body)
          console.log('BODY長さ:', item.body?.length)
          console.log('BODYが存在するか:', !!item.body)
          console.log('BODYが空文字列か:', item.body === '')
          console.log('BODYがnullか:', item.body === null)
          console.log('BODYがundefinedか:', item.body === undefined)
        })
        
        // BODYフィールドの統計
        const bodyStats = {
          total: data.length,
          withBody: data.filter(item => item.body && item.body.length > 0).length,
          emptyBody: data.filter(item => !item.body || item.body === '').length,
          nullBody: data.filter(item => item.body === null).length,
          undefinedBody: data.filter(item => item.body === undefined).length
        }
        console.log('BODYフィールド統計:', bodyStats)
      }

      setMessage({ type: 'success', text: 'デバッグ情報をコンソールに出力しました' })
    } catch (error) {
      console.error('Error debugging database:', error)
      setMessage({ type: 'error', text: 'デバッグ情報の取得に失敗しました' })
    } finally {
      setLoading(false)
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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

          {/* Test Data */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900">テストデータ</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              BODY表示確認用のテストデータを追加
            </p>
            
            <button
              onClick={addTestData}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              テストデータ追加
            </button>
          </div>

          {/* Debug Database */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900">デバッグ</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              データベースの内容をコンソールに出力
            </p>
            
            <button
              onClick={debugDatabase}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              デバッグ実行
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-orange-900">
                    {selectedItems.length}件のアイテムが選択されています
                  </h4>
                  <p className="text-sm text-orange-700">
                    一括操作を実行できます
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItems([])}
                  className="px-3 py-1.5 text-orange-700 hover:text-orange-900 hover:bg-orange-100 rounded-lg text-sm font-medium transition-colors"
                >
                  選択解除
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={loading}
                  className="px-4 py-1.5 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? '削除中...' : '一括削除'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">地域ニュース一覧</h3>
                <span className="text-sm text-slate-500">({news.length}件)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedItems.length === news.length ? 'すべて解除' : 'すべて選択'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === news.length && news.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">地域</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">タイトル</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">概要</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">詳細内容</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">カテゴリ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">公開日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">作成日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {news.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50 ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
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
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs">
                        {item.body ? (
                          <details className="group">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-xs">
                              詳細を見る ({item.body.length}文字)
                            </summary>
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {item.body}
                            </div>
                          </details>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      -
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

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, type: 'single' })}
          onConfirm={confirmDelete}
          title={deleteDialog.type === 'bulk' ? '一括削除の確認' : '削除の確認'}
          message={
            deleteDialog.type === 'bulk'
              ? `選択した${selectedItems.length}件のニュースを削除します。この操作は取り消すことができません。`
              : `「${deleteDialog.itemName}」を削除します。この操作は取り消すことができません。`
          }
          itemCount={deleteDialog.type === 'bulk' ? selectedItems.length : 1}
          itemName="ニュース"
          isLoading={loading}
        />
      </div>
    </div>
  )
}