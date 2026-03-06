'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
    useClippy,
    initClippyTutorial,
    advanceClippyTutorial,
    skipClippyTutorial,
    restartClippyTutorial,
    clickClippy,
    showClippyTip,
    showClippyWhoAmI,
    suggestClippyGame,
    dismissClippySpeech,
    closeClippyMenu,
    resetClippyIdleTimer,
    moveClippy,
    deleteClippy,
    cureClippy,
    CLIPPY_MENU_ITEMS,
    type ClippyEmotion,
} from '@/components/xp/contexts/ClippyStore'
import type { AppType } from '@/components/xp/core/WindowManager'

/* ═══════════════════════════════════════════════
 *  Cleepy — The Windows XP Assistant
 *
 *  A CSS-drawn animated paperclip character
 *  with speech bubbles, tutorial, and context menu.
 * ═══════════════════════════════════════════════ */

interface ClippyProps {
    openApp?: (appType: AppType) => void
    desktopW?: number
    desktopH?: number
}

export function Clippy({ openApp, desktopW = 1024, desktopH = 768 }: ClippyProps) {
    const state = useClippy()
    const initialized = useRef(false)
    const [typewriterText, setTypewriterText] = useState('')
    const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Clamp coordinates to the actual desktop boundaries so he doesn't render off-screen in 3D
    const clippyW = 100
    const clippyH = 100
    const speechH = 150 // approximate max height of the speech bubble
    const taskbarH = 40
    let renderX = state.x
    let renderY = state.y

    // Safety check in case the persisted values were from a much larger screen
    if (typeof state.x !== 'number' || isNaN(state.x)) renderX = desktopW - clippyW - 20
    if (typeof state.y !== 'number' || isNaN(state.y)) renderY = desktopH - clippyH - taskbarH - 20

    // Compute if we're near the edges
    const isNearTop = renderY < speechH
    const isNearRight = renderX > desktopW - 200 // Menu width is ~180
    const isNearLeft = renderX < 150

    // Actually clamp
    renderX = Math.max(0, Math.min(renderX, desktopW - clippyW))
    renderY = Math.max(isNearTop ? 0 : speechH, Math.min(renderY, desktopH - clippyH - taskbarH))

    // Initialize tutorial on first mount
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            // Small delay so the desktop renders first
            const t = setTimeout(() => initClippyTutorial(), 1500)
            return () => clearTimeout(t)
        }
    }, [])

    // Typewriter effect for speech
    useEffect(() => {
        if (typewriterRef.current) {
            clearInterval(typewriterRef.current)
            typewriterRef.current = null
        }

        if (!state.speech) {
            setTypewriterText('')
            return
        }

        const fullText = state.speech.text
        let index = 0
        setTypewriterText('')

        typewriterRef.current = setInterval(() => {
            index++
            setTypewriterText(fullText.slice(0, index))
            if (index >= fullText.length) {
                if (typewriterRef.current) clearInterval(typewriterRef.current)
                typewriterRef.current = null
            }
        }, 25)

        return () => {
            if (typewriterRef.current) clearInterval(typewriterRef.current)
        }
    }, [state.speech?.text])

    // Handle menu item click
    const handleMenuAction = useCallback((action: string) => {
        closeClippyMenu()
        switch (action) {
            case 'tip':
                showClippyTip()
                break
            case 'whoami':
                showClippyWhoAmI()
                break
            case 'game':
                suggestClippyGame()
                break
            case 'cv':
                openApp?.('cv')
                break
            case 'restart-tutorial':
                restartClippyTutorial()
                break
            case 'close':
                break
        }
    }, [openApp])

    // Click on Clippy body
    const handleClippyClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        clickClippy()
        resetClippyIdleTimer()
    }, [])

    // Close menu when clicking outside
    useEffect(() => {
        if (!state.menuOpen) return
        const handleClickOutside = () => closeClippyMenu()
        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside)
        }, 10)
        return () => {
            clearTimeout(timer)
            document.removeEventListener('click', handleClickOutside)
        }
    }, [state.menuOpen])

    // Move Clippy logic (pointer capture)
    const dragRef = useRef<{ startX: number; startY: number; startWinX: number; startWinY: number } | null>(null)

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        // Only drag from the body, prevent menu clicks from dragging
        if ((e.target as HTMLElement).closest('.cleepy-menu') || (e.target as HTMLElement).closest('.cleepy-speech')) {
            return
        }

        const target = e.currentTarget as HTMLElement
        target.setPointerCapture(e.pointerId)

        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWinX: renderX,
            startWinY: renderY,
        }
    }, [renderX, renderY])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragRef.current) return
        const dx = e.clientX - dragRef.current.startX
        const dy = e.clientY - dragRef.current.startY
        moveClippy(dragRef.current.startWinX + dx, dragRef.current.startWinY + dy)
    }, [])

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        const target = e.currentTarget as HTMLElement
        target.releasePointerCapture(e.pointerId)

        if (!dragRef.current) return

        const dx = Math.abs(e.clientX - dragRef.current.startX)
        const dy = Math.abs(e.clientY - dragRef.current.startY)

        // If moved less than 5 pixels, treat as a click
        if (dx < 5 && dy < 5) {
            clickClippy()
            resetClippyIdleTimer()
        } else {
            // Check if dropped on the Recycle Bin
            // We use elementsFromPoint because elementFromPoint might return Clippy himself
            const dropTargets = document.elementsFromPoint(e.clientX, e.clientY)
            const recycleBin = dropTargets.find(el => el.closest('[data-app-id="recycle-bin"]'))

            if (recycleBin) {
                deleteClippy()
            }
        }

        dragRef.current = null
    }, [])

    // HTML5 Drag and Drop for the Rose
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault() // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move'
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        try {
            const dataStr = e.dataTransfer.getData('text/plain')
            if (!dataStr) return
            const payload = JSON.parse(dataStr)
            if (payload && payload.name === 'La-Rose.txt') {
                cureClippy()
            }
        } catch {
            // Ignore parse errors from foreign drops
        }
    }, [])


    if (!state.visible || state.isDeleted) return null

    return (
        <>
            <style>{CLIPPY_STYLES}</style>
            <div
                className="cleepy-container"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                    position: 'absolute',
                    left: renderX,
                    top: renderY,
                    zIndex: 9990,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'auto',
                    touchAction: 'none', // Prevent scrolling on touch devices
                }}
            >
                {/* ─── Speech Bubble ─── */}
                {state.speech && (
                    <SpeechBubble
                        text={typewriterText}
                        type={state.speech.type}
                        onNext={state.speech.type === 'tutorial' ? advanceClippyTutorial : undefined}
                        onSkip={state.speech.type === 'tutorial' ? skipClippyTutorial : undefined}
                        onDismiss={state.speech.type !== 'tutorial' ? dismissClippySpeech : undefined}
                        tutorialStep={state.tutorialStep}
                        totalSteps={6}
                        isNearTop={isNearTop}
                        isNearLeft={isNearLeft}
                        isNearRight={isNearRight}
                    />
                )}

                {/* ─── Context Menu ─── */}
                {state.menuOpen && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="cleepy-menu"
                        style={{
                            position: 'absolute',
                            top: isNearTop ? clippyH + 10 : undefined,
                            bottom: !isNearTop ? 120 : undefined,
                            right: isNearRight ? 0 : undefined,
                            left: !isNearRight ? 0 : undefined,
                            backgroundColor: '#ECE9D8',
                            border: '2px solid #0054E3',
                            borderRadius: 4,
                            boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                            padding: '4px 0',
                            width: 180,
                            zIndex: 9999,
                            fontFamily: '"Tahoma", "Segoe UI", sans-serif',
                            fontSize: 12,
                        }}
                    >
                        <div style={{
                            padding: '4px 8px',
                            fontWeight: 'bold',
                            fontSize: 11,
                            color: '#0054E3',
                            borderBottom: '1px solid #ACA899',
                            marginBottom: 2,
                        }}>
                            Cleepy — Assistant
                        </div>
                        {CLIPPY_MENU_ITEMS.map((item) => (
                            <div
                                key={item.action}
                                onClick={() => handleMenuAction(item.action)}
                                className="cleepy-menu-item"
                                style={{
                                    padding: '5px 12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#316AC5')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── Character ─── */}
                <div
                    onClick={handleClippyClick}
                    className={`cleepy-character cleepy-emotion-${state.emotion}`}
                    title="Cliquez sur Cleepy !"
                    style={{ cursor: 'pointer' }}
                >
                    <ClippyCharacter emotion={state.emotion} />
                </div>
            </div>
        </>
    )
}

/* ── Speech Bubble ── */

function SpeechBubble({
    text,
    type,
    onNext,
    onSkip,
    onDismiss,
    tutorialStep,
    totalSteps,
    isNearTop,
    isNearLeft,
    isNearRight,
}: {
    text: string
    type: string
    onNext?: () => void
    onSkip?: () => void
    onDismiss?: () => void
    tutorialStep: number
    totalSteps: number
    isNearTop: boolean
    isNearLeft: boolean
    isNearRight: boolean
}) {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="cleepy-speech"
            style={{
                position: 'absolute',
                top: isNearTop ? 110 : undefined, // below Clippy if near top
                bottom: !isNearTop ? 110 : undefined, // above Clippy otherwise
                left: isNearLeft ? 0 : isNearRight ? undefined : '50%',
                right: isNearRight ? 0 : undefined,
                transform: !isNearLeft && !isNearRight ? 'translateX(-50%)' : 'none',
                backgroundColor: '#FFFEE0',
                border: '2px solid #000',
                borderRadius: 12,
                padding: '10px 14px',
                width: 280, // fixed width so it doesn't jump around
                fontFamily: '"Tahoma", "Segoe UI", sans-serif',
                fontSize: 12,
                lineHeight: 1.5,
                color: '#000',
                boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
                animation: 'cleepy-bubble-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
        >
            {/* Close button for non-tutorial */}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    style={{
                        position: 'absolute',
                        top: 2,
                        right: 6,
                        background: 'none',
                        border: 'none',
                        fontSize: 14,
                        cursor: 'pointer',
                        color: '#888',
                        fontWeight: 'bold',
                        lineHeight: 1,
                    }}
                >
                    ×
                </button>
            )}

            {/* Text */}
            <div style={{ marginBottom: type === 'tutorial' ? 8 : 0, paddingRight: onDismiss ? 14 : 0 }}>
                {text}
            </div>

            {/* Tutorial buttons */}
            {type === 'tutorial' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <button
                        onClick={onSkip}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: 10,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                    >
                        Passer le tuto
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 9, color: '#888' }}>
                            {tutorialStep + 1}/{totalSteps}
                        </span>
                        <button
                            onClick={onNext}
                            style={{
                                background: 'linear-gradient(180deg, #4A90D9, #2E6BB5)',
                                color: '#fff',
                                border: '1px solid #1A4D8F',
                                borderRadius: 3,
                                padding: '3px 12px',
                                fontSize: 11,
                                fontWeight: 'bold',
                                cursor: 'pointer',
                            }}
                        >
                            {tutorialStep === totalSteps - 1 ? 'Terminer ✓' : 'Suivant →'}
                        </button>
                    </div>
                </div>
            )}

            {/* Speech bubble pointer */}
            <div
                style={{
                    position: 'absolute',
                    bottom: -10,
                    right: 30,
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '10px solid #000',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: -7,
                    right: 31,
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderTop: '9px solid #FFFEE0',
                }}
            />
        </div>
    )
}

/* ── Character (SVG Paperclip) ── */

function ClippyCharacter({ emotion }: { emotion: ClippyEmotion }) {
    // Generate the pupil positions based on emotion (e.g. looking down when sad, up when happy)
    const pupilDy = (emotion === 'hurt' || emotion === 'cry') ? 5 : (emotion === 'angry' ? -2 : (emotion === 'happy' ? -2 : 0));
    const pupilDx = (emotion === 'happy') ? 1 : 0;

    // The exact continuous path of a paperclip starting from inner wire
    const clippyPath = "M 40,55 L 40,80 A 10,10 0 0,0 60,80 L 60,25 A 20,20 0 0,0 20,25 L 20,95 A 30,30 0 0,0 80,95 L 80,40";

    return (
        <div
            className={`cleepy-body cleepy-anim-${emotion}`}
            style={{
                width: 70,
                height: 100,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <svg
                viewBox="0 0 100 130"
                width="100%"
                height="100%"
                style={{
                    filter: emotion === 'hurt' || emotion === 'cry' ? 'hue-rotate(10deg) drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))',
                    overflow: 'visible'
                }}
            >
                <defs>
                    <linearGradient id="clippy-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d5d5d5" />
                        <stop offset="30%" stopColor="#ffffff" />
                        <stop offset="70%" stopColor="#a0a0a0" />
                        <stop offset="100%" stopColor="#606060" />
                    </linearGradient>
                </defs>

                {/* Wire Outline / Shadow */}
                <path
                    d={clippyPath}
                    fill="none"
                    stroke="#444"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Main Metallic Wire */}
                <path
                    d={clippyPath}
                    fill="none"
                    stroke="url(#clippy-metal)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Highlight */}
                <path
                    d={clippyPath}
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(-1, -1)"
                />

                {/* Left Eye */}
                <ellipse cx="36" cy="45" rx="13" ry="17" fill="white" stroke="#222" strokeWidth="1.5" />
                {/* Right Eye */}
                <ellipse cx="64" cy="45" rx="13" ry="17" fill="white" stroke="#222" strokeWidth="1.5" />

                {/* Left Pupil */}
                <circle cx={40 + pupilDx} cy={45 + pupilDy} r="5" fill="#111" />
                {/* Right Pupil */}
                <circle cx={60 + pupilDx} cy={45 + pupilDy} r="5" fill="#111" />

                {/* Eye Highlights */}
                <circle cx={38 + pupilDx} cy={43 + pupilDy} r="1.5" fill="white" />
                <circle cx={58 + pupilDx} cy={43 + pupilDy} r="1.5" fill="white" />

                {/* Eyebrows */}
                {emotion === 'angry' && (
                    <g stroke="#222" strokeWidth="3" strokeLinecap="round">
                        <line x1="22" y1="20" x2="44" y2="34" />
                        <line x1="56" y1="34" x2="78" y2="20" />
                    </g>
                )}
                {(emotion === 'hurt' || emotion === 'cry') && (
                    <g stroke="#222" strokeWidth="3" strokeLinecap="round">
                        <line x1="24" y1="34" x2="44" y2="22" />
                        <line x1="56" y1="22" x2="76" y2="34" />
                    </g>
                )}
                {emotion === 'happy' && (
                    <g stroke="#222" strokeWidth="2" strokeLinecap="round" fill="none">
                        <path d="M 24,28 Q 34,20 44,28" />
                        <path d="M 56,28 Q 66,20 76,28" />
                    </g>
                )}

                {/* Tears */}
                {emotion === 'cry' && (
                    <g fill="#5BC0EB">
                        <path d="M 28,70 Q 32,80 28,85 Q 24,80 28,70" className="cleepy-tear" />
                        <path d="M 72,70 Q 76,80 72,85 Q 68,80 72,70" className="cleepy-tear cleepy-tear-right" />
                    </g>
                )}

                {/* Blush */}
                {(emotion === 'hurt' || emotion === 'cry') && (
                    <g fill="rgba(255, 100, 100, 0.6)">
                        <ellipse cx="20" cy="58" rx="7" ry="4" />
                        <ellipse cx="80" cy="58" rx="7" ry="4" />
                    </g>
                )}
            </svg>

            {/* Wave hand */}
            {emotion === 'wave' && (
                <div className="cleepy-wave-hand" style={{
                    position: 'absolute',
                    right: -12,
                    top: 15,
                    fontSize: 26,
                    transformOrigin: 'bottom center',
                    filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))'
                }}>
                    👋
                </div>
            )}

            {/* Shadow under Clippy */}
            <div style={{
                position: 'absolute',
                bottom: -8,
                left: 15,
                width: 40,
                height: 8,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.3), transparent 70%)',
            }} />
        </div>
    )
}

/* ── CSS Keyframes ── */

const CLIPPY_STYLES = `
  @keyframes cleepy-bubble-in {
    from {
      transform: scale(0.5) translateY(10px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  @keyframes cleepy-idle-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @keyframes cleepy-hurt-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }

  @keyframes cleepy-wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    75% { transform: rotate(-10deg); }
  }

  @keyframes cleepy-tear-fall {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(12px); opacity: 0; }
  }

  @keyframes cleepy-cry-shake {
    0%, 100% { transform: translateY(0); }
    25% { transform: translateY(-2px) rotate(-1deg); }
    75% { transform: translateY(-2px) rotate(1deg); }
  }

  .cleepy-anim-idle {
    animation: cleepy-idle-bounce 3s ease-in-out infinite;
  }

  .cleepy-anim-happy {
    animation: cleepy-idle-bounce 1.5s ease-in-out infinite;
  }

  .cleepy-anim-hurt {
    animation: cleepy-hurt-shake 0.4s ease-in-out;
  }

  .cleepy-anim-angry {
    animation: cleepy-hurt-shake 0.3s ease-in-out infinite;
  }

  .cleepy-anim-cry {
    animation: cleepy-cry-shake 0.6s ease-in-out infinite;
  }

  .cleepy-anim-wave {
    animation: cleepy-idle-bounce 2s ease-in-out infinite;
  }

  .cleepy-wave-hand {
    animation: cleepy-wave 0.8s ease-in-out infinite;
  }

  .cleepy-tear {
    animation: cleepy-tear-fall 1.2s ease-in infinite;
  }

  .cleepy-tear-right {
    animation-delay: 0.4s;
  }

  .cleepy-character {
    transition: transform 0.2s ease;
  }

  .cleepy-character:hover {
    transform: scale(1.08);
  }

  .cleepy-character:active {
    transform: scale(0.95);
  }

  .cleepy-menu-item:hover span {
    color: #fff !important;
  }

  .cleepy-container {
    transform-origin: bottom right;
  }
`
