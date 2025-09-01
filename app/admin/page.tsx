'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  FileText, 
  Database, 
  AlertTriangle, 
  Calendar, 
  Archive, 
  Gift,
  TrendingUp,
  Users
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  topics: number
  localApps: number
  subsidies: number
  localNews: number
  events: number
  knowledge: number
  alerts: number
  meetings: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    topics: 0,
    localApps: 0,
    subsidies: 0,
    localNews: 0,
    events: 0,
    knowledge: 0,
    alerts: 0,
    meetings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [
        { count: topics },
        { count: localApps },
        { count: subsidies },
        { count: localNews },
        { count: events },
        { count: knowledge },
        { count: alerts },
        { count: meetings }
      ] = await Promise.all([
        supabase.from('topics').select('*', { count: 'exact', head: true }),
        supabase.from('local_apps').select('*', { count: 'exact', head: true }),
        supabase.from('subsidies_normalized').select('*', { count: 'exact', head: true }),
        supabase.from('local_news').select('*', { count: 'exact', head: true }),
        supabase.from('academic_circle_events').select('*', { count: 'exact', head: true }),
        supabase.from('local_media_knowledge').select('*', { count: 'exact', head: true }),
        supabase.from('alerts').select('*', { count: 'exact', head: true }),
        supabase.from('meetings').select('*', { count: 'exact', head: true })
      ])

      setStats({
        topics: topics || 0,
        localApps: localApps || 0,
        subsidies: subsidies || 0,
        localNews: localNews || 0,
        events: events || 0,
        knowledge: knowledge || 0,
        alerts: alerts || 0,
        meetings: meetings || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'トピック',
      value: stats.topics,
      icon: FileText,
      href: '/admin/topics',
      color: 'bg-blue-500'
    },
    {
      name: '地域アプリ',
      value: stats.localApps,
      icon: Database,
      href: '/admin/apps',
      color: 'bg-green-500'
    },
    {
      name: '補助金・助成金',
      value: stats.subsidies,
      icon: Gift,
      href: '/admin/subsidies',
      color: 'bg-purple-500'
    },
    {
      name: '地域ニュース',
      value: stats.localNews,
      icon: FileText,
      href: '/admin/news',
      color: 'bg-orange-500'
    },
    {
      name: 'イベント',
      value: stats.events,
      icon: Calendar,
      href: '/admin/events',
      color: 'bg-red-500'
    },
    {
      name: 'ナレッジ',
      value: stats.knowledge,
      icon: Archive,
      href: '/admin/knowledge',
      color: 'bg-indigo-500'
    },
    {
      name: 'アラート',
      value: stats.alerts,
      icon: AlertTriangle,
      href: '/admin/alerts',
      color: 'bg-yellow-500'
    },
    {
      name: '会議',
      value: stats.meetings,
      icon: Users,
      href: '/admin/meetings',
      color: 'bg-pink-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">管理ダッシュボード</h1>
        <p className="text-slate-600">システム全体の状況を確認できます</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/subsidies"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Gift className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">補助金・助成金管理</div>
              <div className="text-sm text-blue-600">CSVインポート・ETL実行</div>
            </div>
          </Link>
          
          <Link
            href="/admin/topics"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileText className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-green-900">トピック管理</div>
              <div className="text-sm text-green-600">ニュース・トピックの管理</div>
            </div>
          </Link>
          
          <Link
            href="/admin/alerts"
            className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <div className="font-medium text-orange-900">アラート管理</div>
              <div className="text-sm text-orange-600">システムアラートの確認</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
