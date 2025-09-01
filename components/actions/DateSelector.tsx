'use client'

import { useState } from 'react'
import { format, addDays, subDays, startOfDay, isToday, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onSearch: (date: Date) => void
}

export default function DateSelector({ selectedDate, onDateChange, onSearch }: DateSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1)
    onDateChange(newDate)
    onSearch(newDate)
  }

  const handleNextDay = () => {
    const newDate = addDays(selectedDate, 1)
    onDateChange(newDate)
    onSearch(newDate)
  }

  const handleToday = () => {
    const today = new Date()
    onDateChange(today)
    onSearch(today)
  }

  const handleDateClick = (date: Date) => {
    onDateChange(date)
    onSearch(date)
    setIsCalendarOpen(false)
  }

  const generateCalendarDays = () => {
    const start = startOfDay(selectedDate)
    const days = []
    
    // 前月の日付（表示用）
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1)
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // 6週間分の日付を生成
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          日付選択
        </h2>
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {isCalendarOpen ? '閉じる' : 'カレンダー'}
        </button>
      </div>

      {/* 日付ナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousDay}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {format(selectedDate, 'yyyy年M月d日', { locale: ja })}
          </div>
          <div className="text-sm text-gray-600">
            {format(selectedDate, 'EEEE', { locale: ja })}
          </div>
        </div>
        
        <button
          onClick={handleNextDay}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 今日ボタン */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleToday}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isToday(selectedDate)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          今日
        </button>
      </div>

      {/* カレンダー */}
      {isCalendarOpen && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
              const isSelected = isSameDay(date, selectedDate)
              const isTodayDate = isToday(date)
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`p-2 text-sm rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isTodayDate
                      ? 'bg-blue-100 text-blue-700'
                      : isCurrentMonth
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {format(date, 'd')}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 検索ボタン */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => onSearch(selectedDate)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          この日のタスクを表示
        </button>
      </div>
    </div>
  )
}