'use client'

import { SubsidyNormalized } from '@/lib/types'
import { X, ExternalLink, Calendar, Building2, MapPin, Users, FileText, Info } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect } from 'react'

interface SubsidyDetailModalProps {
  subsidy: SubsidyNormalized
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
    switch (status) {
      case 'open':
        return {
          text: '公募中',
          className: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-600'
        }
      case 'coming_soon':
        return {
          text: '公募予定',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          iconColor: 'text-orange-600'
        }
      case 'closed':
        return {
          text: '終了',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600'
        }
      default:
        return {
          text: '不明',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600'
        }
    }
  }

  // Calculate days until deadline
  const getDaysUntilDeadline = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const statusBadge = getStatusBadge(subsidy.status)
  const daysUntilDeadline = subsidy.apply_end ? getDaysUntilDeadline(subsidy.apply_end) : null

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
            
            {/* Title and location */}
            <div className="pr-12">
              <h2 className="text-2xl font-bold mb-3 leading-tight">
                {subsidy.name}
              </h2>
              
              {(subsidy.prefecture || subsidy.municipality) && (
                <div className="flex items-center gap-2 text-green-100 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {subsidy.prefecture}
                    {subsidy.municipality && ` ${subsidy.municipality}`}
                  </span>
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
            {/* Deadline warning */}
            {daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-semibold text-orange-800">
                      {daysUntilDeadline === 0 ? '⚠️ 本日締切です！' : `⚠️ 締切まであと${daysUntilDeadline}日です`}
                    </div>
                    <div className="text-sm text-orange-700 mt-1">
                      お早めにご申請ください
                    </div>
                  </div>
                </div>
              </div>
            )}

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
              {/* Issuer */}
              {subsidy.issuer && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">発行者・担当部署</span>
                  </div>
                  <p className="text-slate-900 pl-6">{subsidy.issuer}</p>
                </div>
              )}

              {/* Audience */}
              {subsidy.audience && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">対象者</span>
                  </div>
                  <p className="text-slate-900 pl-6">{subsidy.audience}</p>
                </div>
              )}

              {/* Application Start Date */}
              {subsidy.apply_start && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">申請開始日</span>
                  </div>
                  <p className="text-slate-900 pl-6">
                    {format(new Date(subsidy.apply_start), 'yyyy年MM月dd日(E)', { locale: ja })}
                  </p>
                </div>
              )}

              {/* Application End Date */}
              {subsidy.apply_end && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">申請締切日</span>
                  </div>
                  <p className={`pl-6 ${
                    daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0 
                      ? 'text-orange-600 font-semibold' 
                      : 'text-slate-900'
                  }`}>
                    {format(new Date(subsidy.apply_end), 'yyyy年MM月dd日(E)', { locale: ja })}
                    {daysUntilDeadline !== null && daysUntilDeadline >= 0 && (
                      <span className="text-sm text-slate-500 ml-2">
                        ({daysUntilDeadline === 0 ? '本日締切' : `あと${daysUntilDeadline}日`})
                      </span>
                    )}
                  </p>
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