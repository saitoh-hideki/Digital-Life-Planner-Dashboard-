import { X } from 'lucide-react'
import { SearchResult } from '@/lib/types'

interface DetailModalProps {
  result: SearchResult | null
  isOpen: boolean
  onClose: () => void
}

export default function DetailModal({ result, isOpen, onClose }: DetailModalProps) {
  if (!isOpen || !result) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* モーダル */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">{result.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>
          
          {/* コンテンツ */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* 概要 */}
            {result.summary && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">概要</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {result.summary}
                </p>
              </div>
            )}
            
            {/* 詳細説明 */}
            {'description' in result && (result as {description: string}).description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">詳細</h3>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {(result as {description: string}).description}
                </div>
              </div>
            )}
            
            {/* メタデータ */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.prefecture && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">都道府県:</span>
                    <span className="text-slate-800">{result.prefecture}</span>
                  </div>
                )}
                {result.municipality && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">市区町村:</span>
                    <span className="text-slate-800">{result.municipality}</span>
                  </div>
                )}
                {result.source_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">情報源:</span>
                    <span className="text-slate-800">{result.source_name}</span>
                  </div>
                )}
                {result.url && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">URL:</span>
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline break-all"
                    >
                      {result.url}
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* タグ */}
            {result.tags && result.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">タグ</h3>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* フッター */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              最終更新: {'updated_at' in result && (result as {updated_at: string}).updated_at ? new Date((result as {updated_at: string}).updated_at).toLocaleDateString('ja-JP') : '不明'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                閉じる
              </button>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  公式サイトへ
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
