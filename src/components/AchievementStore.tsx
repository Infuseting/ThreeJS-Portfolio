'use client'

import { useSyncExternalStore } from 'react'

/* ═══════════════════════════════════════════════
 *  Achievement Store
 *
 *  Global singleton managing unlocked achievements,
 *  "new" status, persistence, and toast notifications.
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
    description: 'Vous avez atteint un score de 10 000 au Tetris. Vous êtes un vrai gamerz.',
    rarity: 'LEGENDARY',
    image: '/achievements/tetris-master.png',
  },
  {
    id: 'jour-nuit',
    title: 'Jour. Nuit. Jour. Nuit...',
    description: 'Vous avez cliqué 10 fois d\'affilée sur un interrupteur. Vous avez un tic nerveux ou quoi ?',
    rarity: 'RARE',
    image: '/achievements/jour-nuit.png',
  },
  {
    id: 'harceleur',
    title: 'Harceleur',
    description: 'Vous avez cliqué sur Cleepy plus de 25 fois d\'affilée. Il n\'a rien demandé, mais vous avez insisté. Bravo, vous êtes officiellement un harceleur numérique.',
    rarity: 'EPIC',
    image: '/achievements/harceleur.png',
  },
  {
    id: 'resto_clippy',
    title: 'Pardon',
    description: 'Vous avez sorti Cleepy de la corbeille. C\'est un acte de grande bonté.',
    rarity: 'EPIC',
    image: '/achievements/resto-clippy.png',
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
  /** Achievements unlocked but not yet viewed in the app */
  unseen: Set<string>
  toast: AchievementDef | null
}

type Listener = () => void

const STORAGE_KEY = 'threejs_portfolio_achievements'

function loadPersistedState(): { unlocked: Set<string>, unseen: Set<string> } {
  try {
    if (typeof window === 'undefined') return { unlocked: new Set(), unseen: new Set() }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { unlocked: new Set(), unseen: new Set() }
    const parsed = JSON.parse(stored)
    return {
      unlocked: new Set(parsed.unlocked || []),
      unseen: new Set(parsed.unseen || [])
    }
  } catch (e) {
    console.warn('Failed to load achievements from localStorage', e)
    return { unlocked: new Set(), unseen: new Set() }
  }
}

function savePersistedState(unlocked: Set<string>, unseen: Set<string>) {
  try {
    if (typeof window === 'undefined') return
    const data = {
      unlocked: Array.from(unlocked),
      unseen: Array.from(unseen)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save achievements to localStorage', e)
  }
}

function createAchievementStore() {
  const initial = loadPersistedState()
  let state: AchievementState = {
    unlocked: initial.unlocked,
    unseen: initial.unseen,
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

      const newUnseen = new Set(state.unseen)
      newUnseen.add(id)

      savePersistedState(newUnlocked, newUnseen)

      // Clear previous toast timeout
      if (toastTimeout) clearTimeout(toastTimeout)

      state = { unlocked: newUnlocked, unseen: newUnseen, toast: def }
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
    markViewed: () => {
      if (state.unseen.size === 0) return
      state = { ...state, unseen: new Set() }
      savePersistedState(state.unlocked, state.unseen)
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
export function markAchievementsViewed() {
  achievementStore.markViewed()
}
