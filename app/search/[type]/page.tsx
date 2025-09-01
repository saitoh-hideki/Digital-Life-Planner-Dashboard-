'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Search, Gift, Newspaper } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SearchResult } from '@/lib/types'
import SearchForm from '@/components/search/SearchForm'
import SearchResults from '@/components/search/SearchResults'

export default function SearchPage() {
  const params = useParams()
  const router = useRouter()
  const searchType = params?.type as 'apps' | 'subsidies' | 'news' | 'local-news'
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // ページ読み込み時に初期検索を実行
  useEffect(() => {
    performInitialSearch()
  }, [searchType])

  const performInitialSearch = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from(getTableName())
        .select('*')
      
      if (searchType === 'news') {
        query = query.eq('status', 'published')
      }
      
      if (searchType === 'local-news') {
        // 新しい地域ニューステーブルはstatusカラムがないので条件を追加しない
      }
      
      const { data, error } = await query
        .order(getOrderBy(), { ascending: searchType === 'subsidies' })
        .limit(20)
      
      if (error) throw error
      
      // Format results for display
      const formattedResults: SearchResult[] = (data || []).map(item => ({
        ...item,
        metadata: {
          platform: item.platform,
          provider: item.provider,
          apply_end: item.apply_end,
          audience: item.audience,
          status: item.status
        }
      }))
      
      setResults(formattedResults)
      setHasSearched(true)
    } catch (error) {
      console.error('Initial search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getPageTitle = () => {
    switch (searchType) {
      case 'apps':
        return '地域アプリ検索'
      case 'subsidies':
        return '補助金・助成金検索'
      case 'news':
        return '地域ニュース検索'
      case 'local-news':
        return '地域ニュース検索（新）'
      default:
        return '検索'
    }
  }

  const getPageDescription = () => {
    switch (searchType) {
      case 'apps':
        return '地域に特化した便利なアプリケーションを検索できます'
      case 'subsidies':
        return '地域の補助金・助成金情報を検索できます'
      case 'news':
        return '地域の最新ニュース・情報を検索できます'
      case 'local-news':
        return '全国各地のデジタル化・地域活性化に関する最新情報を検索できます'
      default:
        return '地域情報を検索できます'
    }
  }

  const getPageIcon = () => {
    switch (searchType) {
      case 'apps':
        return <Search className="w-8 h-8 text-blue-500" />
      case 'subsidies':
        return <Gift className="w-8 h-8 text-green-500" />
      case 'news':
        return <Newspaper className="w-8 h-8 text-orange-500" />
      case 'local-news':
        return <Newspaper className="w-8 h-8 text-green-500" />
      default:
        return <Search className="w-8 h-8 text-blue-500" />
    }
  }

  const getTableName = () => {
    switch (searchType) {
      case 'apps':
        return 'local_apps'
      case 'subsidies':
        return 'subsidies'
      case 'news':
        return 'local_news'
      case 'local-news':
        return 'local_news'
      default:
        return ''
    }
  }

  const getOrderBy = () => {
    switch (searchType) {
      case 'subsidies':
        return 'apply_end'
      case 'apps':
        return 'id' // updated_onカラムが存在しない場合はidでソート
      case 'news':
        return 'published_at'
      case 'local-news':
        return 'created_at'
      default:
        return 'id'
    }
  }

  const handleSearch = async (params: {
    prefecture: string
    municipality: string
    keyword: string
  }) => {
    setLoading(true)
    setHasSearched(true)
    
    try {
      let query = supabase
        .from(getTableName())
        .select('*')
      
      if (searchType === 'news') {
        query = query.eq('status', 'published')
      }
      
      if (searchType === 'local-news') {
        // 新しい地域ニューステーブルはstatusカラムがないので条件を追加しない
      }
      
      if (params.prefecture) {
        query = query.eq('prefecture', params.prefecture)
      }
      
      if (params.municipality) {
        query = query.ilike('municipality', `%${params.municipality}%`)
      }
      
      if (params.keyword) {
        query = query.or(`name.ilike.%${params.keyword}%,summary.ilike.%${params.keyword}%`)
      }
      
      const { data, error } = await query
        .order(getOrderBy(), { ascending: searchType === 'subsidies' })
        .limit(20)
      
      if (error) throw error
      
      // Format results for display
      const formattedResults: SearchResult[] = (data || []).map(item => ({
        ...item,
        metadata: {
          platform: item.platform,
          provider: item.provider,
          apply_end: item.apply_end,
          audience: item.audience,
          status: item.status
        }
      }))
      
      setResults(formattedResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
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
                  {getPageIcon()}
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {getPageTitle()}
                </h1>
              </div>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {getPageDescription()}
              </p>
            </div>
          </div>
        </div>
        
        {/* 検索フォーム */}
        <SearchForm onSearch={handleSearch} searchType={searchType} />
        
        {/* 検索結果 */}
        <div className="animate-fade-in">
          <SearchResults
            results={results}
            type={searchType}
            loading={loading}
            hasSearched={hasSearched}
          />
        </div>
      </div>
    </div>
  )
}