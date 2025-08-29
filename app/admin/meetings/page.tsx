'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Handshake, Plus, Edit, Trash2, Save, X, Calendar, MapPin, Users } from 'lucide-react'

interface MeetingFormData {
  title: string
  description: string
  venue: string
  start_at: string
  end_at: string
  participants: string
  status: string
}

export default function MeetingsAdminPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    venue: '',
    start_at: '',
    end_at: '',
    participants: '',
    status: 'scheduled'
  })

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      setError(null)
      // 仮のデータを表示（実際のテーブルが存在しない場合）
      const mockMeetings = [
        {
          id: 1,
          title: '地域活性化会議',
          description: '地域の活性化について話し合う会議',
          venue: '横浜市役所',
          start_at: '2025-01-15T10:00',
          end_at: '2025-01-15T12:00',
          participants: '地域代表者、行政担当者',
          status: 'scheduled',
          created_at: new Date().toISOString()
        }
      ]
      setMeetings(mockMeetings)
    } catch (error) {
      console.error('Error fetching meetings:', error)
      setError('データの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setError(null)
      
      if (isEditing) {
        // 更新（仮の実装）
        const updatedMeetings = meetings.map(meeting => 
          meeting.id === isEditing 
            ? { ...meeting, ...formData, updated_at: new Date().toISOString() }
            : meeting
        )
        setMeetings(updatedMeetings)
      } else {
        // 新規作成（仮の実装）
        const newMeeting = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString()
        }
        setMeetings([newMeeting, ...meetings])
      }

      // フォームをリセット
      setFormData({ title: '', description: '', venue: '', start_at: '', end_at: '', participants: '', status: 'scheduled' })
      setIsEditing(null)
    } catch (error) {
      console.error('Error saving meeting:', error)
      setError('データの保存中にエラーが発生しました')
    }
  }

  const handleEdit = (item: any) => {
    setIsEditing(item.id)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      venue: item.venue || '',
      start_at: item.start_at ? new Date(item.start_at).toISOString().slice(0, 16) : '',
      end_at: item.end_at ? new Date(item.end_at).toISOString().slice(0, 16) : '',
      participants: item.participants || '',
      status: item.status || 'scheduled'
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このミーティングを削除しますか？')) return

    try {
      setError(null)
      // 仮の実装
      setMeetings(meetings.filter(meeting => meeting.id !== id))
    } catch (error) {
      console.error('Error deleting meeting:', error)
      setError('データの削除中にエラーが発生しました')
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setFormData({ title: '', description: '', venue: '', start_at: '', end_at: '', participants: '', status: 'scheduled' })
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'scheduled':
        return { text: '予定', color: 'bg-blue-100 text-blue-800' }
      case 'in_progress':
        return { text: '進行中', color: 'bg-green-100 text-green-800' }
      case 'completed':
        return { text: '完了', color: 'bg-gray-100 text-gray-800' }
      case 'cancelled':
        return { text: 'キャンセル', color: 'bg-red-100 text-red-800' }
      default:
        return { text: '未設定', color: 'bg-slate-100 text-slate-800' }
    }
  }

  const getMeetingStatus = (startAt: string | null, endAt: string | null) => {
    if (!startAt) return { text: '未設定', color: 'bg-gray-100 text-gray-800' }
    
    const now = new Date()
    const start = new Date(startAt)
    const end = endAt ? new Date(endAt) : null
    
    if (end && now > end) return { text: '終了', color: 'bg-gray-100 text-gray-800' }
    if (now >= start) return { text: '開催中', color: 'bg-green-100 text-green-800' }
    if (start.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) return { text: '明日開催', color: 'bg-orange-100 text-orange-800' }
    return { text: '予定', color: 'bg-blue-100 text-blue-800' }
  }

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return '-'
    return new Date(dateTime).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-500">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meeting管理</h1>
          <p className="text-slate-600 mt-2">会議やミーティングの情報を管理します</p>
        </div>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Handshake className="w-5 h-5" />
          {isEditing ? 'ミーティング情報を編集' : '新しいミーティングを追加'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ミーティングタイトル *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: 地域活性化会議"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="ミーティングの目的や議題"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                会場 *
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="例: 横浜市役所会議室"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ステータス
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scheduled">予定</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                開始日時 *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start_at}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                終了日時
              </label>
              <input
                type="datetime-local"
                value={formData.end_at}
                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              参加者
            </label>
            <input
              type="text"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              placeholder="例: 地域代表者、行政担当者、企業関係者"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  更新
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  追加
                </>
              )}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-300 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                キャンセル
              </button>
            )}
          </div>
        </form>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* ミーティング一覧 */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">ミーティング一覧</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  説明
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  会場
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  開催日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  参加者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {meetings.map((item) => {
                const statusBadge = getStatusBadge(item.status)
                const meetingStatus = getMeetingStatus(item.start_at, item.end_at)
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {item.title || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                      <div className="truncate" title={item.description}>
                        {item.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {item.venue || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>開始: {formatDateTime(item.start_at)}</span>
                        </div>
                        {item.end_at && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <span>終了: {formatDateTime(item.end_at)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="truncate max-w-32" title={item.participants}>
                          {item.participants || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                        <br />
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meetingStatus.color}`}>
                          {meetingStatus.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="編集"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {meetings.length === 0 && (
          <div className="text-center py-12">
            <Handshake className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">ミーティング情報はまだありません</p>
            <p className="text-slate-400 text-sm mt-2">新しいミーティングを追加してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
