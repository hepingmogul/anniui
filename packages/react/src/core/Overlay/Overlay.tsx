import { forwardRef, useRef } from 'react'
import { cn } from '../utils/cn'
import type { OverlayProps } from './Overlay.types'

const DEFAULT_Z_INDEX = 2000

let nextZIndex: number | null = null

function getInitialZIndex() {
  if (typeof document === 'undefined') return DEFAULT_Z_INDEX
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--ui-default-zindex').trim()
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : DEFAULT_Z_INDEX
}

function allocateZIndex() {
  if (nextZIndex === null) {
    nextZIndex = getInitialZIndex()
  }

  const current = nextZIndex
  nextZIndex += 1

  return current
}

export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(function Overlay(
  { zIndex, className, style, children, ...rest },
  ref,
) {
  const allocatedZIndex = useRef(allocateZIndex())
  const currentZIndex = zIndex ?? allocatedZIndex.current

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{ zIndex: currentZIndex, ...style }}
      {...rest}
    >
      {children}
    </div>
  )
})
