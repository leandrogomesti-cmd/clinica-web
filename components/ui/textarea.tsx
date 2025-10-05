// components/ui/textarea.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full border rounded-xl px-3 py-2 min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500/40',
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'