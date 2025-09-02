'use client'

import { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemCount?: number
  itemName?: string
  isLoading?: boolean
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemCount = 1,
  itemName = 'アイテム',
  isLoading = false
}: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('')

  if (!isOpen) return null

  const isConfirmEnabled = confirmText === 'DELETE' && !isLoading

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      onConfirm()
      setConfirmText('')
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="relative bg-red-50 px-6 py-6 text-red-900 border-b border-red-200">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-red-100 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 pr-8">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-red-700 mt-1">
                  {itemCount > 1 ? `${itemCount}件の${itemName}` : itemName}を削除します
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                {message}
              </p>
              
              {itemCount > 1 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      一括削除の注意事項
                    </span>
                  </div>
                  <ul className="mt-2 text-sm text-orange-700 space-y-1">
                    <li>• 選択した{itemCount}件すべてが削除されます</li>
                    <li>• この操作は取り消すことができません</li>
                    <li>• 関連するデータも一緒に削除される場合があります</li>
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  削除を確認するには「DELETE」と入力してください
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isConfirmEnabled}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    削除中...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    削除する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
