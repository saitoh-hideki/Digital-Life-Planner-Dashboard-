'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SearchResult } from '@/lib/types'
import SearchForm from '@/components/search/SearchForm'
import SearchResults from '@/components/search/SearchResults'

export default function SearchPage() {
  const params = useParams()
  const router = useRouter()
  const searchType = params?.type as 'apps' | 'subsidies' | 'news'
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const getPageTitle = () => {
    switch (searchType) {
      case 'apps':
        return '地域アプリ検索'
      case 'subsidies':
        return '補助金・助成金検索'
      case 'news':
        return '地域ニュース検索'
      default:
        return '検索'
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
          {getPageTitle()}
        </h1>
      </div>
      
      <SearchForm onSearch={handleSearch} />
      
      <SearchResults
        results={results}
        type={searchType}
        loading={loading}
        hasSearched={hasSearched}
      />
    </div>
  )
}