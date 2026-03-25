import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '../../test/utils'
import { Cascader } from './Cascader'
import type { CascaderOption } from './Cascader.types'

const options: CascaderOption[] = [
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
    ],
  },
  {
    value: 'js',
    name: '江苏',
    children: [{ value: 'nj', name: '南京' }],
  },
]

function openPanel() {
  const trigger = screen.getByRole('button')
  return userEvent.click(trigger)
}

function getLastCall<T extends (...args: any[]) => any>(fn: T) {
  const calls = (fn as unknown as { mock: { calls: any[][] } }).mock.calls
  return calls[calls.length - 1]
}

describe('Cascader', () => {
  it('单选模式可选择叶子节点并触发 onChange', async () => {
    const onChange = vi.fn()
    render(<Cascader options={options} onChange={onChange} />)

    await openPanel()
    await userEvent.click(screen.getByRole('button', { name: /浙江/ }))
    await userEvent.click(screen.getByRole('button', { name: /杭州/ }))
    await userEvent.click(screen.getByRole('button', { name: /西湖区/ }))

    expect(onChange).toHaveBeenCalled()
    const lastCall = getLastCall(onChange)
    expect(lastCall?.[0]).toEqual(['zj', 'hz', 'xh'])
    expect(screen.getByText('浙江 / 杭州 / 西湖区')).toBeInTheDocument()
  })

  it('changeOnSelect 为 true 时可选择非叶子节点', async () => {
    const onChange = vi.fn()
    render(<Cascader options={options} onChange={onChange} changeOnSelect />)

    await openPanel()
    await userEvent.click(screen.getByRole('button', { name: /浙江/ }))
    const lastCall = getLastCall(onChange)
    expect(lastCall?.[0]).toEqual(['zj'])
  })

  it('多选模式默认父子关联策略生效', async () => {
    const onChange = vi.fn()
    render(<Cascader options={options} multiple onChange={onChange} />)

    await openPanel()
    await userEvent.click(screen.getByRole('button', { name: /浙江/ }))

    const lastCall = getLastCall(onChange)
    expect(lastCall?.[0]).toEqual([
      ['zj', 'hz', 'xh'],
      ['zj', 'hz', 'ys'],
    ])
  })

  it('checkStrictly 为 true 时多选仅勾选当前节点', async () => {
    const onChange = vi.fn()
    render(<Cascader options={options} multiple checkStrictly onChange={onChange} />)

    await openPanel()
    await userEvent.click(screen.getByRole('button', { name: /浙江/ }))

    const lastCall = getLastCall(onChange)
    expect(lastCall?.[0]).toEqual([['zj']])
  })

  it('showSearch 可本地搜索并选择结果', async () => {
    const onChange = vi.fn()
    render(<Cascader options={options} showSearch onChange={onChange} />)

    await openPanel()
    const input = screen.getByPlaceholderText('请选择')
    await userEvent.type(input, '西湖')
    await userEvent.click(screen.getByRole('button', { name: /浙江 \/ 杭州 \/ 西湖区/ }))

    const lastCall = getLastCall(onChange)
    expect(lastCall?.[0]).toEqual(['zj', 'hz', 'xh'])
  })

  it('支持远程搜索', async () => {
    const onRemoteSearch = vi.fn().mockResolvedValue([
      {
        value: 'remote',
        name: '远程省',
        children: [{ value: 'remote-city', name: '远程市' }],
      },
    ])
    render(<Cascader options={options} showSearch onRemoteSearch={onRemoteSearch} />)

    await openPanel()
    const input = screen.getByPlaceholderText('请选择')
    await userEvent.type(input, '远程')

    await waitFor(() => {
      expect(onRemoteSearch).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.getByText('远程省 / 远程市')).toBeInTheDocument()
    })
  })

  it('支持懒加载子节点', async () => {
    const loadMore = vi.fn().mockResolvedValue([{ value: 'dynamic', name: '动态节点' }])
    render(
      <Cascader
        options={[{ value: 'root', name: '根节点', isLeaf: false }]}
        loadMore={loadMore}
      />,
    )

    await openPanel()
    await userEvent.click(screen.getByRole('button', { name: /根节点/ }))

    await waitFor(() => {
      expect(loadMore).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /动态节点/ })).toBeInTheDocument()
    })
  })

  it('allowClear 可清空值并触发 onClear', async () => {
    const onClear = vi.fn()
    const onChange = vi.fn()
    render(
      <Cascader
        options={options}
        value={['zj', 'hz', 'xh']}
        allowClear
        onClear={onClear}
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByLabelText('清空'))
    expect(onClear).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith(undefined, [])
  })
})
