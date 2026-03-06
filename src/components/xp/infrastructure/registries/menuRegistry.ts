'use client'

import { MenuDef } from '@/components/xp/core/MenuBar'

/**
 * menuRegistry - Registre centralisé des menus standards et réutilisables
 * 
 * Élimine la duplication de menus dans 8 apps
 * ~20 lignes de menus par app × 8 apps = 160 lignes
 * 
 * Patterns:
 * - FILE_QUIT: Menu Fichier avec Quitter
 * - FILE_EDIT: Fichier + Édition classiques
 * - FILE_EDIT_VIEW: Fichier + Édition + Affichage
 * - HELP_ABOUT: Menu ? avec À propos
 * 
 * Utilisation:
 * const menus = STANDARD_MENUS.FILE_EDIT(windowId, closeCallback)
 */

/**
 * Menu Fichier avec Quitter seul
 */
export const FILE_QUIT = (onQuit: () => void): MenuDef[] => [
  {
    label: 'Fichier',
    items: [
      { divider: true },
      { label: 'Quitter', onClick: onQuit },
    ],
  },
]

/**
 * Menu Fichier + Édition (structure Notepad-like)
 */
export const FILE_EDIT_BASIC = (callbacks: {
  onNew?: () => void
  onOpen?: () => void
  onSave?: () => void
  onQuit: () => void
  onUndo?: () => void
  onCut?: () => void
  onCopy?: () => void
  onPaste?: () => void
  onDelete?: () => void
}): MenuDef[] => [
  {
    label: 'Fichier',
    items: [
      { label: 'Nouveau', onClick: callbacks.onNew, disabled: !callbacks.onNew },
      { label: 'Ouvrir...', onClick: callbacks.onOpen, disabled: !callbacks.onOpen },
      { label: 'Enregistrer', onClick: callbacks.onSave, disabled: !callbacks.onSave },
      { label: 'Enregistrer sous...', disabled: true },
      { divider: true },
      { label: 'Quitter', onClick: callbacks.onQuit },
    ],
  },
  {
    label: 'Édition',
    items: [
      { label: 'Annuler', onClick: callbacks.onUndo, disabled: !callbacks.onUndo },
      { divider: true },
      { label: 'Couper', onClick: callbacks.onCut, disabled: !callbacks.onCut },
      { label: 'Copier', onClick: callbacks.onCopy, disabled: !callbacks.onCopy },
      { label: 'Coller', onClick: callbacks.onPaste, disabled: !callbacks.onPaste },
      { label: 'Supprimer', onClick: callbacks.onDelete, disabled: !callbacks.onDelete },
    ],
  },
]

/**
 * Menu Fichier + Édition + Affichage + ? (structure complexe)
 */
export const FILE_EDIT_VIEW_HELP = (callbacks: {
  onNew?: () => void
  onOpen?: () => void
  onSave?: () => void
  onQuit: () => void
  onUndo?: () => void
  onCut?: () => void
  onCopy?: () => void
  onPaste?: () => void
  onDelete?: () => void
  onAbout?: () => void
  appName?: string
}): MenuDef[] => [
  {
    label: 'Fichier',
    items: [
      { label: 'Nouveau', onClick: callbacks.onNew, disabled: !callbacks.onNew },
      { label: 'Ouvrir...', onClick: callbacks.onOpen, disabled: !callbacks.onOpen },
      { label: 'Enregistrer', onClick: callbacks.onSave, disabled: !callbacks.onSave },
      { label: 'Enregistrer sous...', disabled: true },
      { divider: true },
      { label: 'Quitter', onClick: callbacks.onQuit },
    ],
  },
  {
    label: 'Édition',
    items: [
      { label: 'Annuler', onClick: callbacks.onUndo, disabled: !callbacks.onUndo },
      { divider: true },
      { label: 'Couper', onClick: callbacks.onCut, disabled: !callbacks.onCut },
      { label: 'Copier', onClick: callbacks.onCopy, disabled: !callbacks.onCopy },
      { label: 'Coller', onClick: callbacks.onPaste, disabled: !callbacks.onPaste },
      { label: 'Supprimer', onClick: callbacks.onDelete, disabled: !callbacks.onDelete },
    ],
  },
  ...(callbacks.onAbout ? [{
    label: '?',
    items: [
      { label: `À propos de ${callbacks.appName || 'l\'application'}`, onClick: callbacks.onAbout },
    ],
  }] : []),
]

/**
 * Menu Game (pour Minesweeper, Tetris - Jeu + ?):
 */
export const GAME_MENU = (callbacks: {
  onNew: () => void
  onDifficulty?: (level: string) => void
  onAbout?: () => void
  appName?: string
}): MenuDef[] => [
  {
    label: 'Jeu',
    items: [
      { label: 'Nouveau', onClick: callbacks.onNew },
      ...(callbacks.onDifficulty ? [{ divider: true }] : []),
      ...(callbacks.onDifficulty ? [
        { label: 'Débutant', onClick: () => callbacks.onDifficulty?.('beginner') },
        { label: 'Intermédiaire', onClick: () => callbacks.onDifficulty?.('intermediate') },
        { label: 'Expert', onClick: () => callbacks.onDifficulty?.('expert') },
      ] : []),
    ],
  },
  ...(callbacks.onAbout ? [{
    label: '?',
    items: [
      { label: `À propos de ${callbacks.appName || 'Jeu'}`, onClick: callbacks.onAbout },
    ],
  }] : []),
]

/**
 * Menu Édition & Format (pour des éditeurs)
 */
export const FORMAT_MENU = (callbacks: {
  onFont?: () => void
  onColor?: () => void
}): MenuDef[] => [
  {
    label: 'Format',
    items: [
      { label: 'Police...', onClick: callbacks.onFont, disabled: !callbacks.onFont },
      { label: 'Couleur...', onClick: callbacks.onColor, disabled: !callbacks.onColor },
    ],
  },
]

/**
 * Menu ? avec À propos
 */
export const HELP_ABOUT = (callbacks: {
  onAbout: () => void
  appName?: string
}): MenuDef[] => [
  {
    label: '?',
    items: [
      { label: `À propos de ${callbacks.appName || 'l\'application'}`, onClick: callbacks.onAbout },
    ],
  },
]

/**
 * Registry des menus complets (combinaisons courantes)
 */
export const MENU_TEMPLATES = {
  // Simplement quitter
  QUIT_ONLY: { factory: FILE_QUIT },

  // Notepad-like (Fichier, Édition)
  DOCUMENT_APP: { factory: FILE_EDIT_BASIC },

  // Complet (Fichier, Édition, Affichage, ?)
  FULL_APP: { factory: FILE_EDIT_VIEW_HELP },

  // Jeu (Jeu, ?)
  GAME_APP: { factory: GAME_MENU },
} as const
