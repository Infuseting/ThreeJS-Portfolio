'use client'

import { MenuItem } from './MenuItem'

interface StartMenuProps {
  taskbarH: number
  onOpenIE: () => void
  onOpenVSCode: () => void
  onOpenMinesweeper: () => void
  onOpenSlitherio: () => void
  onOpenNotepad: () => void
  onOpenCmd: () => void
  onOpenMediaPlayer: () => void
  onOpenPaint: () => void
  onOpenPinball: () => void
  onOpenFileExplorer: () => void
  onOpenCv: () => void
  onOpenTaskMgr: () => void
  onOpenOutlook: () => void
  onOpenControlPanel: () => void
  onOpenGitTracker: () => void
  onClose: () => void
}

/** The Windows XP Start menu popup. */
export function StartMenu({
  taskbarH,
  onOpenIE,
  onOpenVSCode,
  onOpenMinesweeper,
  onOpenSlitherio,
  onOpenNotepad,
  onOpenCmd,
  onOpenMediaPlayer,
  onOpenPaint,
  onOpenPinball,
  onOpenFileExplorer,
  onOpenCv,
  onOpenTaskMgr,
  onOpenOutlook,
  onOpenControlPanel,
  onOpenGitTracker,
  onClose,
}: StartMenuProps) {
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
      <div style={{ padding: '6px 0' }}>
        <MenuItem icon="🌐" label="Internet Explorer" onClick={onOpenIE} />
        <MenuItem icon="💻" label="VS Code" onClick={onOpenVSCode} />
        <MenuItem icon="💣" label="Démineur" onClick={onOpenMinesweeper} />
        <MenuItem icon="🐍" label="Slither.io" onClick={onOpenSlitherio} />
        <MenuItem icon="📝" label="Bloc-notes" onClick={onOpenNotepad} />
        <MenuItem icon="📟" label="Invite de commandes" onClick={onOpenCmd} />
        <MenuItem icon="📊" label="Gestionnaire des tâches" onClick={onOpenTaskMgr} />
        <MenuItem icon="📧" label="Outlook Express" onClick={onOpenOutlook} />
        <MenuItem icon="🐙" label="Git Tracker" onClick={onOpenGitTracker} />
        <MenuItem icon="🎵" label="Lofi Radio" onClick={onOpenMediaPlayer} />
        <MenuItem icon="🎨" label="Paint" onClick={onOpenPaint} />
        <MenuItem icon="🪐" label="Pinball" onClick={onOpenPinball} />
        <MenuItem icon="📄" label="Mon CV" onClick={onOpenCv} />
        <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <MenuItem icon="📁" label="Mes documents" onClick={onOpenFileExplorer} />
          <MenuItem icon="⚙️" label="Panneau de configuration" onClick={onOpenControlPanel} />
        </div>
        <div style={{ height: 1, backgroundColor: '#ACA899', margin: '8px 0' }} />
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '2px solid #0054E3', padding: '6px 12px',
        display: 'flex', justifyContent: 'flex-end', background: '#D6DFF7',
      }}>
        <button
          onClick={onClose}
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
