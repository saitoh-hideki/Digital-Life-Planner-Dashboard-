interface InfoItemProps {
  title: string
  description?: string
  metadata?: string[]
  badge?: string
}

export default function InfoItem({ title, description, metadata, badge }: InfoItemProps) {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-1">
              {description}
            </p>
          )}
          {metadata && metadata.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
              {metadata.map((item, index) => (
                <span key={index}>{item}</span>
              ))}
            </div>
          )}
        </div>
        {badge && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 shrink-0">
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}