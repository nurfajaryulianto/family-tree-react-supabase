import React, { createContext, useContext, useCallback, useEffect, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRealtimeSubscriptions, usePresenceSubscriptions } from '@/hooks/useRealtimeSubscriptions'
import { handleRealtimeOptimisticUpdate } from '@/hooks/useTreeData'
import { supabase } from '@/lib/supabase'

interface RealtimeCollaborationContextType {
  isConnected: boolean
  isPresenceConnected: boolean
  reconnect: () => void
  reconnectPresence: () => void
  updatePresence: (status: string, cursorPosition?: any) => Promise<void>
  removePresence: () => Promise<void>
}

const RealtimeCollaborationContext = createContext<RealtimeCollaborationContextType | undefined>(undefined)

interface RealtimeCollaborationProviderProps {
  children: ReactNode
  treeId: string
  enabled?: boolean
}

export function RealtimeCollaborationProvider({
  children,
  treeId,
  enabled = true,
}: RealtimeCollaborationProviderProps) {
  const queryClient = useQueryClient()

  // Main realtime subscriptions for tree data
  const {
    isConnected,
    reconnect,
  } = useRealtimeSubscriptions({
    treeId,
    enabled,
    onMemberChange: (event) => {
      // Handle optimistic updates for member changes
      handleRealtimeOptimisticUpdate(queryClient, event, treeId)
    },
    onRelationshipChange: (event) => {
      // Handle optimistic updates for relationship changes
      handleRealtimeOptimisticUpdate(queryClient, event, treeId)
    },
    onTreeChange: (event) => {
      // Invalidate tree data when tree changes
      queryClient.invalidateQueries({ queryKey: ['tree', treeId] })
    },
    onActivityChange: (event) => {
      // Invalidate activities when new activity occurs
      queryClient.invalidateQueries({ queryKey: ['activities', treeId] })
    },
    onError: (error) => {
      console.error('Realtime subscription error:', error)
    },
  })

  // Presence subscriptions
  const {
    isConnected: isPresenceConnected,
    resubscribe: reconnectPresence,
  } = usePresenceSubscriptions({
    treeId,
    enabled,
    onPresenceChange: (event) => {
      // Handle presence updates
      handleRealtimeOptimisticUpdate(queryClient, event, treeId)
    },
    onError: (error) => {
      console.error('Presence subscription error:', error)
    },
  })

  // Update presence function
  const updatePresence = useCallback(async (status: string, cursorPosition?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      await supabase
        .from('presence')
        .upsert({
          tree_id: treeId,
          user_id: user.id,
          status,
          cursor_position: cursorPosition || {},
          online_at: new Date().toISOString(),
        })
    } catch (error) {
      console.error('Error updating presence:', error)
      throw error
    }
  }, [treeId])

  // Remove presence function
  const removePresence = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('presence')
        .delete()
        .eq('tree_id', treeId)
        .eq('user_id', user.id)
    } catch (error) {
      console.error('Error removing presence:', error)
    }
  }, [treeId])

  // Cleanup presence on unmount
  useEffect(() => {
    return () => {
      removePresence()
    }
  }, [removePresence])

  // Update presence periodically to keep user marked as online
  useEffect(() => {
    if (!enabled || !isPresenceConnected) return

    const interval = setInterval(() => {
      updatePresence('active')
    }, 60 * 1000) // Update every minute

    return () => clearInterval(interval)
  }, [enabled, isPresenceConnected, updatePresence])

  // Set initial presence when component mounts
  useEffect(() => {
    if (enabled && isPresenceConnected) {
      updatePresence('active')
    }
  }, [enabled, isPresenceConnected, updatePresence])

  const contextValue: RealtimeCollaborationContextType = {
    isConnected,
    isPresenceConnected,
    reconnect,
    reconnectPresence,
    updatePresence,
    removePresence,
  }

  return (
    <RealtimeCollaborationContext.Provider value={contextValue}>
      {children}
    </RealtimeCollaborationContext.Provider>
  )
}

export function useRealtimeCollaboration() {
  const context = useContext(RealtimeCollaborationContext)
  if (context === undefined) {
    throw new Error('useRealtimeCollaboration must be used within a RealtimeCollaborationProvider')
  }
  return context
}

// Hook to listen for specific real-time events
export function useRealtimeEventListeners(treeId: string) {
  const queryClient = useQueryClient()

  const handleRealtimeEvent = useCallback((event: any) => {
    console.log('Real-time event received:', event)

    // Handle optimistic updates
    handleRealtimeOptimisticUpdate(queryClient, event, treeId)

    // Show toast notifications for important events
    switch (event.table) {
      case 'members':
        if (event.event === 'INSERT') {
          // You could integrate with a toast system here
          console.log('New member added:', event.payload.new)
        } else if (event.event === 'UPDATE') {
          console.log('Member updated:', event.payload.new)
        }
        break
      case 'relationships':
        if (event.event === 'INSERT') {
          console.log('New relationship added:', event.payload.new)
        }
        break
    }
  }, [queryClient, treeId])

  return { handleRealtimeEvent }
}