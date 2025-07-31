'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center gap-2 font-medium 
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      transform hover:scale-[1.02] active:scale-[0.98]
      shadow-sm hover:shadow-md active:shadow-sm
      rounded-xl border
    `

    const variants = {
      primary: `
        bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
        text-white border-blue-600 hover:border-blue-700
        focus:ring-blue-500 shadow-blue-200/50
      `,
      secondary: `
        bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300
        text-gray-700 hover:text-gray-800 border-gray-300 hover:border-gray-400
        focus:ring-gray-500 shadow-gray-200/50
      `,
      success: `
        bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
        text-white border-green-600 hover:border-green-700
        focus:ring-green-500 shadow-green-200/50
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
        text-white border-red-600 hover:border-red-700
        focus:ring-red-500 shadow-red-200/50
      `,
      ghost: `
        bg-transparent hover:bg-gray-100 active:bg-gray-200
        text-gray-700 hover:text-gray-900 border-transparent
        focus:ring-gray-500 shadow-none hover:shadow-sm
      `,
      outline: `
        bg-white hover:bg-gray-50 active:bg-gray-100
        text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400
        focus:ring-gray-500 shadow-gray-200/30
      `
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-4 py-2 text-sm min-h-[40px]',
      lg: 'px-6 py-3 text-base min-h-[48px]',
      xl: 'px-8 py-4 text-lg min-h-[56px]'
    }

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6'
    }

    const LoadingSpinner = () => (
      <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])}>
        <span className="sr-only">Loading...</span>
      </div>
    )

    const renderIcon = () => {
      if (loading) return <LoadingSpinner />
      if (!icon) return null
      
      return (
        <span className={cn('flex-shrink-0', iconSizes[size])}>
          {icon}
        </span>
      )
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {iconPosition === 'left' && renderIcon()}
        <span className={cn('transition-opacity duration-200', loading && 'opacity-70')}>
          {children}
        </span>
        {iconPosition === 'right' && renderIcon()}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
