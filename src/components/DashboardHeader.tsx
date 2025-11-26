'use client'

import { logout } from '@/app/auth/actions'

interface DashboardHeaderProps {
  businessName: string
  inviteCode: string
  userFullName: string
  userRole: string
}

export default function DashboardHeader({ businessName, inviteCode, userFullName, userRole }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{businessName}</h1>
          <p className="text-xs text-gray-500">Invite Code: <span className="font-mono font-bold">{inviteCode}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{userFullName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
          
          <form action={logout}>
            <button className="text-sm text-red-600 hover:text-red-500">Sign out</button>
          </form>
        </div>
      </div>
    </header>
  )
}
