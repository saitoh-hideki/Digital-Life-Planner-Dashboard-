import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Topic } from '@/lib/types'
import { Sparkles, Clock, Building, ExternalLink } from 'lucide-react'

interface TopicItemProps {
  topic: Topic
}

export default function TopicItem({ topic }: TopicItemProps) {
  const isRecent = new Date(topic.published_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // 24時間以内

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <div className="space-y-4">
        {/* ヘッダー部分 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-relaxed group-hover:text-blue-600 transition-colors">
                {topic.headline}
              </h3>
              {isRecent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  NEW
                </span>
              )}
            </div>
            
            {/* AI要約 */}
            {topic.ai_summary && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI要約
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {topic.ai_summary}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* フッター部分 */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4">
            {topic.source_name && (
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3" />
                <span className="font-medium">{topic.source_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <time>
                {format(new Date(topic.published_at), 'HH:mm', { locale: ja })}
              </time>
            </div>
          </div>
          
          {/* 外部リンクアイコン */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  )
}