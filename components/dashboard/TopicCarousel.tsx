'use client'

import { useState, useRef } from 'react'
import { Topic } from '@/lib/types'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TopicCarouselProps {
  topics: Topic[]
}

export default function TopicCarousel({ topics }: TopicCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cardWidth = 320 // カードの横幅
      const gap = 24 // カード間のギャップ
      const scrollPosition = index * (cardWidth + gap)
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
      setCurrentIndex(index)
    }
  }

  const scrollLeft = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1)
    }
  }

  const scrollRight = () => {
    if (currentIndex < Math.ceil(topics.length / 3) - 1) {
      scrollToIndex(currentIndex + 1)
    }
  }

  const isRecent = (publishedAt: string) => {
    return new Date(publishedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 text-slate-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <p className="text-slate-500 text-lg mb-2">本日のトピックはまだありません</p>
        <p className="text-slate-400 text-sm">新しい情報が入り次第、ここに表示されます</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* ナビゲーションボタン */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            disabled={currentIndex >= Math.ceil(topics.length / 3) - 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* ドットインジケータ */}
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.ceil(topics.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-blue-600 w-6' 
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* スクロールコンテナ */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex-shrink-0 w-80 bg-white rounded-xl p-5 border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
          >
            <div className="space-y-4">
              {/* ヘッダー部分 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-relaxed group-hover:text-blue-600 transition-colors">
                      {topic.headline}
                    </h3>
                    {isRecent(topic.published_at) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        NEW
                      </span>
                    )}
                  </div>
                  
                  {/* AI要約 */}
                  {topic.ai_summary && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          AI要約
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {topic.ai_summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* フッター部分 */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  {topic.source_name && (
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">{topic.source_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <time>
                      {format(new Date(topic.published_at), 'HH:mm', { locale: ja })}
                    </time>
                  </div>
                </div>
                
                {/* 続きを読むリンク */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <a 
                    href="#" 
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                  >
                    続きを読む
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* スクロールバーを隠すCSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
