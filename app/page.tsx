'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Topic, LocalApp, Subsidy, LocalNews, AcademicCircleEvent, LocalMediaKnowledge } from '@/lib/types'
import DashboardCard from '@/components/dashboard/DashboardCard'
import TopicCarousel from '@/components/dashboard/TopicCarousel'
import InfoItem from '@/components/dashboard/InfoItem'
import LocalNewsCard from '@/components/dashboard/LocalNewsCard'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, FileText, Archive, Settings, Shield } from 'lucide-react'
import Link from 'next/link'
import { canAccessAdmin } from '@/lib/auth'

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
  const [canAccessAdminPanel, setCanAccessAdminPanel] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      // 一時的に権限チェックを無効化して、すべてのユーザーが管理者画面にアクセス可能にする
      setCanAccessAdminPanel(true)
      // 本来の権限チェック（後で有効化）
      // const hasAccess = await canAccessAdmin()
      // setCanAccessAdminPanel(hasAccess)
    } catch (error) {
      console.error('Error checking admin access:', error)
      setCanAccessAdminPanel(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setError(null)
      
      // 本日のトピック
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('is_today', true)
        .order('published_at', { ascending: false })
        .limit(10)
      
      if (topicsError) throw topicsError
      
      // 補助金・助成金（subsidies_sheetテーブルから取得）
      const { data: subsidiesData, error: subsidiesError } = await supabase
        .from('subsidies_sheet')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (subsidiesError) throw subsidiesError
      
      // 地域アプリ - updated_onカラムが存在しない場合はidでソート
      const { data: appsData, error: appsError } = await supabase
        .from('local_apps')
        .select('*')
        .order('id', { ascending: false })
        .limit(3)
      
      if (appsError) throw appsError
      
      // 地域ニュース
      const { data: newsData, error: newsError } = await supabase
        .from('local_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (newsError) throw newsError
      
      // アカデミックサークルイベント
      const { data: eventsData, error: eventsError } = await supabase
        .from('academic_circle_events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5)
      
      if (eventsError) throw eventsError
      
      // 地域媒体ナレッジ
      const { data: knowledgeData, error: knowledgeError } = await supabase
        .from('local_media_knowledge')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (knowledgeError) throw knowledgeError
      
      setTopics(topicsData || [])
      setSubsidies(subsidiesData || [])
      setLocalApps(appsData || [])
      setLocalNews(newsData || [])
      setEvents(eventsData || [])
      setKnowledge(knowledgeData || [])
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
    { name: 'Alerts管理', href: '/admin/alerts', icon: '⚠️' },
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
            className="btn-primary"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページタイトルとアラートボタン */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Digital Life Planner
            </h1>
            <p className="text-slate-600">
              Your Hub for Learning, Planning, and Acting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1段目：本日のトピック（フル幅・カードスタイル） */}
          <div className="col-span-full">
            <DashboardCard
              title="本日のトピック"
              icon="📰"
              linkText="すべて見る"
              linkHref="/archive"
              fullWidth
            >
              <TopicCarousel topics={topics} />
            </DashboardCard>
          </div>

          {/* 2段目：3カラム */}
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
                          {subsidy.url && (
                            <a
                              href={subsidy.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              詳細
                            </a>
                          )}
                        </div>
                      </div>
                      {subsidy.status && (
                        <span className={`px-3 py-2 rounded-lg text-xs font-semibold flex-shrink-0 ${
                          getSubsidyStatusColorFromStatus(subsidy.status) === 'green' ? 'bg-green-100 text-green-800' :
                          getSubsidyStatusColorFromStatus(subsidy.status) === 'orange' ? 'bg-orange-100 text-orange-800' :
                          getSubsidyStatusColorFromStatus(subsidy.status) === 'gray' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {subsidy.status}
                        </span>
                      )}
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

          <LocalNewsCard />

          {/* 3段目：3カラム */}
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
                <Link
                  href="/admin/events"
                  className="inline-flex items-center gap-2 px-4 py-2 mt-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  イベントを追加
                </Link>
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
                      {/* 左側：ファイル種別アイコン */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getFileTypeBackground(item.file_name || null)} rounded-full flex items-center justify-center text-white text-lg shadow-lg`}>
                          {getFileTypeIcon(item.file_name || null)}
                        </div>
                      </div>
                      
                      {/* 中央：ファイル情報 */}
                      <div className="flex-1 min-w-0">
                        {/* タイトル */}
                        <h4 className="font-semibold text-slate-900 text-sm mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                          {item.title || item.file_name || `ファイル ${item.id}`}
                        </h4>
                        
                        {/* 地域情報 */}
                        {item.region && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                              {item.region}
                            </span>
                          </div>
                        )}
                        
                        {/* 作成日 */}
                        {item.created_at && (
                          <div className="text-xs text-slate-500">
                            {format(new Date(item.created_at), 'yyyy/MM/dd')}
                          </div>
                        )}
                      </div>
                      
                      {/* 右側：操作ボタン */}
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

      {/* 設定ボタン（画面右下固定） */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <div className="relative flex flex-col gap-3">
          {/* 管理者画面への移動ボタン（権限がある場合のみ表示） */}
          {canAccessAdminPanel && (
            <Link
              href="/admin"
              className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
              title="管理者画面"
            >
              <Shield className="w-6 h-6" />
            </Link>
          )}
          
          {/* 設定ボタン */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
            title="設定"
          >
            <Settings className="w-6 h-6" />
          </button>
          
          {/* ドリルダウンメニュー */}
          {isSettingsOpen && (
            <>
              {/* オーバーレイ */}
              <div 
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsSettingsOpen(false)}
              />
              
              {/* メニュー */}
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
    </div>
  )
}

// ヘルパー関数
function getSubsidyStatusColorFromStatus(status: string): string {
  if (!status) return 'gray'
  
  const normalized = status.toLowerCase().trim()
  
  if (normalized.includes('募集中') || normalized.includes('受付中') || 
      normalized.includes('open') || normalized.includes('active')) {
    return 'green'
  }
  
  if (normalized.includes('募集終了') || normalized.includes('受付終了') || 
      normalized.includes('締切') || normalized.includes('closed') || 
      normalized.includes('終了')) {
    return 'gray'
  }
  
  if (normalized.includes('予定') || normalized.includes('準備中') || 
      normalized.includes('近日') || normalized.includes('coming') || 
      normalized.includes('soon')) {
    return 'orange'
  }
  
  return 'blue' // デフォルト
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
