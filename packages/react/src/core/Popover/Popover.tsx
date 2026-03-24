import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { MutableRefObject, MouseEvent as ReactMouseEvent, Ref } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../utils/cn'
import { Follow } from '../utils/follow'
import type { FollowPosition } from '../utils/follow'
import type { PopoverContentProps, PopoverProps, PopoverTriggerProps, PopoverType } from './Popover.types'

const DEFAULT_Z_INDEX = 2000
const DEFAULT_CLOSE_DELAY = 80

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

function composeEventHandlers<E>(
  userHandler: ((event: E) => void) | undefined,
  internalHandler: (event: E) => void,
) {
  return (event: E) => {
    userHandler?.(event)
    internalHandler(event)
  }
}

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  ;(ref as MutableRefObject<T>).current = value
}

interface PopoverContextValue {
  open: boolean
  type: PopoverType
  placement: FollowPosition
  offset: number
  closeDelay: number
  zIndex: number
  triggerElement: HTMLElement | null
  contentElement: HTMLDivElement | null
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  setTriggerElement: (element: HTMLElement | null) => void
  setContentElement: (element: HTMLDivElement | null) => void
  clearCloseTimer: () => void
  scheduleClose: () => void
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function usePopoverContext() {
  const context = useContext(PopoverContext)
  if (!context) {
    throw new Error('Popover components must be used inside <Popover>.')
  }
  return context
}

export function Popover({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  type = 'click',
  placement = 'bottom',
  offset = 10,
  closeDelay = DEFAULT_CLOSE_DELAY,
  zIndex,
}: PopoverProps) {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const allocatedZIndex = useRef<number>(allocateZIndex())
  const resolvedZIndex = zIndex ?? allocatedZIndex.current

  const currentOpen = isControlled ? open : internalOpen

  const setOpen = useCallback((nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }, [isControlled, onOpenChange])

  const toggleOpen = useCallback(() => {
    setOpen(!currentOpen)
  }, [currentOpen, setOpen])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false)
      closeTimerRef.current = null
    }, closeDelay)
  }, [clearCloseTimer, closeDelay, setOpen])

  useEffect(() => {
    return () => {
      clearCloseTimer()
    }
  }, [clearCloseTimer])

  const value = useMemo<PopoverContextValue>(() => ({
    open: currentOpen,
    type,
    placement,
    offset,
    closeDelay,
    zIndex: resolvedZIndex,
    triggerElement,
    contentElement,
    setOpen,
    toggleOpen,
    setTriggerElement,
    setContentElement,
    clearCloseTimer,
    scheduleClose,
  }), [
    clearCloseTimer,
    closeDelay,
    contentElement,
    currentOpen,
    offset,
    placement,
    resolvedZIndex,
    scheduleClose,
    setOpen,
    triggerElement,
    type,
    toggleOpen,
  ])

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
}

export function PopoverTrigger({ children }: PopoverTriggerProps) {
  const {
    type,
    setOpen,
    toggleOpen,
    setTriggerElement,
    clearCloseTimer,
    scheduleClose,
  } = usePopoverContext()

  const child = Children.only(children)
  if (!isValidElement(child)) return null

  const childProps = child.props as {
    onClick?: (event: ReactMouseEvent<HTMLElement>) => void
    onMouseEnter?: (event: ReactMouseEvent<HTMLElement>) => void
    onMouseLeave?: (event: ReactMouseEvent<HTMLElement>) => void
  }
  const childRef = (child as unknown as { ref?: Ref<HTMLElement> }).ref

  return cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      assignRef(childRef, node)
      setTriggerElement(node)
    },
    onClick: composeEventHandlers(childProps.onClick, () => {
      if (type === 'click') {
        toggleOpen()
      }
    }),
    onMouseEnter: composeEventHandlers(childProps.onMouseEnter, () => {
      if (type === 'hover') {
        clearCloseTimer()
        setOpen(true)
      }
    }),
    onMouseLeave: composeEventHandlers(childProps.onMouseLeave, () => {
      if (type === 'hover') {
        scheduleClose()
      }
    }),
  } as Partial<typeof childProps>)
}

export function PopoverContent({
  children,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: PopoverContentProps) {
  const {
    open,
    type,
    placement,
    offset,
    zIndex,
    triggerElement,
    contentElement,
    setOpen,
    setContentElement,
    clearCloseTimer,
    scheduleClose,
  } = usePopoverContext()
  const [followCss, setFollowCss] = useState<Record<string, string | number>>({})

  const updatePosition = useCallback(() => {
    if (!triggerElement || !contentElement) return
    const follow = new Follow(triggerElement, contentElement, { placement, offset })
    if (!follow.result) return
    setFollowCss(follow.result.css)
  }, [contentElement, offset, placement, triggerElement])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const frame = window.requestAnimationFrame(() => {
      updatePosition()
    })
    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const handleViewportChange = () => {
      updatePosition()
    }

    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open || type !== 'click') return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerElement?.contains(target) || contentElement?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [contentElement, open, setOpen, triggerElement, type])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, setOpen])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={setContentElement}
      className={cn(
        'rounded-md border border-neutral-200 bg-white p-3 shadow-lg',
        className,
      )}
      style={{
        position: 'fixed',
        top: -9999,
        left: -9999,
        zIndex,
        ...followCss,
        ...style,
      }}
      onMouseEnter={composeEventHandlers(onMouseEnter, () => {
        if (type === 'hover') {
          clearCloseTimer()
        }
      })}
      onMouseLeave={composeEventHandlers(onMouseLeave, () => {
        if (type === 'hover') {
          scheduleClose()
        }
      })}
      {...rest}
    >
      {children}
    </div>,
    document.body,
  )
}
