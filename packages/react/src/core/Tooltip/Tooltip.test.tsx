import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '../../test/utils'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('hover 后显示 tooltip 文案', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="提示信息" openDelay={0}>
        <button type="button">触发器</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: '触发器' }))
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByRole('tooltip')).toHaveTextContent('提示信息')
    vi.useRealTimers()
  })

  it('mouseleave 后关闭 tooltip', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="提示信息" openDelay={0} closeDelay={80}>
        <button type="button">触发器</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: '触发器' }))
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.mouseLeave(screen.getByRole('button', { name: '触发器' }))
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('focus 时显示，blur 后关闭', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="焦点提示" openDelay={0} closeDelay={0}>
        <button type="button">键盘触发</button>
      </Tooltip>,
    )

    const trigger = screen.getByRole('button', { name: '键盘触发' })
    fireEvent.focus(trigger)
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByRole('tooltip')).toHaveTextContent('焦点提示')

    fireEvent.blur(trigger)
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('disabled=true 时不展示 tooltip', () => {
    render(
      <Tooltip content="不可见提示" openDelay={0} disabled>
        <button type="button">禁用触发器</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: '禁用触发器' }))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('支持受控模式', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Tooltip content="受控提示" open={false} onOpenChange={onOpenChange}>
        <button type="button">受控触发器</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: '受控触发器' }))
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    rerender(
      <Tooltip content="受控提示" open={true} onOpenChange={onOpenChange}>
        <button type="button">受控触发器</button>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent('受控提示')
    vi.useRealTimers()
  })

  it('按下 Esc 后关闭 tooltip', () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Esc 提示" openDelay={0}>
        <button type="button">Esc触发器</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Esc触发器' }))
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
