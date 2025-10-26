import { useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Presence = Database['public']['Tables']['presence']['Row'] & {
  auth_user?: {
    email: string
    raw_user_meta_data: any
  }
}

type UserPresence = {
  id: string
  userId: string
  status: string
  cursorPosition: any
  lastSeen: string
  onlineAt: string
  user: {
    email: string
    name?: string
    avatar?: string
  }
}

// Hook to get presence for a tree
export function usePresence(treeId: string | null) {
  return useQuery({
    queryKey: ['presence', treeId],
    queryFn: async () => {
      if (!treeId) throw new Error('Tree ID is required')

      const { data, error } = await supabase
        .from('presence')
        .select(`
          *,
          auth.users!presence_user_id_fkey (
            email,
            raw_user_meta_data
          )
        `)
        .eq('tree_id', treeId)
        .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 minutes
        .order('online_at', { ascending: false })

      if (error) throw error

      // Transform the data to include user metadata
      return data.map((presence: any): UserPresence => ({
        id: presence.id,
        userId: presence.user_id,
        status: presence.status,
        cursorPosition: presence.cursor_position,
        lastSeen: presence.last_seen,
        onlineAt: presence.online_at,
        user: {
          email: presence.auth.users?.email || '',
          name: presence.auth.users?.raw_user_meta_data?.name ||
                presence.auth.users?.email?.split('@')[0] || 'Unknown User',
          avatar: presence.auth.users?.raw_user_meta_data?.avatar_url || undefined,
        }
      }))
    },
    enabled: !!treeId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook to manage current user's presence
export function useUserPresence(treeId: string | null) {
  const queryClient = useQueryClient()
  const currentUserId = useRef<string | null>(null)
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null)

  // Get current user
  const getCurrentUser = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    currentUserId.current = user?.id || null
    return user
  }, [])

  // Update presence mutation
  const updatePresenceMutation = useMutation({
    mutationFn: async ({
      status,
      cursorPosition,
    }: {
      status: string
      cursorPosition?: any
    }) => {
      if (!treeId || !currentUserId.current) {
        throw new Error('Tree ID or user ID not available')
      }

      const { data, error } = await supabase
        .from('presence')
        .upsert({
          tree_id: treeId,
          user_id: currentUserId.current,
          status,
          cursor_position: cursorPosition || {},
          online_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate presence query to get fresh data
      if (treeId) {
        queryClient.invalidateQueries({ queryKey: ['presence', treeId] })
      }
    },
  })

  // Remove presence mutation
  const removePresenceMutation = useMutation({
    mutationFn: async () => {
      if (!treeId || !currentUserId.current) {
        throw new Error('Tree ID or user ID not available')
      }

      const { error } = await supabase
        .from('presence')
        .delete()
        .eq('tree_id', treeId)
        .eq('user_id', currentUserId.current)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate presence query
      if (treeId) {
        queryClient.invalidateQueries({ queryKey: ['presence', treeId] })
      }
    },
  })

  // Start heartbeat to keep presence alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
    }

    heartbeatInterval.current = setInterval(() => {
      updatePresenceMutation.mutate({
        status: 'active',
      })
    }, 60 * 1000) // Update every minute
  }, [updatePresenceMutation])

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
      heartbeatInterval.current = null
    }
  }, [])

  // Initialize presence
  const initializePresence = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      if (!user || !treeId) return

      await updatePresenceMutation.mutateAsync({
        status: 'active',
      })

      startHeartbeat()
    } catch (error) {
      console.error('Error initializing presence:', error)
    }
  }, [getCurrentUser, treeId, updatePresenceMutation.mutateAsync, startHeartbeat])

  // Update presence status
  const updateStatus = useCallback((status: string, cursorPosition?: any) => {
    updatePresenceMutation.mutate({
      status,
      cursorPosition,
    })
  }, [updatePresenceMutation])

  // Cleanup presence
  const cleanup = useCallback(() => {
    stopHeartbeat()
    removePresenceMutation.mutate()
  }, [stopHeartbeat, removePresenceMutation])

  // Auto-initialize and cleanup
  useEffect(() => {
    if (treeId) {
      initializePresence()
    }

    return () => {
      cleanup()
    }
  }, [treeId, initializePresence, cleanup])

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanup()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [cleanup])

  return {
    updateStatus,
    cleanup,
    isUpdating: updatePresenceMutation.isPending,
    isRemoving: removePresenceMutation.isPending,
  }
}

// Hook to track cursor position and viewport
export function useCursorPosition() {
  const positionRef = useRef({
    x: 0,
    y: 0,
    zoom: 1,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  })

  const updatePosition = useCallback((x: number, y: number, zoom: number = 1) => {
    positionRef.current = {
      x,
      y,
      zoom,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    }
  }, [])

  const getPosition = useCallback(() => {
    return positionRef.current
  }, [])

  return {
    updatePosition,
    getPosition,
  }
}

// Hook to track which member is being viewed/edited
export function useMemberFocus() {
  const focusedMemberRef = useRef<string | null>(null)

  const focusMember = useCallback((memberId: string) => {
    focusedMemberRef.current = memberId
  }, [])

  const unfocusMember = useCallback(() => {
    focusedMemberRef.current = null
  }, [])

  const getFocusedMember = useCallback(() => {
    return focusedMemberRef.current
  }, [])

  return {
    focusMember,
    unfocusMember,
    getFocusedMember,
  }
}

// Utility function to format presence status
export function formatPresenceStatus(status: string, lastSeen: string): string {
  const now = new Date()
  const lastSeenDate = new Date(lastSeen)
  const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

  switch (status) {
    case 'active':
      return 'Active now'
    case 'idle':
      return diffMinutes < 2 ? 'Active' : `Idle ${diffMinutes}m`
    case 'away':
      return 'Away'
    case 'editing':
      return 'Editing'
    case 'viewing':
      return 'Viewing'
    default:
      if (diffMinutes < 1) return 'Active now'
      if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`
      const diffHours = Math.floor(diffMinutes / 60)
      if (diffHours < 24) return `Last seen ${diffHours}h ago`
      return `Last seen ${lastSeenDate.toLocaleDateString()}`
  }
}

// Utility function to get user display name
export function getUserDisplayName(user: { email: string; name?: string }): string {
  if (user.name && user.name.trim()) {
    return user.name
  }

  // Extract name from email if no name is set
  const emailName = user.email.split('@')[0]
  return emailName.charAt(0).toUpperCase() + emailName.slice(1)
}

// Utility function to get user initials
export function getUserInitials(user: { email: string; name?: string }): string {
  const displayName = getUserDisplayName(user)
  const names = displayName.split(' ')

  if (names.length >= 2) {
    return names[0].charAt(0) + names[names.length - 1].charAt(0)
  }

  return displayName.substring(0, 2).toUpperCase()
}