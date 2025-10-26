import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { FamilyMember, Relationship } from '@/types/family-tree'

// Types for our application
type Tree = Database['public']['Tables']['trees']['Row']
type Member = Database['public']['Tables']['members']['Row']
type DbRelationship = Database['public']['Tables']['relationships']['Row']
type Activity = Database['public']['Tables']['activities']['Row']
type Presence = Database['public']['Tables']['presence']['Row']

// Convert database member to our frontend FamilyMember type
export const dbMemberToFamilyMember = (dbMember: Member): FamilyMember => ({
  id: dbMember.id,
  firstName: dbMember.first_name,
  lastName: dbMember.last_name,
  birthName: dbMember.birth_name || undefined,
  nickname: dbMember.nickname || undefined,
  birthDate: dbMember.birth_date || undefined,
  birthLocation: dbMember.birth_location || undefined,
  deathDate: dbMember.death_date || undefined,
  deathLocation: dbMember.death_location || undefined,
  isDeceased: dbMember.is_deceased,
  gender: dbMember.gender || undefined,
  avatarUrl: dbMember.avatar_url || undefined,
  bio: dbMember.bio || undefined,
  notes: dbMember.notes || undefined,
  treeId: dbMember.tree_id,
  createdAt: dbMember.created_at,
  updatedAt: dbMember.updated_at,
})

// Convert database relationship to our frontend Relationship type
export const dbRelationshipToRelationship = (dbRel: DbRelationship): Relationship => ({
  id: dbRel.id,
  fromMemberId: dbRel.from_member_id,
  toMemberId: dbRel.to_member_id,
  type: dbRel.type,
  treeId: dbRel.tree_id,
  createdAt: dbRel.created_at,
})

// Hook to fetch a specific tree
export function useTree(treeId: string | null) {
  return useQuery({
    queryKey: ['tree', treeId],
    queryFn: async () => {
      if (!treeId) throw new Error('Tree ID is required')

      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('id', treeId)
        .single()

      if (error) throw error
      return data as Tree
    },
    enabled: !!treeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch members for a tree
export function useMembers(treeId: string | null) {
  return useQuery({
    queryKey: ['members', treeId],
    queryFn: async () => {
      if (!treeId) throw new Error('Tree ID is required')

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('tree_id', treeId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data.map(dbMemberToFamilyMember)
    },
    enabled: !!treeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to fetch relationships for a tree
export function useRelationships(treeId: string | null) {
  return useQuery({
    queryKey: ['relationships', treeId],
    queryFn: async () => {
      if (!treeId) throw new Error('Tree ID is required')

      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .eq('tree_id', treeId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data.map(dbRelationshipToRelationship)
    },
    enabled: !!treeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to fetch activities for a tree
export function useActivities(treeId: string | null, limit: number = 50) {
  return useQuery({
    queryKey: ['activities', treeId, limit],
    queryFn: async () => {
      if (!treeId) throw new Error('Tree ID is required')

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          auth.users!activities_user_id_fkey (
            email,
            raw_user_meta_data
          )
        `)
        .eq('tree_id', treeId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as Activity[]
    },
    enabled: !!treeId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Hook to fetch presence for a tree
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
      return data as Presence[]
    },
    enabled: !!treeId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Mutation to create a new member
export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberData: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => {
      const dbMember = {
        tree_id: memberData.treeId,
        first_name: memberData.firstName,
        last_name: memberData.lastName,
        birth_name: memberData.birthName || null,
        nickname: memberData.nickname || null,
        birth_date: memberData.birthDate || null,
        birth_location: memberData.birthLocation || null,
        death_date: memberData.deathDate || null,
        death_location: memberData.deathLocation || null,
        is_deceased: memberData.isDeceased,
        gender: memberData.gender || null,
        avatar_url: memberData.avatarUrl || null,
        bio: memberData.bio || null,
        notes: memberData.notes || null,
      }

      const { data, error } = await supabase
        .from('members')
        .insert(dbMember)
        .select()
        .single()

      if (error) throw error
      return dbMemberToFamilyMember(data)
    },
    onSuccess: (newMember, variables) => {
      // Update the members cache
      queryClient.setQueryData(
        ['members', variables.treeId],
        (oldMembers: FamilyMember[] | undefined) => {
          if (!oldMembers) return [newMember]
          return [...oldMembers, newMember]
        }
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['relationships', variables.treeId] })
      queryClient.invalidateQueries({ queryKey: ['activities', variables.treeId] })
    },
  })
}

// Mutation to update a member
export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...memberData }: Partial<FamilyMember> & { id: string }) => {
      const dbMember: Partial<Database['public']['Tables']['members']['Update']> = {}

      if (memberData.firstName !== undefined) dbMember.first_name = memberData.firstName
      if (memberData.lastName !== undefined) dbMember.last_name = memberData.lastName
      if (memberData.birthName !== undefined) dbMember.birth_name = memberData.birthName
      if (memberData.nickname !== undefined) dbMember.nickname = memberData.nickname
      if (memberData.birthDate !== undefined) dbMember.birth_date = memberData.birthDate
      if (memberData.birthLocation !== undefined) dbMember.birth_location = memberData.birthLocation
      if (memberData.deathDate !== undefined) dbMember.death_date = memberData.deathDate
      if (memberData.deathLocation !== undefined) dbMember.death_location = memberData.deathLocation
      if (memberData.isDeceased !== undefined) dbMember.is_deceased = memberData.isDeceased
      if (memberData.gender !== undefined) dbMember.gender = memberData.gender
      if (memberData.avatarUrl !== undefined) dbMember.avatar_url = memberData.avatarUrl
      if (memberData.bio !== undefined) dbMember.bio = memberData.bio
      if (memberData.notes !== undefined) dbMember.notes = memberData.notes

      const { data, error } = await supabase
        .from('members')
        .update(dbMember)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return dbMemberToFamilyMember(data)
    },
    onSuccess: (updatedMember) => {
      // Update the members cache
      queryClient.setQueryData(
        ['members', updatedMember.treeId],
        (oldMembers: FamilyMember[] | undefined) => {
          if (!oldMembers) return [updatedMember]
          return oldMembers.map(member =>
            member.id === updatedMember.id ? updatedMember : member
          )
        }
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['activities', updatedMember.treeId] })
    },
  })
}

// Mutation to delete a member
export function useDeleteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, treeId }: { id: string; treeId: string }) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, treeId }
    },
    onSuccess: ({ id, treeId }) => {
      // Update the members cache
      queryClient.setQueryData(
        ['members', treeId],
        (oldMembers: FamilyMember[] | undefined) => {
          if (!oldMembers) return []
          return oldMembers.filter(member => member.id !== id)
        }
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['relationships', treeId] })
      queryClient.invalidateQueries({ queryKey: ['activities', treeId] })
    },
  })
}

// Mutation to create a relationship
export function useCreateRelationship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (relationshipData: Omit<Relationship, 'id' | 'createdAt'>) => {
      const dbRelationship = {
        tree_id: relationshipData.treeId,
        from_member_id: relationshipData.fromMemberId,
        to_member_id: relationshipData.toMemberId,
        type: relationshipData.type,
      }

      const { data, error } = await supabase
        .from('relationships')
        .insert(dbRelationship)
        .select()
        .single()

      if (error) throw error
      return dbRelationshipToRelationship(data)
    },
    onSuccess: (newRelationship) => {
      // Update the relationships cache
      queryClient.setQueryData(
        ['relationships', newRelationship.treeId],
        (oldRelationships: Relationship[] | undefined) => {
          if (!oldRelationships) return [newRelationship]
          return [...oldRelationships, newRelationship]
        }
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['activities', newRelationship.treeId] })
    },
  })
}

// Mutation to delete a relationship
export function useDeleteRelationship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, treeId }: { id: string; treeId: string }) => {
      const { error } = await supabase
        .from('relationships')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, treeId }
    },
    onSuccess: ({ id, treeId }) => {
      // Update the relationships cache
      queryClient.setQueryData(
        ['relationships', treeId],
        (oldRelationships: Relationship[] | undefined) => {
          if (!oldRelationships) return []
          return oldRelationships.filter(rel => rel.id !== id)
        }
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['activities', treeId] })
    },
  })
}

// Optimistic update helper for realtime events
export function handleRealtimeOptimisticUpdate(
  queryClient: useQueryClient,
  event: any,
  treeId: string
) {
  const { table, event: eventType, payload } = event

  switch (table) {
    case 'members':
      if (eventType === 'INSERT') {
        const newMember = dbMemberToFamilyMember(payload.new)
        queryClient.setQueryData(
          ['members', treeId],
          (oldMembers: FamilyMember[] | undefined) => {
            if (!oldMembers) return [newMember]

            // Avoid duplicates
            const exists = oldMembers.some(member => member.id === newMember.id)
            return exists ? oldMembers : [...oldMembers, newMember]
          }
        )
      } else if (eventType === 'UPDATE') {
        const updatedMember = dbMemberToFamilyMember(payload.new)
        queryClient.setQueryData(
          ['members', treeId],
          (oldMembers: FamilyMember[] | undefined) => {
            if (!oldMembers) return [updatedMember]
            return oldMembers.map(member =>
              member.id === updatedMember.id ? updatedMember : member
            )
          }
        )
      } else if (eventType === 'DELETE') {
        const deletedId = payload.old.id
        queryClient.setQueryData(
          ['members', treeId],
          (oldMembers: FamilyMember[] | undefined) => {
            if (!oldMembers) return []
            return oldMembers.filter(member => member.id !== deletedId)
          }
        )
      }
      break

    case 'relationships':
      if (eventType === 'INSERT') {
        const newRelationship = dbRelationshipToRelationship(payload.new)
        queryClient.setQueryData(
          ['relationships', treeId],
          (oldRelationships: Relationship[] | undefined) => {
            if (!oldRelationships) return [newRelationship]

            // Avoid duplicates
            const exists = oldRelationships.some(rel => rel.id === newRelationship.id)
            return exists ? oldRelationships : [...oldRelationships, newRelationship]
          }
        )
      } else if (eventType === 'DELETE') {
        const deletedId = payload.old.id
        queryClient.setQueryData(
          ['relationships', treeId],
          (oldRelationships: Relationship[] | undefined) => {
            if (!oldRelationships) return []
            return oldRelationships.filter(rel => rel.id !== deletedId)
          }
        )
      }
      break

    case 'activities':
      // For activities, we just invalidate since new activities are added frequently
      queryClient.invalidateQueries({ queryKey: ['activities', treeId] })
      break

    case 'presence':
      // For presence, we just invalidate to get the latest status
      queryClient.invalidateQueries({ queryKey: ['presence', treeId] })
      break
  }
}