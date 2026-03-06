'use client'

import { useRef, useCallback } from 'react'
import { unlockAchievement } from '@/components/stores/AchievementStore'

/* ═══════════════════════════════════════════════
 *  useWindowDrag
 *
 *  Extracted from XPWindow: handles pointer-capture
 *  drag-to-move on the title bar.
 * ═══════════════════════════════════════════════ */

interface UseWindowDragOpts {
  windowId: string
  winX: number
  winY: number
  winW: number
  winH: number
  maximized: boolean
  isFixedSize?: boolean
  focus: (id: string) => void
  move: (id: string, x: number, y: number) => void
  screenToVirtual: (dxScreen: number, dyScreen: number) => { dx: number; dy: number }
}

export function useWindowDrag(opts: UseWindowDragOpts) {
  const dragRef = useRef<{
    startX: number
    startY: number
    startWinX: number
    startWinY: number
    totalDistance: number
    lastX: number
    lastY: number
  } | null>(null)

  const onTitlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      if (opts.maximized && !opts.isFixedSize) return
      opts.focus(opts.windowId)

      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWinX: opts.winX,
        startWinY: opts.winY,
        totalDistance: 0,
        lastX: e.clientX,
        lastY: e.clientY,
      }

      const onMove = (ev: PointerEvent) => {
        const d = dragRef.current
        if (!d) return

        // Track dragged distance
        const dist = Math.sqrt(Math.pow(ev.clientX - d.lastX, 2) + Math.pow(ev.clientY - d.lastY, 2))
        d.totalDistance += dist
        d.lastX = ev.clientX
        d.lastY = ev.clientY

        if (d.totalDistance > 4000) {
          unlockAchievement('drag-drop-master')
        }

        const { dx, dy } = opts.screenToVirtual(ev.clientX - d.startX, ev.clientY - d.startY)
        opts.move(opts.windowId, d.startWinX + dx, d.startWinY + dy)
      }
      const cleanup = () => {
        dragRef.current = null
        target.removeEventListener('pointermove', onMove)
        target.removeEventListener('pointerup', cleanup)
        target.removeEventListener('pointercancel', cleanup)
        try { target.releasePointerCapture(e.pointerId) } catch { /* already released */ }
      }
      target.addEventListener('pointermove', onMove)
      target.addEventListener('pointerup', cleanup)
      target.addEventListener('pointercancel', cleanup)
    },
    [opts],
  )

  return onTitlePointerDown
}
