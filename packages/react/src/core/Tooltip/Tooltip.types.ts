import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react'
import type { FollowPosition } from '../utils/follow'

export interface TooltipProps {
  children: ReactElement
  content: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: FollowPosition
  offset?: number
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
  zIndex?: number
  contentClassName?: string
  contentStyle?: CSSProperties
  contentProps?: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'style' | 'className'>
}
