'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Archive, Calendar, Globe, Newspaper, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'

interface ArchiveItem {
  id: string
  type: 'topic' | 'news'
  title: string
  summary: string
  source: string
  published_at: string
  is_today?: boolean
  status?: string
}

export default function ArchiveAdminPage() {
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'topics' | 'news'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchArchiveData()
  }, [])

  const fetchArchiveData = async () => {
    try {
      setError(null)
      setLoading(true)

      // 過去30日間のデータを取得
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // トピックを取得
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .gte('published_at', thirtyDaysAgo.toISOString())
        .order('published_at', { ascending: false })

      if (topicsError) throw topicsError

      // 地域ニュースを取得
      const { data: newsData, error: newsError } = await supabase
        .from('local_news')
        .select('*')
        .gte('published_at', thirtyDaysAgo.toISOString())
        .order('published_at', { ascending: false })

      if (newsError) throw newsError

      // データを統合
      const topics = (topicsData || []).map(topic => ({
        id: `topic_${topic.id}`,
        type: 'topic' as const,
        title: topic.headline || '',
        summary: topic.ai_summary || '',
        source: topic.source_name || '',
        published_at: topic.published_at,
        is_today: topic.is_today
      }))

      const news = (newsData || []).map(news => ({
        id: `news_${news.id}`,
        type: 'news' as const,
        title: news.name || '',
        summary: news.summary || '',
        source: news.source_name || '',
        published_at: news.published_at,
        status: news.status
      }))

      // 日付順でソート
      const allItems = [...topics, ...news].sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      )

      setArchiveItems(allItems)
    } catch (error) {
      console.error('Error fetching archive data:', error)
      setError('データの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteItem = async (item: ArchiveItem) => {
    if (!confirm('このアイテムを削除しますか？')) return

    try {
      setError(null)
      
      if (item.type === 'topic') {
        const topicId = item.id.replace('topic_', '')
        const { error } = await supabase
          .from('topics')
          .delete()
          .eq('id', topicId)

        if (error) throw error
      } else {
        const newsId = item.id.replace('news_', '')
        const { error } = await supabase
          .from('local_news')
          .delete()
          .eq('id', newsId)

        if (error) throw error
      }

      // データを再取得
      await fetchArchiveData()
    } catch (error) {
      console.error('Error deleting item:', error)
      setError('データの削除中にエラーが発生しました')
    }
  }

  const filteredItems = archiveItems.filter(item => {
    // フィルター適用
    if (filter === 'topics' && item.type !== 'topic') return false
    if (filter === 'news' && item.type !== 'news') return false

    // 検索語適用
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.summary.toLowerCase().includes(searchLower) ||
        item.source.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  const getTypeBadge = (type: string) => {
    if (type === 'topic') {
      return { text: 'トピック', color: 'bg-blue-100 text-blue-800', icon: Globe }
    } else {
      return { text: 'ニュース', color: 'bg-purple-100 text-purple-800', icon: Newspaper }
    }
  }

  const getStatusBadge = (item: ArchiveItem) => {
    if (item.type === 'topic' && item.is_today) {
      return { text: '本日表示', color: 'bg-green-100 text-green-800' }
    }
    if (item.type === 'news' && item.status === 'published') {
      return { text: '公開', color: 'bg-green-100 text-green-800' }
    }
    if (item.type === 'news' && item.status === 'draft') {
      return { text: '下書き', color: 'bg-yellow-100 text-yellow-800' }
    }
    return { text: '通常', color: 'bg-gray-100 text-gray-800' }
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
          <h1 className="text-3xl font-bold text-slate-900">ニュースアーカイブ管理</h1>
          <p className="text-slate-600 mt-2">過去のニュースとトピックを管理します</p>
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

      {/* フィルターと検索 */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="タイトル、概要、出典で検索..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              タイプ
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'topics' | 'news')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべて</option>
              <option value="topics">トピックのみ</option>
              <option value="news">ニュースのみ</option>
            </select>
          </div>
        </div>
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

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">トピック数</p>
              <p className="text-2xl font-bold text-slate-900">
                {archiveItems.filter(item => item.type === 'topic').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Newspaper className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">ニュース数</p>
              <p className="text-2xl font-bold text-slate-900">
                {archiveItems.filter(item => item.type === 'news').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">本日表示</p>
              <p className="text-2xl font-bold text-slate-900">
                {archiveItems.filter(item => item.type === 'topic' && item.is_today).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* アーカイブ一覧 */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">アーカイブ一覧</h2>
          <p className="text-slate-600 text-sm mt-1">
            {filteredItems.length}件のアイテムを表示中
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  タイプ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  概要
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  出典
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  公開日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredItems.map((item) => {
                const typeBadge = getTypeBadge(item.type)
                const statusBadge = getStatusBadge(item)
                const TypeIcon = typeBadge.icon

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadge.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        {typeBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {item.title || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                      <div className="truncate" title={item.summary}>
                        {item.summary || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.source || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(new Date(item.published_at), 'MM/dd HH:mm', { locale: ja })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteItem(item)}
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
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Archive className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {searchTerm || filter !== 'all' ? '条件に一致するアイテムがありません' : 'アーカイブアイテムはまだありません'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {searchTerm || filter !== 'all' ? '検索条件やフィルターを変更してください' : '新しいアイテムが追加されると、ここに表示されます'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
