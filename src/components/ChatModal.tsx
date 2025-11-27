'use client'

import { MessageSquare } from 'lucide-react'
import ChatWindow from './ChatWindow'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ChatModalProps {
  currentUserId: string
  otherUserId: string
  otherUserName: string
  roomId: string
}

export default function ChatModal({ currentUserId, otherUserId, otherUserName, roomId }: ChatModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500">
          <MessageSquare className="h-4 w-4" />
          Chat with {otherUserName}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Chat with {otherUserName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            currentUserId={currentUserId}
            otherUserId={otherUserId}
            otherUserName={otherUserName}
            roomId={roomId}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
