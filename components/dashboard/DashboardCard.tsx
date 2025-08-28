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
    <div className={`card-modern p-6 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-slate-50 rounded-xl text-xl">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        {linkText && linkHref && (
          <Link
            href={linkHref}
            className="btn-outline text-xs py-1.5 px-3"
          >
            {linkText.includes('検索') ? (
              <>
                <Search className="w-3 h-3" />
                {linkText}
              </>
            ) : (
              <>
                {linkText}
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </Link>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}