'use client'

import { useState, useEffect } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { prefectures, municipalities, defaultMunicipalities } from '@/lib/prefectures'

interface SearchFormProps {
  onSearch: (params: {
    prefecture: string
    municipality: string
    keyword: string
  }) => void
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [prefecture, setPrefecture] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [keyword, setKeyword] = useState('')
  const [availableMunicipalities, setAvailableMunicipalities] = useState(defaultMunicipalities)

  // 都道府県が変更されたときに市町村をリセット
  useEffect(() => {
    if (prefecture) {
      const municipalitiesList = municipalities[prefecture as keyof typeof municipalities] || []
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">地域を選んで検索</h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-1">
              都道府県
            </label>
            <select
              id="prefecture"
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {prefectures.map(pref => (
                <option key={pref.value} value={pref.value}>
                  {pref.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-1">
              市区町村
            </label>
            <select
              id="municipality"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              disabled={!prefecture}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {availableMunicipalities.map(muni => (
                <option key={muni.value} value={muni.value}>
                  {muni.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
              キーワード
            </label>
            <input
              type="text"
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="検索キーワードを入力"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            リセット
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            検索する
          </button>
        </div>
      </form>
    </div>
  )
}