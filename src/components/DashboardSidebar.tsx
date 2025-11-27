'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Settings, Briefcase, LogOut, Users } from 'lucide-react'
import { logout } from '@/app/auth/actions'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface DashboardSidebarProps {
  businessName: string
  inviteCode: string
  userFullName: string
  userRole: string
}

export default function DashboardSidebar({ businessName, inviteCode, userFullName, userRole }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Company Name at Top */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">{businessName}</h1>
        <p className="text-xs text-gray-500 mt-1">
          Code: <span className="font-mono font-bold">{inviteCode}</span>
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info and Logout at Bottom */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">{userFullName}</p>
          <p className="text-xs text-gray-500 capitalize">{userRole}</p>
        </div>
        <form action={logout}>
          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
