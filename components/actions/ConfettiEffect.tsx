'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Star, Trophy, Heart, Zap, Sparkles, Award, Crown } from 'lucide-react'

interface ConfettiEffectProps {
  isActive: boolean
  onComplete: () => void
  selectedSupporter?: Supporter | null
}

type ParticleType = 'confetti' | 'star' | 'trophy' | 'heart' | 'zap' | 'sparkles' | 'award' | 'crown' | 'firework' | 'lightning' | 'rainbow'
type PatternType = 'normal' | 'spiral' | 'explosion' | 'rain' | 'starfield'

interface Supporter {
  id: string
  name: string
  avatar: string
  messages: string[]
  color: string
  customName?: string
}

export default function ConfettiEffect({ isActive, onComplete, selectedSupporter }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    vx: number
    vy: number
    rotation: number
    rotationSpeed: number
    color: string
    type: ParticleType
    scale: number
    trail: Array<{x: number, y: number, opacity: number}>
    neon: boolean
  }>>([])
  
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [currentPattern, setCurrentPattern] = useState<PatternType>('normal')
  const [currentSupporter, setCurrentSupporter] = useState<Supporter | null>(null)
  const [showFlash, setShowFlash] = useState(false)

  // 応援者の定義（30個ずつのメッセージ）
  const supporters: Supporter[] = [
    {
      id: 'family',
      name: '家族',
      avatar: '👨‍👩‍👧‍👦',
      color: '#FF6B9D',
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
    }
  ]

  // パーティクル生成関数（500個、巨大パーティクル、特殊パーティクル含む）
  const generateParticles = (pattern: PatternType) => {
    const newParticles: Array<{
      id: number
      x: number
      y: number
      vx: number
      vy: number
      rotation: number
      rotationSpeed: number
      color: string
      type: ParticleType
      scale: number
      trail: Array<{x: number, y: number, opacity: number}>
      neon: boolean
    }> = []
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
      '#FF8E53', '#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#98D8C8', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
    ]

    switch (pattern) {
      case 'normal':
        // 通常パターン：500個のパーティクル
        for (let i = 0; i < 500; i++) {
          const isGiant = Math.random() < 0.1 // 10%の確率で巨大パーティクル
          const isSpecial = Math.random() < 0.15 // 15%の確率で特殊パーティクル
          const hasNeon = Math.random() < 0.2 // 20%の確率でネオン効果
          
          let randomType: ParticleType
          if (isSpecial) {
            randomType = Math.random() > 0.5 ? 'firework' : 'lightning'
          } else {
            randomType = Math.random() > 0.6 ? 
              (Math.random() > 0.7 ? 'star' : 'trophy') : 
              (Math.random() > 0.5 ? 'heart' : 
               Math.random() > 0.6 ? 'zap' : 
               Math.random() > 0.7 ? 'sparkles' : 
               Math.random() > 0.8 ? 'award' : 'crown')
          }
          
          newParticles.push({
            id: i,
            x: Math.random() * window.innerWidth,
            y: -20,
            vx: (Math.random() - 0.5) * 15,
            vy: Math.random() * 6 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: randomType,
            scale: isGiant ? Math.random() * 2 + 2 : Math.random() * 0.8 + 0.6,
            trail: [],
            neon: hasNeon
          })
        }
        break

      case 'explosion':
        // 爆発パターン：500個のパーティクル
        for (let i = 0; i < 500; i++) {
          const angle = (i / 500) * Math.PI * 2
          const speed = Math.random() * 20 + 15
          const isGiant = Math.random() < 0.15
          const hasNeon = Math.random() < 0.25
          
          let randomType: ParticleType
          if (Math.random() < 0.2) {
            randomType = 'firework'
          } else {
            randomType = Math.random() > 0.6 ? 'zap' : 'sparkles'
          }
          
          newParticles.push({
            id: i,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 30,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: randomType,
            scale: isGiant ? Math.random() * 2.5 + 2 : Math.random() * 1.2 + 0.8,
            trail: [],
            neon: hasNeon
          })
        }
        break

      default:
        // その他のパターンも同様に500個
        for (let i = 0; i < 500; i++) {
          const isGiant = Math.random() < 0.1
          const hasNeon = Math.random() < 0.2
          
          newParticles.push({
            id: i,
            x: Math.random() * window.innerWidth,
            y: -20,
            vx: (Math.random() - 0.5) * 12,
            vy: Math.random() * 4 + 3,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'star',
            scale: isGiant ? Math.random() * 2 + 1.5 : Math.random() * 0.6 + 0.8,
            trail: [],
            neon: hasNeon
          })
        }
    }
    
    return newParticles
  }

  useEffect(() => {
    if (!isActive) return

    // フラッシュ効果を表示
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 300)

    // 応援者とパターンを選択
    let chosenSupporter: Supporter
    if (selectedSupporter) {
      chosenSupporter = Math.random() < 0.7 ? selectedSupporter : supporters[Math.floor(Math.random() * supporters.length)]
    } else {
      chosenSupporter = supporters[Math.floor(Math.random() * supporters.length)]
    }
    
    const randomMessage = chosenSupporter.messages[Math.floor(Math.random() * chosenSupporter.messages.length)]
    const patterns: PatternType[] = ['normal', 'spiral', 'explosion', 'rain', 'starfield']
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]
    
    setCurrentSupporter(chosenSupporter)
    setCurrentMessage(randomMessage)
    setCurrentPattern(randomPattern)

    // 500個のパーティクルを生成
    const newParticles = generateParticles(randomPattern)
    setParticles(newParticles)

    // アニメーション時間を延長（6秒）
    const timer = setTimeout(() => {
      onComplete()
    }, 6000)

    return () => clearTimeout(timer)
  }, [isActive, onComplete, selectedSupporter])

  useEffect(() => {
    if (!isActive || particles.length === 0) return

    const animate = () => {
      setParticles(prev => 
        prev.map(particle => {
          // 軌跡を更新
          const newTrail = [...particle.trail, {x: particle.x, y: particle.y, opacity: 1}]
          if (newTrail.length > 10) newTrail.shift()
          
          // パーティクルの動きを更新
          let newVx = particle.vx
          let newVy = particle.vy
          
          // パターン別の特別な動き
          switch (currentPattern) {
            case 'explosion':
              newVx = particle.vx * 0.95
              newVy = particle.vy * 0.95
              break
            case 'rain':
              newVy = particle.vy + 0.3
              break
          }
          
          return {
            ...particle,
            x: particle.x + newVx,
            y: particle.y + newVy,
            rotation: particle.rotation + particle.rotationSpeed,
            vx: newVx,
            vy: newVy,
            trail: newTrail.map(t => ({...t, opacity: t.opacity * 0.9}))
          }
        })
      )
    }

    const interval = setInterval(animate, 16)
    return () => clearInterval(interval)
  }, [isActive, particles, currentPattern])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* フラッシュ効果 */}
      {showFlash && (
        <div className="absolute inset-0 bg-white animate-pulse" style={{animationDuration: '0.3s'}} />
      )}

      {/* パーティクル */}
      {particles.map(particle => (
        <div key={particle.id}>
          {/* 軌跡効果 */}
          {particle.trail.map((trail, index) => (
            <div
              key={`${particle.id}-trail-${index}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: trail.x,
                top: trail.y,
                backgroundColor: particle.color,
                opacity: trail.opacity * 0.6,
                transform: `scale(${particle.scale * 0.3})`
              }}
            />
          ))}
          
          {/* メインパーティクル */}
          <div
            className="absolute"
            style={{
              left: particle.x,
              top: particle.y,
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
              filter: particle.neon ? 'drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor)' : 'none'
            }}
          >
            {particle.type === 'confetti' && (
              <div
                className="w-3 h-3"
                style={{ backgroundColor: particle.color }}
              />
            )}
            {particle.type === 'star' && (
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            )}
            {particle.type === 'trophy' && (
              <Trophy className="w-4 h-4 text-yellow-500 fill-current" />
            )}
            {particle.type === 'heart' && (
              <Heart className="w-4 h-4 text-pink-500 fill-current" />
            )}
            {particle.type === 'zap' && (
              <Zap className="w-4 h-4 text-yellow-500 fill-current" />
            )}
            {particle.type === 'sparkles' && (
              <Sparkles className="w-4 h-4 text-purple-500 fill-current" />
            )}
            {particle.type === 'award' && (
              <Award className="w-4 h-4 text-blue-500 fill-current" />
            )}
            {particle.type === 'crown' && (
              <Crown className="w-4 h-4 text-yellow-600 fill-current" />
            )}
            {particle.type === 'firework' && (
              <div className="w-6 h-6 text-orange-500 text-4xl">🎆</div>
            )}
            {particle.type === 'lightning' && (
              <div className="w-6 h-6 text-yellow-300 text-4xl">⚡</div>
            )}
          </div>
        </div>
      ))}

      {/* 中央の完了メッセージ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-10 text-center transform animate-bounce border-4 border-gradient-to-r from-green-400 to-blue-500">
          {currentSupporter && (
            <div className="flex items-center justify-center mb-4">
              <div className="text-6xl mr-3">{currentSupporter.avatar}</div>
              <div className="text-left">
                <div className="text-lg font-medium text-gray-700">
                  {currentSupporter.customName || currentSupporter.name}より
                </div>
                <div className="text-sm text-gray-500">応援メッセージ</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center w-24 h-24 rounded-full mx-auto mb-6 animate-pulse bg-gradient-to-br from-green-400 to-blue-500">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
            タスク完了！
          </h2>
          
          <div className="bg-white/80 rounded-xl p-4 mb-4 border-2 border-gray-200">
            <p className="text-xl text-gray-700 font-medium">{currentMessage}</p>
          </div>
          
          <p className="text-lg text-gray-600 mb-6">お疲れさまでした！</p>
          
          <div className="flex items-center justify-center gap-3 text-3xl animate-pulse">
            <span>🎉</span><span>✨</span><span>🎊</span><span>🌟</span><span>💫</span>
          </div>
        </div>
      </div>

      {/* 背景のオーバーレイ */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-transparent via-blue-50/40 to-purple-50/40" />
      
      {/* 装飾要素 */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce">🎊</div>
      <div className="absolute top-20 right-20 text-5xl animate-bounce delay-100">✨</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-bounce delay-200">🌟</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-bounce delay-300">🎉</div>
    </div>
  )
}
