import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePresence } from '@/hooks/usePresence'
import { formatPresenceStatus, getUserDisplayName, getUserInitials } from '@/hooks/usePresence'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Users, Circle, User } from 'lucide-react'

interface PresenceIndicatorProps {
  treeId: string | null
  maxVisible?: number
  showStatus?: boolean
  className?: string
}

export function PresenceIndicator({
  treeId,
  maxVisible = 3,
  showStatus = false,
  className = ''
}: PresenceIndicatorProps) {
  const { data: presenceUsers, isLoading, error } = usePresence(treeId)

  if (!treeId || isLoading || error || !presenceUsers || presenceUsers.length === 0) {
    return null
  }

  const visibleUsers = presenceUsers.slice(0, maxVisible)
  const hiddenCount = Math.max(0, presenceUsers.length - maxVisible)

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center -space-x-2">
          <AnimatePresence>
            {visibleUsers.map((user, index) => (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    className="relative"
                  >
                    <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-ring/20 hover:ring-ring/40 transition-all">
                      <AvatarImage
                        src={user.user.avatar}
                        alt={getUserDisplayName(user.user)}
                      />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(user.user)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status indicator */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-background ${
                        user.status === 'active'
                          ? 'bg-green-500'
                          : user.status === 'idle'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      <motion.div
                        animate={user.status === 'active' ? {
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1],
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="h-full w-full rounded-full bg-green-500"
                      />
                    </motion.div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {getUserDisplayName(user.user)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatPresenceStatus(user.status, user.lastSeen)}
                    </p>
                    {showStatus && user.cursorPosition && Object.keys(user.cursorPosition).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Viewing: {Object.keys(user.cursorPosition).join(', ')}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </AnimatePresence>

          {/* Hidden users count */}
          {hiddenCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: visibleUsers.length * 0.05 }}
                >
                  <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-ring/20">
                    <AvatarFallback className="text-xs bg-muted">
                      +{hiddenCount}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="space-y-2">
                  <p className="font-medium">
                    {hiddenCount} more {hiddenCount === 1 ? 'person' : 'people'}
                  </p>
                  <div className="space-y-1">
                    {presenceUsers.slice(maxVisible).map(user => (
                      <div key={user.id} className="flex items-center justify-between text-xs">
                        <span>{getUserDisplayName(user.user)}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* User count */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{presenceUsers.length}</span>
        </div>
      </div>
    </TooltipProvider>
  )
}

// Compact presence indicator for small spaces
export function CompactPresenceIndicator({
  treeId,
  className = ''
}: {
  treeId: string | null
  className?: string
}) {
  const { data: presenceUsers, isLoading } = usePresence(treeId)

  if (!treeId || isLoading || !presenceUsers || presenceUsers.length === 0) {
    return null
  }

  const activeUsers = presenceUsers.filter(user => user.status === 'active')
  const count = presenceUsers.length

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <motion.div
        animate={activeUsers.length > 0 ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Users className="h-4 w-4 text-muted-foreground" />
      </motion.div>
      <span className="text-sm text-muted-foreground">{count}</span>
      {activeUsers.length > 0 && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
        </motion.div>
      )}
    </div>
  )
}

// Presence list for sidebar or detailed view
export function PresenceList({
  treeId,
  className = ''
}: {
  treeId: string | null
  className?: string
}) {
  const { data: presenceUsers, isLoading } = usePresence(treeId)

  if (!treeId || isLoading || !presenceUsers || presenceUsers.length === 0) {
    return (
      <div className={`text-center text-muted-foreground py-4 ${className}`}>
        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No one else is here</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Active Now</h3>
        <Badge variant="secondary" className="text-xs">
          {presenceUsers.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {presenceUsers.map(user => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.user.avatar}
                  alt={getUserDisplayName(user.user)}
                />
                <AvatarFallback className="text-xs">
                  {getUserInitials(user.user)}
                </AvatarFallback>
              </Avatar>

              <div className={`absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-background ${
                user.status === 'active'
                  ? 'bg-green-500'
                  : user.status === 'idle'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
              }`} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getUserDisplayName(user.user)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatPresenceStatus(user.status, user.lastSeen)}
              </p>
            </div>

            <Badge variant="outline" className="text-xs">
              {user.status}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  )
}