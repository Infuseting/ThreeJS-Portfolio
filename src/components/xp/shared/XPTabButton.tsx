'use client'

interface XPTabButtonProps {
  active: boolean
  onClick: () => void
  label: string
  disabled?: boolean
}

/**
 * Shared XP-style tab button used in TaskManager, ControlPanel, DateTimeProp, etc.
 */
export function XPTabButton({ active, onClick, label, disabled = false }: XPTabButtonProps) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        padding: '4px 8px',
        backgroundColor: active ? '#FFF' : '#ECE9D8',
        border: '1px solid #ACA899',
        borderBottom: active ? '1px solid #FFF' : '1px solid #ACA899',
        marginTop: active ? 0 : 2,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        marginLeft: 2,
        zIndex: active ? 2 : 1,
        position: 'relative',
      }}
    >
      {label}
    </div>
  )
}
