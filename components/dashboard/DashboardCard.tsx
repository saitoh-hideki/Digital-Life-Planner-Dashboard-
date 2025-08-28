'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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
    <div className={`bg-white rounded-lg shadow-md p-6 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        {linkText && linkHref && (
          <Link
            href={linkHref}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            {linkText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}