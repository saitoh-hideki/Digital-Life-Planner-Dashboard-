'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Topic, LocalApp, Subsidy, LocalNews, AcademicCircleEvent, LocalMediaKnowledge } from '@/lib/types'
import DashboardCard from '@/components/dashboard/DashboardCard'
import TopicItem from '@/components/dashboard/TopicItem'
import InfoItem from '@/components/dashboard/InfoItem'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

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
        .order('issued_on', { ascending: false })
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">エラーが発生しました</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <p className="text-gray-500 text-sm">本日のトピックはまだありません</p>
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
            <p className="text-gray-500 text-sm">補助金情報は準備中です</p>
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
            <p className="text-gray-500 text-sm">地域アプリ情報はまだありません</p>
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
            <p className="text-gray-500 text-sm">地域ニュースはまだありません</p>
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
            <p className="text-gray-500 text-sm">イベント情報はまだありません</p>
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
                title={item.title}
                description={item.description}
                metadata={[
                  item.media_type || '',
                  item.issued_on ? format(new Date(item.issued_on), 'yyyy/MM/dd') : ''
                ].filter(Boolean)}
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm">ナレッジ情報はまだありません</p>
          )}
        </DashboardCard>

        <DashboardCard
          title="ニュースアーカイブ"
          icon="📂"
          linkText="すべて見る"
          linkHref="/archive"
        >
          <p className="text-gray-600 text-sm">
            過去30日間のトピックと地域ニュースを統合表示
          </p>
          <a
            href="/archive"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            アーカイブを見る →
          </a>
        </DashboardCard>
      </div>
    </div>
  )
}
