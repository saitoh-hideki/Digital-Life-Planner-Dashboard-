import { Tag, Calendar, MapPin, Building } from 'lucide-react'

interface InfoItemProps {
  title: string
  description?: string
  metadata?: string[]
  badge?: string
}

export default function InfoItem({ title, description, metadata, badge }: InfoItemProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all duration-200">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 line-clamp-1 text-sm leading-relaxed mb-2">
              {title}
            </h3>
            
            {description && (
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
                {description}
              </p>
            )}
            
            {metadata && metadata.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                {metadata.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {index === 0 && item.includes('締切') && <Calendar className="w-3 h-3" />}
                    {index === 0 && item.includes('プラットフォーム') && <Building className="w-3 h-3" />}
                    {index === 0 && item.includes('都道府県') && <MapPin className="w-3 h-3" />}
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {badge && (
            <span className="badge-secondary">
              <Tag className="w-3 h-3 mr-1" />
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}