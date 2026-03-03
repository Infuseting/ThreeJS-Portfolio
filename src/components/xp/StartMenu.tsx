'use client'

import { MenuItem } from './MenuItem'

interface StartMenuProps {
  taskbarH: number
  onOpenIE: () => void
  onOpenVSCode: () => void
  onOpenFileExplorer: () => void
  onClose: () => void
}

/** The Windows XP Start menu popup. */
export function StartMenu({
  taskbarH,
  onOpenIE,
  onOpenVSCode,
  onOpenFileExplorer,
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
        <MenuItem icon="📁" label="Poste de travail" onClick={onOpenFileExplorer} />
        <div style={{ borderTop: '1px solid #ccc', margin: '4px 12px' }} />
        <MenuItem icon="📁" label="Mes documents" onClick={onOpenFileExplorer} />
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
