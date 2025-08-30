'use client'

import { useState } from 'react'
import { Alert } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { X, ExternalLink, AlertTriangle, AlertCircle, Info, Calendar, User, FileText, Share2, Mail, Download } from 'lucide-react'

interface AlertDetailModalProps {
  alert: Alert | null
  isOpen: boolean
  onClose: () => void
}

export default function AlertDetailModal({ alert, isOpen, onClose }: AlertDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!alert || !isOpen) return null

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'high':
        return <AlertCircle className="w-6 h-6 text-orange-500" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />
      default:
        return <Info className="w-6 h-6 text-gray-500" />
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

  const handleTaskCreation = async () => {
    setIsLoading(true)
    try {
      // TODO: タスク作成の実装
      console.log('Creating task for alert:', alert.id)
      // ここでタスク作成APIを呼び出す
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: alert.title_ja || alert.title_original,
          text: alert.summary_ja || alert.summary_original || '',
          url: alert.url
        })
      } else {
        // Fallback: copy to clipboard
        const text = `${alert.title_ja || alert.title_original}\n\n${alert.summary_ja || alert.summary_original || ''}\n\n詳細: ${alert.url}`
        await navigator.clipboard.writeText(text)
        alert('情報をクリップボードにコピーしました')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleEmailDraft = () => {
    const subject = encodeURIComponent(`[注意喚起] ${alert.title_ja || alert.title_original}`)
    const body = encodeURIComponent(
      `以下の注意喚起情報をお知らせします。\n\n` +
      `【タイトル】\n${alert.title_ja || alert.title_original}\n\n` +
      `【概要】\n${alert.summary_ja || alert.summary_original || ''}\n\n` +
      `【詳細】\n${alert.url}\n\n` +
      `【発信元】${alert.source}\n` +
      `【発行日時】${format(new Date(alert.published_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}\n\n` +
      `ご確認いただき、必要に応じて対応をお願いします。`
    )
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handlePDFExport = () => {
    // TODO: PDF出力の実装
    console.log('Exporting to PDF:', alert.id)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                {getSeverityIcon(alert.severity)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">注意喚起詳細</h2>
                <p className="text-sm text-gray-500">警察庁・消費者庁からの情報</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Severity and Category */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(alert.severity)}`}>
                  {getCategoryLabel(alert.category)}
                </span>
                <span className="text-sm text-gray-500">重要度: {alert.severity}</span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {alert.title_ja || alert.title_original}
                </h3>
                {alert.title_ja && alert.title_ja !== alert.title_original && (
                  <p className="text-sm text-gray-600 italic">
                    原文: {alert.title_original}
                  </p>
                )}
              </div>

              {/* Summary */}
              {alert.summary_ja && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">概要</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {alert.summary_ja}
                  </p>
                  {alert.summary_ja !== alert.summary_original && alert.summary_original && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 italic">
                        原文: {alert.summary_original}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">発信元:</span>
                  <span className="text-sm font-medium text-gray-900">{alert.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">発行日時:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {format(new Date(alert.published_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">カテゴリ:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getCategoryLabel(alert.category)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">重要度:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {alert.severity === 'critical' ? '緊急' : alert.severity === 'high' ? '高' : '通常'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">アクション</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={handleTaskCreation}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {isLoading ? '処理中...' : 'タスク化'}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    共有
                  </button>
                  
                  <button
                    onClick={handleEmailDraft}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    メール下書き
                  </button>
                  
                  <button
                    onClick={handlePDFExport}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    PDF出力
                  </button>
                </div>
              </div>

              {/* External Link */}
              <div className="text-center">
                <a
                  href={alert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  公式サイトで詳細を確認
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
