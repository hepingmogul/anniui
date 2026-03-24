import { useState } from 'react'
import { Button, Popover, PopoverContent, PopoverTrigger } from '../index'

export default function PopoverPage() {
  const [controlledOpen, setControlledOpen] = useState(false)

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Popover 气泡卡片
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        基于 Follow 定位，支持 click / hover 两种触发，以及受控与非受控模式。
      </p>
      {/* <div className='h-96' /> */}
      {/* <div className='h-96' /> */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          click 触发（默认）
        </h2>
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <Button>点击打开 Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                默认 click 模式
              </p>
              <p className="text-xs text-neutral-500">
                点击触发器切换；点击外部或按 Esc 关闭。
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          hover 触发
        </h2>
        <Popover type="hover" placement="right" closeDelay={120}>
          <PopoverTrigger>
            <Button variant="secondary">移入查看详情</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                hover 模式
              </p>
              <p className="text-xs text-neutral-500">
                鼠标移入打开，移出后延迟关闭，避免触发器与浮层间闪烁。
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </section>

      <section>
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          受控模式（open + onOpenChange）
        </h2>
        <div className="flex items-center gap-3">
          <Popover
            open={controlledOpen}
            onOpenChange={setControlledOpen}
            placement="top"
          >
            <PopoverTrigger>
              <Button variant="ghost">受控 Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  当前状态：{controlledOpen ? '打开' : '关闭'}
                </p>
                <p className="text-xs text-neutral-500">
                  组件内部动作会触发 onOpenChange，最终状态由外部 state 决定。
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="secondary"
            onClick={() => setControlledOpen((v) => !v)}
          >
            外部切换：{controlledOpen ? '关闭' : '打开'}
          </Button>
        </div>
      </section>
      {/* <div className='h-96' /> */}
      {/* <div className='h-96' /> */}
    </div>
  )
}
