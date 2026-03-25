import type { ReactNode } from 'react'
import type { FollowPosition } from '../utils/follow'

export type CascaderNodeValue = string | number
export type CascaderPathValue = CascaderNodeValue[]
export type CascaderMultipleValue = CascaderPathValue[]
export type CascaderValue = CascaderPathValue | CascaderMultipleValue | undefined

export interface CascaderOption {
  value: CascaderNodeValue
  name: ReactNode
  children?: CascaderOption[]
  disabled?: boolean
  isLeaf?: boolean
  extra?: unknown
  [key: string]: unknown
}

export interface CascaderRenderOption extends CascaderOption {
  __pathValues: CascaderPathValue
  __pathOptions: CascaderRenderOption[]
  children?: CascaderRenderOption[]
}

export type CascaderShowCheckedStrategy = 'all' | 'parent' | 'leaf'

export interface CascaderProps {
  options: CascaderOption[]
  value?: CascaderValue
  defaultValue?: CascaderValue
  onChange?: (value: CascaderValue, selectedOptions: CascaderRenderOption[] | CascaderRenderOption[][]) => void
  disabled?: boolean
  multiple?: boolean
  checkStrictly?: boolean
  changeOnSelect?: boolean
  allowClear?: boolean
  placeholder?: string
  popupVisible?: boolean
  defaultPopupVisible?: boolean
  onPopupVisibleChange?: (visible: boolean) => void
  placement?: FollowPosition
  offset?: number
  zIndex?: number
  className?: string
  panelClassName?: string
  size?: 'sm' | 'md' | 'lg'
  showSearch?: boolean
  searchDebounce?: number
  onSearch?: (keyword: string) => void
  onRemoteSearch?: (keyword: string) => Promise<CascaderOption[]>
  searchNotFoundContent?: ReactNode
  loadMore?: (option: CascaderRenderOption) => Promise<CascaderOption[] | void>
  onLoadMore?: (option: CascaderRenderOption) => void
  onClear?: () => void
  maxTagCount?: number
  showCheckedStrategy?: CascaderShowCheckedStrategy
  valueKey?: string
  nameKey?: string
  childrenKey?: string
  disabledKey?: string
  isLeafKey?: string
  columnTitleRender?: (level: number, path: CascaderRenderOption[]) => ReactNode
  footerRender?: (params: { selectedPaths: CascaderRenderOption[][] }) => ReactNode
}
