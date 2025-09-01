'use client'

import { SubsidyNormalized } from '@/lib/types'
import { Calendar, Building2, MapPin, ExternalLink, Users, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface SubsidyCardProps {
  subsidy: SubsidyNormalized
  onClick: () => void
}

export default function SubsidyCard({ subsidy, onClick }: SubsidyCardProps) {
  // Status badge configuration
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return {
          text: '公募中',
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'coming_soon':
        return {
          text: '公募予定',
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        }
      case 'closed':
        return {
          text: '終了',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
      default:
        return {
          text: '不明',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
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

  // Format amount display
  const formatAmount = (min?: number, max?: number, text?: string) => {
    if (min && max) {
      if (min === max) {
        return `${(min / 10000).toLocaleString()}万円`
      }
      return `${(min / 10000).toLocaleString()}万円 ～ ${(max / 10000).toLocaleString()}万円`
    } else if (min) {
      return `${(min / 10000).toLocaleString()}万円以上`
    } else if (max) {
      return `最大${(max / 10000).toLocaleString()}万円`
    } else if (text) {
      return text
    }
    return '未定'
  }

  const statusBadge = getStatusBadge(subsidy.status)
  const daysUntilDeadline = subsidy.apply_end ? getDaysUntilDeadline(subsidy.apply_end) : null

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Header with status badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-green-600 transition-colors duration-200 line-clamp-2 mb-2">
            {subsidy.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {subsidy.prefecture && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{subsidy.prefecture}</span>
                {subsidy.municipality && (
                  <span className="text-slate-400">・{subsidy.municipality}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className={`px-2 py-1 text-xs font-medium rounded-lg border ${statusBadge.className} flex-shrink-0 ml-3`}>
          {statusBadge.text}
        </div>
      </div>

      {/* Summary */}
      {subsidy.summary && (
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {subsidy.summary}
        </p>
      )}

      {/* Metadata */}
      <div className="space-y-3 mb-4">
        {/* Issuer */}
        {subsidy.issuer && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{subsidy.issuer}</span>
          </div>
        )}

        {/* Audience */}
        {subsidy.audience && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{subsidy.audience}</span>
          </div>
        )}

        {/* Amount */}
        {(subsidy.amount_min || subsidy.amount_max || subsidy.amount_text) && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {formatAmount(subsidy.amount_min, subsidy.amount_max, subsidy.amount_text)}
            </span>
          </div>
        )}

        {/* Application period */}
        {(subsidy.apply_start || subsidy.apply_end) && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {subsidy.apply_start && subsidy.apply_end ? (
                <span>
                  {format(new Date(subsidy.apply_start), 'yyyy/MM/dd', { locale: ja })}
                  {' ～ '}
                  <span className={daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0 ? 'text-orange-600 font-medium' : ''}>
                    {format(new Date(subsidy.apply_end), 'yyyy/MM/dd', { locale: ja })}
                  </span>
                </span>
              ) : subsidy.apply_end ? (
                <span>
                  締切: 
                  <span className={daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0 ? 'text-orange-600 font-medium ml-1' : 'ml-1'}>
                    {format(new Date(subsidy.apply_end), 'yyyy/MM/dd', { locale: ja })}
                  </span>
                </span>
              ) : subsidy.apply_start ? (
                <span>開始: {format(new Date(subsidy.apply_start), 'yyyy/MM/dd', { locale: ja })}</span>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Deadline warning */}
      {daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-orange-800">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {daysUntilDeadline === 0 ? '本日締切' : `締切まで${daysUntilDeadline}日`}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-400">
          {subsidy.created_at && (
            <span>
              登録日: {format(new Date(subsidy.created_at), 'yyyy/MM/dd', { locale: ja })}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-green-600 group-hover:text-green-700 font-medium">
            <span>詳細を見る</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  )
}