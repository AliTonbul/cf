'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import ReactMarkdown from 'react-markdown'
import { Camera, Send, Image as ImageIcon } from 'lucide-react'


type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  image_url?: string
  read?: boolean
  created_at: string
}

type ChatWindowProps = {
  currentUserId: string
  otherUserId: string
  otherUserName: string
  roomId: string
}

export default function ChatWindow({ currentUserId, otherUserId, roomId, otherUserName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial messages
    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    })()



    // Subscribe to new messages - listen for all messages in this conversation
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('📨 Received real-time message:', payload)
          const newMessage = payload.new as Message
          // Only add if it's part of this conversation
          if (
            (newMessage.sender_id === currentUserId && newMessage.receiver_id === otherUserId) ||
            (newMessage.sender_id === otherUserId && newMessage.receiver_id === currentUserId)
          ) {
            console.log('✅ Message is for this conversation, adding to state')
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMessage.id)) {
                console.log('⚠️ Duplicate message, skipping')
                return prev
              }
              return [...prev, newMessage]
            })
          } else {
            console.log('❌ Message not for this conversation')
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 Subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, otherUserId, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    
    // Mark unread messages as read
    const unreadMessageIds = messages
      .filter(m => m.receiver_id === currentUserId && !m.read)
      .map(m => m.id)
    
    if (unreadMessageIds.length > 0) {
      supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadMessageIds)
        .then(() => {
          console.log('✅ Marked messages as read:', unreadMessageIds)
        })
    }
  }, [messages, currentUserId, supabase])

  const sendMessage = async (content: string, imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return

    const tempId = Math.random().toString()
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content: content,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content: content,
      image_url: imageUrl,
    })

    if (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error (simplified)
      setMessages((prev) => prev.filter(m => m.id !== tempId))
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${currentUserId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('message-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('message-images')
      .getPublicUrl(filePath)

    await sendMessage('', publicUrl)
    setUploading(false)
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-sm font-medium text-gray-900">Chat with {otherUserName}</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                {msg.image_url && (
                  <img src={msg.image_url} alt="Shared" className="rounded-md mb-2 max-h-48 object-cover" />
                )}
                {msg.content && (
                  <div className={`prose prose-sm max-w-none ${isMe ? 'prose-invert' : ''}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
                <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

       {/* Camera Capture using file input */}
       <input
         type="file"
         accept="image/*"
         capture="environment"
         ref={cameraInputRef}
         className="hidden"
         onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
       />

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-end gap-2">
          <div className="flex gap-2 pb-2">
             <button
               onClick={() => cameraInputRef.current?.click()}
               className="text-gray-500 hover:text-indigo-600 p-1"
               title="Take Photo"
             >
               <Camera className="h-5 w-5" />
             </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-indigo-600 p-1"
              title="Upload Image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(newMessage)
                }
              }}
              placeholder="Type a message... (Markdown supported)"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
              rows={1}
              style={{ minHeight: '38px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={() => sendMessage(newMessage)}
            disabled={(!newMessage.trim() && !uploading) || uploading}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading image...</p>}
      </div>
    </div>
  )
}
