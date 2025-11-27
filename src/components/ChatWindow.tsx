'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import ReactMarkdown from 'react-markdown'
import { Camera, Send, Image as ImageIcon, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

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

    // Subscribe to new messages
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
          const newMessage = payload.new as Message
          if (
            (newMessage.sender_id === currentUserId && newMessage.receiver_id === otherUserId) ||
            (newMessage.sender_id === otherUserId && newMessage.receiver_id === currentUserId)
          ) {
            setMessages((prev) => {
              if (prev.some(m => m.id === newMessage.id)) return prev
              return [...prev, newMessage]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, otherUserId, supabase, roomId])

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
        .then()
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
    <Card className="flex flex-col h-full border-0 shadow-none rounded-none">
      <ScrollArea className="flex-1 p-4" style={{ overflowY: 'scroll' }}>
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{isMe ? 'ME' : otherUserName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-lg px-4 py-2 ${
                    isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {msg.image_url && (
                      <img src={msg.image_url} alt="Shared" className="rounded-md mb-2 max-h-48 object-cover" />
                    )}
                    {msg.content && (
                      <div className={`prose prose-sm max-w-none ${isMe ? 'prose-invert' : ''}`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <div className="flex items-center gap-2">
           <input
             type="file"
             accept="image/*"
             capture="environment"
             ref={cameraInputRef}
             className="hidden"
             onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
           />
           <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            
          <Button
            variant="ghost"
            size="icon"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0"
          >
            <Camera className="h-5 w-5" />
            <span className="sr-only">Take Photo</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0"
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach File</span>
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(newMessage)
              }
            }}
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
          />
          
          <Button 
            onClick={() => sendMessage(newMessage)}
            disabled={(!newMessage.trim() && !uploading) || uploading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        {uploading && <p className="text-xs text-muted-foreground mt-2">Uploading image...</p>}
      </div>
    </Card>
  )
}
