'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, FileText, Calendar } from 'lucide-react'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          ダッシュボードに戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          地域媒体ナレッジ
        </h1>
        <p className="text-gray-600 mt-2">
          地域のデジタル化に関する資料、マニュアル、ガイドブック
        </p>
      </div>

      <div className="space-y-4">
        {knowledge.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm text-gray-500">
                    FILE
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.file_name || `ファイル ${item.id}`}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-500">
                  {item.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(item.created_at), 'yyyy/MM/dd', { locale: ja })}
                      </span>
                    </div>
                  )}
                  
                  {item.url && item.url !== 'EMPTY' && (
                    <div className="flex items-center gap-2">
                      <span>URL: {item.url}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {item.url && item.url !== 'EMPTY' && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  ファイルを開く
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {knowledge.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          ナレッジ資料はまだありません
        </div>
      )}
    </div>
  )
}
