'use client'

import { useState, useEffect, useRef } from 'react'
import { useTetris, COLS, ROWS } from '../../hooks/useTetris'
import { useWM } from './WindowManager'
import { MenuBar } from './MenuBar'
import { unlockAchievement } from '@/components/AchievementStore'

/* ═══════════════════════════════════════════════
 *  Tetris App (Windows XP style)
 * ═══════════════════════════════════════════════ */

interface TetrisAppProps {
  windowId: string
}

const BLOCK_SIZE = 16

const COLORS = [
  'transparent', // 0
  '#00FFFF',     // 1: I (Cyan)
  '#0000FF',     // 2: J (Blue)
  '#FFA500',     // 3: L (Orange)
  '#FFFF00',     // 4: O (Yellow)
  '#00FF00',     // 5: S (Green)
  '#800080',     // 6: T (Purple)
  '#FF0000'      // 7: Z (Red)
]

export function TetrisApp({ windowId }: TetrisAppProps) {
  const {
    grid,
    currentPiece,
    nextPiece,
    score,
    level,
    lines,
    gameState,
    startGame,
    pauseGame,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    rotate
  } = useTetris()

  const wm = useWM()
  const containerRef = useRef<HTMLDivElement>(null)

  // Achievement: Tetris Master
  useEffect(() => {
    if (score >= 10000) {
      unlockAchievement('tetris-master')
    }
  }, [score])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling when playing
      if (gameState === 'playing' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (gameState !== 'playing') return

      switch (e.key) {
        case 'ArrowLeft':
          moveLeft()
          break
        case 'ArrowRight':
          moveRight()
          break
        case 'ArrowDown':
          moveDown()
          break
        case 'ArrowUp':
          rotate()
          break
        case ' ':
          hardDrop()
          break
      }
    }

    // Only listen if this window is focused (optional, but good practice in WM)
    // Actually, we'll attach to the document and rely on the user having focus
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, moveLeft, moveRight, moveDown, rotate, hardDrop])

  // Combine grid and current piece for rendering
  const displayGrid = grid.map(row => [...row])
  if (currentPiece && gameState === 'playing') {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = currentPiece.pos.y + y
          const boardX = currentPiece.pos.x + x
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            displayGrid[boardY][boardX] = currentPiece.color
          }
        }
      }
    }
  }

  // Draw Next Piece Matrix (4x4)
  const nextGrid = Array.from({ length: 4 }, () => Array(4).fill(0))
  if (nextPiece) {
    // Center it in the 4x4 preview
    const offsetY = nextPiece.shape.length === 2 ? 1 : 0
    const offsetX = nextPiece.shape[0].length === 2 ? 1 : 0
    for (let y = 0; y < nextPiece.shape.length; y++) {
      for (let x = 0; x < nextPiece.shape[y].length; x++) {
        if (nextPiece.shape[y][x] !== 0) {
          nextGrid[y + offsetY][x + offsetX] = nextPiece.color
        }
      }
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#C0C0C0',
        fontFamily: 'Tahoma, sans-serif',
        fontSize: 11,
        userSelect: 'none',
        outline: 'none',
        padding: 0,
        overflow: 'hidden'
      }}
    >
      {/* ── Menu bar ── */}
      <MenuBar
        menus={[
          {
            label: 'Partie',
            items: [
              { label: 'Nouvelle Partie', onClick: startGame },
              { label: gameState === 'paused' ? "Reprendre" : "Pause", onClick: pauseGame, disabled: gameState === 'idle' || gameState === 'game_over' },
              { divider: true },
              { label: 'Quitter', onClick: () => wm.closeWindow(windowId) }
            ]
          }
        ]}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        gap: 12,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        
        {/* ── Game Board ── */}
        <div style={{
          borderLeft: '2px solid #808080',
          borderTop: '2px solid #808080',
          borderRight: '2px solid #fff',
          borderBottom: '2px solid #fff',
          backgroundColor: '#000',
          position: 'relative'
        }}>
          {/* Main Grid */}
          <div style={{
            display: 'grid',
            gridTemplateRows: `repeat(${ROWS}, ${BLOCK_SIZE}px)`,
            gridTemplateColumns: `repeat(${COLS}, ${BLOCK_SIZE}px)`
          }}>
            {displayGrid.map((row, y) =>
              row.map((color, x) => (
                <div key={`cell-${x}-${y}`} style={{
                  width: BLOCK_SIZE,
                  height: BLOCK_SIZE,
                  backgroundColor: COLORS[color],
                  borderTop: color ? '2px solid rgba(255,255,255,0.4)' : 'none',
                  borderLeft: color ? '2px solid rgba(255,255,255,0.4)' : 'none',
                  borderBottom: color ? '2px solid rgba(0,0,0,0.4)' : 'none',
                  borderRight: color ? '2px solid rgba(0,0,0,0.4)' : 'none',
                  boxSizing: 'border-box'
                }} />
              ))
            )}
          </div>
          
          {/* Overlays */}
          {gameState === 'idle' && (
             <Overlay text="TETRIS" subtext="Appuyez sur Nouvelle Partie" bgColor="rgba(0,0,0,0.7)" />
          )}
          {gameState === 'game_over' && (
             <Overlay text="GAME OVER" subtext="Nouvelle Partie pour rejouer" bgColor="rgba(255,0,0,0.5)" />
          )}
          {gameState === 'paused' && (
             <Overlay text="PAUSE" subtext="Reprendre via le menu" bgColor="rgba(0,0,0,0.6)" />
          )}
        </div>

        {/* ── Info Panel ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: 100
        }}>
          {/* Next Piece */}
          <Panel title="Suivant">
             <div style={{
              display: 'grid',
              gridTemplateRows: `repeat(4, ${BLOCK_SIZE}px)`,
              gridTemplateColumns: `repeat(4, ${BLOCK_SIZE}px)`,
              justifyContent: 'center',
              padding: 4
            }}>
              {nextGrid.map((row, y) =>
                row.map((color, x) => (
                  <div key={`nextcell-${x}-${y}`} style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    backgroundColor: COLORS[color],
                    borderTop: color ? '2px solid rgba(255,255,255,0.4)' : 'none',
                    borderLeft: color ? '2px solid rgba(255,255,255,0.4)' : 'none',
                    borderBottom: color ? '2px solid rgba(0,0,0,0.4)' : 'none',
                    borderRight: color ? '2px solid rgba(0,0,0,0.4)' : 'none',
                    boxSizing: 'border-box'
                  }} />
                ))
              )}
            </div>
          </Panel>

          <Panel title="Score">
             <InfoValue>{score}</InfoValue>
          </Panel>
          <Panel title="Niveau">
             <InfoValue>{level}</InfoValue>
          </Panel>
          <Panel title="Lignes">
             <InfoValue>{lines}</InfoValue>
          </Panel>
          
          <div style={{ marginTop: 'auto', fontSize: 10, color: '#666', textAlign: 'center' }}>
            Flèches: Bouger/Tourner<br/>
            Espace: Chute libre
          </div>
        </div>

      </div>
    </div>
  )
}

function Overlay({ text, subtext, bgColor }: { text: string, subtext?: string, bgColor: string }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: bgColor,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      textShadow: '1px 1px 0 #000',
      textAlign: 'center',
      padding: 10
    }}>
      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>{text}</div>
      {subtext && <div style={{ fontSize: 11 }}>{subtext}</div>}
    </div>
  )
}

function Panel({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{
      borderLeft: '1px solid #fff',
      borderTop: '1px solid #fff',
      borderRight: '1px solid #808080',
      borderBottom: '1px solid #808080',
      backgroundColor: '#f0f0f0',
      padding: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  )
}

function InfoValue({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      borderLeft: '2px solid #808080',
      borderTop: '2px solid #808080',
      borderRight: '2px solid #fff',
      borderBottom: '2px solid #fff',
      backgroundColor: '#000',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: 14,
      width: '100%',
      textAlign: 'right',
      padding: '2px 4px',
      boxSizing: 'border-box'
    }}>
      {children}
    </div>
  )
}


