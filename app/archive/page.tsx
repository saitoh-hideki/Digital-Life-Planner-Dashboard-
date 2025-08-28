'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { NewsArchive } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function ArchivePage() {
  const router = useRouter()
  const [archives, setArchives] = useState<NewsArchive[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArchives()
  }, [])

  const fetchArchives = async () => {
    try {
      const { data, error } = await supabase
        .from('v_news_archive')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      setArchives(data || [])
    } catch (error) {
      console.error('Error fetching archives:', error)
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
          ニュースアーカイブ
        </h1>
        <p className="text-gray-600 mt-2">
          過去30日間のトピックと地域ニュースを統合表示
        </p>
      </div>

      <div className="space-y-4">
        {archives.map((archive) => (
          <div key={`${archive.kind}-${archive.id}`} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    archive.kind === 'topic' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {archive.kind === 'topic' ? 'RSS' : '地域ニュース'}
                  </span>
                  {archive.prefecture && (
                    <span className="text-sm text-gray-500">{archive.prefecture}</span>
                  )}
                  {archive.municipality && (
                    <span className="text-sm text-gray-500">{archive.municipality}</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {archive.title}
                </h3>
                
                {archive.summary && (
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {archive.summary}
                  </p>
                )}
                
                <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                  {archive.source_name && (
                    <span className="font-medium">{archive.source_name}</span>
                  )}
                  <time>
                    {format(new Date(archive.published_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                  </time>
                </div>
                
                {archive.tags && archive.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {archive.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {archive.source_url && (
                <a
                  href={archive.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm shrink-0"
                >
                  詳細を見る
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {archives.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          アーカイブデータがまだありません
        </div>
      )}
    </div>
  )
}
