import { Tag, Calendar, MapPin, Building } from 'lucide-react'
import { ReactNode } from 'react'

interface InfoItemProps {
  title: string
  description?: string | ReactNode
  metadata?: string[]
  badge?: string
  badgeColor?: string
}

export default function InfoItem({ title, description, metadata, badge, badgeColor = 'blue' }: InfoItemProps) {
  const getBadgeClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'gray':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'blue':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 line-clamp-1 text-sm leading-relaxed mb-2">
              {title}
            </h3>
            
            {description && (
              <div className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
                {typeof description === 'string' ? (
                  <p>{description}</p>
                ) : (
                  description
                )}
              </div>
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
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getBadgeClasses(badgeColor)}`}>
              <Tag className="w-3 h-3 mr-1" />
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}