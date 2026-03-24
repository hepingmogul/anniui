import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import type { FollowPosition } from '../utils/follow'

export type PopoverType = 'click' | 'hover'

export interface PopoverProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  type?: PopoverType
  placement?: FollowPosition
  offset?: number
  closeDelay?: number
  zIndex?: number
}

export interface PopoverTriggerProps {
  children: ReactElement
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}
