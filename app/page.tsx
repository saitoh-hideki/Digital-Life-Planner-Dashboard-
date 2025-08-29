'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Topic, LocalApp, Subsidy, LocalNews, AcademicCircleEvent, LocalMediaKnowledge } from '@/lib/types'
import DashboardCard from '@/components/dashboard/DashboardCard'
import TopicItem from '@/components/dashboard/TopicItem'
import InfoItem from '@/components/dashboard/InfoItem'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Search, MapPin, Globe } from 'lucide-react'

export default function DashboardPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [localApps, setLocalApps] = useState<LocalApp[]>([])
  const [subsidies, setSubsidies] = useState<Subsidy[]>([])
  const [localNews, setLocalNews] = useState<LocalNews[]>([])
  const [events, setEvents] = useState<AcademicCircleEvent[]>([])
  const [knowledge, setKnowledge] = useState<LocalMediaKnowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      
      // 本日のトピック
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('is_today', true)
        .order('published_at', { ascending: false })
        .limit(3)
      
      if (topicsError) throw topicsError
      
      // 補助金・助成金
      const { data: subsidiesData, error: subsidiesError } = await supabase
        .from('subsidies')
        .select('*')
        .gte('apply_end', new Date().toISOString())
        .order('apply_end', { ascending: true })
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
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3)
      
      if (newsError) throw newsError
      
      // アカデミックサークルイベント
      const { data: eventsData, error: eventsError } = await supabase
        .from('academic_circle_events')
        .select('*')
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(3)
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Digital Life Planner
              </h1>
              <p className="text-lg text-blue-600 font-medium">
                地域の情報をAIが整理・要約してお届け
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-700">東京都</span>
              </div>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1段目：本日のトピック（フル幅） */}
          <DashboardCard
            title="本日のトピック"
            icon="📰"
            linkText="すべて見る"
            linkHref="/archive"
            fullWidth
          >
            {topics.length > 0 ? (
              topics.map((topic) => (
                <TopicItem key={topic.id} topic={topic} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 text-slate-300">
                  <Globe className="w-full h-full" />
                </div>
                <p className="text-slate-500 text-sm">本日のトピックはまだありません</p>
              </div>
            )}
          </DashboardCard>

          {/* 2段目：3カラム */}
          <DashboardCard
            title="補助金・助成金"
            icon="💰"
            linkText="検索へ"
            linkHref="/search/subsidies"
          >
            {subsidies.length > 0 ? (
              subsidies.map((subsidy) => (
                <InfoItem
                  key={subsidy.id}
                  title={subsidy.name}
                  description={subsidy.summary}
                  metadata={[
                    subsidy.audience || '',
                    subsidy.apply_end ? `締切: ${format(new Date(subsidy.apply_end), 'MM/dd')}` : ''
                  ].filter(Boolean)}
                  badge={subsidy.status}
                />
              ))
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 text-slate-300">
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
              localApps.map((app) => (
                <InfoItem
                  key={app.id}
                  title={app.name}
                  description={app.summary}
                  metadata={[
                    app.platform || '',
                    app.provider || ''
                  ].filter(Boolean)}
                />
              ))
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 text-slate-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">地域アプリ情報はまだありません</p>
              </div>
            )}
          </DashboardCard>

          <DashboardCard
            title="地域ニュース"
            icon="📝"
            linkText="検索へ"
            linkHref="/search/news"
          >
            {localNews.length > 0 ? (
              localNews.map((news) => (
                <InfoItem
                  key={news.id}
                  title={news.name}
                  description={news.summary}
                  metadata={[
                    news.source_name || '',
                    news.prefecture
                  ].filter(Boolean)}
                  badge={news.tags?.[0]}
                />
              ))
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 text-slate-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">地域ニュースはまだありません</p>
              </div>
            )}
          </DashboardCard>

          {/* 3段目：3カラム */}
          <DashboardCard
            title="アカデミックサークル"
            icon="🎓"
            linkText="すべて見る"
            linkHref="/events"
          >
            {events.length > 0 ? (
              events.map((event) => (
                <InfoItem
                  key={event.id}
                  title={event.title}
                  description={event.venue}
                  metadata={[
                    format(new Date(event.start_at), 'MM/dd HH:mm', { locale: ja })
                  ]}
                />
              ))
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 text-slate-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">イベント情報はまだありません</p>
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
              knowledge.map((item) => (
                <InfoItem
                  key={item.id}
                  title={item.file_name || `ファイル ${item.id}`}
                  description={item.url && item.url !== 'EMPTY' ? item.url : 'ファイルがアップロードされていません'}
                  metadata={[
                    item.created_at ? format(new Date(item.created_at), 'yyyy/MM/dd') : ''
                  ].filter(Boolean)}
                />
              ))
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 text-slate-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">ナレッジ情報はまだありません</p>
              </div>
            )}
          </DashboardCard>

          <DashboardCard
            title="ニュースアーカイブ"
            icon="📂"
            linkText="すべて見る"
            linkHref="/archive"
          >
            <div className="space-y-4">
              <p className="text-slate-600 text-sm leading-relaxed">
                過去30日間のトピックと地域ニュースを統合表示
              </p>
              <a
                href="/archive"
                className="btn-outline w-full justify-center"
              >
                アーカイブを見る
              </a>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
