export type Database = {
  public: {
    Tables: {
      trees: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          tree_id: string
          first_name: string
          last_name: string
          birth_name: string | null
          nickname: string | null
          birth_date: string | null
          birth_location: string | null
          death_date: string | null
          death_location: string | null
          is_deceased: boolean
          gender: string | null
          avatar_url: string | null
          bio: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          first_name: string
          last_name: string
          birth_name?: string | null
          nickname?: string | null
          birth_date?: string | null
          birth_location?: string | null
          death_date?: string | null
          death_location?: string | null
          is_deceased?: boolean
          gender?: string | null
          avatar_url?: string | null
          bio?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          first_name?: string
          last_name?: string
          birth_name?: string | null
          nickname?: string | null
          birth_date?: string | null
          birth_location?: string | null
          death_date?: string | null
          death_location?: string | null
          is_deceased?: boolean
          gender?: string | null
          avatar_url?: string | null
          bio?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          tree_id: string
          from_member_id: string
          to_member_id: string
          type: 'parent' | 'child' | 'spouse' | 'sibling'
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          from_member_id: string
          to_member_id: string
          type: 'parent' | 'child' | 'spouse' | 'sibling'
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          from_member_id?: string
          to_member_id?: string
          type?: 'parent' | 'child' | 'spouse' | 'sibling'
          created_by?: string | null
          created_at?: string
        }
      }
      tree_collaborators: {
        Row: {
          id: string
          tree_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          joined_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          tree_id: string
          user_id: string
          type: 'member_added' | 'member_updated' | 'relationship_added' | 'tree_updated' | 'user_joined'
          title: string
          description: string | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          user_id: string
          type: 'member_added' | 'member_updated' | 'relationship_added' | 'tree_updated' | 'user_joined'
          title: string
          description?: string | null
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          user_id?: string
          type?: 'member_added' | 'member_updated' | 'relationship_added' | 'tree_updated' | 'user_joined'
          title?: string
          description?: string | null
          metadata?: any
          created_at?: string
        }
      }
      presence: {
        Row: {
          id: string
          tree_id: string
          user_id: string
          status: string
          cursor_position: any
          last_seen: string
          online_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          user_id: string
          status?: string
          cursor_position?: any
          last_seen?: string
          online_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          user_id?: string
          status?: string
          cursor_position?: any
          last_seen?: string
          online_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'owner' | 'editor' | 'viewer'
      relationship_type: 'parent' | 'child' | 'spouse' | 'sibling'
      notification_type: 'member_added' | 'member_updated' | 'relationship_added' | 'tree_updated' | 'user_joined'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}