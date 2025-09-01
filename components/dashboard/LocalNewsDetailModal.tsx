'use client'

import { LocalNews } from '@/lib/types'
import { X, ExternalLink, MapPin, Calendar, FileText, Info } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect } from 'react'

interface LocalNewsDetailModalProps {
  news: LocalNews
  isOpen: boolean
  onClose: () => void
}

export default function LocalNewsDetailModal({ news, isOpen, onClose }: LocalNewsDetailModalProps) {
  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Category badge configuration
  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      '行政DX': 'bg-blue-100 text-blue-800 border-blue-200',
      '教育・学習': 'bg-green-100 text-green-800 border-green-200',
      '防災・安全': 'bg-red-100 text-red-800 border-red-200',
      '福祉・子育て': 'bg-pink-100 text-pink-800 border-pink-200',
      '産業・ビジネス': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'イベント': 'bg-purple-100 text-purple-800 border-purple-200',
      '環境・暮らし': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'その他': 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const categoryIcons: Record<string, string> = {
      '行政DX': '🏛️',
      '教育・学習': '📚',
      '防災・安全': '🚨',
      '福祉・子育て': '👨‍👩‍👧‍👦',
      '産業・ビジネス': '💼',
      'イベント': '🎉',
      '環境・暮らし': '🌱',
      'その他': '📰'
    }

    return {
      text: category,
      className: categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200',
      icon: categoryIcons[category] || '📰'
    }
  }

  const categoryBadge = getCategoryBadge(news.category)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-white">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Title and location */}
            <div className="pr-12">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{categoryBadge.icon}</span>
                <h2 className="text-2xl font-bold leading-tight">
                  {news.name}
                </h2>
              </div>
              
              {(news.prefecture || news.municipality) && (
                <div className="flex items-center gap-2 text-green-100 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {news.prefecture}
                    {news.municipality && ` ${news.municipality}`}
                  </span>
                </div>
              )}
              
              {/* Category badge */}
              <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${categoryBadge.className} bg-white/90`}>
                {categoryBadge.text}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Summary */}
            {news.summary && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <h3 className="text-lg font-semibold text-slate-900">概要</h3>
                </div>
                <p className="text-slate-700 leading-relaxed pl-7">
                  {news.summary}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Created Date */}
              {news.created_at && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">登録日</span>
                  </div>
                  <p className="text-slate-900 pl-6">
                    {format(new Date(news.created_at), 'yyyy年MM月dd日(E)', { locale: ja })}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            {news.source_url && (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <ExternalLink className="w-4 h-4" />
                  <span>公式ページのURLが利用可能です</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                詳細な情報は公式ページをご確認ください
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                >
                  閉じる
                </button>
                
                {news.source_url && (
                  <a
                    href={news.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    公式ページを見る
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
