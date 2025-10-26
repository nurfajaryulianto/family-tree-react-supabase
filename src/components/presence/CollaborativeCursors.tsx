import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePresence } from '@/hooks/usePresence'
import { getUserDisplayName, getUserInitials } from '@/hooks/usePresence'
import { cn } from '@/lib/utils'

interface CursorPosition {
  x: number
  y: number
  zoom: number
  member?: string
  element?: string
}

interface CollaborativeCursorsProps {
  treeId: string | null
  containerRef?: React.RefObject<HTMLElement>
  className?: string
}

interface CursorProps {
  user: {
    id: string
    userId: string
    user: {
      email: string
      name?: string
      avatar?: string
    }
    status: string
    cursorPosition: CursorPosition
  }
  containerRef?: React.RefObject<HTMLElement>
}

// Individual cursor component
function Cursor({ user, containerRef }: CursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null)

  // Transform cursor position based on container
  const getTransformedPosition = () => {
    if (!user.cursorPosition || !containerRef?.current) {
      return { x: 0, y: 0 }
    }

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    // Apply zoom transformation
    const zoom = user.cursorPosition.zoom || 1
    const x = (user.cursorPosition.x || 0) * zoom
    const y = (user.cursorPosition.y || 0) * zoom

    return { x, y }
  }

  const position = getTransformedPosition()

  return (
    <motion.div
      ref={cursorRef}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.8 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute pointer-events-none z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Cursor */}
      <div className="relative">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <path
            d="M5 3L21 12L12 13L8 21L5 3Z"
            fill="currentColor"
            className={cn(
              'text-blue-500',
              user.status === 'editing' && 'text-orange-500',
              user.status === 'viewing' && 'text-green-500'
            )}
          />
        </svg>

        {/* User label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-6 left-6 bg-background border border-border rounded-md px-2 py-1 shadow-lg whitespace-nowrap"
        >
          <div className="flex items-center gap-1">
            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
              {getUserInitials(user.user)}
            </div>
            <span className="text-xs font-medium">
              {getUserDisplayName(user.user)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {user.status === 'editing' ? 'Editing' :
             user.status === 'viewing' ? 'Viewing' :
             user.status === 'active' ? 'Active' : 'Idle'}
          </div>
        </motion.div>
      </div>

      {/* Animated pulse effect */}
      {user.status === 'active' && (
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-blue-500/20"
        />
      )}
    </motion.div>
  )
}

// Member highlight indicator
interface MemberHighlightProps {
  memberId: string
  user: {
    user: {
      email: string
      name?: string
      avatar?: string
    }
    status: string
  }
  position: { x: number; y: number }
}

function MemberHighlight({ memberId, user, position }: MemberHighlightProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="absolute pointer-events-none z-40"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Highlight ring */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 0.3, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={cn(
          'w-16 h-16 rounded-full border-2',
          user.status === 'editing' ? 'border-orange-500/60 bg-orange-500/10' :
          user.status === 'viewing' ? 'border-green-500/60 bg-green-500/10' :
          'border-blue-500/60 bg-blue-500/10'
        )}
      />

      {/* User label */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-background border border-border rounded-full px-2 py-1 shadow-lg">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium">
              {getUserInitials(user.user)}
            </div>
            <span className="text-xs font-medium">
              {getUserDisplayName(user.user)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Main collaborative cursors component
export function CollaborativeCursors({
  treeId,
  containerRef,
  className = ''
}: CollaborativeCursorsProps) {
  const { data: presenceUsers } = usePresence(treeId)

  if (!treeId || !presenceUsers || presenceUsers.length === 0) {
    return null
  }

  // Filter out users without cursor position
  const usersWithCursors = presenceUsers.filter(
    user => user.cursorPosition && (user.cursorPosition.x || user.cursorPosition.y)
  )

  // Group users by whether they're looking at a specific member
  const usersWithMemberFocus = usersWithCursors.filter(
    user => user.cursorPosition?.member
  )

  const usersWithFreeCursor = usersWithCursors.filter(
    user => !user.cursorPosition?.member
  )

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      <AnimatePresence>
        {/* Free cursors */}
        {usersWithFreeCursor.map(user => (
          <Cursor
            key={user.id}
            user={user}
            containerRef={containerRef}
          />
        ))}

        {/* Member highlights */}
        {usersWithMemberFocus.map(user => {
          if (!user.cursorPosition?.member || !user.cursorPosition?.x || !user.cursorPosition?.y) {
            return null
          }

          return (
            <MemberHighlight
              key={`member-${user.id}`}
              memberId={user.cursorPosition.member}
              user={user}
              position={{
                x: user.cursorPosition.x,
                y: user.cursorPosition.y
              }}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Hook to manage current user's cursor position
export function useCursorManager(
  treeId: string | null,
  containerRef?: React.RefObject<HTMLElement>
) {
  const { updateStatus } = useUserPresence(treeId)
  const positionRef = useRef({ x: 0, y: 0, zoom: 1, member: undefined })
  const updateTimeoutRef = useRef<NodeJS.Timeout>()

  // Update cursor position
  const updateCursorPosition = useCallback((
    x: number,
    y: number,
    zoom: number = 1,
    memberId?: string
  ) => {
    positionRef.current = { x, y, zoom, member: memberId }

    // Debounce updates to avoid too frequent calls
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateStatus('active', {
        x,
        y,
        zoom,
        member: memberId,
        timestamp: Date.now()
      })
    }, 100)
  }, [updateStatus])

  // Track mouse movement on container
  useEffect(() => {
    if (!containerRef?.current || !treeId) return

    const container = containerRef.current
    let rafId: number

    const handleMouseMove = (event: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        updateCursorPosition(x, y)
      })
    }

    const handleMouseLeave = () => {
      updateCursorPosition(0, 0)
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [containerRef, treeId, updateCursorPosition])

  // Focus on specific member
  const focusOnMember = useCallback((memberId: string, element?: HTMLElement) => {
    if (element && containerRef?.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      const x = elementRect.left + elementRect.width / 2 - containerRect.left
      const y = elementRect.top + elementRect.height / 2 - containerRect.top

      updateCursorPosition(x, y, 1, memberId)
    } else {
      updateCursorPosition(0, 0, 1, memberId)
    }
  }, [containerRef, updateCursorPosition])

  return {
    updateCursorPosition,
    focusOnMember,
  }
}