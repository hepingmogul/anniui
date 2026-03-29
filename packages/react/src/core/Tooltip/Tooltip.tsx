import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { FocusEvent, MouseEvent as ReactMouseEvent, MutableRefObject, Ref } from 'react'
import { createPortal } from 'react-dom'
import { Overlay } from '../Overlay'
import { cn } from '../utils/cn'
import { Follow } from '../utils/follow'
import type { TooltipProps } from './Tooltip.types'

const DEFAULT_OPEN_DELAY = 120
const DEFAULT_CLOSE_DELAY = 80

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

export function Tooltip({
  children,
  content,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'top',
  offset = 8,
  openDelay = DEFAULT_OPEN_DELAY,
  closeDelay = DEFAULT_CLOSE_DELAY,
  disabled = false,
  zIndex,
  contentClassName,
  contentStyle,
  contentProps,
}: TooltipProps) {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null)
  const [followCss, setFollowCss] = useState<Record<string, string | number>>({})
  const timerRef = useRef<number | null>(null)
  const contentId = useId()

  const currentOpen = isControlled ? open : internalOpen

  const setOpen = useCallback((nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }, [isControlled, onOpenChange])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const scheduleOpen = useCallback(() => {
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      setOpen(true)
      timerRef.current = null
    }, openDelay)
  }, [clearTimer, openDelay, setOpen])

  const scheduleClose = useCallback(() => {
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      setOpen(false)
      timerRef.current = null
    }, closeDelay)
  }, [clearTimer, closeDelay, setOpen])

  const updatePosition = useCallback(() => {
    if (!triggerElement || !contentElement) return
    const follow = new Follow(triggerElement, contentElement, { placement, offset })
    if (!follow.result) return
    setFollowCss(follow.result.css)
  }, [contentElement, offset, placement, triggerElement])

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  useEffect(() => {
    if (!disabled) return
    clearTimer()
    setOpen(false)
  }, [clearTimer, disabled, setOpen])

  useLayoutEffect(() => {
    if (!currentOpen || disabled) return
    updatePosition()
    const frame = window.requestAnimationFrame(() => {
      updatePosition()
    })
    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [currentOpen, disabled, updatePosition])

  useEffect(() => {
    if (!currentOpen || disabled) return
    const handleViewportChange = () => {
      updatePosition()
    }

    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [currentOpen, disabled, updatePosition])

  useEffect(() => {
    if (!currentOpen || disabled) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearTimer()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [clearTimer, currentOpen, disabled, setOpen])

  if (!isValidElement(children)) return null

  const childProps = children.props as {
    onMouseEnter?: (event: ReactMouseEvent<HTMLElement>) => void
    onMouseLeave?: (event: ReactMouseEvent<HTMLElement>) => void
    onFocus?: (event: FocusEvent<HTMLElement>) => void
    onBlur?: (event: FocusEvent<HTMLElement>) => void
  }
  const childRef = (children as unknown as { ref?: Ref<HTMLElement> }).ref

  const trigger = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      assignRef(childRef, node)
      setTriggerElement(node)
    },
    'aria-describedby': currentOpen && !disabled ? contentId : undefined,
    onMouseEnter: composeEventHandlers(childProps.onMouseEnter, () => {
      if (disabled) return
      scheduleOpen()
    }),
    onMouseLeave: composeEventHandlers(childProps.onMouseLeave, () => {
      if (disabled) return
      scheduleClose()
    }),
    onFocus: composeEventHandlers(childProps.onFocus, () => {
      if (disabled) return
      scheduleOpen()
    }),
    onBlur: composeEventHandlers(childProps.onBlur, () => {
      if (disabled) return
      scheduleClose()
    }),
  } as Partial<typeof childProps>)

  return (
    <>
      {trigger}
      {currentOpen && !disabled && typeof document !== 'undefined'
        ? createPortal(
            <Overlay
              ref={setContentElement}
              role="tooltip"
              id={contentId}
              zIndex={zIndex}
              className={cn(
                'pointer-events-auto rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs leading-5 text-neutral-700 shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
                contentClassName,
              )}
              style={{
                position: 'fixed',
                top: -9999,
                left: -9999,
                ...followCss,
                ...contentStyle,
              }}
              {...contentProps}
              onMouseEnter={composeEventHandlers(contentProps?.onMouseEnter, () => {
                clearTimer()
              })}
              onMouseLeave={composeEventHandlers(contentProps?.onMouseLeave, () => {
                scheduleClose()
              })}
            >
              {content}
            </Overlay>,
            document.body,
          )
        : null}
    </>
  )
}
