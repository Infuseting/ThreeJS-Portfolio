'use client'

import { useWM, useWMState } from '@/components/xp/core/WindowManager'
import { useVolume, useVolumeState } from '@/components/xp/contexts/VolumeContext'
import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════
 *  Volume Mixer App (Windows XP style)
 *
 *  Shows a Master volume slider and one slider
 *  per open window. Each slider actually controls
 *  the effective volume of that app.
 * ═══════════════════════════════════════════════ */

export function VolumeMixerApp({ windowId }: { windowId: string }) {
    const wm = useWM()
    const wmState = useWMState()
    const vol = useVolume()
    const volState = useVolumeState()
    const containerRef = useRef<HTMLDivElement>(null)

    // Close window when clicking outside
    useEffect(() => {
        const handleDown = (e: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {

                const target = e.target as HTMLElement
                wm.closeWindow(windowId)
            }
        }
        // Small delay so the click that opened this doesn't immediately close it
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleDown)
            document.addEventListener('touchstart', handleDown)
        }, 10)

        return () => {
            clearTimeout(timer)
            document.removeEventListener('mousedown', handleDown)
            document.removeEventListener('touchstart', handleDown)
        }
    }, [windowId, wm])

    // Register open windows and unregister closed ones from the volume store
    useEffect(() => {
        const openIds = new Set(wmState.windows.map(w => w.id))

        // Register new windows
        wmState.windows.forEach((win) => {
            if (win.id !== windowId && win.appType !== 'volume-mixer') {
                vol.registerApp(win.id, win.title, win.icon)
            }
        })

        // Unregister closed windows
        Object.keys(volState.apps).forEach((appId) => {
            if (!openIds.has(appId)) {
                vol.unregisterApp(appId)
            }
        })
    }, [wmState.windows, vol, volState.apps, windowId])

    const appEntries = Object.values(volState.apps).filter(a => a.windowId !== windowId)

    return (
        <div ref={containerRef} style={{
            height: '100%',
            backgroundColor: '#ECE9D8',
            fontFamily: 'Tahoma, sans-serif',
            fontSize: 11,
            display: 'flex',
            flexDirection: 'column',
            userSelect: 'none',
        }}>
            {/* Menu bar */}
            <div style={{ display: 'flex', gap: 10, padding: '2px 4px', borderBottom: '1px solid #ACA899' }}>
                <span style={{ padding: '0 4px', cursor: 'pointer' }}>Options</span>
                <span style={{ padding: '0 4px', cursor: 'pointer' }}>Aide</span>
            </div>

            {/* Mixer area */}
            <div style={{
                flex: 1,
                display: 'flex',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '8px 4px',
                gap: 0,
                scrollbarWidth: 'thin',
            }}>
                {/* Master channel */}
                <VolumeChannel
                    label="Master"
                    icon="🔊"
                    volume={volState.masterVolume}
                    muted={volState.masterMuted}
                    onVolumeChange={(v) => vol.setMasterVolume(v)}
                    onToggleMute={() => vol.toggleMasterMute()}
                    isMaster
                />

                {/* Separator */}
                <div style={{ width: 1, backgroundColor: '#ACA899', margin: '4px 0', flexShrink: 0 }} />

                {/* Per-app channels */}
                {appEntries.length > 0 ? (
                    appEntries.map((app) => (
                        <VolumeChannel
                            key={app.windowId}
                            label={app.appTitle}
                            icon={app.appIcon}
                            volume={app.volume}
                            muted={app.muted}
                            onVolumeChange={(v) => vol.setAppVolume(app.windowId, v)}
                            onToggleMute={() => vol.toggleAppMute(app.windowId)}
                        />
                    ))
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#666', padding: 20 }}>
                        Aucune application ouverte
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── Single Volume Channel ── */

interface VolumeChannelProps {
    label: string
    icon: string
    volume: number
    muted: boolean
    onVolumeChange: (v: number) => void
    onToggleMute: () => void
    isMaster?: boolean
}

function VolumeChannel({ label, icon, volume, muted, onVolumeChange, onToggleMute, isMaster }: VolumeChannelProps) {
    const [dragging, setDragging] = useState(false)

    // Handle drag on the slider track
    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const y = e.clientY - rect.top
        const ratio = 1 - y / rect.height
        onVolumeChange(Math.round(ratio * 100))
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setDragging(true)
        e.currentTarget.setPointerCapture(e.pointerId)
        const rect = e.currentTarget.getBoundingClientRect()
        const y = e.clientY - rect.top
        const ratio = 1 - y / rect.height
        onVolumeChange(Math.round(ratio * 100))
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging) return
        const rect = e.currentTarget.getBoundingClientRect()
        const y = e.clientY - rect.top
        const ratio = 1 - y / rect.height
        onVolumeChange(Math.round(Math.max(0, Math.min(100, ratio * 100))))
    }

    const handlePointerUp = () => {
        setDragging(false)
    }

    const thumbPosition = 100 - volume // 0=top, 100=bottom

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: isMaster ? 80 : 72,
            minWidth: isMaster ? 80 : 72,
            padding: '4px 8px',
            gap: 4,
        }}>
            {/* Icon */}
            <div style={{ fontSize: 18 }}>{icon}</div>

            {/* Volume level display */}
            <div style={{
                fontSize: 10,
                color: muted ? '#999' : '#000',
                fontWeight: 'bold',
            }}>
                {muted ? 'MUET' : `${volume}%`}
            </div>

            {/* Vertical slider track */}
            <div
                style={{
                    flex: 1,
                    width: 24,
                    position: 'relative',
                    cursor: 'pointer',
                    minHeight: 80,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                {/* Track background */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: 4,
                    bottom: 4,
                    width: 4,
                    backgroundColor: '#808080',
                    borderLeft: '1px solid #404040',
                    borderTop: '1px solid #404040',
                    borderRight: '1px solid #fff',
                    borderBottom: '1px solid #fff',
                }} />

                {/* Filled portion */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: 4,
                    width: 4,
                    height: `${volume}%`,
                    maxHeight: 'calc(100% - 8px)',
                    backgroundColor: muted ? '#999' : (isMaster ? '#0054E3' : '#3C9D3C'),
                }} />

                {/* Tick marks */}
                {[0, 20, 40, 60, 80, 100].map((tick) => (
                    <div key={tick} style={{
                        position: 'absolute',
                        top: `${100 - tick}%`,
                        left: 0,
                        right: 0,
                        height: 1,
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <div style={{ width: 3, height: 1, backgroundColor: '#808080' }} />
                        <div style={{ flex: 1 }} />
                        <div style={{ width: 3, height: 1, backgroundColor: '#808080' }} />
                    </div>
                ))}

                {/* Thumb */}
                <div style={{
                    position: 'absolute',
                    top: `calc(${thumbPosition}% - 6px)`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 14,
                    height: 12,
                    backgroundColor: '#ECE9D8',
                    borderLeft: '2px solid #fff',
                    borderTop: '2px solid #fff',
                    borderRight: '2px solid #808080',
                    borderBottom: '2px solid #808080',
                    cursor: 'grab',
                    zIndex: 2,
                }} />
            </div>

            {/* Mute checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', fontSize: 10, marginTop: 2 }}>
                <input
                    type="checkbox"
                    checked={muted}
                    onChange={onToggleMute}
                    style={{ width: 12, height: 12, cursor: 'pointer' }}
                />
                Muet
            </label>

            {/* Label */}
            <div style={{
                width: '100%',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 10,
                fontWeight: isMaster ? 'bold' : 'normal',
                color: '#000',
                padding: '0 2px',
            }}
                title={label}
            >
                {label}
            </div>
        </div>
    )
}
