'use client'

import { useState, useEffect } from 'react'
import { Search, RotateCcw, MapPin, Building2, Hash } from 'lucide-react'
import { prefectures, getMunicipalitiesByPrefecture, defaultMunicipalities } from '@/lib/prefectures'

interface SearchFormProps {
  onSearch: (params: {
    prefecture: string
    municipality: string
    keyword: string
  }) => void
  searchType?: 'apps' | 'subsidies' | 'news' | 'local-news'
}

export default function SearchForm({ onSearch, searchType = 'apps' }: SearchFormProps) {
  const [prefecture, setPrefecture] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [keyword, setKeyword] = useState('')
  const [availableMunicipalities, setAvailableMunicipalities] = useState(defaultMunicipalities)

  // 検索タイプに応じた説明文を取得
  const getSearchDescription = () => {
    switch (searchType) {
      case 'apps':
        return '都道府県・市区町村・キーワードで地域アプリを検索できます'
      case 'subsidies':
        return '都道府県・市区町村・キーワードで補助金・助成金を検索できます'
      case 'news':
        return '都道府県・市区町村・キーワードで地域ニュースを検索できます'
      case 'local-news':
        return '都道府県・市区町村・キーワードで地域ニュースを検索できます'
      default:
        return '都道府県・市区町村・キーワードで地域情報を検索できます'
    }
  }

  // 都道府県が変更されたときに市町村をリセット
  useEffect(() => {
    console.log('都道府県が変更されました:', prefecture)
    if (prefecture) {
      const municipalitiesList = getMunicipalitiesByPrefecture(prefecture)
      console.log('取得された市町村リスト:', municipalitiesList)
      setAvailableMunicipalities(municipalitiesList)
    } else {
      setAvailableMunicipalities(defaultMunicipalities)
    }
    setMunicipality('')
  }, [prefecture])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ prefecture, municipality, keyword })
  }

  const handleReset = () => {
    setPrefecture('')
    setMunicipality('')
    setKeyword('')
    setAvailableMunicipalities(defaultMunicipalities)
    onSearch({ prefecture: '', municipality: '', keyword: '' })
  }

  return (
    <div className="relative">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl"></div>
      
      {/* メインコンテンツ */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            地域を選んで検索
          </h2>
          <p className="text-slate-600 text-sm">
            {getSearchDescription()}
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-6">
          {/* 検索フィールド */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 都道府県 */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-blue-500 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <select
                id="prefecture"
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 text-slate-700 font-medium"
              >
                <option value="">都道府県を選択</option>
                {prefectures.map(pref => (
                  <option key={pref.value} value={pref.value}>
                    {pref.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 市区町村 */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-indigo-500 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <select
                id="municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                disabled={!prefecture}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 text-slate-700 font-medium disabled:bg-slate-100/80 disabled:cursor-not-allowed disabled:border-slate-200"
              >
                <option value="">市区町村を選択</option>
                {availableMunicipalities.map(muni => (
                  <option key={muni.value} value={muni.value}>
                    {muni.label}
                  </option>
                ))}
              </select>
            </div>

            {/* キーワード */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-sky-500 group-focus-within:text-sky-600 transition-colors" />
              </div>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="検索キーワードを入力"
                className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 text-slate-700 font-medium"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* ボタン群 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              type="button"
              onClick={handleReset}
              className="group px-8 py-4 text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl transition-all duration-200 flex items-center gap-3 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
              リセット
            </button>
            
            <button
              type="submit"
              className="group relative px-8 py-4 text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden"
            >
              {/* 光沢エフェクト */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              検索する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}