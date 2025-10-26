import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type RealtimeEvent = {
  table: keyof Database['public']['Tables']
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  schema: string
  payload: {
    old?: any
    new?: any
  }
}

interface UseRealtimeSubscriptionsOptions {
  treeId: string
  enabled?: boolean
  onMemberChange?: (event: RealtimeEvent) => void
  onRelationshipChange?: (event: RealtimeEvent) => void
  onTreeChange?: (event: RealtimeEvent) => void
  onActivityChange?: (event: RealtimeEvent) => void
  onError?: (error: Error) => void
}

export function useRealtimeSubscriptions({
  treeId,
  enabled = true,
  onMemberChange,
  onRelationshipChange,
  onTreeChange,
  onActivityChange,
  onError,
}: UseRealtimeSubscriptionsOptions) {
  const queryClient = useQueryClient()
  const channelsRef = useRef<RealtimeChannel[]>([])

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    try {
      const { table, event: eventType, payload } = event

      // Update TanStack Query cache based on the table and event
      switch (table) {
        case 'members':
          // Invalidate members query
          queryClient.invalidateQueries({ queryKey: ['members', treeId] })

          // Also invalidate relationships as member changes might affect relationship data
          queryClient.invalidateQueries({ queryKey: ['relationships', treeId] })

          // Call custom callback if provided
          if (onMemberChange) {
            onMemberChange(event)
          }
          break

        case 'relationships':
          // Invalidate relationships query
          queryClient.invalidateQueries({ queryKey: ['relationships', treeId] })

          // Also invalidate members as relationship changes might affect tree structure
          queryClient.invalidateQueries({ queryKey: ['members', treeId] })

          if (onRelationshipChange) {
            onRelationshipChange(event)
          }
          break

        case 'trees':
          // Invalidate tree query
          queryClient.invalidateQueries({ queryKey: ['tree', treeId] })

          if (onTreeChange) {
            onTreeChange(event)
          }
          break

        case 'activities':
          // Invalidate activities query
          queryClient.invalidateQueries({ queryKey: ['activities', treeId] })

          if (onActivityChange) {
            onActivityChange(event)
          }
          break

        default:
          console.warn('Unknown table in realtime event:', table)
      }

      // Log the event for debugging
      console.log(`Realtime ${eventType} event on ${table}:`, payload)
    } catch (error) {
      console.error('Error handling realtime event:', error)
      if (onError) {
        onError(error as Error)
      }
    }
  }, [treeId, queryClient, onMemberChange, onRelationshipChange, onTreeChange, onActivityChange, onError])

  const subscribe = useCallback(() => {
    if (!enabled || !treeId) return

    // Cleanup existing subscriptions
    unsubscribe()

    try {
      // Create main tree subscription channel
      const treeChannel = supabase
        .channel(`tree-${treeId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trees',
            filter: `id=eq.${treeId}`
          },
          handleRealtimeEvent
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'members',
            filter: `tree_id=eq.${treeId}`
          },
          handleRealtimeEvent
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'relationships',
            filter: `tree_id=eq.${treeId}`
          },
          handleRealtimeEvent
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
            filter: `tree_id=eq.${treeId}`
          },
          handleRealtimeEvent
        )
        .subscribe((status) => {
          console.log(`Tree subscription status for ${treeId}:`, status)

          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to realtime updates for tree ${treeId}`)
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Failed to subscribe to realtime updates for tree ${treeId}`)
            if (onError) {
              onError(new Error('Failed to subscribe to realtime updates'))
            }
          }
        })

      channelsRef.current.push(treeChannel)
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error)
      if (onError) {
        onError(error as Error)
      }
    }
  }, [treeId, enabled, handleRealtimeEvent, onError])

  const unsubscribe = useCallback(() => {
    channelsRef.current.forEach(channel => {
      try {
        supabase.removeChannel(channel)
      } catch (error) {
        console.error('Error removing channel:', error)
      }
    })
    channelsRef.current = []
  }, [])

  // Set up subscription when component mounts or dependencies change
  useEffect(() => {
    subscribe()

    // Cleanup when component unmounts or dependencies change
    return () => {
      unsubscribe()
    }
  }, [subscribe, unsubscribe])

  // Manual reconnection function
  const reconnect = useCallback(() => {
    console.log('Manually reconnecting realtime subscriptions...')
    unsubscribe()
    setTimeout(() => {
      subscribe()
    }, 1000)
  }, [unsubscribe, subscribe])

  return {
    isConnected: channelsRef.current.length > 0,
    reconnect,
    unsubscribe
  }
}

// Hook for subscribing to presence updates
interface UsePresenceSubscriptionsOptions {
  treeId: string
  enabled?: boolean
  onPresenceChange?: (event: RealtimeEvent) => void
  onError?: (error: Error) => void
}

export function usePresenceSubscriptions({
  treeId,
  enabled = true,
  onPresenceChange,
  onError,
}: UsePresenceSubscriptionsOptions) {
  const queryClient = useQueryClient()
  const presenceChannelRef = useRef<RealtimeChannel | null>(null)

  const handlePresenceEvent = useCallback((event: RealtimeEvent) => {
    try {
      // Update presence cache
      queryClient.invalidateQueries({ queryKey: ['presence', treeId] })

      if (onPresenceChange) {
        onPresenceChange(event)
      }

      console.log(`Presence event for tree ${treeId}:`, event)
    } catch (error) {
      console.error('Error handling presence event:', error)
      if (onError) {
        onError(error as Error)
      }
    }
  }, [treeId, queryClient, onPresenceChange, onError])

  const subscribeToPresence = useCallback(() => {
    if (!enabled || !treeId) return

    // Cleanup existing presence subscription
    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current)
    }

    try {
      presenceChannelRef.current = supabase
        .channel(`presence-${treeId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'presence',
            filter: `tree_id=eq.${treeId}`
          },
          handlePresenceEvent
        )
        .subscribe((status) => {
          console.log(`Presence subscription status for ${treeId}:`, status)

          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to presence updates for tree ${treeId}`)
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Failed to subscribe to presence updates for tree ${treeId}`)
            if (onError) {
              onError(new Error('Failed to subscribe to presence updates'))
            }
          }
        })
    } catch (error) {
      console.error('Error setting up presence subscriptions:', error)
      if (onError) {
        onError(error as Error)
      }
    }
  }, [treeId, enabled, handlePresenceEvent, onError])

  const unsubscribeFromPresence = useCallback(() => {
    if (presenceChannelRef.current) {
      try {
        supabase.removeChannel(presenceChannelRef.current)
        presenceChannelRef.current = null
      } catch (error) {
        console.error('Error removing presence channel:', error)
      }
    }
  }, [])

  useEffect(() => {
    subscribeToPresence()

    return () => {
      unsubscribeFromPresence()
    }
  }, [subscribeToPresence, unsubscribeFromPresence])

  return {
    isConnected: !!presenceChannelRef.current,
    unsubscribe: unsubscribeFromPresence,
    resubscribe: subscribeToPresence
  }
}

// Utility hook for getting connection status
export function useRealtimeConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const channel = supabase.channel('connection-status')

    channel
      .on('system', {}, (payload) => {
        if (payload.extension === 'postgres_changes') {
          setConnectionStatus('connected')
          setError(null)
        }
      })
      .subscribe((status) => {
        switch (status) {
          case 'SUBSCRIBED':
            setConnectionStatus('connected')
            setError(null)
            break
          case 'CHANNEL_ERROR':
            setConnectionStatus('error')
            setError(new Error('Connection error'))
            break
          case 'TIMED_OUT':
            setConnectionStatus('error')
            setError(new Error('Connection timeout'))
            break
          case 'CLOSED':
            setConnectionStatus('disconnected')
            setError(null)
            break
          default:
            setConnectionStatus('connecting')
            setError(null)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { connectionStatus, error }
}

// Import useState that was missing
import { useState } from 'react'