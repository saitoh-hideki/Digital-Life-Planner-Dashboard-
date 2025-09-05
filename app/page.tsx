'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Topic, LocalApp, Subsidy, LocalNews, LocalNewsCategory, AcademicCircleEvent, LocalMediaKnowledge } from '@/lib/types'
import DashboardCard from '@/components/dashboard/DashboardCard'
import InfoItem from '@/components/dashboard/InfoItem'
import SubsidyDetailModal from '@/components/subsidies/SubsidyDetailModal'
import LocalNewsDetailModal from '@/components/dashboard/LocalNewsDetailModal'
import DigitalSafetyNewsList from '@/components/news/DigitalSafetyNewsList'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, FileText, Archive, Settings, Shield, Eye, ExternalLink, MapPin, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [localApps, setLocalApps] = useState<LocalApp[]>([])
  const [subsidies, setSubsidies] = useState<Subsidy[]>([])
  const [localNews, setLocalNews] = useState<LocalNews[]>([])
  const [events, setEvents] = useState<AcademicCircleEvent[]>([])
  const [knowledge, setKnowledge] = useState<LocalMediaKnowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [canAccessAdminPanel, setCanAccessAdminPanel] = useState(true)
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null)
  const [isSubsidyModalOpen, setIsSubsidyModalOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<LocalNews | null>(null)
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('all')
  const [prefectures, setPrefectures] = useState<string[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const showSubsidyDetail = (subsidy: Subsidy) => {
    setSelectedSubsidy(subsidy)
    setIsSubsidyModalOpen(true)
  }

  const showNewsDetail = (news: LocalNews) => {
    setSelectedNews(news)
    setIsNewsModalOpen(true)
  }

  const fetchDashboardData = async () => {
    try {
      setError(null)
      setLoading(true)
      
      const [
        { data: topicsData, error: topicsError },
        { data: subsidiesData, error: subsidiesError },
        { data: appsData, error: appsError },
        { data: newsData, error: newsError },
        { data: eventsData, error: eventsError },
        { data: knowledgeData, error: knowledgeError }
      ] = await Promise.all([
        supabase.from('topics').select('*').eq('is_today', true).order('published_at', { ascending: false }).limit(10),
        supabase.from('subsidies_sheet').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('local_apps').select('*').order('id', { ascending: false }).limit(3),
        supabase.from('local_news').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('academic_circle_events').select('*').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date', { ascending: true }).limit(5),
        supabase.from('local_media_knowledge').select('*').order('created_at', { ascending: false }).limit(3)
      ])

      if (topicsError) throw topicsError
      if (subsidiesError) throw subsidiesError
      if (appsError) throw appsError
      if (newsError) throw newsError
      if (eventsError) throw eventsError
      if (knowledgeError) throw knowledgeError

      setTopics(topicsData || [])
      setSubsidies(subsidiesData || [])
      setLocalApps(appsData || [])
      setLocalNews(newsData || [])
      setEvents(eventsData || [])
      setKnowledge(knowledgeData || [])

      const uniquePrefectures = [...new Set(newsData?.map(item => item.prefecture) || [])]
      setPrefectures(uniquePrefectures.sort())

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('データの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const settingsMenuItems = [
    { name: '本日のトピック', href: '/admin/topics', icon: '📰' },
    { name: '補助金・助成金', href: '/admin/subsidies', icon: '💰' },
    { name: '地域アプリ', href: '/admin/apps', icon: '📱' },
    { name: '地域ニュース', href: '/admin/news', icon: '📝' },
    { name: 'アカデミックサークル', href: '/admin/events', icon: '🎓' },
    { name: '地域媒体ナレッジ', href: '/admin/knowledge', icon: '📖' },
    { name: 'ニュースアーカイブ', href: '/admin/archive', icon: '📂' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-500">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">エラーが発生しました</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  const filteredNews = selectedPrefecture === 'all' 
    ? localNews 
    : localNews.filter(news => news.prefecture === selectedPrefecture)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Digital Life Planner
          </h1>
          <p className="text-slate-600">
            Your Hub for Learning, Planning, and Acting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-full">
            <DashboardCard
              title="地域ハイライト"
              subtitle="あなたの地域の最新情報をピックアップ"
              icon={<MapPin className="w-5 h-5" />}
              linkText="すべて見る"
              linkHref="/local-news"
              fullWidth
            >
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    表示地域:
                  </label>
                  <select
                    value={selectedPrefecture}
                    onChange={(e) => setSelectedPrefecture(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">すべての地域</option>
                    {prefectures.map((prefecture) => (
                      <option key={prefecture} value={prefecture}>
                        {prefecture}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredNews.length > 0 ? (
                <div className="overflow-x-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}>
                  <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                    {filteredNews.slice(0, 10).map((news) => (
                      <div key={news.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex-shrink-0 w-80">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">
                                {getNewsCategoryIcon(news.category || 'その他')}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getNewsCategoryColor(news.category || 'その他')}`}>
                                {news.category || 'その他'}
                              </span>
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                              {news.name}
                            </h4>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{news.prefecture} {news.municipality}</span>
                                <span>•</span>
                                <span>
                                  {new Date(news.created_at).toLocaleDateString('ja-JP')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => showNewsDetail(news)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors duration-200"
                                >
                                  <Eye className="w-3 h-3" />
                                  詳細
                                </button>
                                {news.source_url && (
                                  <a
                                    href={news.source_url}
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 text-slate-300">
                    <MapPin className="w-full h-full" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    {selectedPrefecture === 'all' 
                      ? '地域ハイライト情報はまだありません' 
                      : `${selectedPrefecture}の地域ニュースはまだありません`}
                  </p>
                </div>
              )}
            </DashboardCard>
          </div>

          <DashboardCard
            title="補助金・助成金"
            icon="💰"
            linkText="検索へ"
            linkHref="/subsidies"
          >
            {subsidies.length > 0 ? (
              <div className="space-y-4">
                {subsidies.map((subsidy) => (
                  <div key={subsidy.row_id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                          {subsidy.name}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                          {subsidy.summary || subsidy.organization}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-slate-500">
                            {subsidy.organization}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => showSubsidyDetail(subsidy)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors duration-200"
                            >
                              <Eye className="w-3 h-3" />
                              詳細
                            </button>
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 text-slate-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">補助金情報は準備中です</p>
              </div>
            )}
          </DashboardCard>

          <DashboardCard
            title="地域アプリ"
            icon="📱"
            linkText="検索へ"
            linkHref="/search/apps"
          >
            {localApps.length > 0 ? (
              <div className="space-y-4">
                {localApps.map((app) => (
                  <InfoItem
                    key={app.id}
                    title={app.name}
                    description={app.summary}
                    metadata={[
                      app.platform || '',
                      app.provider || ''
                    ].filter(Boolean)}
                    badge={app.platform || 'アプリ'}
                    badgeColor="blue"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 text-slate-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">地域アプリ情報はまだありません</p>
              </div>
            )}
          </DashboardCard>

          <DashboardCard
            title="デジタル安心・安全"
            subtitle="詐欺・セキュリティ・プライバシーの注意と対策"
            icon={<ShieldAlert className="w-5 h-5" />}
            linkText="すべて見る"
            linkHref="/local-news"
          >
            <DigitalSafetyNewsList 
              news={localNews} 
              onNewsClick={showNewsDetail}
              limit={3}
            />
          </DashboardCard>

          <DashboardCard
            title="アカデミックサークル"
            icon="🎓"
            linkText="すべて見る"
            linkHref="/events"
          >
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.slice(0, 3).map((event) => (
                  <InfoItem
                    key={event.id}
                    title={event.event_name}
                    description={event.event_category}
                    metadata={[
                      `${event.event_date} ${event.start_time.substring(0, 5)}-${event.end_time.substring(0, 5)}`,
                      event.delivery_type
                    ]}
                    badge={event.day_of_week}
                    badgeColor="green"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 text-slate-300">
                  <Calendar className="w-full h-full" />
                </div>
                <p className="text-slate-500 text-lg mb-2">イベント情報はまだありません</p>
                <p className="text-slate-400 text-sm">新しいイベントが登録されると、ここに表示されます</p>
              </div>
            )}
          </DashboardCard>

          <DashboardCard
            title="地域媒体ナレッジ"
            icon="📖"
            linkText="すべて見る"
            linkHref="/knowledge"
          >
            {knowledge.length > 0 ? (
              <div className="space-y-4">
                {knowledge.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getFileTypeBackground(item.file_name || null)} rounded-full flex items-center justify-center text-white text-lg shadow-lg`}>
                          {getFileTypeIcon(item.file_name || null)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                          {item.title || item.file_name || `ファイル ${item.id}`}
                        </h4>
                        {item.region && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                              {item.region}
                            </span>
                          </div>
                        )}
                        {item.created_at && (
                          <div className="text-xs text-slate-500">
                            {format(new Date(item.created_at), 'yyyy/MM/dd')}
                          </div>
                        )}
                      </div>
                      {item.url && item.url !== 'EMPTY' ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-xs font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex-shrink-0"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          開く
                        </a>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold flex-shrink-0">
                          <span className="text-xs">なし</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 text-slate-300">
                  <FileText className="w-full h-full" />
                </div>
                <p className="text-slate-500 text-lg mb-2">ナレッジ情報はまだありません</p>
                <p className="text-slate-400 text-sm">PDFやレポートが登録されると、ここに表示されます</p>
              </div>
            )}
          </DashboardCard>

          <DashboardCard
            title="ニュースアーカイブ"
            icon="📂"
            linkText="すべて見る"
            linkHref="/archive"
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  過去30日間のトピックと地域ニュースを統合表示
                </p>
                {topics.slice(0, 3).map((topic, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <h4 className="font-medium text-slate-900 text-sm line-clamp-1 mb-1">
                      {topic.headline}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {format(new Date(topic.published_at), 'MM/dd HH:mm', { locale: ja })} - {topic.source_name}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/archive"
                className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Archive className="w-4 h-4" />
                アーカイブを見る
              </Link>
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[9999]">
        <div className="relative flex flex-col gap-3">
          {canAccessAdminPanel && (
            <Link
              href="/admin"
              className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
              title="管理者画面"
            >
              <Shield className="w-6 h-6" />
            </Link>
          )}
          
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
            title="設定"
          >
            <Settings className="w-6 h-6" />
          </button>
          
          {isSettingsOpen && (
            <>
              <div 
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsSettingsOpen(false)}
              />
              <div className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-[9999]">
                <div className="px-4 py-2 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">管理メニュー</h3>
                </div>
                <div className="py-2">
                  {settingsMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors duration-200 group"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                      <span className="text-sm font-medium group-hover:text-blue-600 transition-colors duration-200">{item.name}</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedSubsidy && (
        <SubsidyDetailModal
          subsidy={selectedSubsidy}
          isOpen={isSubsidyModalOpen}
          onClose={() => {
            setIsSubsidyModalOpen(false)
            setSelectedSubsidy(null)
          }}
        />
      )}

      {selectedNews && (
        <LocalNewsDetailModal
          news={selectedNews}
          isOpen={isNewsModalOpen}
          onClose={() => {
            setIsNewsModalOpen(false)
            setSelectedNews(null)
          }}
        />
      )}
    </div>
  )
}

function getFileTypeBackground(fileName: string | null): string {
  if (!fileName) return 'from-slate-500 to-slate-600'
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf': return 'from-blue-500 to-indigo-600'
    case 'doc':
    case 'docx': return 'from-green-500 to-teal-600'
    case 'xls':
    case 'xlsx': return 'from-blue-500 to-indigo-600'
    case 'ppt':
    case 'pptx': return 'from-purple-500 to-pink-600'
    default: return 'from-slate-500 to-slate-600'
  }
}

function getFileTypeIcon(fileName: string | null): string {
  if (!fileName) return '📄'
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf': return '📄'
    case 'doc':
    case 'docx': return '📑'
    case 'xls':
    case 'xlsx': return '📊'
    case 'ppt':
    case 'pptx': return '📽️'
    default: return '📄'
  }
}

function getNewsCategoryIcon(category: string): string {
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
  return categoryIcons[category] || '📰'
}

function getNewsCategoryColor(category: string): string {
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
  return categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
}