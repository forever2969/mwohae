'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-[#FF6B9D] text-white shadow-sm shadow-[#FF6B9D]/30 hover:bg-[#E5427D]',
    secondary: 'bg-[#FFE8F0] text-[#FF6B9D] hover:bg-[#FFD4E8]',
    outline: 'border-2 border-[#FF6B9D] text-[#FF6B9D] bg-transparent hover:bg-[#FFE8F0]',
    ghost: 'text-[#8E8E93] bg-transparent hover:bg-[#F2F2F7]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg w-full',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}
