import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RealtimeCollaborationProvider, useRealtimeCollaboration } from '@/contexts/RealtimeCollaborationContext'
import { useMembers, useCreateMember, useUpdateMember } from '@/hooks/useTreeData'
import { useUserPresence, useCursorManager } from '@/hooks/usePresence'
import { PresenceIndicator, PresenceList } from '@/components/presence/PresenceIndicator'
import { CollaborativeCursors } from '@/components/presence/CollaborativeCursors'
import { RealtimeToast, ActivityFeed, RealtimeStatus, MemberHighlight } from '@/components/feedback/RealtimeFeedback'
import { FamilyMember } from '@/types/family-tree'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Users,
  Wifi,
  WifiOff,
  Activity,
  UserPlus,
  Edit3,
  Eye,
  Settings,
  TreePine,
  MessageSquare
} from 'lucide-react'

// Create a query client for this demo
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000,
    },
  },
})

// Mock tree ID for demo
const DEMO_TREE_ID = 'demo-tree-123'

function RealtimeCollaborationDemoContent() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [highlightedMembers, setHighlightedMembers] = useState<Set<string>>(new Set())
  const [showCursors, setShowCursors] = useState(true)
  const [showNotifications, setShowNotifications] = useState(true)
  const [newMemberName, setNewMemberName] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  const { isConnected, reconnect } = useRealtimeCollaboration()
  const { data: members, isLoading } = useMembers(DEMO_TREE_ID)
  const createMemberMutation = useCreateMember()
  const updateMemberMutation = useUpdateMember()
  const { updateStatus } = useUserPresence(DEMO_TREE_ID)
  const { updateCursorPosition, focusOnMember } = useCursorManager(DEMO_TREE_ID, canvasRef)

  // Mock data for demonstration
  const mockMembers: FamilyMember[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      treeId: DEMO_TREE_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Doe',
      treeId: DEMO_TREE_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      firstName: 'Robert',
      lastName: 'Doe',
      treeId: DEMO_TREE_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const displayMembers = members || mockMembers

  // Handle adding a new member
  const handleAddMember = async () => {
    if (!newMemberName.trim()) return

    const names = newMemberName.trim().split(' ')
    const firstName = names[0] || 'Unknown'
    const lastName = names.slice(1).join(' ') || 'Person'

    try {
      await createMemberMutation.mutateAsync({
        firstName,
        lastName,
        treeId: DEMO_TREE_ID,
        isDeceased: false,
      })

      // Simulate highlight effect for new member
      const newMemberId = `new-${Date.now()}`
      setHighlightedMembers(prev => new Set(prev).add(newMemberId))
      setTimeout(() => {
        setHighlightedMembers(prev => {
          const next = new Set(prev)
          next.delete(newMemberId)
          return next
        })
      }, 3000)

      setNewMemberName('')
    } catch (error) {
      console.error('Failed to create member:', error)
    }
  }

  // Handle updating a member
  const handleUpdateMember = async (memberId: string, updates: Partial<FamilyMember>) => {
    try {
      await updateMemberMutation.mutateAsync({
        id: memberId,
        ...updates,
      })

      // Highlight updated member
      setHighlightedMembers(prev => new Set(prev).add(memberId))
      setTimeout(() => {
        setHighlightedMembers(prev => {
          const next = new Set(prev)
          next.delete(memberId)
          return next
        })
      }, 3000)
    } catch (error) {
      console.error('Failed to update member:', error)
    }
  }

  // Handle member click
  const handleMemberClick = (memberId: string, element: HTMLElement) => {
    setSelectedMember(memberId)
    focusOnMember(memberId, element)
    updateStatus('viewing', { member: memberId })
  }

  // Simulate real-time updates
  const simulateRealtimeUpdate = (type: 'add' | 'update') => {
    if (type === 'add') {
      const randomId = `sim-${Date.now()}`
      const randomNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward']
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]

      const newMember = {
        id: randomId,
        firstName: randomName,
        lastName: 'Smith',
        treeId: DEMO_TREE_ID,
        isDeceased: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setHighlightedMembers(prev => new Set(prev).add(randomId))
      setTimeout(() => {
        setHighlightedMembers(prev => {
          const next = new Set(prev)
          next.delete(randomId)
          return next
        })
      }, 3000)
    } else {
      const randomMember = displayMembers[Math.floor(Math.random() * displayMembers.length)]
      if (randomMember) {
        setHighlightedMembers(prev => new Set(prev).add(randomMember.id))
        setTimeout(() => {
          setHighlightedMembers(prev => {
            const next = new Set(prev)
            next.delete(randomMember.id)
            return next
          })
        }, 3000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <TreePine className="h-8 w-8 text-blue-600" />
              Real-time Family Tree Collaboration
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Experience live collaboration features with real-time updates, presence tracking, and more.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">Disconnected</span>
                  <Button size="sm" onClick={reconnect}>Reconnect</Button>
                </>
              )}
            </div>

            {/* Presence Indicator */}
            <PresenceIndicator treeId={DEMO_TREE_ID} showStatus={true} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Collaborators & Activity */}
        <div className="lg:col-span-1 space-y-4">
          {/* Collaborators */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaborators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PresenceList treeId={DEMO_TREE_ID} />
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed treeId={DEMO_TREE_ID} />
            </CardContent>
          </Card>
        </div>

        {/* Main Canvas Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Family Tree Canvas</CardTitle>
                  <CardDescription>
                    Click on members to focus, or drag to move around.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <RealtimeStatus treeId={DEMO_TREE_ID} />
                  <Badge variant="outline">
                    {displayMembers.length} members
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Canvas */}
              <div
                ref={canvasRef}
                className="relative h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden"
                onMouseMove={(e) => {
                  if (showCursors) {
                    const rect = canvasRef.current?.getBoundingClientRect()
                    if (rect) {
                      updateCursorPosition(e.clientX - rect.left, e.clientY - rect.top)
                    }
                  }
                }}
              >
                {/* Collaborative Cursors */}
                {showCursors && (
                  <CollaborativeCursors
                    treeId={DEMO_TREE_ID}
                    containerRef={canvasRef}
                  />
                )}

                {/* Family Members */}
                <div className="absolute inset-0 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {displayMembers.map((member, index) => (
                      <MemberHighlight
                        key={member.id}
                        memberId={member.id}
                        isHighlighted={highlightedMembers.has(member.id)}
                        highlightType="update"
                      >
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`
                            relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg
                            border-2 cursor-pointer transition-all
                            ${selectedMember === member.id
                              ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                          `}
                          onClick={(e) => {
                            handleMemberClick(member.id, e.currentTarget)
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {member.firstName[0]}{member.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Click to focus
                              </p>
                            </div>
                            {selectedMember === member.id && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </MemberHighlight>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => simulateRealtimeUpdate('add')}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Simulate Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => simulateRealtimeUpdate('update')}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Simulate Update
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                  <Switch
                    id="show-cursors"
                    checked={showCursors}
                    onCheckedChange={setShowCursors}
                  />
                  <Label htmlFor="show-cursors" className="text-sm">
                    Show Cursors
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-notifications"
                    checked={showNotifications}
                    onCheckedChange={setShowNotifications}
                  />
                  <Label htmlFor="show-notifications" className="text-sm">
                    Notifications
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Actions & Settings */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-member">Add New Member</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="new-member"
                    placeholder="Full name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddMember}
                    disabled={!newMemberName.trim() || createMemberMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedMember && (
                <div className="space-y-2">
                  <Label>Selected Member Actions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleUpdateMember(selectedMember, {
                          firstName: displayMembers.find(m => m.id === selectedMember)?.firstName + ' (Updated)'
                        })
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMember(null)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Collaboration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Live Updates</p>
                  <p className="text-xs text-muted-foreground">
                    Real-time synchronization
                  </p>
                </div>
                <Switch checked={isConnected} disabled />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Presence</p>
                  <p className="text-xs text-muted-foreground">
                    Show active users
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Activity alerts
                  </p>
                </div>
                <Switch
                  checked={showNotifications}
                  onCheckedChange={setShowNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Cursors</p>
                  <p className="text-xs text-muted-foreground">
                    Show user cursors
                  </p>
                </div>
                <Switch
                  checked={showCursors}
                  onCheckedChange={setShowCursors}
                />
              </div>
            </CardContent>
          </Card>

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-sm">Real-time updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <span className="text-sm">Presence tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full" />
                <span className="text-sm">Collaborative cursors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                <span className="text-sm">Activity feed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full" />
                <span className="text-sm">Visual notifications</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real-time Toast Notifications */}
      {showNotifications && (
        <RealtimeToast treeId={DEMO_TREE_ID} />
      )}
    </div>
  )
}

// Main demo component with providers
export function RealtimeCollaborationDemo() {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeCollaborationProvider treeId={DEMO_TREE_ID}>
        <RealtimeCollaborationDemoContent />
      </RealtimeCollaborationProvider>
    </QueryClientProvider>
  )
}