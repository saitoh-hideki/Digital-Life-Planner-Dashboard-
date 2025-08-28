'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Calendar, MapPin, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AcademicCircleEvent } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<AcademicCircleEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_circle_events')
        .select(`
          *,
          regions:region_id(code, name)
        `)
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(50)
      
      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          ダッシュボードに戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          アカデミックサークルイベント
        </h1>
        <p className="text-gray-600 mt-2">
          DLP関連の勉強会、セミナー、ワークショップ情報
        </p>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                
                {event.description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(event.start_at), 'yyyy/MM/dd (E) HH:mm', { locale: ja })}
                      {event.end_at && ` - ${format(new Date(event.end_at), 'HH:mm', { locale: ja })}`}
                    </span>
                  </div>
                  
                  {event.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                  )}
                  
                  {event.regions && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-medium">
                        {event.regions.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 shrink-0">
                {event.rsvp_url && (
                  <a
                    href={event.rsvp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    参加申込
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                
                <span className="text-xs text-gray-400 text-center">
                  {new Date(event.start_at) > new Date() ? '開催予定' : '開催済み'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          開催予定のイベントはありません
        </div>
      )}
    </div>
  )
}
