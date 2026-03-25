import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '../utils/cn'
import type { CheckboxProps } from './Checkbox.types'

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    indeterminate = false,
    tag = 'span',
    disabled,
    checked,
    defaultChecked = false,
    onChange,
    className,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => innerRef.current!)

  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isChecked = isControlled ? checked : internalChecked
  const isError = ariaInvalid === 'true' || ariaInvalid === true

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked)
    }
    onChange?.(e)
  }

  const showCheck = !indeterminate && isChecked
  const showMinus = indeterminate
  const RootTag = tag

  return (
    <RootTag
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        ref={innerRef}
        type="checkbox"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        aria-invalid={ariaInvalid}
        className="sr-only peer"
        {...props}
      />
      <span
        className={cn(
          'h-4 w-4 rounded flex items-center justify-center border-2 transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-ring peer-focus-visible:ring-offset-1',
          (isChecked || indeterminate)
            ? isError
              ? 'bg-danger border-danger'
              : 'bg-primary border-primary'
            : isError
              ? 'border-danger bg-surface'
              : 'border-neutral-300 bg-surface',
        )}
      >
        {showMinus && <Minus size={10} strokeWidth={3} className="text-white" />}
        {showCheck && <Check size={10} strokeWidth={3} className="text-white" />}
      </span>
    </RootTag>
  )
})
