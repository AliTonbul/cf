'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'

interface MessageNotificationProps {
  userId: string
  href: string
  className?: string
}

export default function MessageNotification({ userId, href, className = '' }: MessageNotificationProps) {
  const { unreadCount } = useUnreadMessages(userId)

  return (
    <Link 
      href={href} 
      className={`relative text-gray-500 hover:text-indigo-600 ${className}`}
      title="Messages"
    >
      <MessageSquare className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
