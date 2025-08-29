'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

interface DashboardCardProps {
  title: string
  icon: ReactNode
  children: ReactNode
  linkText?: string
  linkHref?: string
  fullWidth?: boolean
}

export default function DashboardCard({
  title,
  icon,
  children,
  linkText,
  linkHref,
  fullWidth = false
}: DashboardCardProps) {
  return (
    <div className={`card-modern p-6 hover:shadow-xl transition-all duration-300 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-2xl border border-blue-100">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        {linkText && linkHref && (
          <Link
            href={linkHref}
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-all duration-200 group"
          >
            {linkText.includes('検索') ? (
              <>
                <Search className="w-4 h-4" />
                {linkText}
              </>
            ) : (
              <>
                {linkText}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </Link>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}