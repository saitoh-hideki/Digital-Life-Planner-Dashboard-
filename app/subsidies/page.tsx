'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Search, Gift, Filter, Calendar, Building2, MapPin, Eye, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Subsidy } from '@/lib/types'
import { prefectures, getMunicipalitiesByPrefecture } from '@/lib/prefectures'
import SubsidyDetailModal from '@/components/subsidies/SubsidyDetailModal'

export default function SubsidiesPage() {
  const router = useRouter()
  
  // State management
  const [subsidies, setSubsidies] = useState<Subsidy[]>([])
  const [filteredSubsidies, setFilteredSubsidies] = useState<Subsidy[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Search filters
  const [filters, setFilters] = useState({
    prefecture: '',
    municipality: '',
    keyword: '',
    status: '',
    audience: ''
  })
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  
  // UI State
  const [showFilters, setShowFilters] = useState(false)

  // Load initial data on page load
  useEffect(() => {
    loadSubsidies()
  }, [])

  // Filter subsidies when filters change
  useEffect(() => {
    applyFilters()
  }, [subsidies, filters])

  const loadSubsidies = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('subsidies_sheet')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setSubsidies(data || [])
      setHasSearched(true)
    } catch (error) {
      console.error('Error loading subsidies:', error)
      setSubsidies([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...subsidies]

    // Prefecture filter
    if (filters.prefecture) {
      filtered = filtered.filter(s => s.prefecture === filters.prefecture)
    }

    // Municipality filter
    if (filters.municipality) {
      filtered = filtered.filter(s => 
        s.municipality?.toLowerCase().includes(filters.municipality.toLowerCase())
      )
    }

    // Keyword filter (searches in name, summary, organization, target_audience)
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(keyword) ||
        s.summary?.toLowerCase().includes(keyword) ||
        s.organization?.toLowerCase().includes(keyword) ||
        s.target_audience?.toLowerCase().includes(keyword)
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status)
    }

    // Audience filter
    if (filters.audience) {
      filtered = filtered.filter(s => 
        s.target_audience?.toLowerCase().includes(filters.audience.toLowerCase())
      )
    }

    setFilteredSubsidies(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    
    // Reset municipality when prefecture changes
    if (key === 'prefecture' && value !== filters.prefecture) {
      setFilters(prev => ({ ...prev, municipality: '' }))
    }
  }

  const clearFilters = () => {
    setFilters({
      prefecture: '',
      municipality: '',
      keyword: '',
      status: '',
      audience: ''
    })
  }

  const showSubsidyDetail = (subsidy: Subsidy) => {
    setSelectedSubsidy(subsidy)
    setShowDetailModal(true)
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubsidies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSubsidies = filteredSubsidies.slice(startIndex, endIndex)

  // Get status badge info
  const getStatusBadge = (status: string) => {
    if (!status) return { text: '不明', color: 'bg-gray-100 text-gray-800' }
    
    const normalized = status.toLowerCase().trim()
    
    if (normalized.includes('募集中') || normalized.includes('受付中') || 
        normalized.includes('open') || normalized.includes('active')) {
      return { text: '公募中', color: 'bg-green-100 text-green-800' }
    }
    
    if (normalized.includes('募集終了') || normalized.includes('受付終了') || 
        normalized.includes('締切') || normalized.includes('closed') || 
        normalized.includes('終了')) {
      return { text: '終了', color: 'bg-gray-100 text-gray-800' }
    }
    
    if (normalized.includes('予定') || normalized.includes('準備中') || 
        normalized.includes('近日') || normalized.includes('coming') || 
        normalized.includes('soon')) {
      return { text: '公募予定', color: 'bg-orange-100 text-orange-800' }
    }
    
    return { text: status, color: 'bg-blue-100 text-blue-800' }
  }

  // Get municipalities for selected prefecture
  const availableMunicipalities = getMunicipalitiesByPrefecture(filters.prefecture)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-3xl"></div>
          
          <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            {/* Back Button */}
            <button
              onClick={() => router.push('/')}
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-200 mb-6 px-4 py-2 rounded-xl hover:bg-slate-100/80"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">ダッシュボードに戻る</span>
            </button>
            
            {/* Page Title */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                  <Gift className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  補助金・助成金検索
                </h1>
              </div>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                全国の補助金・助成金情報を検索できます。地域・対象者・キーワードで絞り込み可能です。
              </p>
              
              {/* Stats */}
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>全{subsidies.length}件の補助金・助成金</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>検索結果: {filteredSubsidies.length}件</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 mb-8">
          {/* Filter Toggle Button */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">検索・絞り込み</h2>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {showFilters ? '絞り込みを閉じる' : '詳細絞り込み'}
                </span>
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-6 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Prefecture Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    都道府県
                  </label>
                  <select
                    value={filters.prefecture}
                    onChange={(e) => handleFilterChange('prefecture', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {prefectures.map((pref) => (
                      <option key={pref.value} value={pref.value}>
                        {pref.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Municipality Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    市区町村
                  </label>
                  <select
                    value={filters.municipality}
                    onChange={(e) => handleFilterChange('municipality', e.target.value)}
                    disabled={!filters.prefecture}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {availableMunicipalities.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    ステータス
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">すべて</option>
                    <option value="open">公募中</option>
                    <option value="coming_soon">公募予定</option>
                    <option value="closed">終了</option>
                  </select>
                </div>

                {/* Keyword Filter */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    キーワード検索
                  </label>
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    placeholder="補助金名、概要、対象者などで検索..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Audience Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    対象者
                  </label>
                  <input
                    type="text"
                    value={filters.audience}
                    onChange={(e) => handleFilterChange('audience', e.target.value)}
                    placeholder="中小企業、個人事業主など"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                >
                  フィルターをクリア
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Section */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <div className="text-slate-500">検索中...</div>
              </div>
            </div>
          ) : hasSearched && currentSubsidies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 text-slate-300">
                <Search className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                該当する補助金・助成金が見つかりませんでした
              </h3>
              <p className="text-slate-500 mb-4">
                検索条件を変更して再度お試しください
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                フィルターをクリア
              </button>
            </div>
          ) : (
            <>
              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentSubsidies.map((subsidy) => (
                  <div key={subsidy.row_id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    {/* Header with status badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-green-600 transition-colors duration-200 line-clamp-2">
                          {subsidy.name}
                        </h3>
                        {subsidy.summary && (
                          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-3">
                            {subsidy.summary}
                          </p>
                        )}
                      </div>
                      {subsidy.status && (
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${
                          getStatusBadge(subsidy.status).color
                        }`}>
                          {getStatusBadge(subsidy.status).text}
                        </span>
                      )}
                    </div>

                    {/* Organization and details */}
                    <div className="space-y-3 mb-6">
                      {subsidy.organization && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="line-clamp-1">{subsidy.organization}</span>
                        </div>
                      )}
                      
                      {subsidy.target_audience && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">対象者:</span> {subsidy.target_audience}
                        </div>
                      )}
                      
                      {subsidy.amount && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">補助金額:</span> {subsidy.amount}
                        </div>
                      )}
                      
                      {subsidy.period && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">期間:</span> {subsidy.period}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        {new Date(subsidy.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* 詳細ボタン */}
                        <button
                          onClick={() => showSubsidyDetail(subsidy)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors duration-200"
                        >
                          <Eye className="w-3 h-3" />
                          詳細
                        </button>
                        {/* URLボタン */}
                        {subsidy.url && (
                          <a
                            href={subsidy.url}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    前へ
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubsidy && (
        <SubsidyDetailModal
          subsidy={selectedSubsidy}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedSubsidy(null)
          }}
        />
      )}
    </div>
  )
}