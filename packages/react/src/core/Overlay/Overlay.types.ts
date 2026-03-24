import type { HTMLAttributes, ReactNode } from 'react'

export interface OverlayProps extends HTMLAttributes<HTMLDivElement> {
  zIndex?: number
  children?: ReactNode
}
