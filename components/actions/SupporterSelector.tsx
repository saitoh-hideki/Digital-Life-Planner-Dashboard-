'use client'

import { useState, useEffect } from 'react'
import { Settings, Heart, User } from 'lucide-react'

interface Supporter {
  id: string
  name: string
  avatar: string
  customName: string
  color: string
}

interface SupporterSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSupporterChange: (supporter: Supporter) => void
  currentSupporter: Supporter | null
}

export default function SupporterSelector({ 
  isOpen, 
  onClose, 
  onSupporterChange, 
  currentSupporter 
}: SupporterSelectorProps) {
  const [customName, setCustomName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍👩‍👧‍👦')

  // アバターの選択肢
  const avatars = [
    '👨‍👩‍👧‍👦', '👥', '👨‍🏫', '👔', '🐕', '💪', '👨‍💼', '👩‍💼', 
    '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨'
  ]

  // デフォルトの応援者設定
  const defaultSupporter: Supporter = {
    id: 'supporter',
    name: '応援者',
    avatar: '👨‍👩‍👧‍👦',
    customName: '',
    color: '#FF6B9D'
  }

  useEffect(() => {
    if (currentSupporter) {
      setCustomName(currentSupporter.customName || '')
      setSelectedAvatar(currentSupporter.avatar)
    } else {
      setCustomName('')
      setSelectedAvatar('👨‍👩‍👧‍👦')
    }
  }, [currentSupporter])

  const handleSave = () => {
    const supporter: Supporter = {
      ...defaultSupporter,
      avatar: selectedAvatar,
      customName: customName.trim()
    }
    
    onSupporterChange(supporter)
    localStorage.setItem('selectedSupporter', JSON.stringify(supporter))
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            応援者設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 説明 */}
        <p className="text-gray-600 mb-6 text-sm">
          タスク完了時に表示される応援メッセージの送り手の設定を行います。
        </p>

        {/* アバター選択 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            アバターを選択
          </label>
          <div className="grid grid-cols-8 gap-2">
            {avatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => setSelectedAvatar(avatar)}
                className={`
                  text-2xl p-2 rounded-lg border-2 transition-all hover:scale-110
                  ${selectedAvatar === avatar 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
        
        {/* 名前入力 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            応援者の名前を入力
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="例: 田中太郎、花子、パパ"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            空欄の場合は「応援者より」と表示されます
          </p>
        </div>

        {/* プレビュー */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            プレビュー
          </h3>
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{selectedAvatar}</span>
              <span className="text-sm text-gray-600">
                {customName || '応援者'}より
              </span>
            </div>
            <p className="text-gray-700 text-sm">
              今日の仕事ぶりは成長を感じるな！確実にステップアップしてるぞ！
            </p>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
