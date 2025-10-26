import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useRealtimeCollaboration } from '@/contexts/RealtimeCollaborationContext'
import { useActivities } from '@/hooks/useTreeData'
// Simple date formatting function to avoid date-fns dependency
const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return options?.addSuffix ? 'just now' : 'less than a minute'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return options?.addSuffix ? `${diffInMinutes} minutes ago` : `${diffInMinutes} minutes`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return options?.addSuffix ? `${diffInHours} hours ago` : `${diffInHours} hours`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return options?.addSuffix ? `${diffInDays} days ago` : `${diffInDays} days`
}
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, UserPlus, Edit3, Users, Info, X, CheckCircle } from 'lucide-react'
import { getUserDisplayName, getUserInitials } from '@/hooks/usePresence'

// Activity notification component
interface ActivityNotificationProps {
  activity: any
  onDismiss?: () => void
}

function ActivityNotification({ activity, onDismiss }: ActivityNotificationProps) {
  const controls = useAnimation()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Animate in
    controls.start({
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    })

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = async () => {
    await controls.start({
      x: 100,
      opacity: 0,
      transition: { duration: 0.3 }
    })
    setIsVisible(false)
    onDismiss?.()
  }

  const getIcon = () => {
    switch (activity.type) {
      case 'member_added':
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case 'member_updated':
        return <Edit3 className="h-4 w-4 text-orange-500" />
      case 'relationship_added':
        return <Users className="h-4 w-4 text-green-500" />
      case 'user_joined':
        return <UserPlus className="h-4 w-4 text-purple-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getUserInfo = () => {
    const user = activity.auth_user
    if (!user) return null

    return {
      name: user.raw_user_meta_data?.name || user.email?.split('@')[0] || 'Unknown User',
      email: user.email,
      avatar: user.raw_user_meta_data?.avatar_url,
    }
  }

  const userInfo = getUserInfo()
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={controls}
          exit={{ x: 100, opacity: 0 }}
          className="relative"
        >
          <Card className="w-80 shadow-lg border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">
                      {activity.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  {userInfo && (
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={userInfo.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {getUserInitials(userInfo)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {userInfo.name}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    </div>
                  )}

                  {activity.description && (
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                </div>

                {/* Dismiss button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={handleDismiss}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast notification system
interface RealtimeToastProps {
  treeId: string | null
  maxNotifications?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function RealtimeToast({
  treeId,
  maxNotifications = 3,
  position = 'top-right'
}: RealtimeToastProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const { isConnected } = useRealtimeCollaboration()
  const queryClient = useQueryClient()

  // Listen for activities
  const { data: activities } = useActivities(treeId, 20)

  // Show notifications for new activities
  useEffect(() => {
    if (!activities || activities.length === 0) return

    // Get the most recent activity
    const latestActivity = activities[0]
    const now = new Date()
    const activityTime = new Date(latestActivity.created_at)
    const timeDiff = now.getTime() - activityTime.getTime()

    // Only show notification for very recent activities (within 2 seconds)
    if (timeDiff < 2000 && isConnected) {
      setNotifications(prev => [latestActivity, ...prev].slice(0, maxNotifications))
    }
  }, [activities, isConnected, maxNotifications])

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  if (notifications.length === 0 && !isExpanded) {
    return null
  }

  return (
    <div className={`fixed z-50 space-y-2 ${getPositionClasses()}`}>
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <ActivityNotification
            key={notification.id}
            activity={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </AnimatePresence>

      {/* Clear all button */}
      {notifications.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            className="text-xs"
          >
            Clear all
          </Button>
        </motion.div>
      )}
    </div>
  )
}

// Highlight effect for changed elements
interface HighlightEffectProps {
  isHighlighted: boolean
  children: React.ReactNode
  highlightType?: 'add' | 'update' | 'delete'
  className?: string
}

export function HighlightEffect({
  isHighlighted,
  children,
  highlightType = 'update',
  className = ''
}: HighlightEffectProps) {
  const getHighlightColor = () => {
    switch (highlightType) {
      case 'add':
        return 'border-green-500 bg-green-50/50 dark:bg-green-500/10'
      case 'update':
        return 'border-orange-500 bg-orange-50/50 dark:bg-orange-500/10'
      case 'delete':
        return 'border-red-500 bg-red-50/50 dark:bg-red-500/10'
      default:
        return 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
    }
  }

  return (
    <AnimatePresence>
      {isHighlighted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 rounded-lg border-2 ${getHighlightColor()} pointer-events-none z-10 ${className}`}
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: 3,
              ease: "easeInOut"
            }}
            className={`absolute inset-0 rounded-lg ${getHighlightColor()}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Member highlight wrapper
export function MemberHighlight({
  memberId,
  isHighlighted,
  highlightType,
  children,
  className = ''
}: {
  memberId: string
  isHighlighted: boolean
  highlightType?: 'add' | 'update' | 'delete'
  children: React.ReactNode
  className?: string
}) {
  const [wasHighlighted, setWasHighlighted] = useState(false)

  useEffect(() => {
    if (isHighlighted && !wasHighlighted) {
      setWasHighlighted(true)
      const timer = setTimeout(() => {
        setWasHighlighted(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isHighlighted, wasHighlighted])

  return (
    <div className={`relative ${className}`}>
      {children}
      <HighlightEffect
        isHighlighted={wasHighlighted}
        highlightType={highlightType}
      />
    </div>
  )
}

// Activity feed component
export function ActivityFeed({
  treeId,
  className = ''
}: {
  treeId: string | null
  className?: string
}) {
  const { data: activities, isLoading } = useActivities(treeId, 10)

  if (!treeId || isLoading || !activities || activities.length === 0) {
    return (
      <div className={`text-center text-muted-foreground py-4 ${className}`}>
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Recent Activity</h3>
        <Badge variant="secondary" className="text-xs">
          {activities.length}
        </Badge>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.map((activity, index) => {
          const userInfo = activity.auth_user
          const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {activity.type === 'member_added' && <UserPlus className="h-4 w-4 text-blue-500" />}
                {activity.type === 'member_updated' && <Edit3 className="h-4 w-4 text-orange-500" />}
                {activity.type === 'relationship_added' && <Users className="h-4 w-4 text-green-500" />}
                {activity.type === 'user_joined' && <UserPlus className="h-4 w-4 text-purple-500" />}
                {!['member_added', 'member_updated', 'relationship_added', 'user_joined'].includes(activity.type) && (
                  <Info className="h-4 w-4 text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {userInfo && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={userInfo.raw_user_meta_data?.avatar_url}
                      />
                      <AvatarFallback className="text-[10px]">
                        {getUserInitials({
                          email: userInfo.email,
                          name: userInfo.raw_user_meta_data?.name
                        })}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <p className="text-sm font-medium truncate">
                    {activity.title}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {userInfo && (
                    <span>
                      {userInfo.raw_user_meta_data?.name || userInfo.email?.split('@')[0]}
                    </span>
                  )}
                  <span>•</span>
                  <span>{timeAgo}</span>
                </div>

                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Real-time status indicator
export function RealtimeStatus({
  treeId,
  className = ''
}: {
  treeId: string | null
  className?: string
}) {
  const { isConnected, isPresenceConnected } = useRealtimeCollaboration()

  if (!treeId) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        animate={isConnected && isPresenceConnected ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className={`h-2 w-2 rounded-full ${
          isConnected && isPresenceConnected
            ? 'bg-green-500'
            : 'bg-yellow-500'
        }`} />
      </motion.div>
      <span className="text-xs text-muted-foreground">
        {isConnected && isPresenceConnected ? 'Live' : 'Connecting...'}
      </span>
    </div>
  )
}