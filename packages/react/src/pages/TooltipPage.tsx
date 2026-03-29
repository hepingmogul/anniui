import { Button, Tooltip } from '../index'

export default function TooltipPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Tooltip 文字提示
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        基于 Overlay 渲染浮层，支持 hover / focus 触发和暗黑模式。
      </p>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          基础用法
        </h2>
        <Tooltip content="这是一段基础提示文字">
          <Button>悬停查看</Button>
        </Tooltip>
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          位置与延迟
        </h2>
        <div className="flex items-center gap-4">
          <Tooltip content="顶部提示" placement="top">
            <Button variant="secondary">Top</Button>
          </Tooltip>
          <Tooltip content="右侧提示" placement="right" openDelay={0}>
            <Button variant="secondary">Right</Button>
          </Tooltip>
          <Tooltip content="底部提示" placement="bottom" closeDelay={150}>
            <Button variant="secondary">Bottom</Button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          自定义内容样式
        </h2>
        <Tooltip
          content="支持自定义 className"
          contentClassName="bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-neutral-200"
        >
          <Button variant="ghost">自定义主题提示</Button>
        </Tooltip>
      </section>
    </div>
  )
}
