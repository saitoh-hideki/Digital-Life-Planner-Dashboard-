'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, FileText, Calendar, ExternalLink, FolderOpen, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LocalMediaKnowledge } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function KnowledgePage() {
  const router = useRouter()
  const [knowledge, setKnowledge] = useState<LocalMediaKnowledge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKnowledge()
  }, [])

  const fetchKnowledge = async () => {
    try {
      const { data, error } = await supabase
        .from('local_media_knowledge')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      setKnowledge(data || [])
    } catch (error) {
      console.error('Error fetching knowledge:', error)
    } finally {
      setLoading(false)
    }
  }

  // ファイル種別に基づくアイコンを取得
  const getFileIcon = (fileName: string | null) => {
    if (!fileName) return '📄'
    const ext = fileName.split('.').pop()?.toLowerCase() || null
    switch (ext) {
      case 'pdf': return '📄'
      case 'doc':
      case 'docx': return '📑'
      case 'xls':
      case 'xlsx': return '📊'
      case 'ppt':
      case 'pptx': return '📽️'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️'
      default: return '📄'
    }
  }

  // ファイル種別に基づく背景色を取得
  const getFileIconBg = (fileName: string | null) => {
    if (!fileName) return 'from-slate-400 to-slate-500'
    const ext = fileName.split('.').pop()?.toLowerCase() || null
    switch (ext) {
      case 'pdf': return 'from-blue-400 to-blue-500'
      case 'doc':
      case 'docx': return 'from-indigo-400 to-indigo-500'
      case 'xls':
      case 'xlsx': return 'from-green-400 to-green-500'
      case 'ppt':
      case 'pptx': return 'from-orange-400 to-orange-500'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'from-purple-400 to-purple-500'
      default: return 'from-slate-400 to-slate-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-500">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダーセクション */}
        <div className="relative mb-8">
          {/* 背景装飾 */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>
          
          {/* メインコンテンツ */}
          <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            {/* 戻るボタン */}
            <button
              onClick={() => router.push('/')}
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-200 mb-6 px-4 py-2 rounded-xl hover:bg-slate-100/80"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">ダッシュボードに戻る</span>
            </button>
            
            {/* ページタイトル */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  地域媒体ナレッジ
                </h1>
              </div>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                地域のデジタル化に関する資料、マニュアル、ガイドブック
              </p>
            </div>
          </div>
        </div>

        {/* メインコンテンツ部 - 高さ固定のスクロールカラム */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
          {/* スクロール可能なリスト部分 */}
          <div className="h-[80vh] overflow-y-auto">
            <div className="p-6">
              {knowledge.length > 0 ? (
                <div className="space-y-4">
                  {knowledge.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* 左側：ファイル種別アイコン */}
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getFileIconBg(item.file_name || null)} rounded-full flex items-center justify-center text-white text-xl shadow-lg`}>
                            {getFileIcon(item.file_name || null)}
                          </div>
                        </div>
                        
                        {/* 中央：ファイル情報 */}
                        <div className="flex-1 min-w-0">
                          {/* タイトル */}
                          <h3 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                            {item.title || `ファイル ${item.id}`}
                          </h3>
                          
                          {/* 地域情報 */}
                          {item.region && (
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                {item.region}
                              </span>
                            </div>
                          )}
                          
                          {/* ファイル名 */}
                          {item.file_name && item.file_name !== 'EMPTY' && (
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-500 font-mono">
                                {item.file_name}
                              </span>
                            </div>
                          )}
                          
                          {/* 作成日 */}
                          {item.created_at && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(item.created_at), 'yyyy/MM/dd', { locale: ja })}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* 右側：操作ボタン */}
                        {item.url && item.url !== 'EMPTY' ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                            ファイルを開く
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 rounded-xl text-sm font-semibold flex-shrink-0">
                            <FileText className="w-4 h-4" />
                            ファイルなし
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* 空状態 */
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 text-slate-300">
                    <FolderOpen className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    まだ資料がアップロードされていません
                  </h3>
                  <p className="text-slate-500">
                    地域のデジタル化に関する資料が登録されると、ここに表示されます
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
