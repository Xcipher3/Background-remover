'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedContainerProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  stagger?: boolean
}

export function AnimatedContainer({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.3,
  direction = 'fade',
  stagger = false
}: AnimatedContainerProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 20, opacity: 0 }
      case 'down': return { y: -20, opacity: 0 }
      case 'left': return { x: 20, opacity: 0 }
      case 'right': return { x: -20, opacity: 0 }
      default: return { opacity: 0 }
    }
  }

  const getFinalPosition = () => {
    switch (direction) {
      case 'up':
      case 'down': return { y: 0, opacity: 1 }
      case 'left':
      case 'right': return { x: 0, opacity: 1 }
      default: return { opacity: 1 }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger ? 0.1 : 0,
        delayChildren: delay
      }
    }
  }

  const itemVariants = {
    hidden: getInitialPosition(),
    visible: {
      ...getFinalPosition(),
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing
      }
    }
  }

  if (stagger) {
    return (
      <motion.div
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 0.3, className = '' }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

interface SlideInProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.4, 
  className = '' 
}: SlideInProps) {
  const getInitial = () => {
    switch (direction) {
      case 'left': return { x: -50, opacity: 0 }
      case 'right': return { x: 50, opacity: 0 }
      case 'up': return { y: 50, opacity: 0 }
      case 'down': return { y: -50, opacity: 0 }
    }
  }

  return (
    <motion.div
      className={className}
      initial={getInitial()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  )
}

interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function ScaleIn({ children, delay = 0, duration = 0.3, className = '' }: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ 
  children, 
  className = '', 
  staggerDelay = 0.1 
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

interface TabTransitionProps {
  children: ReactNode
  activeKey: string
  className?: string
}

export function TabTransition({ children, activeKey, className = '' }: TabTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        className={className}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
