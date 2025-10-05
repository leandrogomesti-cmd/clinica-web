// components/ui/input.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'