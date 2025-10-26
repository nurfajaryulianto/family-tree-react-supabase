# Real-time Collaboration Features Documentation

## Overview

This document describes the comprehensive real-time collaboration features implemented for the family tree application. These features enable multiple users to work together on family trees simultaneously with live updates, presence tracking, and collaborative interactions.

## Features Implemented

### 1. Database Schema with Real-time Support

**Location**: `supabase/migrations/001_initial_schema.sql`

#### Key Tables:
- **`trees`** - Family tree projects with ownership and privacy controls
- **`members`** - Individual family member records
- **`relationships`** - Connections between family members
- **`tree_collaborators`** - User permissions and collaboration management
- **`activities`** - Activity feed for real-time events
- **`presence`** - User presence and cursor tracking

#### Real-time Features:
- **Row-Level Security (RLS)** policies ensuring data privacy
- **Real-time subscriptions** enabled on all collaborative tables
- **Automatic activity logging** through database triggers
- **Presence tracking** with automatic cleanup

### 2. Supabase Client Configuration

**Location**: `src/lib/supabase.ts`

#### Key Features:
- **Type-safe database client** with TypeScript integration
- **Helper functions** for common operations (tree access, user management)
- **Real-time subscription helpers** for easy setup
- **Presence management** functions
- **Activity logging** utilities

### 3. Real-time Subscription Hooks

**Location**: `src/hooks/useRealtimeSubscriptions.ts`

#### Main Hook: `useRealtimeSubscriptions`
- **Automatic connection management** with reconnection logic
- **Event handling** for all table changes (INSERT, UPDATE, DELETE)
- **TanStack Query integration** for cache updates
- **Error handling** and status tracking
- **Presence subscription** support

#### Features:
```typescript
const {
  isConnected,
  reconnect,
  unsubscribe
} = useRealtimeSubscriptions({
  treeId: 'tree-123',
  onMemberChange: (event) => { /* handle changes */ },
  onRelationshipChange: (event) => { /* handle changes */ },
  onError: (error) => { /* handle errors */ }
})
```

### 4. Data Fetching with TanStack Query

**Location**: `src/hooks/useTreeData.ts`

#### Key Hooks:
- **`useTree()`** - Fetch tree information
- **`useMembers()`** - Fetch family members with real-time updates
- **`useRelationships()`** - Fetch relationships with real-time updates
- **`useActivities()`** - Fetch activity feed
- **`usePresence()`** - Fetch active users

#### Mutation Hooks:
- **`useCreateMember()`** - Add new family members
- **`useUpdateMember()`** - Update existing members
- **`useDeleteMember()`** - Remove members
- **`useCreateRelationship()`** - Add relationships
- **`useDeleteRelationship()`** - Remove relationships

#### Optimistic Updates:
All mutations include optimistic updates that instantly update the UI while the server processes the change.

### 5. User Presence Tracking

**Location**: `src/hooks/usePresence.ts`

#### Features:
- **Real-time presence detection** (active, idle, away)
- **Cursor position tracking** for collaborative editing
- **Automatic heartbeat** to maintain online status
- **Member focus tracking** (who's viewing which member)
- **Status formatting** utilities

#### Usage:
```typescript
const {
  updateStatus,
  cleanup,
  isUpdating
} = useUserPresence(treeId)
```

### 6. Presence Indicator Components

**Location**: `src/components/presence/PresenceIndicator.tsx`

#### Components:
- **`PresenceIndicator`** - Show active users with avatars
- **`CompactPresenceIndicator`** - Minimal indicator for small spaces
- **`PresenceList`** - Detailed list of active users

#### Features:
- **User avatars** with initials fallback
- **Status indicators** (active, idle, away)
- **Hover tooltips** with user information
- **Animated entry/exit** effects
- **User count display**

### 7. Collaborative Cursors

**Location**: `src/components/presence/CollaborativeCursors.tsx`

#### Features:
- **Real-time cursor tracking** for all active users
- **Member highlighting** when users focus on specific members
- **Cursor position transformation** based on zoom/pan
- **User labels** with names and status
- **Animated pulse effects** for active users

#### Usage:
```typescript
const {
  updateCursorPosition,
  focusOnMember
} = useCursorManager(treeId, containerRef)
```

### 8. Visual Feedback System

**Location**: `src/components/feedback/RealtimeFeedback.tsx`

#### Components:
- **`RealtimeToast`** - Toast notifications for changes
- **`ActivityFeed`** - Recent activity timeline
- **`HighlightEffect`** - Visual highlight for changed elements
- **`MemberHighlight`** - Highlight wrapper for family members
- **`RealtimeStatus`** - Connection status indicator

#### Features:
- **Auto-dismissing notifications** (5 seconds)
- **Activity timeline** with user attribution
- **Visual highlights** for changes (add/update/delete)
- **Connection status** monitoring
- **Time-based formatting** for activities

### 9. Context Provider

**Location**: `src/contexts/RealtimeCollaborationContext.tsx`

#### Features:
- **Centralized state management** for collaboration
- **Automatic presence management** on mount/unmount
- **Real-time event handling** with cache integration
- **Status monitoring** and reconnection support

## Architecture

### Data Flow

1. **User Action** → Mutation Hook → Database
2. **Database Trigger** → Activity Log → Real-time Event
3. **Real-time Event** → Subscription Hook → Cache Update
4. **Cache Update** → Component Re-render → UI Update

### Security Model

- **Row-Level Security (RLS)** ensures users only see data they have access to
- **Permission-based access** (owner, editor, viewer roles)
- **Tree isolation** prevents cross-tree data leakage
- **User authentication** required for all operations

### Performance Optimizations

- **Optimistic updates** provide instant feedback
- **Debounced cursor tracking** reduces database load
- **Automatic cleanup** of old presence data
- **Efficient cache invalidation** strategies
- **Lazy loading** of activity feeds

## Usage Examples

### Basic Setup

```typescript
import { RealtimeCollaborationProvider } from '@/contexts/RealtimeCollaborationContext'

function App() {
  return (
    <RealtimeCollaborationProvider treeId="your-tree-id">
      <YourFamilyTreeComponent />
    </RealtimeCollaborationProvider>
  )
}
```

### Using Presence Indicators

```typescript
import { PresenceIndicator } from '@/components/presence/PresenceIndicator'

function TreeHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1>Family Tree</h1>
      <PresenceIndicator treeId="tree-123" showStatus={true} />
    </div>
  )
}
```

### Using Collaborative Cursors

```typescript
import { CollaborativeCursors } from '@/components/presence/CollaborativeCursors'

function TreeCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={canvasRef} className="relative">
      <CollaborativeCursors
        treeId="tree-123"
        containerRef={canvasRef}
      />
      {/* Your tree content */}
    </div>
  )
}
```

### Using Real-time Data

```typescript
import { useMembers, useCreateMember } from '@/hooks/useTreeData'

function MemberList() {
  const { data: members, isLoading } = useMembers('tree-123')
  const createMember = useCreateMember()

  const handleAddMember = async (memberData) => {
    await createMember.mutateAsync(memberData)
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {members?.map(member => (
        <div key={member.id}>
          {member.firstName} {member.lastName}
        </div>
      ))}
      <button onClick={() => handleAddMember(/* member data */)}>
        Add Member
      </button>
    </div>
  )
}
```

## Configuration

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Run the migration: `supabase db push`
2. Enable RLS on all tables (included in migration)
3. Configure real-time publication (included in migration)
4. Set up authentication providers as needed

### Presence Cleanup

The system automatically cleans up presence records older than 5 minutes. You can also manually trigger cleanup:

```sql
SELECT cleanup_old_presence();
```

## Troubleshooting

### Common Issues

1. **Real-time updates not working**
   - Check Supabase connection
   - Verify RLS policies
   - Ensure user is authenticated

2. **Presence not showing**
   - Check user authentication
   - Verify tree access permissions
   - Ensure presence subscription is active

3. **Cursor tracking not working**
   - Check container reference
   - Verify mouse event handling
   - Ensure presence updates are being sent

### Debug Mode

Enable debug logging by setting:

```typescript
// In your component
const { isConnected } = useRealtimeSubscriptions({
  treeId: 'tree-123',
  onError: (error) => console.error('Realtime error:', error)
})
```

## Future Enhancements

### Planned Features

1. **Collaborative editing** - Simultaneous editing conflicts resolution
2. **Voice/video chat** - Built-in communication tools
3. **Version history** - Track changes over time
4. **Advanced permissions** - More granular access controls
5. **Offline support** - Sync changes when reconnected
6. **Mobile optimization** - Touch-friendly collaboration
7. **API integrations** - Connect to genealogy services
8. **Advanced search** - Find relatives across trees

### Performance Improvements

1. **Delta compression** for real-time updates
2. **Connection pooling** for high-traffic scenarios
3. **Edge caching** for better global performance
4. **Background sync** for offline changes
5. **Smart preloading** of likely-needed data

## Conclusion

The real-time collaboration features provide a comprehensive foundation for multi-user family tree editing. The system is designed to be:

- **Responsive** - Instant feedback with optimistic updates
- **Reliable** - Robust error handling and reconnection
- **Secure** - Proper data isolation and permissions
- **Scalable** - Efficient data management and cleanup
- **User-friendly** - Intuitive visual feedback and presence indicators

These features enable families to work together on their shared history, making genealogy a collaborative and engaging experience.