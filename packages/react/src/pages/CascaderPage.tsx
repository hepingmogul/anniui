import { useMemo, useState } from 'react'
import { Cascader } from '../index'
import type { CascaderOption, CascaderPathValue } from '../index'

const basicOptions: CascaderOption[] = [
  {
    value: 'zj',
    name: '浙江',
    children: [
      {
        value: 'hz',
        name: '杭州',
        children: [
          { value: 'xh', name: '西湖区' },
          { value: 'ys', name: '余杭区' },
        ],
      },
      {
        value: 'nb',
        name: '宁波',
        children: [{ value: 'yx', name: '鄞州区' }],
      },
    ],
  },
  {
    value: 'js',
    name: '江苏',
    children: [
      {
        value: 'nj',
        name: '南京',
        children: [{ value: 'xw', name: '玄武区' }],
      },
    ],
  },
]

const remotePool: CascaderOption[] = [
  {
    value: 'bj',
    name: '北京',
    children: [{ value: 'hd', name: '海淀区' }, { value: 'cy', name: '朝阳区' }],
  },
  {
    value: 'sh',
    name: '上海',
    children: [{ value: 'pd', name: '浦东新区' }, { value: 'mh', name: '闵行区' }],
  },
  {
    value: 'gz',
    name: '广州',
    children: [{ value: 'th', name: '天河区' }, { value: 'by', name: '白云区' }],
  },
]

function createLazyRootOptions(): CascaderOption[] {
  return [
    { value: 'region-east', name: '华东', isLeaf: false },
    { value: 'region-south', name: '华南', isLeaf: false },
  ]
}

export default function CascaderPage() {
  const [singleValue, setSingleValue] = useState<CascaderPathValue | undefined>()
  const [multipleValue, setMultipleValue] = useState<CascaderPathValue[]>([])
  const [remoteValue, setRemoteValue] = useState<CascaderPathValue | undefined>()
  const [lazyOptions] = useState<CascaderOption[]>(() => createLazyRootOptions())
  const [lazyValue, setLazyValue] = useState<CascaderPathValue | undefined>()

  const remoteSearch = async (keyword: string) => {
    await new Promise((resolve) => window.setTimeout(resolve, 300))
    const lower = keyword.trim().toLowerCase()
    if (!lower) return []
    return remotePool.filter((province) => {
      const selfMatch = String(province.name).toLowerCase().includes(lower)
      const childMatch = province.children?.some((city) =>
        String(city.name).toLowerCase().includes(lower),
      )
      return selfMatch || childMatch
    })
  }

  const loadMore = async (option: CascaderOption) => {
    await new Promise((resolve) => window.setTimeout(resolve, 500))

    if (option.value === 'region-east') {
      return [
        { value: 'sd', name: '山东', isLeaf: false },
        { value: 'ah', name: '安徽', isLeaf: false },
      ]
    }
    if (option.value === 'region-south') {
      return [
        { value: 'gd', name: '广东', isLeaf: false },
        { value: 'gx', name: '广西', isLeaf: false },
      ]
    }

    if (option.value === 'sd') {
      return [
        { value: 'jn', name: '济南' },
        { value: 'qd', name: '青岛' },
      ]
    }
    if (option.value === 'ah') {
      return [
        { value: 'hf', name: '合肥' },
        { value: 'wh', name: '芜湖' },
      ]
    }
    if (option.value === 'gd') {
      return [
        { value: 'gz', name: '广州' },
        { value: 'sz', name: '深圳' },
      ]
    }
    if (option.value === 'gx') {
      return [
        { value: 'nn', name: '南宁' },
        { value: 'gl', name: '桂林' },
      ]
    }

    return []
  }

  const summary = useMemo(
    () => ({
      single: singleValue?.join(' / ') ?? '-',
      multiple:
        multipleValue.length > 0 ? multipleValue.map((item) => item.join(' / ')).join('；') : '-',
      remote: remoteValue?.join(' / ') ?? '-',
      lazy: lazyValue?.join(' / ') ?? '-',
    }),
    [lazyValue, multipleValue, remoteValue, singleValue],
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Cascader 级联选择
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        示例包含单选、多选、远程搜索、懒加载四种典型场景。
      </p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          1) 单选
        </h2>
        <div className="max-w-md">
          <Cascader options={basicOptions} value={singleValue} onChange={(val) => setSingleValue(val as CascaderPathValue)} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          2) 多选（复用 Checkbox）
        </h2>
        <div className="max-w-md">
          <Cascader
            options={basicOptions}
            multiple
            value={multipleValue}
            onChange={(val) => setMultipleValue((val as CascaderPathValue[]) ?? [])}
            maxTagCount={2}
            showCheckedStrategy="leaf"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          3) 远程搜索
        </h2>
        <div className="max-w-md">
          <Cascader
            options={basicOptions}
            showSearch
            onRemoteSearch={remoteSearch}
            value={remoteValue}
            onChange={(val) => setRemoteValue(val as CascaderPathValue)}
            searchNotFoundContent="未找到匹配结果"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          4) 懒加载
        </h2>
        <div className="max-w-md">
          <Cascader
            options={lazyOptions}
            loadMore={loadMore}
            value={lazyValue}
            onChange={(val) => setLazyValue(val as CascaderPathValue)}
            changeOnSelect
          />
        </div>
      </section>

      <section className="rounded-md border border-neutral-200 bg-surface p-4 text-sm text-neutral-600 space-y-1">
        <p>当前单选值：{summary.single}</p>
        <p>当前多选值：{summary.multiple}</p>
        <p>当前远程搜索值：{summary.remote}</p>
        <p>当前懒加载值：{summary.lazy}</p>
      </section>
    </div>
  )
}
