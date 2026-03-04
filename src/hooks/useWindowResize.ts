'use client'

import { useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════════
 *  useWindowResize
 *
 *  Extracted from XPWindow: handles pointer-capture
 *  edge/corner resize.
 * ═══════════════════════════════════════════════ */

interface UseWindowResizeOpts {
  windowId: string
  winX: number
  winY: number
  winW: number
  winH: number
  minW: number
  minH: number
  focus: (id: string) => void
  move: (id: string, x: number, y: number) => void
  resize: (id: string, w: number, h: number) => void
  screenToVirtual: (dxScreen: number, dyScreen: number) => { dx: number; dy: number }
}

export function useWindowResize(opts: UseWindowResizeOpts) {
  const dragRef = useRef<{
    edge: string
    startX: number
    startY: number
    startWinX: number
    startWinY: number
    startWinW: number
    startWinH: number
  } | null>(null)

  const onResizePointerDown = useCallback(
    (edge: string) => (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      opts.focus(opts.windowId)

      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)

      dragRef.current = {
        edge,
        startX: e.clientX,
        startY: e.clientY,
        startWinX: opts.winX,
        startWinY: opts.winY,
        startWinW: opts.winW,
        startWinH: opts.winH,
      }

      const onMove = (ev: PointerEvent) => {
        const d = dragRef.current
        if (!d) return
        const { dx, dy } = opts.screenToVirtual(ev.clientX - d.startX, ev.clientY - d.startY)

        let nx = d.startWinX
        let ny = d.startWinY
        let nw = d.startWinW
        let nh = d.startWinH

        if (d.edge.includes('e')) nw = d.startWinW + dx
        if (d.edge.includes('w')) { nw = d.startWinW - dx; nx = d.startWinX + dx }
        if (d.edge.includes('s')) nh = d.startWinH + dy
        if (d.edge.includes('n')) { nh = d.startWinH - dy; ny = d.startWinY + dy }

        nw = Math.max(opts.minW, nw)
        nh = Math.max(opts.minH, nh)
        opts.resize(opts.windowId, nw, nh)
        opts.move(opts.windowId, nx, ny)
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

  return onResizePointerDown
}
