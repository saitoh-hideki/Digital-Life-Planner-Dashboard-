'use client'

import { useState, useEffect } from 'react'
import { Alert } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { AlertTriangle, X, CheckCircle, AlertCircle, Info, ChevronRight } from 'lucide-react'
import AlertDetailModal from './AlertDetailModal'

interface AlertsButtonProps {
  className?: string
}

export default function AlertsButton({ className }: AlertsButtonProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setAlerts(data || [])
      setUnreadCount(data?.filter(alert => !alert.is_read).length || 0)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId)

      if (error) throw error

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert)
    setIsDetailModalOpen(true)
    setIsOpen(false)
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

  return (
    <>
      {/* Alerts Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${className}`}
      >
        <AlertTriangle className="w-4 h-4" />
        Alerts
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Simple Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Alerts</h2>
                    <p className="text-sm text-gray-600">警察庁・消費者庁からの注意喚起</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p>読み込み中...</p>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">現在、注意喚起はありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                          alert.is_read ? 'bg-gray-50' : 'bg-white border-orange-200'
                        }`}
                        onClick={() => handleAlertClick(alert)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(alert.severity)}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {getCategoryLabel(alert.category)}
                            </span>
                          </div>
                          {!alert.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(alert.id)
                              }}
                              className="text-gray-400 hover:text-green-600"
                              title="既読にする"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">
                          {alert.title_ja || alert.title_original}
                        </h3>
                        
                        {alert.summary_ja && (
                          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                            {alert.summary_ja}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{alert.source}</span>
                          <span>{format(new Date(alert.published_at), 'MM/dd HH:mm', { locale: ja })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    最新{alerts.length}件
                    {unreadCount > 0 && (
                      <span className="ml-2 text-orange-600">（未読{unreadCount}件）</span>
                    )}
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedAlert(null)
        }}
      />
    </>
  )
}
