'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'bars'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-blue-600',
              size === 'sm' ? 'w-2 h-2' : 
              size === 'md' ? 'w-3 h-3' : 
              size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn(
          'rounded-full bg-blue-600',
          sizes[size],
          className
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    )
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'bg-blue-600 rounded-sm',
              size === 'sm' ? 'w-1 h-4' : 
              size === 'md' ? 'w-1.5 h-6' : 
              size === 'lg' ? 'w-2 h-8' : 'w-3 h-12'
            )}
            animate={{
              scaleY: [1, 2, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    )
  }

  // Default spinner
  return (
    <motion.div
      className={cn(
        'border-2 border-gray-200 border-t-blue-600 rounded-full',
        sizes[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  )
}

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({ 
  progress, 
  size = 60, 
  strokeWidth = 4, 
  className 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          className="text-blue-600"
          style={{
            strokeDasharray: circumference,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}

interface ProcessingAnimationProps {
  isProcessing: boolean
  progress?: number
  message?: string
  className?: string
}

export function ProcessingAnimation({ 
  isProcessing, 
  progress, 
  message = 'Processing...', 
  className 
}: ProcessingAnimationProps) {
  if (!isProcessing) return null

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center p-8 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/60',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {progress !== undefined ? (
        <ProgressRing progress={progress} className="mb-4" />
      ) : (
        <LoadingSpinner size="lg" className="mb-4" />
      )}
      
      <motion.p
        className="text-blue-700 font-medium text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
      
      {progress !== undefined && (
        <motion.div
          className="w-full max-w-xs mt-4"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full bg-blue-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
