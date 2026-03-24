import { useState } from 'react'
import { Button, Dialog, DialogBody, DialogClose, DialogFooter, DialogHeader } from '../index'

export default function DialogPage() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Dialog 对话框
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        基于 Overlay 的居中弹层，移动端最小宽度 50vw，PC 最小宽度 md:min-w-sm，最大宽度均为 90vw。
      </p>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          基础用法
        </h2>
        <Button onClick={() => setOpen(true)}>打开 Dialog</Button>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogClose />
        <DialogHeader>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            删除确认
          </h3>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            该操作不可恢复，确认后将永久删除当前数据。
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" outline onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={() => setOpen(false)}>
            确认删除
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
