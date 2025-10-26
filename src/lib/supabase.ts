import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper function to check if user is authenticated
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get user's accessible trees
export const getUserTrees = async (userId: string) => {
  const { data, error } = await supabase
    .from('trees')
    .select(`
      *,
      tree_collaborators!inner(
        user_id,
        role
      )
    `)
    .or(`owner_id.eq.${userId},tree_collaborators.user_id.eq.${userId}`)

  if (error) throw error
  return data
}

// Helper function to check if user has access to a tree
export const canAccessTree = async (treeId: string, userId: string, requiredRole: 'viewer' | 'editor' | 'owner' = 'viewer') => {
  // Check if user is owner
  const { data: ownerCheck } = await supabase
    .from('trees')
    .select('id')
    .eq('id', treeId)
    .eq('owner_id', userId)
    .single()

  if (ownerCheck) return { canAccess: true, role: 'owner' as const }

  // Check collaborator access
  const { data: collaboratorCheck } = await supabase
    .from('tree_collaborators')
    .select('role')
    .eq('tree_id', treeId)
    .eq('user_id', userId)
    .single()

  if (!collaboratorCheck) return { canAccess: false, role: null }

  const roleHierarchy = { viewer: 1, editor: 2, owner: 3 }
  const userRoleLevel = roleHierarchy[collaboratorCheck.role as keyof typeof roleHierarchy]
  const requiredRoleLevel = roleHierarchy[requiredRole]

  return {
    canAccess: userRoleLevel >= requiredRoleLevel,
    role: collaboratorCheck.role as 'viewer' | 'editor' | 'owner'
  }
}

// Real-time subscription helpers
export const subscribeToTree = (treeId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`tree-${treeId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trees',
        filter: `id=eq.${treeId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'members',
        filter: `tree_id=eq.${treeId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'relationships',
        filter: `tree_id=eq.${treeId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `tree_id=eq.${treeId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToPresence = (treeId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`presence-${treeId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'presence',
        filter: `tree_id=eq.${treeId}`
      },
      callback
    )
    .subscribe()
}

// Presence management
export const updatePresence = async (treeId: string, userId: string, status: string, cursorPosition?: any) => {
  const { data, error } = await supabase
    .from('presence')
    .upsert({
      tree_id: treeId,
      user_id: userId,
      status,
      cursor_position: cursorPosition || {},
      online_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const removePresence = async (treeId: string, userId: string) => {
  const { error } = await supabase
    .from('presence')
    .delete()
    .eq('tree_id', treeId)
    .eq('user_id', userId)

  if (error) throw error
}

// Activity logging
export const logActivity = async (
  treeId: string,
  userId: string,
  type: 'member_added' | 'member_updated' | 'relationship_added' | 'tree_updated' | 'user_joined',
  title: string,
  description: string,
  metadata?: any
) => {
  const { data, error } = await supabase
    .from('activities')
    .insert({
      tree_id: treeId,
      user_id: userId,
      type,
      title,
      description,
      metadata: metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export default supabase