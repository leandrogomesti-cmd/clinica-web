// components/ui/select.tsx
'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

type Opt = { value: string; label: string }

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children?: React.ReactNode
}

export function Select({ className, children, ...props }: SelectProps) {
  const opts: Opt[] = []

  // extrai <SelectItem value="...">Texto</SelectItem> que estiverem dentro de <SelectContent>…
  React.Children.forEach(children as React.ReactNode, (child: any) => {
    if (child?.type?.displayName === 'SelectContent') {
      React.Children.forEach(child.props.children, (item: any) => {
        if (item?.type?.displayName === 'SelectItem') {
          const value = String(item.props.value ?? '')
          const label = String(item.props.children ?? '')
          opts.push({ value, label })
        }
      })
    }
  })

  // placeholder de <SelectValue placeholder="..."/>
  let placeholder: string | undefined
  React.Children.forEach(children as React.ReactNode, (child: any) => {
    if (child?.type?.displayName === 'SelectTrigger') {
      const sv = React.Children.toArray(child.props.children).find(
        (n: any) => n?.type?.displayName === 'SelectValue'
      ) as any
      placeholder = sv?.props?.placeholder
    }
  })

  return (
    <select className={cn('w-full border rounded-xl px-3 py-2', className)} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {opts.map((o, i) => (
        <option key={i} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

// Wrappers “no-op” para manter a mesma API do shadcn nas telas
export function SelectTrigger({ children }: { children?: React.ReactNode }) { return <>{children}</> }
SelectTrigger.displayName = 'SelectTrigger'

export function SelectContent({ children }: { children?: React.ReactNode }) { return <>{children}</> }
SelectContent.displayName = 'SelectContent'

export function SelectItem({ children }: { value: string; children: React.ReactNode }) { return <>{children}</> }
SelectItem.displayName = 'SelectItem'

export function SelectValue({ placeholder }: { placeholder?: string }) { return null }
SelectValue.displayName = 'SelectValue'