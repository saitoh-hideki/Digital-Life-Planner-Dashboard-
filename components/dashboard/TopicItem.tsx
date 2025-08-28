import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Topic } from '@/lib/types'
import { Sparkles, Clock, Building } from 'lucide-react'

interface TopicItemProps {
  topic: Topic
}

export default function TopicItem({ topic }: TopicItemProps) {
  const isRecent = new Date(topic.published_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // 24時間以内

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all duration-200">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-relaxed">
                {topic.headline}
              </h3>
              {isRecent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  NEW
                </span>
              )}
            </div>
            
            {topic.ai_summary && (
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI要約
                </span>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {topic.ai_summary}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
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
        </div>
      </div>
    </div>
  )
}