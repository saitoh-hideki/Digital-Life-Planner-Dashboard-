'use client'

import { useState, useEffect } from 'react'
import { Alert } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { AlertTriangle, X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface AlertsButtonProps {
  className?: string
}

export default function AlertsButton({ className }: AlertsButtonProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

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

      console.log('Fetched alerts:', data) // デバッグ用
      setAlerts(data || [])
      setUnreadCount(data?.filter(alert => !alert.is_read).length || 0)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
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
                      className="p-3 border rounded-lg bg-white border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(alert.severity)}
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {getCategoryLabel(alert.category)}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-sm mb-2">
                        {alert.title_ja || alert.title_original}
                      </h3>
                      
                      {alert.summary_ja && (
                        <p className="text-gray-600 text-xs mb-2">
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
      )}
    </>
  )
}
