import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '../../test/utils'
import { Dialog, DialogBody, DialogClose, DialogFooter, DialogHeader } from './Dialog'

describe('Dialog', () => {
  it('open=false 时不渲染', () => {
    render(<Dialog open={false}>内容</Dialog>)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('open=true 时渲染并包含宽度约束 class', () => {
    render(
      <Dialog open>
        <DialogBody>内容</DialogBody>
      </Dialog>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('min-w-[50vw]')
    expect(dialog.className).toContain('md:min-w-sm')
    expect(dialog.className).toContain('max-w-[90vw]')
  })

  it('点击遮罩会触发关闭，点击内容区不会', () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogBody>内容</DialogBody>
      </Dialog>,
    )

    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(onOpenChange).not.toHaveBeenCalled()

    const overlay = dialog.parentElement as HTMLElement
    fireEvent.click(overlay)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('按 Escape 触发关闭', () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogBody>内容</DialogBody>
      </Dialog>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('zIndex 透传给 Overlay', () => {
    render(
      <Dialog open zIndex={4567}>
        <DialogBody>内容</DialogBody>
      </Dialog>,
    )
    const dialog = screen.getByRole('dialog')
    const overlay = dialog.parentElement as HTMLElement
    expect(overlay.style.zIndex).toBe('4567')
  })

  it('支持 Header/Body/Footer 分区', () => {
    render(
      <Dialog open>
        <DialogHeader>标题</DialogHeader>
        <DialogBody>正文</DialogBody>
        <DialogFooter>底部</DialogFooter>
      </Dialog>,
    )

    expect(screen.getByText('标题')).toBeInTheDocument()
    expect(screen.getByText('正文')).toBeInTheDocument()
    expect(screen.getByText('底部')).toBeInTheDocument()
  })

  it('点击 DialogClose 触发关闭', () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogHeader>
          标题
          <DialogClose />
        </DialogHeader>
        <DialogBody>正文</DialogBody>
      </Dialog>,
    )

    fireEvent.click(screen.getByRole('button', { name: '关闭对话框' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
