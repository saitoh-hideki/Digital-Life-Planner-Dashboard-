'use client'

import { useState, useEffect } from 'react'
import { LocalNews, LocalNewsCategory } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { Globe, MapPin, ExternalLink, ArrowLeft, Home, Filter, Search, Eye } from 'lucide-react'
import Link from 'next/link'
import LocalNewsDetailModal from '@/components/dashboard/LocalNewsDetailModal'

const CATEGORY_COLORS: Record<LocalNewsCategory, string> = {
  '行政DX': 'bg-blue-100 text-blue-800 border-blue-200',
  '教育・学習': 'bg-green-100 text-green-800 border-green-200',
  '防災・安全': 'bg-red-100 text-red-800 border-red-200',
  '福祉・子育て': 'bg-pink-100 text-pink-800 border-pink-200',
  '産業・ビジネス': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'イベント': 'bg-purple-100 text-purple-800 border-purple-200',
  '環境・暮らし': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'その他': 'bg-gray-100 text-gray-800 border-gray-200'
}

const CATEGORY_ICONS: Record<LocalNewsCategory, string> = {
  '行政DX': '🏛️',
  '教育・学習': '📚',
  '防災・安全': '🚨',
  '福祉・子育て': '👨‍👩‍👧‍👦',
  '産業・ビジネス': '💼',
  'イベント': '🎉',
  '環境・暮らし': '🌱',
  'その他': '📰'
}

export default function LocalNewsPage() {
  const [news, setNews] = useState<LocalNews[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<LocalNewsCategory | 'all'>('all')
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [prefectures, setPrefectures] = useState<string[]>([])
  const [selectedNews, setSelectedNews] = useState<LocalNews | null>(null)
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false)

  // ニュース一覧の取得
  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('local_news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('News fetch error:', error)
        throw error
      }
      
      // デバッグ情報を追加
      console.log('LocalNewsPage - Fetched news data:', data)
      if (data && data.length > 0) {
        console.log('LocalNewsPage - First item body:', data[0].body)
        console.log('LocalNewsPage - First item body type:', typeof data[0].body)
        console.log('LocalNewsPage - First item body length:', data[0].body?.length)
        console.log('LocalNewsPage - All items with body:', data.filter(item => item.body && item.body.length > 0).length)
        console.log('LocalNewsPage - All items body data:', data.map(item => ({ id: item.id, name: item.name, body: item.body, bodyLength: item.body?.length })))
      }
      
      setNews(data || [])
      
      // 都道府県の一覧を抽出
      const uniquePrefectures = [...new Set(data?.map(item => item.prefecture) || [])]
      setPrefectures(uniquePrefectures.sort())
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  // フィルタリングと検索
  const filteredNews = news.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory
    const prefectureMatch = selectedPrefecture === 'all' || item.prefecture === selectedPrefecture
    const searchMatch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prefecture.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.municipality.toLowerCase().includes(searchQuery.toLowerCase())
    
    return categoryMatch && prefectureMatch && searchMatch
  })

  // カテゴリ別の件数
  const categoryCounts = news.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<LocalNewsCategory, number>)

  const showNewsDetail = (news: LocalNews) => {
    setSelectedNews(news)
    setIsNewsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* ダッシュボードに戻るボタン */}
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボード
            </Link>
            
            {/* ホームボタン */}
            <Link
              href="/"
              className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Globe className="w-8 h-8 text-green-600" />
              地域ニュース
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              全国各地のデジタル化・地域活性化に関する最新情報
            </p>
          </div>
        </div>
      </div>

      {/* フィルターと検索 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* カテゴリフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              カテゴリ
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as LocalNewsCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">すべてのカテゴリ</option>
              {Object.entries(categoryCounts).map(([category, count]) => (
                <option key={category} value={category}>
                  {CATEGORY_ICONS[category as LocalNewsCategory]} {category} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* 都道府県フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              都道府県
            </label>
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">すべての都道府県</option>
              {prefectures.map((prefecture) => (
                <option key={prefecture} value={prefecture}>
                  {prefecture}
                </option>
              ))}
            </select>
          </div>

          {/* 検索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              キーワード検索
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ニュースタイトル、内容、地域名など"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* 結果件数 */}
      <div className="mb-6">
        <p className="text-gray-600">
          <span className="font-medium">{filteredNews.length}</span>件のニュースが見つかりました
        </p>
      </div>

      {/* ニュース一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredNews.map((newsItem) => (
          <div
            key={newsItem.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">
                {CATEGORY_ICONS[newsItem.category]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[newsItem.category]}`}>
                    {newsItem.category}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {newsItem.prefecture} {newsItem.municipality}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-200">
                  {newsItem.name}
                </h3>
              </div>
            </div>

            {/* 本文の表示 - bodyフィールドを優先して表示 */}
            {newsItem.body ? (
              <div className="mb-4">
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  {newsItem.body}
                </p>
                {newsItem.body.length > 150 && (
                  <details className="mt-2 group">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
                      <span>全文を見る</span>
                      <span className="text-xs text-gray-500">({newsItem.body.length}文字)</span>
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {newsItem.body}
                    </div>
                  </details>
                )}
              </div>
            ) : newsItem.summary ? (
              <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                {newsItem.summary}
              </p>
            ) : null}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                {new Date(newsItem.created_at).toLocaleDateString('ja-JP')}
              </span>
              <div className="flex items-center gap-2">
                {/* 詳細ボタン */}
                <button
                  onClick={() => showNewsDetail(newsItem)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors duration-200"
                >
                  <Eye className="w-3 h-3" />
                  詳細
                </button>
                {/* URLボタン */}
                {newsItem.source_url && (
                  <a
                    href={newsItem.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-medium transition-colors duration-200"
                  >
                    <ExternalLink className="w-3 h-3" />
                    URL
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 結果がない場合 */}
      {filteredNews.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
            <Globe className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            該当するニュースがありません
          </h3>
          <p className="text-gray-500 mb-6">
            検索条件を変更してお試しください
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all')
              setSelectedPrefecture('all')
              setSearchQuery('')
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            フィルターをリセット
          </button>
        </div>
      )}

      {/* 地域ニュース詳細モーダル */}
      {selectedNews && (
        <LocalNewsDetailModal
          news={selectedNews}
          isOpen={isNewsModalOpen}
          onClose={() => {
            setIsNewsModalOpen(false)
            setSelectedNews(null)
          }}
        />
      )}
    </div>
  )
}
