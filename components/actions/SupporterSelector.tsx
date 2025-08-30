'use client'

import { useState, useEffect } from 'react'
import { Settings, Heart, Star } from 'lucide-react'

interface Supporter {
  id: string
  name: string
  avatar: string
  messages: string[]
  color: string
  customName: string
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
  const [selectedSupporter, setSelectedSupporter] = useState<Supporter | null>(currentSupporter)
  const [customNames, setCustomNames] = useState<Record<string, string>>({})

  const supporters: Supporter[] = [
    {
      id: 'family',
      name: '家族',
      avatar: '👨‍👩‍👧‍👦',
      color: '#FF6B9D',
      customName: '',
      messages: [
        "今日の仕事ぶりは成長を感じるな！確実にステップアップしてるぞ！",
        "ミーティングよく頑張ったな！リーダーシップが光ってたぞ！",
        "この成果は素晴らしい！君の努力が実を結んでる！",
        "毎日着実に成長してるな！家族の誇りだぞ！",
        "今日のタスク完了は完璧だ！君の集中力がすごい！",
        "この仕事ぶりを見てると、君の成長が手に取るように分かる！",
        "ミーティングでの発言、とても良かった！自信を持って話してた！",
        "今日も頑張ったな！君の粘り強さが光ってる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！君の成長は止まらない！",
        "今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！君の努力は必ず報われる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！君の成長は止まらない！",
        "今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！君の努力は必ず報われる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！"
      ]
    },
    {
      id: 'friend',
      name: '友達',
      avatar: '👥',
      color: '#4ECDC4',
      customName: '',
      messages: [
        "今日の仕事ぶりは成長を感じるな！確実にステップアップしてるぞ！",
        "ミーティングよく頑張ったな！リーダーシップが光ってたぞ！",
        "この成果は素晴らしい！君の努力が実を結んでる！",
        "毎日着実に成長してるな！友達として誇りだぞ！",
        "今日のタスク完了は完璧だ！君の集中力がすごい！",
        "この仕事ぶりを見てると、君の成長が手に取るように分かる！",
        "ミーティングでの発言、とても良かった！自信を持って話してた！",
        "今日も頑張ったな！君の粘り強さが光ってる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！君の成長は止まらない！",
        "今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！君の努力は必ず報われる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！君の成長は止まらない！",
        "今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！君の努力は必ず報われる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！"
      ]
    },
    {
      id: 'mentor',
      name: 'メンター',
      avatar: '👨‍🏫',
      color: '#45B7D1',
      customName: '',
      messages: [
        "今日の仕事ぶりは成長を感じるな！確実にステップアップしてるぞ！",
        "ミーティングよく頑張ったな！リーダーシップが光ってたぞ！",
        "この成果は素晴らしい！君の努力が実を結んでる！",
        "毎日着実に成長してるな！メンターとして誇りだぞ！",
        "今日のタスク完了は完璧だ！君の集中力がすごい！",
        "この仕事ぶりを見てると、君の成長が手に取るように分かる！",
        "ミーティングでの発言、とても良かった！自信を持って話してた！",
        "今日も頑張ったな！君の粘り強さが光ってる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！君の成長は止まらない！",
        "今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！君の努力は必ず報われる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！君の成長は止まらない！",
        "今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！君の努力は必ず報われる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！"
      ]
    },
    {
      id: 'colleague',
      name: '同僚',
      avatar: '👔',
      color: '#96CEB4',
      customName: '',
      messages: [
        "今日の仕事ぶりは成長を感じるな！確実にステップアップしてるぞ！",
        "ミーティングよく頑張ったな！リーダーシップが光ってたぞ！",
        "この成果は素晴らしい！君の努力が実を結んでる！",
        "毎日着実に成長してるな！同僚として誇りだぞ！",
        "今日のタスク完了は完璧だ！君の集中力がすごい！",
        "この仕事ぶりを見てると、君の成長が手に取るように分かる！",
        "ミーティングでの発言、とても良かった！自信を持って話してた！",
        "今日も頑張ったな！君の粘り強さが光ってる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！君の成長は止まらない！",
        "今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！君の努力は必ず報われる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！君の成長は止まらない！",
        "今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！君の努力は必ず報われる！",
        "この成果は君の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！君の成長が目に見える！"
      ]
    },
    {
      id: 'pet',
      name: 'ペット',
      avatar: '🐕',
      color: '#FFEAA7',
      customName: '',
      messages: [
        "ワンワン！今日の仕事ぶりは成長を感じるな！確実にステップアップしてるぞ！",
        "ワンワン！ミーティングよく頑張ったな！リーダーシップが光ってたぞ！",
        "ワンワン！この成果は素晴らしい！君の努力が実を結んでる！",
        "ワンワン！毎日着実に成長してるな！ペットとして誇りだぞ！",
        "ワンワン！今日のタスク完了は完璧だ！君の集中力がすごい！",
        "ワンワン！この仕事ぶりを見てると、君の成長が手に取るように分かる！",
        "ワンワン！ミーティングでの発言、とても良かった！自信を持って話してた！",
        "ワンワン！今日も頑張ったな！君の粘り強さが光ってる！",
        "ワンワン！この成果は君の実力の証明だ！着実に成長してるぞ！",
        "ワンワン！毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "ワンワン！今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ワンワン！ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "ワンワン！このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "ワンワン！毎日着実に進歩してるな！君の成長は止まらない！",
        "ワンワン！今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "ワンワン！この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ワンワン！ミーティングでの意見、とても的確だった！成長を感じる！",
        "ワンワン！今日も頑張ったな！君の努力は必ず報われる！",
        "ワンワン！この成果は君の実力の証明だ！着実に成長してるぞ！",
        "ワンワン！毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "ワンワン！今日の仕事は素晴らしかった！君の成長が目に見える！",
        "ワンワン！ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "ワンワン！このタスク完了は完璧だ！君の集中力と実行力がすごい！",
        "ワンワン！毎日着実に進歩してるな！君の成長は止まらない！",
        "ワンワン！今日の成果は君の実力の証だ！確実にステップアップしてる！",
        "ワンワン！この仕事ぶりを見てると、君の将来が楽しみになる！",
        "ワンワン！ミーティングでの意見、とても的確だった！成長を感じる！",
        "ワンワン！今日も頑張ったな！君の努力は必ず報われる！",
        "ワンワン！この成果は君の実力の証明だ！着実に成長してるぞ！",
        "ワンワン！毎日の積み重ねが実を結んでる！君の努力は無駄になってない！",
        "ワンワン！今日の仕事は素晴らしかった！君の成長が目に見える！"
      ]
    },
    {
      id: 'self',
      name: '自分',
      avatar: '💪',
      color: '#DDA0DD',
      customName: '',
      messages: [
        "今日の仕事ぶりは成長を感じるな！確実にステップアップしてるぞ！",
        "ミーティングよく頑張ったな！リーダーシップが光ってたぞ！",
        "この成果は素晴らしい！自分の努力が実を結んでる！",
        "毎日着実に成長してるな！自分として誇りだぞ！",
        "今日のタスク完了は完璧だ！自分の集中力がすごい！",
        "この仕事ぶりを見てると、自分の成長が手に取るように分かる！",
        "ミーティングでの発言、とても良かった！自信を持って話してた！",
        "今日も頑張ったな！自分の粘り強さが光ってる！",
        "この成果は自分の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！自分の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！自分の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！自分の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！自分の成長は止まらない！",
        "今日の成果は自分の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、自分の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！自分の努力は必ず報われる！",
        "この成果は自分の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！自分の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！自分の成長が目に見える！",
        "ミーティングでの進行、とても上手だった！リーダーシップが光ってる！",
        "このタスク完了は完璧だ！自分の集中力と実行力がすごい！",
        "毎日着実に進歩してるな！自分の成長は止まらない！",
        "今日の成果は自分の実力の証だ！確実にステップアップしてる！",
        "この仕事ぶりを見てると、自分の将来が楽しみになる！",
        "ミーティングでの意見、とても的確だった！成長を感じる！",
        "今日も頑張ったな！自分の努力は必ず報われる！",
        "この成果は自分の実力の証明だ！着実に成長してるぞ！",
        "毎日の積み重ねが実を結んでる！自分の努力は無駄になってない！",
        "今日の仕事は素晴らしかった！自分の成長が目に見える！"
      ]
    }
  ]

  useEffect(() => {
    if (currentSupporter) {
      setSelectedSupporter(currentSupporter)
      // カスタム名も復元
      if (currentSupporter.customName) {
        setCustomNames(prev => ({
          ...prev,
          [currentSupporter.id]: currentSupporter.customName
        }))
      }
    }
  }, [currentSupporter])

  // カスタム名の変更ハンドラー
  const handleCustomNameChange = (supporterId: string, name: string) => {
    setCustomNames(prev => ({
      ...prev,
      [supporterId]: name
    }))
  }

  const handleSupporterSelect = (supporter: Supporter) => {
    const supporterWithCustomName = {
      ...supporter,
      customName: customNames[supporter.id] || ''
    }
    setSelectedSupporter(supporterWithCustomName)
    onSupporterChange(supporterWithCustomName)
  }

  const handleSave = () => {
    if (selectedSupporter) {
      const supporterWithCustomName = {
        ...selectedSupporter,
        customName: customNames[selectedSupporter.id] || ''
      }
      onSupporterChange(supporterWithCustomName)
      // ローカルストレージに保存
      localStorage.setItem('selectedSupporter', JSON.stringify(supporterWithCustomName))
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
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
          タスク完了時に表示される応援メッセージの送り手を選択し、その人の名前を入力してください。
          毎回ランダムに選ばれますが、お気に入りの応援者を設定できます。
        </p>

        {/* 応援者選択 */}
        <div className="space-y-3 mb-6">
          {supporters.map((supporter) => (
            <div
              key={supporter.id}
              className={`
                p-4 rounded-xl border-2 transition-all hover:shadow-md
                ${selectedSupporter?.id === supporter.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* 応援者選択部分 */}
              <div
                onClick={() => handleSupporterSelect(supporter)}
                className="flex items-center gap-3 cursor-pointer mb-3"
              >
                <div className="text-3xl">{supporter.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{supporter.name}</div>
                  <div className="text-sm text-gray-500">
                    {supporter.messages.length}個のメッセージ
                  </div>
                </div>
                {selectedSupporter?.id === supporter.id && (
                  <div className="text-blue-500">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                )}
              </div>
              
              {/* カスタム名入力フィールド */}
              {selectedSupporter?.id === supporter.id && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {supporter.name}の名前を入力
                  </label>
                  <input
                    type="text"
                    value={customNames[supporter.id] || ''}
                    onChange={(e) => handleCustomNameChange(supporter.id, e.target.value)}
                    placeholder={`例: 田中太郎、花子、パパ`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    空欄の場合は「{supporter.name}より」と表示されます
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* プレビュー */}
        {selectedSupporter && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              プレビュー
            </h3>
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{selectedSupporter.avatar}</span>
                <span className="text-sm text-gray-600">
                  {customNames[selectedSupporter.id] || selectedSupporter.name}より
                </span>
              </div>
              <p className="text-gray-700 text-sm">
                {selectedSupporter.messages[0]}
              </p>
            </div>
          </div>
        )}

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
            disabled={!selectedSupporter}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            保存
          </button>
        </div>

        {/* ヒント */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          💡 設定した応援者が優先的に選ばれやすくなります
        </div>
      </div>
    </div>
  )
}
