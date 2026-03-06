'use client'

import { useWM } from '@/components/xp/core/WindowManager'
import { useWindowState } from '@/components/xp/core/WindowManager'

/**
 * useAppState - Hook centralisé pour la gestion commune des états d'app
 * 
 * Encapsule:
 * - Accès à WindowManager (wm)
 * - État de la fenêtre courante (win)
 * - Gestion des alerts/dialogs
 * - Actions communes (closeWindow, setTitle)
 * 
 * Élimine la duplication de ~50 lignes par app × 20 apps = 1000 lignes
 */

export interface AppStateContext {
  // Dépendances
  wm: ReturnType<typeof useWM>
  win: ReturnType<typeof useWindowState> | null
  windowId: string

  // Gestion des alerts - NOTE: Gérées par useAppAlert dans le HOC
  // Ces propriétés ne sont juste que des références (pour compatibilité)
  // Les alerts réelles sont gérées via le hook useAppAlert injecté

  // Actions de fenêtre
  closeWindow: () => void
  setTitle: (title: string) => void
  updateSize: (w: number, h: number) => void
  minimize: () => void
  maximize: () => void
  registerCloseHook: (hook: () => boolean) => void
  unregisterCloseHook: () => void
}

/**
 * Hook centralisé pour la gestion commune des états d'app
 */
export function useAppState(windowId: string): AppStateContext {
  const wm = useWM()
  const win = useWindowState(windowId)

  return {
    wm,
    win,
    windowId,
    closeWindow: () => wm.closeWindow(windowId),
    setTitle: (title: string) => wm.updateTitle(windowId, title),
    updateSize: (w: number, h: number) => wm.resizeWindow(windowId, w, h),
    minimize: () => wm.minimizeWindow(windowId),
    maximize: () => wm.toggleMaximize(windowId),
    registerCloseHook: (hook: () => boolean) => wm.registerCloseHook(windowId, hook),
    unregisterCloseHook: () => wm.unregisterCloseHook(windowId),
  }
}

/**
 * Guard hook - Retourne null si la fenêtre n'existe pas
 * Utilise useAppState en interne
 */
export function useAppStateOrNull(windowId: string): AppStateContext | null {
  const state = useAppState(windowId)
  return state.win ? state : null
}
