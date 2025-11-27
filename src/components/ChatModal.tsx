'use client'

import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import ChatWindow from './ChatWindow'

interface ChatModalProps {
  currentUserId: string
  otherUserId: string
  otherUserName: string
  roomId: string
}

export default function ChatModal({ currentUserId, otherUserId, otherUserName, roomId }: ChatModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <MessageSquare className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Chat with {otherUserName}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[650px] relative flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Chat with {otherUserName}</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden p-4">
               <ChatWindow 
                  currentUserId={currentUserId}
                  otherUserId={otherUserId}
                  otherUserName={otherUserName}
                  roomId={roomId}
               />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
