import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

export interface DialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  zIndex?: number
  className?: string
  overlayClassName?: string
  children?: ReactNode
}

export interface DialogSectionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}
