'use client'

import {
  ACHIEVEMENTS,
  RARITY_COLORS,
  RARITY_GLOW,
  useAchievements,
  type AchievementDef,
  type AchievementRarity,
} from '@/components/AchievementStore'

/* ═══════════════════════════════════════════════
 *  Achievements App (Windows XP style)
 * ═══════════════════════════════════════════════ */

interface AchievementsAppProps {
  windowId: string
}

const RARITY_LABELS: Record<AchievementRarity, string> = {
  COMMON: 'Commun',
  UNCOMMON: 'Peu commun',
  RARE: 'Rare',
  EPIC: 'Épique',
  LEGENDARY: 'Légendaire',
}

export function AchievementsApp({ windowId }: AchievementsAppProps) {
  const { unlocked } = useAchievements()

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Tahoma", "Segoe UI", sans-serif',
      fontSize: 12,
      color: '#fff',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '2px solid #e94560',
      }}>
        <span style={{ fontSize: 22 }}>🏆</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>Succès</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>
            {unlocked.size} / {ACHIEVEMENTS.length} débloqués
          </div>
        </div>
        {/* Progress bar */}
        <div style={{
          flex: 1,
          height: 8,
          backgroundColor: '#333',
          borderRadius: 4,
          overflow: 'hidden',
          marginLeft: 12,
        }}>
          <div style={{
            width: `${(unlocked.size / ACHIEVEMENTS.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #e94560, #FFD700)',
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200, 1fr))',
        gap: 14,
        alignContent: 'start',
      }}>
        {ACHIEVEMENTS.map((ach) => (
          <AchievementCard
            key={ach.id}
            achievement={ach}
            isUnlocked={unlocked.has(ach.id)}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Single achievement card ── */

function AchievementCard({
  achievement,
  isUnlocked,
}: {
  achievement: AchievementDef
  isUnlocked: boolean
}) {
  const borderColor = RARITY_COLORS[achievement.rarity]
  const glowColor = RARITY_GLOW[achievement.rarity]
  const rarityLabel = RARITY_LABELS[achievement.rarity]

  return (
    <div
      style={{
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        backgroundColor: isUnlocked ? '#16213e' : '#0d1117',
        padding: 12,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        boxShadow: isUnlocked ? `0 0 12px ${glowColor}` : 'none',
        opacity: isUnlocked ? 1 : 0.6,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 6,
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
      }}>
        {isUnlocked ? (
          <img
            src={achievement.image}
            alt={achievement.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 28, filter: 'grayscale(1)' }}>🔒</span>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 'bold',
          fontSize: 13,
          marginBottom: 2,
          color: isUnlocked ? '#fff' : '#888',
        }}>
          {isUnlocked ? achievement.title : '???'}
        </div>
        <div style={{
          fontSize: 11,
          color: isUnlocked ? '#ccc' : '#555',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {isUnlocked ? achievement.description : '???'}
        </div>
        <div style={{
          fontSize: 10,
          color: borderColor,
          fontWeight: 'bold',
          marginTop: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {rarityLabel}
        </div>
      </div>
    </div>
  )
}
