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

function horizontalCenterFits(
  refLeft: number,
  refWidth: number,
  contentW: number,
  viewportW: number
): boolean {
  const center = refLeft + refWidth / 2
  return center >= contentW / 2 && viewportW - center >= contentW / 2
}

function verticalCenterFits(
  refTop: number,
  refHeight: number,
  contentH: number,
  viewportH: number
): boolean {
  const center = refTop + refHeight / 2
  return center >= contentH / 2 && viewportH - center >= contentH / 2
}

function toCssWithPx(css: Record<string, number>): Record<string, string | number> {
  const result: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(css)) {
    result[k] = ['top', 'left', 'right', 'bottom'].includes(k) ? `${v}px` : v
  }
  return result
}

class Follow {
  readonly result: FollowResult | null

  constructor(
    eleTrigger: Element,
    eleTarget: Element,
    options?: FollowOptions | null
  ) {
    const placement = options?.placement ?? 'bottom'
    const offset = options?.offset ?? 10

    const ww = window.innerWidth
    const wh = window.innerHeight
    const referenceRect = eleTrigger.getBoundingClientRect()
    const contentRect = eleTarget.getBoundingClientRect()
    const contentW = contentRect.width
    const contentH = contentRect.height

    if (contentW <= 0 || contentH <= 0) {
      this.result = null
      return
    }
    const offsetContentW = contentW + offset
    const offsetContentH = contentH + offset
    const placements: PlacementItem[] = []

    if (referenceRect.top > offsetContentH) {
      const top = referenceRect.top - offsetContentH
      if (ww - referenceRect.left > contentW) {
        placements.push({ placement: 'top-start', css: { top, left: referenceRect.left } })
      }
      if (horizontalCenterFits(referenceRect.left, referenceRect.width, contentW, ww)) {
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
      if (verticalCenterFits(referenceRect.top, referenceRect.height, contentH, wh)) {
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
      if (horizontalCenterFits(referenceRect.left, referenceRect.width, contentW, ww)) {
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
      if (verticalCenterFits(referenceRect.top, referenceRect.height, contentH, wh)) {
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

    const chosen = placements.find((o) => o.placement === placement) ?? placements[0] ?? null
    this.result = chosen
      ? { placement: chosen.placement, css: toCssWithPx(chosen.css) }
      : null
  }
}

export { Follow }
export default Follow
