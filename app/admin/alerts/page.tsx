'use client'

import { useState, useEffect } from 'react'
import { Alert } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { AlertTriangle, AlertCircle, Info, ExternalLink, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function AlertsAdminPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'high' | 'info'>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | '警察庁' | '消費者庁'>('all')

  useEffect(() => {
    fetchAlerts()
  }, [filter, sourceFilter])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('alerts')
        .select('*')
        .order('published_at', { ascending: false })

      // Apply filters
      if (filter !== 'all') {
        if (filter === 'unread') {
          query = query.eq('is_read', false)
        } else {
          query = query.eq('severity', filter)
        }
      }

      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
      setError('データの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertId: string, isRead: boolean) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: isRead })
        .eq('id', alertId)

      if (error) throw error

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: isRead } : alert
      ))
    } catch (error) {
      console.error('Error updating alert:', error)
    }
  }

  const deleteAlert = async (alertId: string) => {
    if (!confirm('このアラートを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId)

      if (error) throw error

      // Update local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryLabel = (category: Alert['category']) => {
    switch (category) {
      case 'phishing':
        return 'フィッシング'
      case 'scam':
        return '詐欺・悪質商法'
      case 'recall':
        return 'リコール'
      case 'gov_notice':
        return '政府通知'
      default:
        return 'その他'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread' && alert.is_read) return false
    if (filter !== 'all' && filter !== 'unread' && alert.severity !== filter) return false
    if (sourceFilter !== 'all' && alert.source !== sourceFilter) return false
    return true
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Alerts 管理</h1>
              <p className="text-slate-600 mt-2">警察庁・消費者庁からの注意喚起情報の管理</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAlerts}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                更新
              </button>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                管理メニューに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">重要度</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'critical' | 'high' | 'info')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="unread">未読</option>
                <option value="critical">緊急</option>
                <option value="high">高</option>
                <option value="info">通常</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">発信元</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as 'all' | '警察庁' | '消費者庁')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="警察庁">警察庁</option>
                <option value="消費者庁">消費者庁</option>
              </select>
            </div>
            <div className="ml-auto">
              <span className="text-sm text-gray-500">
                表示中: {filteredAlerts.length}件 / 全{alerts.length}件
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-red-600 mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">エラーが発生しました</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              再試行
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                  alert.is_read ? 'border-gray-200' : 'border-orange-200'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(alert.severity)}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {getCategoryLabel(alert.category)}
                      </span>
                      <span className="text-sm text-gray-500">{alert.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markAsRead(alert.id, !alert.is_read)}
                        className={`p-2 rounded-lg transition-colors ${
                          alert.is_read 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={alert.is_read ? '未読にする' : '既読にする'}
                      >
                        {alert.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-lg mb-3">
                    {alert.title_ja || alert.title_original}
                  </h3>

                  {/* Summary */}
                  {alert.summary_ja && (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {alert.summary_ja}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                    <div>
                      <span className="text-sm text-gray-500">発行日時:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(alert.published_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">重要度:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {alert.severity === 'critical' ? '緊急' : alert.severity === 'high' ? '高' : '通常'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">カテゴリ:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {getCategoryLabel(alert.category)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <a
                      href={alert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      公式サイトで確認
                    </a>
                    <div className="text-sm text-gray-500">
                      {alert.is_read ? '既読' : '未読'} | 
                      ID: {alert.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">アラートが見つかりません</h3>
                <p className="text-gray-500">フィルター条件を変更するか、新しいアラートを追加してください。</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
