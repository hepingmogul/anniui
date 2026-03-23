import { useRef, useState, useEffect } from 'react'
import { Button, Follow } from '../index'
import type { FollowPosition } from '../index'

const placements: FollowPosition[] = [
  'top', 'top-start', 'top-end',
  'right', 'right-start', 'right-end',
  'bottom', 'bottom-start', 'bottom-end',
  'left', 'left-start', 'left-end',
]

export default function FollowPage() {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [placement, setPlacement] = useState<FollowPosition>('bottom')
  const [resultPlacement, setResultPlacement] = useState<string | null>(null)

  useEffect(() => {
    if (!visible || !triggerRef.current || !targetRef.current) return
    const trigger = triggerRef.current
    const target = targetRef.current
    const follow = new Follow(trigger, target, { placement, offset: 10 })
    if (follow.result) {
      Object.assign(target.style, follow.result.css)
      setResultPlacement(follow.result.placement)
    }
  }, [visible, placement])

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Follow 定位
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        根据 trigger 元素位置计算 target 的最佳摆放位置，支持 12 种方位。
      </p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          首选方位（Placement）
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {placements.map((p) => (
            <Button
              key={p}
              variant={placement === p ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPlacement(p)}
            >
              {p}
            </Button>
          ))}
        </div>
        <div className="inline-block">
          <Button
            ref={triggerRef}
            variant="primary"
            onClick={() => setVisible((v) => !v)}
          >
            点击显示弹层
          </Button>
          <div
            ref={targetRef}
            className="absolute z-50 min-w-[140px] py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-surface shadow-lg text-sm"
            style={{
              display: visible ? 'block' : 'none',
              position: 'fixed',
            }}
          >
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              Follow 弹层
            </p>
            {resultPlacement && (
              <p className="text-xs text-neutral-500 mt-1">
                实际: {resultPlacement}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          多 Trigger 示例
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          在不同位置的按钮周围显示定位结果。
        </p>
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        <div className="grid grid-cols-3 gap-8 py-12">
          <FollowDemoCell placement="top" />
          <FollowDemoCell placement="bottom" />
          <FollowDemoCell placement="left" />
          <FollowDemoCell placement="right" />
          <FollowDemoCell placement="top-start" />
          <FollowDemoCell placement="bottom-end" />
        </div>
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      </section>
    </div>
  )
}

function FollowDemoCell({ placement }: { placement: FollowPosition }) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible || !triggerRef.current || !targetRef.current) return
    const follow = new Follow(triggerRef.current, targetRef.current, {
      placement,
      offset: 8,
    })
    if (follow.result) {
      Object.assign(targetRef.current!.style, follow.result.css)
    }
  }, [visible, placement])

  return (
    <div className="flex items-center justify-center min-h-[120px] border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg">
      <Button
        ref={triggerRef}
        variant="secondary"
        size="sm"
        onClick={() => setVisible((v) => !v)}
      >
        {placement}
      </Button>
      <div
        ref={targetRef}
        className="absolute z-40 py-3 px-4 rounded border border-neutral-200 dark:border-neutral-600 bg-surface shadow text-xs min-w-[200px] min-h-[200px]"
        style={{
          display: visible ? 'block' : 'none',
          position: 'fixed',
        }}
      >
        <p className="font-medium">{placement}</p>
        <p className="text-neutral-500 mt-1">用于测试边界情况</p>
      </div>
    </div>
  )
}
