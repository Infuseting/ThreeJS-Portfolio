'use client'

import { useState, useRef, useEffect } from 'react'
import { unlockAchievement } from '@/components/stores/AchievementStore'

interface DesktopIconProps {
  id?: string
  icon: string
  label: string
  onDoubleClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

/** A single clickable icon on the XP desktop. */
export function DesktopIcon({ id, icon, label, onDoubleClick, onContextMenu }: DesktopIconProps) {
  const [selected, setSelected] = useState(false)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

  // Tracking for Boomer
  const lastClickTimeRef = useRef(0)
  const handleClick = (e: React.MouseEvent) => {
    setSelected(true)
    const now = Date.now()
    if (lastClickTimeRef.current !== 0) {
      const diff = now - lastClickTimeRef.current
      if (diff > 800 && diff < 2000) {
        unlockAchievement('boomer')
        onDoubleClick() // Help them out by triggering the double click!
      }
    }
    lastClickTimeRef.current = now
  }

  // Tracking for D&D (Maniaque, Changement d'avis)
  const dragStartRef = useRef<{
    pointerX: number
    pointerY: number
    startTranslateX: number
    startTranslateY: number
    maxDist: number
  } | null>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    if (e.button !== 0) return
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startTranslateX: translate.x,
      startTranslateY: translate.y,
      maxDist: 0,
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.pointerX
      const dy = e.clientY - dragStartRef.current.pointerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      dragStartRef.current.maxDist = Math.max(dragStartRef.current.maxDist, dist)

      setTranslate({
        x: dragStartRef.current.startTranslateX + dx,
        y: dragStartRef.current.startTranslateY + dy,
      })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartRef.current) {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { }

      const dx = translate.x - dragStartRef.current.startTranslateX
      const dy = translate.y - dragStartRef.current.startTranslateY
      const distFromStart = Math.sqrt(dx * dx + dy * dy)

      if (dragStartRef.current.maxDist > 50 && distFromStart < 10) {
        unlockAchievement('maniaque')
        // Snap perfectly back
        setTranslate({ x: dragStartRef.current.startTranslateX, y: dragStartRef.current.startTranslateY })
      }

      dragStartRef.current = null
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dragStartRef.current) {
        setTranslate({ x: dragStartRef.current.startTranslateX, y: dragStartRef.current.startTranslateY })
        dragStartRef.current = null
        unlockAchievement('changement-avis')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div
      data-app-id={id}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onBlur={() => setSelected(false)}
      tabIndex={0}
      style={{
        transform: `translate(${translate.x}px, ${translate.y}px)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 80, gap: 2, cursor: 'pointer', outline: 'none',
        padding: 4, borderRadius: 3,
        background: selected ? 'rgba(49, 106, 197, 0.4)' : 'transparent',
      }}
    >
      <span style={{ fontSize: 32 }}>{icon}</span>
      <span style={{
        color: '#fff', fontSize: 12, textAlign: 'center',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)', lineHeight: 1.2,
        wordBreak: 'break-word',
      }}>
        {label}
      </span>
    </div>
  )
}
