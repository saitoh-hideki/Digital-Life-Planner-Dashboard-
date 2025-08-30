'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Star, Trophy } from 'lucide-react'

interface ConfettiEffectProps {
  isActive: boolean
  onComplete: () => void
}

type ParticleType = 'confetti' | 'star' | 'trophy'

export default function ConfettiEffect({ isActive, onComplete }: ConfettiEffectProps) {
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
  }>>([])

  useEffect(() => {
    if (!isActive) return

    // パーティクルを生成
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
    }> = []
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
    
    for (let i = 0; i < 50; i++) {
      const randomType: ParticleType = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'star' : 'trophy') : 'confetti'
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: randomType
      })
    }
    
    setParticles(newParticles)

    // アニメーション終了後にコールバック
    const timer = setTimeout(() => {
      onComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [isActive, onComplete])

  useEffect(() => {
    if (!isActive || particles.length === 0) return

    const animate = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          rotation: particle.rotation + particle.rotationSpeed,
          vy: particle.vy + 0.1 // 重力
        }))
      )
    }

    const interval = setInterval(animate, 16) // 60fps

    return () => clearInterval(interval)
  }, [isActive, particles])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* パーティクル */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg)`,
            transition: 'all 0.1s ease-out'
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
        </div>
      ))}

      {/* 中央の完了メッセージ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform animate-bounce">
          <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">タスク完了！</h2>
          <p className="text-lg text-gray-600 mb-4">お疲れさまでした！</p>
          <div className="flex items-center justify-center gap-2 text-2xl">
            <span>🎉</span>
            <span>✨</span>
            <span>🎊</span>
          </div>
        </div>
      </div>

      {/* 背景のオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent" />
    </div>
  )
}
