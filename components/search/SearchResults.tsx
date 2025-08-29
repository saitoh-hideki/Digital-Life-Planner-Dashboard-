import { format } from 'date-fns'
import { ExternalLink, Smartphone, Newspaper, Gift, MapPin, Building2, Calendar, Users, Smartphone as PlatformIcon } from 'lucide-react'
import { SearchResult } from '@/lib/types'

interface SearchResultsProps {
  results: SearchResult[]
  type: 'apps' | 'subsidies' | 'news'
  loading: boolean
  hasSearched: boolean
}

export default function SearchResults({ 
  results, 
  type, 
  loading, 
  hasSearched 
}: SearchResultsProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'apps':
        return <Smartphone className="w-6 h-6 text-blue-500" />
      case 'subsidies':
        return <Gift className="w-6 h-6 text-green-500" />
      case 'news':
        return <Newspaper className="w-6 h-6 text-orange-500" />
      default:
        return <Smartphone className="w-6 h-6 text-blue-500" />
    }
  }

  const getEmptyMessage = () => {
    if (!hasSearched) {
      return '検索条件を入力してください'
    }
    
    switch (type) {
      case 'apps':
        return '条件に一致するアプリが見つかりませんでした'
      case 'subsidies':
        return '一致する補助金が見つかりませんでした。条件を広げて再検索してください'
      case 'news':
        return '一致するニュースが見つかりませんでした'
      default:
        return '検索結果が見つかりませんでした'
    }
  }

  const renderMetadata = (result: SearchResult) => {
    const items = []
    
    if (result.prefecture) items.push({ icon: <MapPin className="w-4 h-4" />, text: result.prefecture, color: 'bg-blue-100 text-blue-700' })
    if (result.municipality) items.push({ icon: <Building2 className="w-4 h-4" />, text: result.municipality, color: 'bg-indigo-100 text-indigo-700' })
    if (result.source_name) items.push({ icon: <Newspaper className="w-4 h-4" />, text: result.source_name, color: 'bg-slate-100 text-slate-700' })
    
    if (type === 'subsidies' && result.metadata) {
      const applyEnd = result.metadata.apply_end
      if (applyEnd && typeof applyEnd === 'string') {
        items.push({ icon: <Calendar className="w-4 h-4" />, text: `締切: ${format(new Date(applyEnd), 'yyyy/MM/dd')}`, color: 'bg-red-100 text-red-700' })
      }
      const audience = result.metadata.audience
      if (audience && typeof audience === 'string') {
        items.push({ icon: <Users className="w-4 h-4" />, text: audience, color: 'bg-purple-100 text-purple-700' })
      }
    }
    
    if (type === 'apps' && result.metadata) {
      const platform = result.metadata.platform
      if (platform && typeof platform === 'string') {
        items.push({ icon: <PlatformIcon className="w-4 h-4" />, text: platform, color: 'bg-sky-100 text-sky-700' })
      }
      const provider = result.metadata.provider
      if (provider && typeof provider === 'string') {
        items.push({ icon: <Building2 className="w-4 h-4" />, text: provider, color: 'bg-emerald-100 text-emerald-700' })
      }
    }
    
    return items
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-slate-600 font-medium">検索中...</div>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 text-slate-300">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          {getEmptyMessage()}
        </h3>
        <p className="text-slate-500 mb-6">
          検索条件を変更して再度お試しください
        </p>
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
          人気アプリ一覧を見る
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 結果ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getTypeIcon()}
          <h3 className="text-xl font-semibold text-slate-800">
            検索結果 ({results.length}件)
          </h3>
        </div>
      </div>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((result, index) => (
          <div 
            key={result.id} 
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 p-6 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* 背景グラデーション */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* メインコンテンツ */}
            <div className="relative">
              {/* ヘッダー */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    {result.name}
                  </h3>
                  
                  {result.summary && (
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                      {result.summary}
                    </p>
                  )}
                </div>
                
                {/* 外部リンクボタン */}
                {result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium shrink-0 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl group-hover:scale-110 transform transition-transform duration-200"
                  >
                    詳細を見る
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </a>
                )}
              </div>
              
              {/* メタデータタグ */}
              <div className="flex flex-wrap gap-2 mb-4">
                {renderMetadata(result).map((item, index) => (
                  <span 
                    key={index}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${item.color} border border-transparent hover:border-current/20 transition-all duration-200`}
                  >
                    {item.icon}
                    {item.text}
                  </span>
                ))}
              </div>
              
              {/* タグ */}
              {result.tags && result.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {result.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* ホバー時の矢印インジケーター */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}