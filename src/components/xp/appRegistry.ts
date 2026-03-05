import type { AppType } from './WindowManager'

export type { AppType }

/* ═══════════════════════════════════════════════
 *  App Registry
 *
 *  Single source of truth for every app's metadata:
 *  title, icon, default window size, and options.
 *
 *  Used by useOpenApp, StartMenu, DesktopIcons,
 *  and the WindowManager's openWindow fallback.
 * ═══════════════════════════════════════════════ */

export interface AppConfig {
  appType: AppType
  title: string
  icon: string
  w: number
  h: number
  isFixedSize?: boolean
}

export const APP_REGISTRY: Record<AppType, AppConfig> = {
  'file-explorer': { appType: 'file-explorer', title: 'Poste de travail', icon: '📁', w: 700, h: 500 },
  'internet-explorer': { appType: 'internet-explorer', title: 'Internet Explorer', icon: '🌐', w: 900, h: 650 },
  'vscode': { appType: 'vscode', title: 'VS Code', icon: '💻', w: 950, h: 700 },
  'minesweeper': { appType: 'minesweeper', title: 'Démineur', icon: '💣', w: 200, h: 300 },
  'tetris': { appType: 'tetris', title: 'Tetris', icon: '🧱', w: 320, h: 480, isFixedSize: true },
  'slitherio': { appType: 'slitherio', title: 'Slither.io', icon: '🐍', w: 1000, h: 700 },
  'notepad': { appType: 'notepad', title: 'Bloc-notes', icon: '📝', w: 600, h: 400 },
  'cmd': { appType: 'cmd', title: 'Invite de commandes', icon: '📟', w: 600, h: 400 },
  'mediaplayer': { appType: 'mediaplayer', title: 'Lecteur Windows Media', icon: '🎵', w: 320, h: 240 },
  'paint': { appType: 'paint', title: 'Paint', icon: '🎨', w: 800, h: 600 },
  'pinball': { appType: 'pinball', title: '3D Pinball - Space Cadet', icon: '🪐', w: 600, h: 446, isFixedSize: true },
  'cv': { appType: 'cv', title: 'Curriculum Vitae', icon: '📄', w: 800, h: 800 },
  'taskmgr': { appType: 'taskmgr', title: 'Gestionnaire des tâches de Windows', icon: '📊', w: 450, h: 450, isFixedSize: true },
  'outlook': { appType: 'outlook', title: 'Outlook Express', icon: '📧', w: 800, h: 600 },
  'control-panel': { appType: 'control-panel', title: 'Panneau de configuration', icon: '⚙️', w: 500, h: 400 },
  'git-tracker': { appType: 'git-tracker', title: 'Git Tracker', icon: '🐙', w: 700, h: 500 },
  'recycle-bin': { appType: 'recycle-bin', title: 'Corbeille', icon: '🗑️', w: 600, h: 450 },
  'volume-mixer': { appType: 'volume-mixer', title: 'Contrôle du volume', icon: '🔊', w: 400, h: 300, isFixedSize: true },
  'datetime': { appType: 'datetime', title: 'Propriétés de Date et heure', icon: '🕒', w: 420, h: 450, isFixedSize: true },
  'achievements': { appType: 'achievements', title: 'Succès', icon: '🏆', w: 500, h: 400 },
}
