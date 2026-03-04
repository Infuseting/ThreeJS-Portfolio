'use client'

import { useCallback } from 'react'
import { useWM, type AppType } from '@/components/xp/WindowManager'
import { APP_REGISTRY } from '@/components/xp/appRegistry'

/* ═══════════════════════════════════════════════
 *  useOpenApp
 *
 *  Replaces the 20+ individual useCallback openXxx
 *  helpers that were duplicated in WindowsXPDesktop.
 *
 *  Returns a single `openApp(appType, overrides?)` fn.
 * ═══════════════════════════════════════════════ */

interface OpenAppOverrides {
  title?: string
  icon?: string
  w?: number
  h?: number
  x?: number
  y?: number
  isFixedSize?: boolean
  payload?: Record<string, unknown>
}

export function useOpenApp(onAfterOpen?: () => void) {
  const wm = useWM()

  const openApp = useCallback(
    (appType: AppType, overrides?: OpenAppOverrides) => {
      const config = APP_REGISTRY[appType]
      if (!config) return

      wm.openWindow(appType, {
        title: overrides?.title ?? config.title,
        icon: overrides?.icon ?? config.icon,
        w: overrides?.w ?? config.w,
        h: overrides?.h ?? config.h,
        x: overrides?.x,
        y: overrides?.y,
        isFixedSize: overrides?.isFixedSize ?? config.isFixedSize,
        payload: overrides?.payload,
      })

      onAfterOpen?.()
    },
    [wm, onAfterOpen],
  )

  return openApp
}
