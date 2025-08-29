'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ExternalLink, Search, Filter, Calendar, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { NewsArchive } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function ArchivePage() {
  const router = useRouter()
  const [archives, setArchives] = useState<NewsArchive[]>([])
  const [filteredArchives, setFilteredArchives] = useState<NewsArchive[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30')

  useEffect(() => {
    fetchArchives()
  }, [])

  useEffect(() => {
    filterArchives()
  }, [archives, searchKeyword, selectedType, selectedPeriod])

  const fetchArchives = async () => {
    try {
      const { data, error } = await supabase
        .from('v_news_archive')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      setArchives(data || [])
    } catch (error) {
      console.error('Error fetching archives:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterArchives = () => {
    let filtered = [...archives]

    // キーワード検索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(archive => 
        archive.title.toLowerCase().includes(keyword) ||
        (archive.summary && archive.summary.toLowerCase().includes(keyword))
      )
    }

    // 種別フィルタ
    if (selectedType !== 'all') {
      filtered = filtered.filter(archive => archive.kind === selectedType)
    }

    // 期間フィルタ
    if (selectedPeriod !== 'all') {
      const days = parseInt(selectedPeriod)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      filtered = filtered.filter(archive => 
        new Date(archive.published_at) >= cutoffDate
      )
    }

    setFilteredArchives(filtered)
  }

  const resetFilters = () => {
    setSearchKeyword('')
    setSelectedType('all')
    setSelectedPeriod('all')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-slate-500">読み込み中...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヘッダー部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              ダッシュボードに戻る
            </button>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
              ニュースアーカイブ
            </h1>
            <p className="text-xl text-slate-600">
              過去30日間のトピックと地域ニュースを統合表示
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索バー */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* キーワード検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="キーワードを入力..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* 種別フィルタ */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
              >
                <option value="all">すべての種別</option>
                <option value="topic">RSS</option>
                <option value="local_news">地域ニュース</option>
              </select>
            </div>

            {/* 期間フィルタ */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
              >
                <option value="all">すべての期間</option>
                <option value="7">過去7日間</option>
                <option value="30">過去30日間</option>
                <option value="90">過去90日間</option>
              </select>
            </div>

            {/* ボタン群 */}
            <div className="flex gap-3">
              <button
                onClick={filterArchives}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                検索
              </button>
              <button
                onClick={resetFilters}
                className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200"
              >
                リセット
              </button>
            </div>
          </div>
        </div>

        {/* 結果件数 */}
        <div className="mb-6">
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">{filteredArchives.length}</span>件のニュースが見つかりました
          </p>
        </div>

        {/* ニュースリスト（スクロール可能） */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="max-h-[80vh] overflow-y-auto">
            {filteredArchives.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredArchives.map((archive) => (
                  <div 
                    key={`${archive.kind}-${archive.id}`} 
                    className="p-6 hover:bg-slate-50 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* バッジと地域情報 */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                            archive.kind === 'topic' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}>
                            {archive.kind === 'topic' ? 'RSS' : '地域ニュース'}
                          </span>
                          {archive.prefecture && (
                            <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                              {archive.prefecture}
                            </span>
                          )}
                          {archive.municipality && (
                            <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                              {archive.municipality}
                            </span>
                          )}
                        </div>
                        
                        {/* タイトル */}
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                          {archive.title}
                        </h3>
                        
                        {/* 要約 */}
                        {archive.summary && (
                          <p className="text-slate-600 mb-4 leading-relaxed line-clamp-3">
                            {archive.summary}
                          </p>
                        )}
                        
                        {/* タグ */}
                        {archive.tags && archive.tags.length > 0 && (
                          <div className="flex gap-2 mb-4 flex-wrap">
                            {archive.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* フッター情報 */}
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {archive.source_name && (
                            <span className="font-medium text-slate-700">{archive.source_name}</span>
                          )}
                          <time className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(archive.published_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          </time>
                        </div>
                      </div>
                      
                      {/* 右側：詳細リンク */}
                      {archive.source_url && (
                        <div className="flex-shrink-0">
                          <a
                            href={archive.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 group-hover:translate-x-1"
                          >
                            詳細を見る
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 空状態 */
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 mx-auto mb-6 text-slate-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  過去30日間にニュースは登録されていません
                </h3>
                <p className="text-slate-600 mb-6">
                  検索条件を変更して再試行してください
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <Filter className="w-4 h-4" />
                  フィルタをリセット
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
