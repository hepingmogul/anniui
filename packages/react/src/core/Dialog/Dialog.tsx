import { createContext, forwardRef, useContext, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Overlay } from '../Overlay'
import { cn } from '../utils/cn'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { DialogCloseProps, DialogProps, DialogSectionProps } from './Dialog.types'

interface DialogContextValue {
  onOpenChange?: (open: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { open, onOpenChange, zIndex, className, overlayClassName, children },
  ref,
) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange?.(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onOpenChange, open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <Overlay
      zIndex={zIndex}
      className={cn(
        'fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4',
        overlayClassName,
      )}
      onClick={() => onOpenChange?.(false)}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-fit min-w-[50vw] md:min-w-96 max-w-[90vw] rounded-lg border border-neutral-200 bg-white shadow-lg',
          className,
        )}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <DialogContext.Provider value={{ onOpenChange }}>
          {children}
        </DialogContext.Provider>
      </div>
    </Overlay>,
    document.body,
  )
})

export const DialogHeader = forwardRef<HTMLDivElement, DialogSectionProps>(function DialogHeader(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn('px-5 py-4 border-b border-neutral-100', className)} {...props}>
      {children}
    </div>
  )
})

export const DialogBody = forwardRef<HTMLDivElement, DialogSectionProps>(function DialogBody(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
})

export const DialogFooter = forwardRef<HTMLDivElement, DialogSectionProps>(function DialogFooter(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'px-5 py-3 border-t border-neutral-100 bg-neutral-50 rounded-b-lg flex items-center justify-end gap-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { className, children, onClick, ...props },
  ref,
) {
  const context = useContext(DialogContext)

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      context?.onOpenChange?.(false)
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label="关闭对话框"
      className={cn(
        'absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700',
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children ?? <X className="h-4 w-4" aria-hidden="true" />}
    </button>
  )
})
