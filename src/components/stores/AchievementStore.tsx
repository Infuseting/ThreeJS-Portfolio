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
  {
    id: 'inception',
    title: 'Inception',
    description: 'Vous avez accédé à infuseting.fr via Internet Explorer.',
    rarity: 'EPIC',
    image: '/achievements/inception.png',
  },
  {
    id: 'ecrivain-rate',
    title: 'Écrivain Raté',
    description: 'Vous avez fermé le Bloc-notes sans sauvegarder vos mots précieux.',
    rarity: 'COMMON',
    image: '/achievements/ecrivain-rate.png',
  },
  {
    id: 'grand-oeuvre',
    title: 'Grand Œuvre',
    description: 'Vous avez tapé plus de 1000 caractères dans le Bloc-notes.',
    rarity: 'RARE',
    image: '/achievements/grand-oeuvre.png',
  },
  {
    id: 'calcul-mental',
    title: 'Calcul Mental',
    description: 'Vous avez tenté une division par zéro dans la Calculatrice. L\'univers a failli imploser.',
    rarity: 'UNCOMMON',
    image: '/achievements/calcul-mental.png',
  },
  {
    id: 'hackerman',
    title: 'Hackerman',
    description: 'Vous avez tapé des commandes dangereuses (comme rm -rf) dans CMD.',
    rarity: 'EPIC',
    image: '/achievements/hackerman.png',
  },
  {
    id: 'matrix',
    title: 'Matrix',
    description: 'Vous avez utilisé "color 0a" dans CMD. Bienvenue dans la matrice.',
    rarity: 'UNCOMMON',
    image: '/achievements/matrix.png',
  },
  {
    id: 'identity-crisis',
    title: 'Identity Crisis',
    description: 'Vous avez tapé "whoami" pour vous souvenir de qui vous êtes.',
    rarity: 'COMMON',
    image: '/achievements/identity-crisis.png',
  },
  {
    id: 'ping-pong',
    title: 'Ping Pong',
    description: 'Vous avez ping infuseting.fr. Pong !',
    rarity: 'COMMON',
    image: '/achievements/ping-pong.png',
  },
  {
    id: 'multitache',
    title: 'Multitâche',
    description: 'Vous avez ouvert 10 fenêtres en même temps.',
    rarity: 'RARE',
    image: '/achievements/multitache.png',
  },
  {
    id: 'bordelique',
    title: 'Bordélique',
    description: 'Vous avez plus de 20 fenêtres ouvertes. Quel chaos !',
    rarity: 'EPIC',
    image: '/achievements/bordelique.png',
  },
  {
    id: 'curieux',
    title: 'Curieux',
    description: 'Vous avez exploré le disque Système (C:). Attention où vous mettez les pieds !',
    rarity: 'COMMON',
    image: '/achievements/curieux.png',
  },
  {
    id: 'cachotier',
    title: 'Cachotier',
    description: 'Vous cherchez des dossiers cachés ? Il n\'y a rien à voir ici...',
    rarity: 'UNCOMMON',
    image: '/achievements/cachotier.png',
  },
  {
    id: 'start-stop',
    title: 'Start, Stop',
    description: 'Vous avez cliqué sur le menu Démarrer frénétiquement. Il s\'est bien ouvert et fermé.',
    rarity: 'RARE',
    image: '/achievements/start-stop.png',
  },
  {
    id: 'konami-code',
    title: 'Code Konami',
    description: 'Haut, Haut, Bas, Bas, Gauche, Droite, Gauche, Droite, B, A. Un classique !',
    rarity: 'LEGENDARY',
    image: '/achievements/konami-code.png',
  },
  {
    id: 'silence-radio',
    title: 'Silence Radio',
    description: 'Vous avez coupé le son. Le monde numérique vous remercie pour le calme.',
    rarity: 'UNCOMMON',
    image: '/achievements/silence-radio.png',
  },
  {
    id: 'audiophile',
    title: 'Audiophile',
    description: 'Vous jouez un peu trop avec le volume sonore. Attention aux oreilles.',
    rarity: 'COMMON',
    image: '/achievements/audiophile.png',
  },
  {
    id: 'bavard',
    title: 'Bavard',
    description: 'Vous avez bien discuté avec Cleepy ! Il est content de se sentir utile.',
    rarity: 'RARE',
    image: '/achievements/bavard.png',
  },
  {
    id: '404-not-found',
    title: '404 Not Found',
    description: 'Cette URL n\'existe pas. Belle tentative.',
    rarity: 'COMMON',
    image: '/achievements/404.png',
  },
  {
    id: 'archiviste',
    title: 'Archiviste',
    description: 'Ouvrir 5 fenêtres de l\'explorateur de fichiers simultanément.',
    rarity: 'UNCOMMON',
    image: '/achievements/archiviste.png',
  },
  {
    id: 'nettoyeur-compulsif',
    title: 'Nettoyeur compulsif',
    description: 'Tenter de vider une corbeille déjà vide.',
    rarity: 'COMMON',
    image: '/achievements/nettoyeur-compulsif.png',
  },
  {
    id: 'indecis',
    title: 'Indécis',
    description: 'Agrandir et réduire la même fenêtre 5 fois de suite.',
    rarity: 'UNCOMMON',
    image: '/achievements/indecis.png',
  },
  {
    id: 'cache-cache',
    title: 'Cache-cache',
    description: 'Glisser une fenêtre presque entièrement hors de l\'écran.',
    rarity: 'UNCOMMON',
    image: '/achievements/cache-cache.png',
  },
  {
    id: 'clic-compulsif',
    title: 'Clic compulsif',
    description: 'Cliquer frénétiquement dans le vide sur le bureau.',
    rarity: 'RARE',
    image: '/achievements/clic-compulsif.png',
  },
  {
    id: 'drag-drop-master',
    title: 'Drag & Drop Master',
    description: 'Faire voyager une fenêtre sur une très longue distance.',
    rarity: 'RARE',
    image: '/achievements/drag-drop-master.png',
  },
  {
    id: 'perdu',
    title: 'Perdu ?',
    description: 'Ouvrir et fermer une fenêtre en moins d\'une seconde.',
    rarity: 'UNCOMMON',
    image: '/achievements/perdu.png',
  },
  {
    id: 'trop-lourd',
    title: 'Trop lourd !',
    description: 'Avoir MS Paint et Pinball ouverts en même temps. Votre pauvre RAM.',
    rarity: 'RARE',
    image: '/achievements/trop-lourd.png',
  },
  {
    id: 'google-box',
    title: 'Google Box',
    description: 'Rechercher le mot "Google" via Internet Explorer.',
    rarity: 'UNCOMMON',
    image: '/achievements/google-box.png',
  },
  {
    id: 'anticonformiste',
    title: 'Anticonformiste',
    description: 'Tenter de supprimer ou renommer un élément fondamental du bureau.',
    rarity: 'RARE',
    image: '/achievements/anticonformiste.png',
  },
  {
    id: 'selectionneur',
    title: 'Sélectionneur',
    description: 'Faire une boîte de sélection géante qui couvre (presque) tout l\'écran.',
    rarity: 'UNCOMMON',
    image: '/achievements/selectionneur.png',
  },
  {
    id: 'maniaque',
    title: 'Maniaque du Rangement',
    description: 'Déplacer une icône et la remettre exactement à sa place originelle.',
    rarity: 'RARE',
    image: '/achievements/maniaque.png',
  },
  {
    id: 'changement-avis',
    title: 'Changement d\'Avis',
    description: 'Commencer à déplacer une icône et annuler avec la touche Échap.',
    rarity: 'UNCOMMON',
    image: '/achievements/changement-avis.png',
  },
  {
    id: 'boomer',
    title: 'Boomer',
    description: 'Double-cliquer si lentement que l\'ordinateur s\'endort entre les deux clics.',
    rarity: 'COMMON',
    image: '/achievements/boomer.png',
  },
  {
    id: 'zoom-zoom',
    title: 'Zoom Zoom',
    description: 'Observer l\'ordinateur depuis une distance de 15 mètres. On dirait un petit point.',
    rarity: 'UNCOMMON',
    image: '/achievements/zoom-zoom.png',
  },
  {
    id: 'patient',
    title: 'Patient',
    description: 'Laisser reposer le bureau sans le toucher pendant 5 minutes. Une éternité.',
    rarity: 'EPIC',
    image: '/achievements/patient.png',
  },
  {
    id: 'rage-quit',
    title: 'Rage Quit',
    description: 'Cliquer frénétiquement sur la croix rouge pour fermer une fenêtre rebelle.',
    rarity: 'RARE',
    image: '/achievements/rage-quit.png',
  },
  {
    id: 'cleepy-enerve',
    title: 'Cleepy, tu m\'énerves !',
    description: 'Ouvrir le menu de Cleepy et le refermer quasi instantanément.',
    rarity: 'UNCOMMON',
    image: '/achievements/cleepy-enerve.png',
  },
  {
    id: 'meilleur-ami',
    title: 'Meilleur Ami',
    description: 'Garder Cleepy à l\'écran pendant 10 minutes consécutives sans le supprimer.',
    rarity: 'EPIC',
    image: '/achievements/meilleur-ami.png',
  },
  {
    id: 'speedrunner',
    title: 'Speedrunner',
    description: 'Ouvrir 3 applications différentes en moins de 3 secondes. Record du monde !',
    rarity: 'RARE',
    image: '/achievements/speedrunner.png',
  },
  {
    id: 'barre-saturee',
    title: 'Barre Saturée',
    description: 'La barre des tâches déborde. 15 fenêtres, vraiment ?',
    rarity: 'EPIC',
    image: '/achievements/barre-saturee.png',
  },
  {
    id: 'maltraitance',
    title: 'Maltraitance',
    description: 'Vous avez secoué Cleepy dans tous les sens. Il a le mal de mer.',
    rarity: 'RARE',
    image: '/achievements/maltraitance.png',
  },
  {
    id: 'coupure-courant',
    title: 'Coupure de Courant',
    description: 'Vous avez fait disjoncter l\'interrupteur à force de le spammer.',
    rarity: 'UNCOMMON',
    image: '/achievements/coupure-courant.png',
  },
  {
    id: 'nostalgique',
    title: 'Nostalgique',
    description: 'Vous avez changé le fond d\'écran. La personnalisation, c\'est la clé.',
    rarity: 'COMMON',
    image: '/achievements/nostalgique.png',
  },
  {
    id: 'hardware-master',
    title: 'Hardware Master',
    description: 'Vous avez inspecté l\'unité centrale. Un vrai technicien.',
    rarity: 'UNCOMMON',
    image: '/achievements/hardware-master.png',
  },
  {
    id: 'troll-internet',
    title: 'Troll Internet',
    description: 'Vous avez fermé toutes les pop-ups. Bienvenue dans les années 2000.',
    rarity: 'RARE',
    image: '/achievements/troll-internet.png',
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
