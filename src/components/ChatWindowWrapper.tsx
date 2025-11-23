'use client'

import dynamic from 'next/dynamic'

const ChatWindow = dynamic(() => import('@/components/ChatWindow'), { ssr: false })

export default function ChatWindowWrapper(props: any) {
  return <ChatWindow {...props} />
}
