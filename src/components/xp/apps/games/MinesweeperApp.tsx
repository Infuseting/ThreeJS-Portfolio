'use client'

import { useState, useEffect, useRef } from 'react'
import { useMinesweeper } from '@/hooks/games/useMinesweeper'
import { Difficulty, CellData } from '@/utils/games/minesweeper'
import { useWM } from '@/components/xp/core/WindowManager'
import { XPAlert } from '@/components/xp/core/XPAlert'
import { XPToolbarButton } from '@/components/xp/shared'
import { MenuBar } from '@/components/xp/core/MenuBar'
import { GAME_MENU } from '@/components/xp/infrastructure/registries/menuRegistry'

/* ═══════════════════════════════════════════════
 *  Minesweeper App (Windows XP style)
 * ═══════════════════════════════════════════════ */

interface MinesweeperAppProps {
    windowId: string
}

export function MinesweeperApp({ windowId }: MinesweeperAppProps) {
    const { gameState, difficulty, resetGame, reveal, flag, chord } = useMinesweeper('beginner')
    const wm = useWM()

    // Update window size when difficulty changes
    useEffect(() => {
        let w = 0
        let h = 0
        switch (difficulty) {
            case 'beginner': w = 176; h = 250; break;
            case 'intermediate': w = 288; h = 362; break;
            case 'expert': w = 512; h = 362; break;
        }
        // Add some padding/borders for the actual window frame
        wm.resizeWindow(windowId, w + 20, h + 60)
    }, [difficulty, windowId, wm])

    // Timer logic
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        if (gameState.status === 'playing' && gameState.startTime) {
            const interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - gameState.startTime!) / 1000))
            }, 1000)
            return () => clearInterval(interval)
        } else if (gameState.status === 'idle') {
            setElapsed(0)
        }
    }, [gameState.status, gameState.startTime])

    const minesLeft = gameState.minesCount - gameState.flagsCount

    let face = '🙂'
    if (gameState.status === 'won') face = '😎'
    else if (gameState.status === 'lost') face = '😵'

    // Handling mouse down for the 'ooh' face
    const [isMouseDown, setIsMouseDown] = useState(false)

    // Use a global mouse up to catch releases outside the app
    useEffect(() => {
        const handleMouseUp = () => setIsMouseDown(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const [showAbout, setShowAbout] = useState(false)

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: '#C0C0C0',
                fontFamily: 'Tahoma, sans-serif',
                fontSize: 11,
                userSelect: 'none',
                border: 'none',
                padding: 0,
            }}
            onMouseLeave={() => setIsMouseDown(false)}
        >
            {/* ── Menu bar (shared GAME_MENU) ── */}
            <div style={{ marginBottom: 4 }}>
                <MenuBar menus={GAME_MENU({
                    onNew: () => resetGame(),
                    onDifficulty: (level: string) => resetGame(level as any),
                    onAbout: () => setShowAbout(true),
                    appName: 'Démineur',
                })} />
            </div>

            <div style={{
                borderLeft: '2px solid #808080',
                borderTop: '2px solid #808080',
                borderRight: '2px solid #fff',
                borderBottom: '2px solid #fff',
                padding: 6,
                backgroundColor: '#C0C0C0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                width: 'fit-content'
            }}>
                {/* ── Header Area ── */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    borderLeft: '2px solid #808080',
                    borderTop: '2px solid #808080',
                    borderRight: '2px solid #fff',
                    borderBottom: '2px solid #fff',
                    padding: 4,
                }}>
                    <SevenSegmentDisplay value={minesLeft} />

                    <XPToolbarButton
                        icon={isMouseDown && gameState.status === 'playing' ? '😮' : face}
                        label=""
                        onClick={() => resetGame()}
                        vertical={true}
                    />

                    <SevenSegmentDisplay value={elapsed} />
                </div>

                {/* ── Game Board ── */}
                <div style={{
                    borderLeft: '3px solid #808080',
                    borderTop: '3px solid #808080',
                    borderRight: '3px solid #fff',
                    borderBottom: '3px solid #fff',
                    backgroundColor: '#C0C0C0',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {gameState.board.map((row, y) => (
                        <div key={y} style={{ display: 'flex' }}>
                            {row.map((cell, x) => (
                                <MinesweeperCell
                                    key={`${x}-${y}`}
                                    cell={cell}
                                    gameStateStatus={gameState.status}
                                    onReveal={() => reveal(x, y)}
                                    onFlag={(e) => {
                                        e.preventDefault();
                                        flag(x, y);
                                    }}
                                    onChord={() => chord(x, y)}
                                    setMouseDown={setIsMouseDown}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {showAbout && (
                <XPAlert
                    title="À propos de Démineur"
                    icon="💣"
                    message={"Démineur XP Clone\nPar Infuseting\n\n© 2026 Infuseting. Tous droits réservés."}
                    onClose={() => setShowAbout(false)}
                />
            )}
        </div>
    )
}

function SevenSegmentDisplay({ value }: { value: number }) {
    const boundedValue = Math.max(-99, Math.min(999, value));
    let str = boundedValue.toString();
    if (value >= 0) {
        str = str.padStart(3, '0');
    } else {
        str = '-' + Math.abs(value).toString().padStart(2, '0');
    }

    return (
        <div style={{
            backgroundColor: '#000',
            color: '#ff0000',
            fontFamily: 'monospace',
            fontSize: 20,
            fontWeight: 'bold',
            padding: '1px 2px',
            borderLeft: '1px solid #808080',
            borderTop: '1px solid #808080',
            borderRight: '1px solid #fff',
            borderBottom: '1px solid #fff',
            lineHeight: 1,
            minWidth: 40,
            textAlign: 'right',
            letterSpacing: 1
        }}>
            {str}
        </div>
    )
}

interface CellProps {
    cell: CellData;
    gameStateStatus: 'idle' | 'playing' | 'won' | 'lost';
    onReveal: () => void;
    onFlag: (e: React.MouseEvent) => void;
    onChord: () => void;
    setMouseDown: (v: boolean) => void;
}

const NUMBER_COLORS = [
    "",
    "#0000ff", // 1 blue
    "#008000", // 2 green
    "#ff0000", // 3 red
    "#000080", // 4 dark blue
    "#800000", // 5 dark red
    "#008080", // 6 cyan
    "#000000", // 7 black
    "#808080", // 8 gray
];

const NUMBER_SYMBOLS = ["", "1", "2", "3", "4", "5", "6", "7", "8"];

function MinesweeperCell({ cell, gameStateStatus, onReveal, onFlag, onChord, setMouseDown }: CellProps) {
    const { isRevealed, isMine, isFlagged, neighborMines } = cell;

    const [isDepressed, setIsDepressed] = useState(false); // Visual only

    let content = "";
    let color = "";
    let backgroundColor = "#C0C0C0";

    let isRaised = !isRevealed;

    if (isFlagged) {
        // If lost and it's a false flag, show a crossed mine
        if (gameStateStatus === 'lost' && !isMine) {
            content = "❌"; // Or a mine with a cross
            isRaised = true; // False flags stay raised or look distinct depending on version
        } else {
            content = "🚩";
        }
    } else if (isRevealed) {
        if (isMine) {
            content = "💣";
            backgroundColor = gameStateStatus === 'lost' && isRevealed ? '#ff0000' : '#C0C0C0'; // red background for the clicked mine
        } else if (neighborMines > 0) {
            content = NUMBER_SYMBOLS[neighborMines];
            color = NUMBER_COLORS[neighborMines];
        }
    } else if (gameStateStatus === 'lost' && isMine) {
        // Game lost, and this is an unflagged mine. Reveal it visually without changing state.
        content = "💣";
        isRaised = false; // Usually drawn flat
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.button === 0 && !isFlagged && !isRevealed && gameStateStatus !== 'won' && gameStateStatus !== 'lost') {
            setIsDepressed(true);
            setMouseDown(true);
            e.currentTarget.setPointerCapture(e.pointerId);
        }
        // Chord handling: middle click or both clicks
        if (e.buttons === 3 || e.button === 1) {
            setMouseDown(true);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDepressed(false);
        setMouseDown(false);

        // If depressed, left click
        if (e.button === 0 && !isFlagged && !isRevealed) {
            onReveal();
        }

        // Chord
        if (isRevealed && neighborMines > 0) {
            onChord(); // It handles the logic internally
        }
    };

    const handlePointerEnter = (e: React.PointerEvent) => {
        if (e.buttons === 1 && !isFlagged && !isRevealed && gameStateStatus !== 'won' && gameStateStatus !== 'lost') {
            setIsDepressed(true);
            setMouseDown(true);
        }
    };

    const handlePointerLeave = (e: React.PointerEvent) => {
        setIsDepressed(false);
        if (e.buttons === 1) {
            setMouseDown(true); // Keep ooh face
        }
    };

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onContextMenu={onFlag}
            style={{
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Tahoma, sans-serif',
                fontWeight: 'bold',
                fontSize: 12,
                backgroundColor,
                color,
                borderLeft: isRaised && !isDepressed ? '2px solid #fff' : '1px solid #808080',
                borderTop: isRaised && !isDepressed ? '2px solid #fff' : '1px solid #808080',
                borderRight: isRaised && !isDepressed ? '2px solid #808080' : '0px solid transparent',
                borderBottom: isRaised && !isDepressed ? '2px solid #808080' : '0px solid transparent',
                boxSizing: 'border-box',
                cursor: 'default',
                paddingRight: isRaised && !isDepressed ? 0 : 1, // small visual adjustments to center text better
            }}
        >
            {content}
        </div>
    )
}
