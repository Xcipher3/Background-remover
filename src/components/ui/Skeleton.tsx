'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'rectangular' | 'text'
  width?: string | number
  height?: string | number
  animate?: boolean
}

export function Skeleton({ 
  className, 
  variant = 'default', 
  width, 
  height, 
  animate = true 
}: SkeletonProps) {
  const baseStyles = `
    bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]
    ${animate ? 'animate-pulse' : ''}
  `

  const variants = {
    default: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    text: 'rounded-sm h-4'
  }

  const style = {
    width: width || undefined,
    height: height || undefined
  }

  if (animate) {
    return (
      <motion.div
        className={cn(baseStyles, variants[variant], className)}
        style={style}
        initial={{ opacity: 0.6 }}
        animate={{ 
          opacity: [0.6, 1, 0.6],
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    )
  }

  return (
    <div
      className={cn(baseStyles, variants[variant], 'shimmer', className)}
      style={style}
    />
  )
}

interface SkeletonCardProps {
  className?: string
  showAvatar?: boolean
  lines?: number
}

export function SkeletonCard({ className, showAvatar = false, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i}
            variant="text" 
            width={i === lines - 1 ? '70%' : '100%'} 
          />
        ))}
      </div>
    </div>
  )
}

interface SkeletonImageProps {
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait'
}

export function SkeletonImage({ className, aspectRatio = 'video' }: SkeletonImageProps) {
  const aspectRatios = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  }

  return (
    <Skeleton 
      className={cn(
        'w-full',
        aspectRatios[aspectRatio],
        className
      )}
      variant="rectangular"
    />
  )
}

interface SkeletonListProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export function SkeletonList({ items = 3, showAvatar = false, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          {showAvatar && <Skeleton variant="circular" width={48} height={48} />}
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface SkeletonButtonProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SkeletonButton({ className, size = 'md' }: SkeletonButtonProps) {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  }

  return (
    <Skeleton 
      className={cn(sizes[size], 'rounded-lg', className)}
    />
  )
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} variant="text" height={20} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              variant="text" 
              height={16} 
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Loading state for the entire image processor
export function ImageProcessorSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SkeletonButton size="md" />
            <div className="w-px h-6 bg-gray-300" />
            <SkeletonButton size="md" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton width={120} height={40} className="rounded-lg" />
            <SkeletonButton size="lg" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/20">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 p-4">
              <Skeleton width="80%" height={20} className="mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonImage aspectRatio="video" className="rounded-xl" />
        <SkeletonImage aspectRatio="video" className="rounded-xl" />
      </div>
    </div>
  )
}
