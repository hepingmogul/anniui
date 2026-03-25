import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'
import { Checkbox } from '../Checkbox'
import { cn } from '../utils/cn'
import type {
  CascaderNodeValue,
  CascaderOption,
  CascaderPathValue,
  CascaderProps,
  CascaderRenderOption,
} from './Cascader.types'

const INPUT_SIZE_CLASSES: Record<NonNullable<CascaderProps['size']>, string> = {
  sm: 'h-7 text-xs px-2',
  md: 'h-9 text-sm px-3',
  lg: 'h-11 text-base px-4',
}

function isPathValue(value: unknown): value is CascaderPathValue {
  return Array.isArray(value) && (value.length === 0 || typeof value[0] !== 'object')
}

function isPathValues(value: unknown): value is CascaderPathValue[] {
  return Array.isArray(value) && (value.length === 0 || Array.isArray(value[0]))
}

function pathToKey(path: CascaderPathValue): string {
  return path.map((item) => String(item)).join('::')
}

function samePath(a: CascaderPathValue, b: CascaderPathValue): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function isPathPrefix(prefix: CascaderPathValue, target: CascaderPathValue): boolean {
  if (prefix.length > target.length) return false
  for (let i = 0; i < prefix.length; i += 1) {
    if (prefix[i] !== target[i]) return false
  }
  return true
}

function normalizeOption(
  option: CascaderOption,
  pathValues: CascaderPathValue,
  pathOptions: CascaderRenderOption[],
  fieldNames: {
    valueKey: string
    nameKey: string
    childrenKey: string
    disabledKey: string
    isLeafKey: string
  },
): CascaderRenderOption {
  const value = option[fieldNames.valueKey] as CascaderNodeValue
  const name = option[fieldNames.nameKey]
  const childrenRaw = option[fieldNames.childrenKey] as CascaderOption[] | undefined
  const disabled = Boolean(option[fieldNames.disabledKey])
  const isLeaf = Boolean(option[fieldNames.isLeafKey])

  const nextPathValues = [...pathValues, value]
  const next: CascaderRenderOption = {
    ...option,
    value,
    name: name as CascaderRenderOption['name'],
    disabled,
    isLeaf,
    __pathValues: nextPathValues,
    __pathOptions: pathOptions,
    children: undefined,
  }

  const nextPathOptions = [...pathOptions, next]
  if (Array.isArray(childrenRaw) && childrenRaw.length > 0) {
    next.children = childrenRaw.map((child) => normalizeOption(child, nextPathValues, nextPathOptions, fieldNames))
  }
  return next
}

function flattenTreeToLeafPaths(options: CascaderRenderOption[]): CascaderRenderOption[][] {
  const result: CascaderRenderOption[][] = []
  const walk = (nodes: CascaderRenderOption[], stack: CascaderRenderOption[]) => {
    nodes.forEach((node) => {
      const nextStack = [...stack, node]
      if (!node.children || node.children.length === 0 || node.isLeaf) {
        result.push(nextStack)
        return
      }
      walk(node.children, nextStack)
    })
  }
  walk(options, [])
  return result
}

function findOptionPathByValues(options: CascaderRenderOption[], values: CascaderPathValue): CascaderRenderOption[] | null {
  let current: CascaderRenderOption[] = options
  const path: CascaderRenderOption[] = []
  for (const value of values) {
    const found = current.find((item) => item.value === value)
    if (!found) return null
    path.push(found)
    current = found.children ?? []
  }
  return path
}

function collectDescendantLeafPaths(node: CascaderRenderOption): CascaderPathValue[] {
  if (!node.children || node.children.length === 0 || node.isLeaf) {
    return [node.__pathValues]
  }
  const paths: CascaderPathValue[] = []
  node.children.forEach((child) => {
    paths.push(...collectDescendantLeafPaths(child))
  })
  return paths
}

function removeDuplicatePaths(paths: CascaderPathValue[]): CascaderPathValue[] {
  const map = new Map<string, CascaderPathValue>()
  paths.forEach((path) => {
    map.set(pathToKey(path), path)
  })
  return [...map.values()]
}

function compressParentPaths(paths: CascaderPathValue[]): CascaderPathValue[] {
  const unique = removeDuplicatePaths(paths)
  return unique.filter((path) => !unique.some((other) => other !== path && isPathPrefix(other, path)))
}

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [delay, value])
  return debounced
}

function getPathDisplayLabel(path: CascaderRenderOption[]): string {
  return path
    .map((node) => {
      if (typeof node.name === 'string' || typeof node.name === 'number') {
        return String(node.name)
      }
      return String(node.value)
    })
    .join(' / ')
}

export function Cascader({
  options,
  value,
  defaultValue,
  onChange,
  disabled = false,
  multiple = false,
  checkStrictly = false,
  changeOnSelect = false,
  allowClear = false,
  placeholder = '请选择',
  popupVisible,
  defaultPopupVisible,
  onPopupVisibleChange,
  placement = 'bottom-start',
  offset = 10,
  zIndex,
  className,
  panelClassName,
  size = 'md',
  showSearch = false,
  searchDebounce = 200,
  onSearch,
  onRemoteSearch,
  searchNotFoundContent = '无匹配项',
  loadMore,
  onLoadMore,
  onClear,
  maxTagCount = 2,
  showCheckedStrategy = 'all',
  valueKey = 'value',
  nameKey = 'name',
  childrenKey = 'children',
  disabledKey = 'disabled',
  isLeafKey = 'isLeaf',
  columnTitleRender,
  footerRender,
}: CascaderProps) {
  const isValueControlled = value !== undefined
  const [innerValue, setInnerValue] = useState(value ?? defaultValue)
  const currentValue = isValueControlled ? value : innerValue
  const isPopupControlled = popupVisible !== undefined
  const [innerPopup, setInnerPopup] = useState(defaultPopupVisible ?? false)
  const currentPopup = isPopupControlled ? popupVisible : innerPopup

  const mappedOptions = useMemo(() => {
    return options.map((item) =>
      normalizeOption(item, [], [], { valueKey, nameKey, childrenKey, disabledKey, isLeafKey }),
    )
  }, [childrenKey, disabledKey, isLeafKey, nameKey, options, valueKey])

  const [innerOptions, setInnerOptions] = useState(mappedOptions)
  useEffect(() => {
    setInnerOptions(mappedOptions)
  }, [mappedOptions])

  const singleValue = useMemo<CascaderPathValue | undefined>(() => {
    if (multiple) return undefined
    if (isPathValue(currentValue)) return currentValue
    return undefined
  }, [currentValue, multiple])

  const multipleValue = useMemo<CascaderPathValue[]>(() => {
    if (!multiple) return []
    if (isPathValues(currentValue)) return removeDuplicatePaths(currentValue)
    return []
  }, [currentValue, multiple])

  const [activePath, setActivePath] = useState<CascaderPathValue>(singleValue ?? [])
  useEffect(() => {
    if (!multiple) {
      setActivePath(singleValue ?? [])
      return
    }
    if (multipleValue.length > 0) {
      setActivePath(multipleValue[0])
    }
  }, [multiple, multipleValue, singleValue])

  const selectedPaths = useMemo<CascaderRenderOption[][]>(() => {
    if (multiple) {
      return multipleValue
        .map((path) => findOptionPathByValues(innerOptions, path))
        .filter((path): path is CascaderRenderOption[] => Boolean(path))
    }
    if (!singleValue) return []
    const path = findOptionPathByValues(innerOptions, singleValue)
    return path ? [path] : []
  }, [innerOptions, multiple, multipleValue, singleValue])

  const selectedPathValues = useMemo(() => selectedPaths.map((path) => path.map((item) => item.value)), [selectedPaths])

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, searchDebounce)
  const [remoteSearchOptions, setRemoteSearchOptions] = useState<CascaderOption[] | null>(null)
  const [remoteSearching, setRemoteSearching] = useState(false)
  const searchSeqRef = useRef(0)

  useEffect(() => {
    if (!showSearch) return
    onSearch?.(searchInput)
  }, [onSearch, searchInput, showSearch])

  useEffect(() => {
    if (!showSearch || !onRemoteSearch) {
      setRemoteSearchOptions(null)
      setRemoteSearching(false)
      return
    }
    const keyword = debouncedSearch.trim()
    if (!keyword) {
      setRemoteSearchOptions(null)
      setRemoteSearching(false)
      return
    }
    const requestId = searchSeqRef.current + 1
    searchSeqRef.current = requestId
    setRemoteSearching(true)
    onRemoteSearch(keyword)
      .then((result) => {
        if (searchSeqRef.current !== requestId) return
        setRemoteSearchOptions(result)
      })
      .catch(() => {
        if (searchSeqRef.current !== requestId) return
        setRemoteSearchOptions([])
      })
      .finally(() => {
        if (searchSeqRef.current !== requestId) return
        setRemoteSearching(false)
      })
  }, [debouncedSearch, onRemoteSearch, showSearch])

  const searchOptions = useMemo(() => {
    if (onRemoteSearch && remoteSearchOptions) {
      return remoteSearchOptions.map((item) =>
        normalizeOption(item, [], [], { valueKey, nameKey, childrenKey, disabledKey, isLeafKey }),
      )
    }
    return innerOptions
  }, [childrenKey, disabledKey, innerOptions, isLeafKey, nameKey, onRemoteSearch, remoteSearchOptions, valueKey])

  const flatLeafPaths = useMemo(() => flattenTreeToLeafPaths(searchOptions), [searchOptions])

  const searchResults = useMemo(() => {
    const keyword = searchInput.trim().toLowerCase()
    if (!showSearch || !keyword) return []
    return flatLeafPaths.filter((path) =>
      path.some((node) => String(node.name).toLowerCase().includes(keyword)),
    )
  }, [flatLeafPaths, searchInput, showSearch])

  const [loadingPathKeys, setLoadingPathKeys] = useState<Set<string>>(new Set())
  const [loadErrorPathKeys, setLoadErrorPathKeys] = useState<Set<string>>(new Set())

  const updateValue = useCallback(
    (nextValue: CascaderPathValue | CascaderPathValue[] | undefined, paths: CascaderRenderOption[][]) => {
      if (!isValueControlled) {
        setInnerValue(nextValue)
      }
      const selectedOptions = multiple ? paths : (paths[0] ?? [])
      onChange?.(nextValue, selectedOptions)
    },
    [isValueControlled, multiple, onChange],
  )

  const setNodeChildren = useCallback(
    (targetPath: CascaderPathValue, children: CascaderOption[]) => {
      const normalizedChildren = children.map((item) =>
        normalizeOption(item, targetPath, [], { valueKey, nameKey, childrenKey, disabledKey, isLeafKey }),
      )
      const patch = (nodes: CascaderRenderOption[]): CascaderRenderOption[] =>
        nodes.map((node) => {
          if (samePath(node.__pathValues, targetPath)) {
            const basePath = node.__pathOptions
            const mapped = children.map((item) => normalizeOption(item, targetPath, [...basePath, node], {
              valueKey,
              nameKey,
              childrenKey,
              disabledKey,
              isLeafKey,
            }))
            return {
              ...node,
              children: mapped,
              isLeaf: false,
            }
          }
          if (!node.children || node.children.length === 0) return node
          return { ...node, children: patch(node.children) }
        })
      setInnerOptions((prev) => patch(prev))
      return normalizedChildren
    },
    [childrenKey, disabledKey, isLeafKey, nameKey, valueKey],
  )

  const maybeLoadChildren = useCallback(
    async (node: CascaderRenderOption) => {
      if (!loadMore) return
      if (node.isLeaf || (node.children && node.children.length > 0)) return
      const key = pathToKey(node.__pathValues)
      if (loadingPathKeys.has(key)) return

      setLoadingPathKeys((prev) => new Set(prev).add(key))
      setLoadErrorPathKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
      onLoadMore?.(node)
      try {
        const children = await loadMore(node)
        if (children && children.length > 0) {
          setNodeChildren(node.__pathValues, children)
        }
      } catch {
        setLoadErrorPathKeys((prev) => new Set(prev).add(key))
      } finally {
        setLoadingPathKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }
    },
    [loadErrorPathKeys, loadMore, loadingPathKeys, onLoadMore, setNodeChildren],
  )

  const columns = useMemo(() => {
    const result: CascaderRenderOption[][] = []
    let current = innerOptions
    result.push(current)
    for (const valueItem of activePath) {
      const found = current.find((item) => item.value === valueItem)
      if (!found || !found.children || found.children.length === 0) break
      current = found.children
      result.push(current)
    }
    return result
  }, [activePath, innerOptions])

  const [triggerLabel, setTriggerLabel] = useState('')
  useEffect(() => {
    if (multiple) return
    const selected = selectedPaths[0]
    if (!selected) {
      setTriggerLabel('')
      return
    }
    setTriggerLabel(getPathDisplayLabel(selected))
  }, [multiple, selectedPaths])

  const displayMultiplePaths = useMemo(() => {
    if (!multiple) return []
    if (showCheckedStrategy === 'all') return selectedPathValues
    if (showCheckedStrategy === 'leaf') {
      return selectedPathValues.filter((path) => {
        const optionPath = findOptionPathByValues(innerOptions, path)
        const node = optionPath?.[optionPath.length - 1]
        return Boolean(node) && (!node?.children || node.children.length === 0 || node.isLeaf)
      })
    }
    return compressParentPaths(selectedPathValues)
  }, [innerOptions, multiple, selectedPathValues, showCheckedStrategy])

  const hiddenCount = Math.max(displayMultiplePaths.length - maxTagCount, 0)
  const visibleMultiplePaths = displayMultiplePaths.slice(0, maxTagCount)

  const closePopup = useCallback(() => {
    if (!isPopupControlled) {
      setInnerPopup(false)
    }
    onPopupVisibleChange?.(false)
  }, [isPopupControlled, onPopupVisibleChange])

  const handleSelectSingle = useCallback(
    (path: CascaderRenderOption[]) => {
      const nextValue = path.map((item) => item.value)
      updateValue(nextValue, [path])
      if (!changeOnSelect || !path[path.length - 1]?.children?.length) {
        closePopup()
      }
      setSearchInput('')
    },
    [changeOnSelect, closePopup, updateValue],
  )

  const toggleMultiplePath = useCallback(
    (path: CascaderRenderOption[]) => {
      const target = path[path.length - 1]
      if (!target) return
      const targetPath = target.__pathValues
      let next = [...multipleValue]

      if (checkStrictly) {
        const exists = next.some((item) => samePath(item, targetPath))
        next = exists ? next.filter((item) => !samePath(item, targetPath)) : [...next, targetPath]
      } else {
        const descLeafPaths = collectDescendantLeafPaths(target)
        const shouldSelect = descLeafPaths.some((leaf) => !next.some((item) => samePath(item, leaf)))
        if (shouldSelect) {
          next = removeDuplicatePaths([...next, ...descLeafPaths])
        } else {
          next = next.filter((item) => !descLeafPaths.some((leaf) => samePath(item, leaf)))
        }
      }

      const optionPaths = next
        .map((pathValue) => findOptionPathByValues(innerOptions, pathValue))
        .filter((item): item is CascaderRenderOption[] => Boolean(item))
      updateValue(next, optionPaths)
    },
    [checkStrictly, innerOptions, multipleValue, updateValue],
  )

  const clearValue = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      if (disabled) return
      const nextValue = multiple ? [] : undefined
      updateValue(nextValue, [])
      onClear?.()
      setSearchInput('')
    },
    [disabled, multiple, onClear, updateValue],
  )

  const renderNodeLabel = useCallback((name: CascaderRenderOption['name']) => {
    if (typeof name === 'string' || typeof name === 'number') return name
    return name
  }, [])

  const renderColumn = (columnOptions: CascaderRenderOption[], level: number) => {
    if (columnOptions.length === 0) return null
    const titlePath = selectedPaths[0]?.slice(0, level) ?? []
    return (
      <div key={`column-${level}`} className="w-fit max-w-60 max-h-64 overflow-auto border-r border-neutral-100 last:border-r-0">
        {columnTitleRender && (
          <div className="px-3 py-2 text-xs text-neutral-500 border-b border-neutral-100">
            {columnTitleRender(level, titlePath)}
          </div>
        )}
        <ul role="listbox" className="py-1">
          {columnOptions.map((option) => {
            const nodePath = option.__pathOptions
            const isActive = option.__pathValues[level] === activePath[level]
            const isSingleSelected = !multiple && Boolean(singleValue && isPathPrefix(option.__pathValues, singleValue))
            const hasChildren = Boolean(option.children && option.children.length > 0)
            const key = pathToKey(option.__pathValues)
            const loading = loadingPathKeys.has(key)
            const hasError = loadErrorPathKeys.has(key)

            let checked = false
            let indeterminate = false
            if (multiple) {
              if (checkStrictly) {
                checked = multipleValue.some((pathValue) => samePath(pathValue, option.__pathValues))
              } else {
                const leafPaths = collectDescendantLeafPaths(option)
                const selectedCount = leafPaths.filter((leafPath) =>
                  multipleValue.some((pathValue) => samePath(pathValue, leafPath)),
                ).length
                checked = selectedCount > 0 && selectedCount === leafPaths.length
                indeterminate = selectedCount > 0 && selectedCount < leafPaths.length
              }
            }

            return (
              <li key={key}>
                <button
                  type="button"
                  disabled={disabled || option.disabled}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                    isSingleSelected
                      ? 'bg-neutral-100 text-neutral-900'
                      : isActive
                        ? 'bg-primary-50 text-primary'
                        : 'hover:bg-neutral-50',
                    (disabled || option.disabled) && 'opacity-50 cursor-not-allowed',
                  )}
                  onClick={() => {
                    if (disabled || option.disabled) return
                    setActivePath(option.__pathValues)
                    if (loadMore) {
                      void maybeLoadChildren(option)
                    }
                    if (multiple) {
                      toggleMultiplePath([...nodePath, option])
                      return
                    }
                    const path = [...nodePath, option]
                    const canLazyLoad = Boolean(loadMore && !option.isLeaf && !hasChildren)
                    const canSelect = changeOnSelect || option.isLeaf || (!hasChildren && !canLazyLoad)
                    if (canSelect) {
                      handleSelectSingle(path)
                    }
                  }}
                >
                  {multiple && (
                    <Checkbox
                      checked={checked}
                      indeterminate={indeterminate}
                      disabled={disabled || option.disabled}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => {
                        if (disabled || option.disabled) return
                        toggleMultiplePath([...nodePath, option])
                      }}
                    />
                  )}
                  <span className="flex-1 truncate">{renderNodeLabel(option.name)}</span>
                  {loading && <span className="text-xs text-neutral-400">加载中...</span>}
                  {hasError && (
                    <span
                      className="text-xs text-danger"
                      onClick={(event) => {
                        event.stopPropagation()
                        void maybeLoadChildren(option)
                      }}
                    >
                      重试
                    </span>
                  )}
                  {!loading && (hasChildren || (!option.isLeaf && loadMore)) ? <ChevronRight size={14} /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  const hasValue = multiple ? multipleValue.length > 0 : Boolean(singleValue && singleValue.length > 0)

  return (
    <Popover
      open={disabled ? false : currentPopup}
      onOpenChange={(open) => {
        if (disabled) return
        if (!isPopupControlled) {
          setInnerPopup(open)
        }
        onPopupVisibleChange?.(open)
        if (!open) {
          setSearchInput('')
        }
      }}
      placement={placement}
      offset={offset}
      zIndex={zIndex}
      type="click"
    >
      <PopoverTrigger>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-full border border-neutral-300 rounded-md flex items-center gap-2 bg-surface',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:ring-offset-1',
            disabled && 'cursor-not-allowed opacity-60 bg-neutral-50',
            INPUT_SIZE_CLASSES[size],
            className,
          )}
          aria-haspopup="listbox"
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && allowClear && hasValue) {
              const nextValue = multiple ? [] : undefined
              updateValue(nextValue, [])
              onClear?.()
            }
          }}
        >
          <span className="flex-1 min-w-0 text-left">
            {showSearch ? (
              <span className="inline-flex items-center w-full gap-2">
                <Search size={14} className="text-neutral-400" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  disabled={disabled}
                  placeholder={placeholder}
                  className="w-full bg-transparent outline-none"
                  onClick={(event) => event.stopPropagation()}
                />
              </span>
            ) : multiple ? (
              hasValue ? (
                <span className="inline-flex items-center gap-1 flex-wrap">
                  {visibleMultiplePaths.map((path) => (
                    <span
                      key={pathToKey(path)}
                      className="inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 text-xs"
                    >
                      {getPathDisplayLabel(findOptionPathByValues(innerOptions, path) ?? [])}
                    </span>
                  ))}
                  {hiddenCount > 0 ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 text-xs">
                      +{hiddenCount}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="text-neutral-400">{placeholder}</span>
              )
            ) : triggerLabel ? (
              <span className="truncate">{triggerLabel}</span>
            ) : (
              <span className="text-neutral-400">{placeholder}</span>
            )}
          </span>

          {allowClear && hasValue && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="清空"
              onClick={clearValue}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  clearValue(event as unknown as React.MouseEvent)
                }
              }}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <X size={14} />
            </span>
          ) : null}
          <ChevronDown size={14} className="text-neutral-400" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        role="dialog"
        className={cn('p-0 overflow-hidden w-fit', panelClassName)}
        onClick={(event) => event.stopPropagation()}
      >
        {showSearch && searchInput.trim() ? (
          <div className="max-h-80 overflow-auto py-1">
            {remoteSearching ? (
              <div className="px-3 py-6 text-sm text-neutral-500 text-center">搜索中...</div>
            ) : searchResults.length === 0 ? (
              <div className="px-3 py-6 text-sm text-neutral-500 text-center">{searchNotFoundContent}</div>
            ) : (
              <ul role="listbox">
                {searchResults.map((path) => {
                  const pathValues = path.map((item) => item.value)
                  const key = pathToKey(pathValues)
                  const selected = multiple
                    ? multipleValue.some((item) => samePath(item, pathValues))
                    : samePath(singleValue ?? [], pathValues)
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-neutral-50',
                          selected && 'text-primary bg-primary-50',
                        )}
                        onClick={() => {
                          if (multiple) {
                            toggleMultiplePath(path)
                            return
                          }
                          handleSelectSingle(path)
                        }}
                      >
                        <span className="truncate">{getPathDisplayLabel(path)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex items-stretch">
            {columns
              .filter((column) => column.length > 0)
              .map((column, index) => renderColumn(column, index))}
          </div>
        )}

        {footerRender ? (
          <div className="border-t border-neutral-100 px-3 py-2">{footerRender({ selectedPaths })}</div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
