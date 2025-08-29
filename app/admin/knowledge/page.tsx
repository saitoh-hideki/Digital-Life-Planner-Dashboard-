'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LocalMediaKnowledge } from '@/lib/types'
import { FileText, Plus, Edit, Trash2, Save, X, Upload, Download } from 'lucide-react'
import Link from 'next/link'

interface KnowledgeFormData {
  region: string
  title: string
  file: File | null
}

export default function KnowledgeAdminPage() {
  const [knowledge, setKnowledge] = useState<LocalMediaKnowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [formData, setFormData] = useState<KnowledgeFormData>({
    region: '',
    title: '',
    file: null
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchKnowledge()
  }, [])

  const fetchKnowledge = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('local_media_knowledge')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setKnowledge(data || [])
    } catch (error) {
      console.error('Error fetching knowledge:', error)
      setError('データの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && file.type !== 'application/pdf') {
      setError('PDFファイルのみアップロード可能です')
      return
    }
    setFormData({ ...formData, file })
    setError(null)
  }

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('knowledge-files')
      .upload(fileName, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('knowledge-files')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setError(null)
      setUploading(true)
      
      let fileUrl = ''
      let fileName = ''
      
      if (formData.file) {
        fileUrl = await uploadFile(formData.file)
        fileName = formData.file.name
      }
      
      if (isEditing) {
        // 更新
        const { error } = await supabase
          .from('local_media_knowledge')
          .update({
            region: formData.region,
            title: formData.title,
            url: fileUrl || null,
            file_name: fileName || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', isEditing)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('local_media_knowledge')
          .insert([{
            region: formData.region,
            title: formData.title,
            url: fileUrl || null,
            file_name: fileName || null
          }])

        if (error) throw error
      }

      // フォームをリセット
      setFormData({ region: '', title: '', file: null })
      setIsEditing(null)
      
      // データを再取得
      await fetchKnowledge()
    } catch (error) {
      console.error('Error saving knowledge:', error)
      setError('データの保存中にエラーが発生しました')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (item: LocalMediaKnowledge) => {
    setIsEditing(item.id || null)
    setFormData({
      region: item.region || '',
      title: item.title || '',
      file: null
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このナレッジを削除しますか？')) return

    try {
      setError(null)
      const { error } = await supabase
        .from('local_media_knowledge')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await fetchKnowledge()
    } catch (error) {
      console.error('Error deleting knowledge:', error)
      setError('データの削除中にエラーが発生しました')
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setFormData({ region: '', title: '', file: null })
  }

  const getFileTypeBadge = (fileName: string | null) => {
    if (!fileName) return { text: 'ファイルなし', color: 'bg-gray-100 text-gray-800' }
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      return { text: 'PDF', color: 'bg-red-100 text-red-800' }
    }
    return { text: 'その他', color: 'bg-slate-100 text-slate-800' }
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
          <h1 className="text-3xl font-bold text-slate-900">地域媒体ナレッジ管理</h1>
          <p className="text-slate-600 mt-2">地域のPDF、レポート、ブログ記事などのナレッジ情報を管理します</p>
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
          <FileText className="w-5 h-5" />
          {isEditing ? 'ナレッジ情報を編集' : '新しいナレッジを追加'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                地域 *
              </label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="例: 横浜市、長野県"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                タイトル *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例: 地域経済レポート、商店街ガイド"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              PDFファイル
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors duration-200 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {formData.file ? formData.file.name : 'ファイルを選択'}
              </label>
              {formData.file && (
                <span className="text-sm text-slate-600">
                  選択中: {formData.file.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              PDFファイルのみアップロード可能です
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  アップロード中...
                </>
              ) : isEditing ? (
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

      {/* ナレッジ一覧 */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">ナレッジ一覧</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  地域
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ファイル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {knowledge.map((item) => {
                const fileBadge = getFileTypeBadge(item.file_name || null)
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.region || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {item.title || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fileBadge.color}`}>
                          {fileBadge.text}
                        </span>
                        {item.url && item.file_name && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="ダウンロード"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('ja-JP') : '-'}
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
                          onClick={() => handleDelete(item.id || 0)}
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
        
        {knowledge.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">ナレッジ情報はまだありません</p>
            <p className="text-slate-400 text-sm mt-2">新しいナレッジを追加してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
