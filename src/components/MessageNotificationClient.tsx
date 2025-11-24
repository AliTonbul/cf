'use client'

import MessageNotification from './MessageNotification'

export default function MessageNotificationClient({ userId, href }: { userId: string; href: string }) {
  return <MessageNotification userId={userId} href={href} />
}
