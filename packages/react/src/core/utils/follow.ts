/** 合法位置：trigger 相对 target 的方位 */
export type FollowPosition =
  | 'top' | 'top-start' | 'top-end'
  | 'right' | 'right-start' | 'right-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'

/** Follow 配置项 */
export interface FollowOptions {
  /** 首选位置，默认 'bottom' */
  placement?: FollowPosition
  /** 与 trigger 的偏移距离（像素），默认 10 */
  offset?: number
}

/** Follow 计算结果 */
export interface FollowResult {
  placement: FollowPosition
  css: Record<string, string | number>
}

type PlacementItem = { placement: FollowPosition; css: Record<string, number> }

class Follow {
  readonly result: FollowResult | null

  constructor(eleTrigger: any, eleTarget: any, options?: FollowOptions | null) {
    const placement = options?.placement ?? 'bottom'
    const offset = options?.offset ?? 10

    const ww = window.innerWidth
    const wh = window.innerHeight
    const referenceRect = eleTrigger.getBoundingClientRect()
    const contentRect = eleTarget.getBoundingClientRect()
    const contentW = contentRect.width
    const contentH = contentRect.height
    const offsetContentW = contentW + offset
    const offsetContentH = contentH + offset
    const placements: PlacementItem[] = []

    if (referenceRect.top > offsetContentH) {
      const top = referenceRect.top - offsetContentH
      if (ww - referenceRect.left > contentW) {
        placements.push({ placement: 'top-start', css: { top, left: referenceRect.left } })
      }
      if (
        referenceRect.width / 2 + referenceRect.left > contentW / 2 &&
        ww - (referenceRect.left + referenceRect.width / 2) > contentW / 2
      ) {
        placements.push({
          placement: 'top',
          css: {
            top,
            left: referenceRect.left + referenceRect.width / 2 - contentW / 2,
          },
        })
      }
      if (referenceRect.right > contentW) {
        placements.push({
          placement: 'top-end',
          css: { top, left: referenceRect.right - contentW },
        })
      }
    }

    if (ww - referenceRect.right > offsetContentW) {
      const left = referenceRect.right + offset
      if (wh - referenceRect.top > contentH) {
        placements.push({ placement: 'right-start', css: { top: referenceRect.top, left } })
      }
      if (
        referenceRect.top + referenceRect.height / 2 > contentH / 2 &&
        wh - (referenceRect.top + referenceRect.height / 2) > contentH / 2
      ) {
        placements.push({
          placement: 'right',
          css: {
            top: referenceRect.top + referenceRect.height / 2 - contentH / 2,
            left,
          },
        })
      }
      if (referenceRect.bottom > contentH) {
        placements.push({
          placement: 'right-end',
          css: { top: referenceRect.bottom - contentH, left },
        })
      }
    }

    if (wh - referenceRect.bottom > offsetContentH) {
      const top = referenceRect.bottom + offset
      if (ww - referenceRect.left > contentW) {
        placements.push({ placement: 'bottom-start', css: { top, left: referenceRect.left } })
      }
      if (
        referenceRect.width / 2 + referenceRect.left > contentW / 2 &&
        ww - (referenceRect.left + referenceRect.width / 2) > contentW / 2
      ) {
        placements.push({
          placement: 'bottom',
          css: {
            top,
            left: referenceRect.left + referenceRect.width / 2 - contentW / 2,
          },
        })
      }
      if (referenceRect.right > contentW) {
        placements.push({
          placement: 'bottom-end',
          css: { top, left: referenceRect.right - contentW },
        })
      }
    }

    if (referenceRect.left > offsetContentW) {
      const left = referenceRect.left - offsetContentW
      if (wh - referenceRect.top > contentH) {
        placements.push({ placement: 'left-start', css: { top: referenceRect.top, left } })
      }
      if (
        referenceRect.top + referenceRect.height / 2 > contentH / 2 &&
        wh - (referenceRect.top + referenceRect.height / 2) > contentH / 2
      ) {
        placements.push({
          placement: 'left',
          css: {
            top: referenceRect.top + referenceRect.height / 2 - contentH / 2,
            left,
          },
        })
      }
      if (referenceRect.bottom > contentH) {
        placements.push({
          placement: 'left-end',
          css: { top: referenceRect.bottom - contentH, left },
        })
      }
    }

    const chosen = placements.find((o) => o.placement === placement) || placements[0] || null
    if (chosen) {
      const css: Record<string, string | number> = { ...chosen.css }
      for (const key of Object.keys(css)) {
        if (['top', 'left', 'right', 'bottom'].includes(key)) {
          css[key] = `${css[key]}px`
        }
      }
      this.result = { placement: chosen.placement, css }
    } else {
      this.result = null
    }
  }
}

export { Follow }
export default Follow
