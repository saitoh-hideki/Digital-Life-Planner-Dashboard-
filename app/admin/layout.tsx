'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FileText, 
  Database, 
  AlertTriangle, 
  Calendar, 
  Archive, 
  Settings,
  Gift
} from 'lucide-react'

const navigation = [
  { name: 'ダッシュボード', href: '/admin', icon: Home },
  { name: 'トピック', href: '/admin/topics', icon: FileText },
  { name: '補助金・助成金', href: '/admin/subsidies', icon: Gift },
  { name: '地域アプリ', href: '/admin/apps', icon: Database },
  { name: '地域ニュース', href: '/admin/news', icon: FileText },
  { name: 'イベント', href: '/admin/events', icon: Calendar },
  { name: 'ナレッジ', href: '/admin/knowledge', icon: Archive },
  { name: 'アラート', href: '/admin/alerts', icon: AlertTriangle }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">管理画面</h1>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <Home className="w-4 h-4" />
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 min-h-screen">
          <nav className="p-4">
            {/* ダッシュボードへの移動リンク */}
            <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 text-blue-700 hover:text-blue-800 font-medium transition-colors"
              >
                <Home className="w-5 h-5" />
                ダッシュボードに戻る
              </Link>
            </div>
            
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
        
        {/* Main content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
