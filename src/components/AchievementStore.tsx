'use client'

import { useSyncExternalStore } from 'react'

/* ═══════════════════════════════════════════════
 *  Achievement Store
 *
 *  Global singleton managing unlocked achievements
 *  and toast notifications.
 * ═══════════════════════════════════════════════ */

export type AchievementRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

export interface AchievementDef {
  id: string
  title: string
  description: string
  rarity: AchievementRarity
  image: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-boot',
    title: 'Premier Contact',
    description: 'Vous avez accédé à l\'ordinateur pour la première fois.',
    rarity: 'COMMON',
    image: '/achievements/first-boot.png',
  },
  {
    id: 'recycle-restore',
    title: 'Écologiste Numérique',
    description: 'Vous avez essayé de restaurer les fichiers de la corbeille. La planète numérique vous remercie.',
    rarity: 'UNCOMMON',
    image: '/achievements/recycle-restore.png',
  },
  {
    id: 'force-shutdown',
    title: 'Crise Cardiaque',
    description: 'Un informaticien vient de faire une crise cardiaque. Vous venez de forcer l\'arrêt d\'un ordinateur, probablement la chose la plus dangereuse à faire (selon les informaticiens des années 2000).',
    rarity: 'EPIC',
    image: '/achievements/force-shutdown.png',
  },
  {
    id: 'tetris-master',
    title: 'Tetris Master',
    description: 'Vous avez atteint un score de 10 000 au Tetris. Vous êtes un vrai gamer.',
    rarity: 'LEGENDARY',
    image: '/achievements/tetris-master.png',
  },
]

/* ── Rarity colors ── */

export const RARITY_COLORS: Record<AchievementRarity, string> = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50',
  RARE: '#2196F3',
  EPIC: '#9C27B0',
  LEGENDARY: '#FFD700',
}

export const RARITY_GLOW: Record<AchievementRarity, string> = {
  COMMON: 'rgba(158,158,158,0.3)',
  UNCOMMON: 'rgba(76,175,80,0.3)',
  RARE: 'rgba(33,150,243,0.3)',
  EPIC: 'rgba(156,39,176,0.4)',
  LEGENDARY: 'rgba(255,215,0,0.5)',
}

/* ── Store ── */

interface AchievementState {
  unlocked: Set<string>
  toast: AchievementDef | null
}

type Listener = () => void

function createAchievementStore() {
  let state: AchievementState = {
    unlocked: new Set<string>(),
    toast: null,
  }
  const listeners = new Set<Listener>()
  const notify = () => listeners.forEach((l) => l())

  let toastTimeout: NodeJS.Timeout | null = null

  return {
    get: () => state,
    unlock: (id: string) => {
      if (state.unlocked.has(id)) return
      const def = ACHIEVEMENTS.find((a) => a.id === id)
      if (!def) return

      const newUnlocked = new Set(state.unlocked)
      newUnlocked.add(id)

      // Clear previous toast timeout
      if (toastTimeout) clearTimeout(toastTimeout)

      state = { unlocked: newUnlocked, toast: def }
      notify()

      // Auto-dismiss toast after 4s
      toastTimeout = setTimeout(() => {
        state = { ...state, toast: null }
        notify()
        toastTimeout = null
      }, 4000)
    },
    dismissToast: () => {
      if (toastTimeout) {
        clearTimeout(toastTimeout)
        toastTimeout = null
      }
      state = { ...state, toast: null }
      notify()
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

const achievementStore = createAchievementStore()

export function useAchievements(): AchievementState {
  return useSyncExternalStore(
    achievementStore.subscribe,
    achievementStore.get,
    achievementStore.get,
  )
}

export function unlockAchievement(id: string) {
  achievementStore.unlock(id)
}

export function dismissAchievementToast() {
  achievementStore.dismissToast()
}
