import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Topic } from '@/lib/types'

interface TopicItemProps {
  topic: Topic
}

export default function TopicItem({ topic }: TopicItemProps) {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
            {topic.headline}
          </h3>
          {topic.ai_summary && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-1">
              {topic.ai_summary}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {topic.source_name && (
              <span className="font-medium">{topic.source_name}</span>
            )}
            <time>
              {format(new Date(topic.published_at), 'HH:mm', { locale: ja })}
            </time>
          </div>
        </div>
        {topic.ai_summary && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shrink-0">
            AI要約
          </span>
        )}
      </div>
    </div>
  )
}