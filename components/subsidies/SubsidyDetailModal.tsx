'use client'

import { Subsidy } from '@/lib/types'
import { X, ExternalLink, Calendar, Building2, MapPin, Users, FileText, Info } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect } from 'react'

interface SubsidyDetailModalProps {
  subsidy: Subsidy
  isOpen: boolean
  onClose: () => void
}

export default function SubsidyDetailModal({ subsidy, isOpen, onClose }: SubsidyDetailModalProps) {
  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    if (!status) return {
      text: '不明',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      iconColor: 'text-gray-600'
    }

    const normalized = status.toLowerCase().trim()
    
    if (normalized.includes('募集中') || normalized.includes('受付中') || 
        normalized.includes('open') || normalized.includes('active')) {
      return {
        text: '公募中',
        className: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600'
      }
    }
    
    if (normalized.includes('募集終了') || normalized.includes('受付終了') || 
        normalized.includes('締切') || normalized.includes('closed') || 
        normalized.includes('終了')) {
      return {
        text: '終了',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        iconColor: 'text-gray-600'
      }
    }
    
    if (normalized.includes('予定') || normalized.includes('準備中') || 
        normalized.includes('近日') || normalized.includes('coming') || 
        normalized.includes('soon')) {
      return {
        text: '公募予定',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        iconColor: 'text-orange-600'
      }
    }
    
    return {
      text: status,
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-600'
    }
  }

  const statusBadge = getStatusBadge(subsidy.status)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-white">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Title and organization */}
            <div className="pr-12">
              <h2 className="text-2xl font-bold mb-3 leading-tight">
                {subsidy.name}
              </h2>
              
              {subsidy.organization && (
                <div className="flex items-center gap-2 text-green-100 mb-4">
                  <Building2 className="w-4 h-4" />
                  <span>{subsidy.organization}</span>
                </div>
              )}
              
              {/* Status badge */}
              <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${statusBadge.className} bg-white/90`}>
                {statusBadge.text}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Summary */}
            {subsidy.summary && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <h3 className="text-lg font-semibold text-slate-900">概要</h3>
                </div>
                <p className="text-slate-700 leading-relaxed pl-7">
                  {subsidy.summary}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization */}
              {subsidy.organization && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">発行者・担当部署</span>
                  </div>
                  <p className="text-slate-900 pl-6">{subsidy.organization}</p>
                </div>
              )}

              {/* Target Audience */}
              {subsidy.target_audience && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">対象者</span>
                  </div>
                  <p className="text-slate-900 pl-6">{subsidy.target_audience}</p>
                </div>
              )}

              {/* Purpose */}
              {subsidy.purpose && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">目的・用途</span>
                  </div>
                  <p className="text-slate-900 pl-6">{subsidy.purpose}</p>
                </div>
              )}

              {/* Amount */}
              {subsidy.amount && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">補助金額</span>
                  </div>
                  <p className="text-slate-900 pl-6">{subsidy.amount}</p>
                </div>
              )}

              {/* Period */}
              {subsidy.period && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">期間</span>
                  </div>
                  <p className="text-slate-900 pl-6">{subsidy.period}</p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            {subsidy.created_at && (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Info className="w-4 h-4" />
                  <span>
                    登録日: {format(new Date(subsidy.created_at), 'yyyy年MM月dd日', { locale: ja })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                詳細な申請方法は公式ページをご確認ください
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                >
                  閉じる
                </button>
                
                {subsidy.url && (
                  <a
                    href={subsidy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    公式ページを見る
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}