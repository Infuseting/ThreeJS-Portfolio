'use client'

import {
  useAchievements,
  dismissAchievementToast,
  RARITY_COLORS,
  RARITY_GLOW,
} from '@/components/stores/AchievementStore'

/* ═══════════════════════════════════════════════
 *  Achievement Toast
 *
 *  Positioned at the bottom-right of the XP desktop.
 *  Auto-dismisses after 4 seconds (driven by the store).
 * ═══════════════════════════════════════════════ */

export function AchievementToast() {
  const { toast } = useAchievements()

  if (!toast) return null

  const borderColor = RARITY_COLORS[toast.rarity]
  const glowColor = RARITY_GLOW[toast.rarity]

  return (
    <div
      onClick={dismissAchievementToast}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 300,
        backgroundColor: '#16213e',
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        boxShadow: `0 0 20px ${glowColor}, 0 4px 12px rgba(0,0,0,0.5)`,
        padding: 12,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        zIndex: 999999,
        cursor: 'pointer',
        pointerEvents: 'auto',
        animation: 'toast-slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fontFamily: '"Tahoma", "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 6,
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        flexShrink: 0,
      }}>
        <img
          src={toast.image}
          alt={toast.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 10,
          color: borderColor,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 2,
        }}>
          🏆 Succès débloqué !
        </div>
        <div style={{
          color: '#fff',
          fontSize: 13,
          fontWeight: 'bold',
        }}>
          {toast.title}
        </div>
      </div>
    </div>
  )
}
