'use client'

import { useState, useEffect } from 'react'
import { LocalNews, LocalNewsCategory } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { Globe, MapPin, ExternalLink, ChevronRight } from 'lucide-react'
import Link from 'next/link'

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

export default function LocalNewsCard() {
  const [news, setNews] = useState<LocalNews[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<LocalNewsCategory | 'all'>('all')
  const [showAll, setShowAll] = useState(false)

  // ニュース一覧の取得
  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('local_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      // デバッグ情報を追加
      console.log('LocalNewsCard - Fetched news data:', data)
      if (data && data.length > 0) {
        console.log('LocalNewsCard - First item body:', data[0].body)
        console.log('LocalNewsCard - First item body type:', typeof data[0].body)
        console.log('LocalNewsCard - First item body length:', data[0].body?.length)
        console.log('LocalNewsCard - First item summary:', data[0].summary)
        console.log('LocalNewsCard - First item summary type:', typeof data[0].summary)
        console.log('LocalNewsCard - First item summary length:', data[0].summary?.length)
        console.log('LocalNewsCard - All items with body:', data.filter(item => item.body && item.body.length > 0).length)
        console.log('LocalNewsCard - All items with summary:', data.filter(item => item.summary && item.summary.length > 0).length)
        
        // URLのデバッグ情報を追加
        console.log('LocalNewsCard - URL Debug Info:')
        data.forEach((item, index) => {
          if (item.source_url) {
            console.log(`Item ${index + 1} (${item.name}):`, item.source_url)
          }
        })
        
        console.log('LocalNewsCard - All items body data:', data.map(item => ({ 
          id: item.id, 
          name: item.name, 
          body: item.body, 
          bodyLength: item.body?.length,
          summary: item.summary,
          summaryLength: item.summary?.length,
          sourceUrl: item.source_url
        })))
      }
      
      setNews(data || [])
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  // カテゴリ別のニュースをフィルタリング
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory)

  // 表示するニュース（最初の5件または全件）
  const displayNews = showAll ? filteredNews : filteredNews.slice(0, 5)

  // カテゴリ別の件数
  const categoryCounts = news.reduce((acc, item) => {
    if (item.category) {
      acc[item.category] = (acc[item.category] || 0) + 1
    }
    return acc
  }, {} as Record<LocalNewsCategory, number>)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">地域ニュース</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">地域ニュース</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {news.length}件のニュース
          </span>
          <Link
            href="/local-news"
            className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
          >
            すべて見る →
          </Link>
        </div>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
          }`}
        >
          すべて ({news.length})
        </button>
        {Object.entries(categoryCounts).map(([category, count]) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as LocalNewsCategory)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedCategory === category
                ? CATEGORY_COLORS[category as LocalNewsCategory]
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {CATEGORY_ICONS[category as LocalNewsCategory]} {category} ({count})
          </button>
        ))}
      </div>

      {/* ニュース一覧 */}
      <div className="space-y-4">
        {displayNews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            該当するニュースがありません
          </div>
        ) : (
          displayNews.map((newsItem) => (
            <div
              key={newsItem.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {newsItem.category && CATEGORY_ICONS[newsItem.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${newsItem.category ? CATEGORY_COLORS[newsItem.category] : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {newsItem.category || '未分類'}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {newsItem.prefecture} {newsItem.municipality}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {newsItem.name}
                  </h4>
                  {/* 本文の表示 - bodyフィールドを優先して表示 */}
                  {newsItem.body ? (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {newsItem.body}
                      </p>
                      {newsItem.body.length > 100 && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                            全文を見る ({newsItem.body.length}文字)
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {newsItem.body}
                          </div>
                        </details>
                      )}
                    </div>
                  ) : newsItem.summary ? (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {newsItem.summary}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(newsItem.created_at).toLocaleDateString('ja-JP')}
                    </span>
                    {newsItem.source_url && (
                      <a
                        href={newsItem.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        詳細
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* もっと見るボタン */}
      {filteredNews.length > 5 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {showAll ? '一部表示' : 'もっと見る'}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        </div>
      )}
    </div>
  )
}
