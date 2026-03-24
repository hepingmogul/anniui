import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '../../test/utils'

describe('Overlay', () => {
  beforeEach(() => {
    vi.resetModules()
    document.documentElement.style.removeProperty('--ui-default-zindex')
  })

  it('读取 --ui-default-zindex 作为首次层级', async () => {
    document.documentElement.style.setProperty('--ui-default-zindex', '3100')
    const { Overlay } = await import('./Overlay')
    const { container } = render(<Overlay />)
    expect((container.firstChild as HTMLDivElement).style.zIndex).toBe('3100')
  })

  it('未设置 --ui-default-zindex 时回退 2000', async () => {
    const { Overlay } = await import('./Overlay')
    const { container } = render(<Overlay />)
    expect((container.firstChild as HTMLDivElement).style.zIndex).toBe('2000')
  })

  it('连续挂载时 z-index 递增', async () => {
    document.documentElement.style.setProperty('--ui-default-zindex', '4200')
    const { Overlay } = await import('./Overlay')
    const first = render(<Overlay />)
    const second = render(<Overlay />)

    expect((first.container.firstChild as HTMLDivElement).style.zIndex).toBe('4200')
    expect((second.container.firstChild as HTMLDivElement).style.zIndex).toBe('4201')
  })

  it('传入 zIndex 时覆盖自动分配值', async () => {
    document.documentElement.style.setProperty('--ui-default-zindex', '5000')
    const { Overlay } = await import('./Overlay')
    const first = render(<Overlay zIndex={9999} />)
    const second = render(<Overlay />)

    expect((first.container.firstChild as HTMLDivElement).style.zIndex).toBe('9999')
    expect((second.container.firstChild as HTMLDivElement).style.zIndex).toBe('5001')
  })
})
