'use client'

export default function ActionsTestPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Actions Test Page</h1>
      <p className="text-lg text-gray-600 mt-2">シンプルなテストページです</p>
      
      <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
        <ul className="space-y-2 text-gray-700">
          <li>✅ ページ表示: 成功</li>
          <li>✅ スタイリング: 成功</li>
          <li>✅ 基本的なレンダリング: 成功</li>
        </ul>
      </div>
    </div>
  )
}
