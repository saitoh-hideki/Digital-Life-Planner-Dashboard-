import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
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
    
    if (result.prefecture) items.push(result.prefecture)
    if (result.municipality) items.push(result.municipality)
    if (result.source_name) items.push(result.source_name)
    
    if (type === 'subsidies' && result.metadata) {
      const applyEnd = result.metadata.apply_end
      if (applyEnd && typeof applyEnd === 'string') {
        items.push(`締切: ${format(new Date(applyEnd), 'yyyy/MM/dd')}`)
      }
      const audience = result.metadata.audience
      if (audience && typeof audience === 'string') items.push(audience)
    }
    
    if (type === 'apps' && result.metadata) {
      const platform = result.metadata.platform
      if (platform && typeof platform === 'string') items.push(platform)
      const provider = result.metadata.provider
      if (provider && typeof provider === 'string') items.push(provider)
    }
    
    return items
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">検索中...</div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {getEmptyMessage()}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div key={result.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {result.name}
              </h3>
              
              {result.summary && (
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {result.summary}
                </p>
              )}
              
              <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                {renderMetadata(result).map((item, index) => (
                  <span key={index} className="after:content-['•'] after:ml-3 last:after:content-none">
                    {item}
                  </span>
                ))}
              </div>
              
              {result.tags && result.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {result.tags.map((tag, index) => (
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
            
            {result.url && (
              <a
                href={result.url}
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
  )
}