'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useUnreadMessages(userId: string) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('read', false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Subscribe to new messages
    const channel = supabase
      .channel(`unread:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          // Increment unread count
          setUnreadCount((prev) => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          // If message was marked as read, decrement
          if ((payload.new as any).read && !(payload.old as any).read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const markAsRead = async (messageIds: string[]) => {
    if (messageIds.length === 0) return

    await supabase
      .from('messages')
      .update({ read: true })
      .in('id', messageIds)
      .eq('receiver_id', userId)

    // Update local count
    setUnreadCount((prev) => Math.max(0, prev - messageIds.length))
  }

  return { unreadCount, markAsRead }
}
