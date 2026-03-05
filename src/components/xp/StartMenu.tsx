'use client'

import { MenuItem } from './MenuItem'
import type { AppType } from './appRegistry'

/** Describes one entry in the Start menu. */
interface StartMenuEntry {
  icon: string
  label: string
  appType: AppType
}

/** Top-level programs listed in the Start menu. */
const MENU_ITEMS: StartMenuEntry[] = [
  { icon: '🌐', label: 'Internet Explorer', appType: 'internet-explorer' },
  { icon: '💻', label: 'VS Code', appType: 'vscode' },
  { icon: '💣', label: 'Démineur', appType: 'minesweeper' },
  { icon: '🧱', label: 'Tetris', appType: 'tetris' },
  { icon: '🐍', label: 'Slither.io', appType: 'slitherio' },
  { icon: '📝', label: 'Bloc-notes', appType: 'notepad' },
  { icon: '📟', label: 'Invite de commandes', appType: 'cmd' },
  { icon: '📊', label: 'Gestionnaire des tâches', appType: 'taskmgr' },
  { icon: '📧', label: 'Outlook Express', appType: 'outlook' },
  { icon: '🐙', label: 'Git Tracker', appType: 'git-tracker' },
  { icon: '🎵', label: 'Lofi Radio', appType: 'mediaplayer' },
  { icon: '🎨', label: 'Paint', appType: 'paint' },
  { icon: '🪐', label: 'Pinball', appType: 'pinball' },
  { icon: '📄', label: 'Mon CV', appType: 'cv' },
  { icon: '🏆', label: 'Succès', appType: 'achievements' },
]

/** Bottom "Places" section of the Start menu. */
const PLACES_ITEMS: StartMenuEntry[] = [
  { icon: '📁', label: 'Mes documents', appType: 'file-explorer' },
  { icon: '⚙️', label: 'Panneau de configuration', appType: 'control-panel' },
]

export interface StartMenuProps {
  taskbarH: number
  openApp: (appType: AppType) => void
  onClose: () => void
  onShutdown: () => void
}

/** The Windows XP Start menu popup. */
export function StartMenu({ taskbarH, openApp, onClose, onShutdown }: StartMenuProps) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: taskbarH,
        left: 0,
        width: 320,
        background: 'linear-gradient(180deg, #1F5DBF 0%, #3078D9 2%, #fff 2%, #fff 100%)',
        border: '2px solid #0054E3',
        borderRadius: '8px 8px 0 0',
        boxShadow: '2px 2px 10px rgba(0,0,0,0.4)',
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #1F5DBF, #3078D9)',
        color: '#fff', padding: '8px 12px', fontWeight: 'bold', fontSize: 15,
        borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 22 }}>👤</span> Infuseting
      </div>

      {/* Menu items */}
      <div style={{ padding: '6px 0', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {MENU_ITEMS.map(({ icon, label, appType }) => (
          <MenuItem key={appType} icon={icon} label={label} onClick={() => openApp(appType)} />
        ))}
        <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {PLACES_ITEMS.map(({ icon, label, appType }) => (
            <MenuItem key={appType} icon={icon} label={label} onClick={() => openApp(appType)} />
          ))}
        </div>
        <div style={{ height: 1, backgroundColor: '#ACA899', margin: '8px 0' }} />
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '2px solid #0054E3', padding: '6px 12px',
        display: 'flex', justifyContent: 'flex-end', background: '#D6DFF7',
      }}>
        <button
          onClick={() => {
            onClose()
            onShutdown()
          }}
          style={{
            background: 'linear-gradient(180deg, #FE8A3A, #E34F0C)',
            color: '#fff', border: '1px solid #933509', borderRadius: 3,
            padding: '3px 16px', fontSize: 12, fontWeight: 'bold', cursor: 'pointer',
          }}
        >
          Arrêter...
        </button>
      </div>
    </div>
  )
}
