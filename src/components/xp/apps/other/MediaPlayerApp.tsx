'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useVolume, useVolumeState } from '@/components/xp/contexts/VolumeContext'

/* ═══════════════════════════════════════════════
 *  Media Player App (Windows Media Player style)
 *
 *  Architecture:
 *  - A HIDDEN YouTube IFrame API player (1x1px) handles
 *    the actual audio playback and volume control.
 *  - A VISIBLE cropped iframe shows the video visually.
 *  - The Volume Mixer controls the hidden player's volume
 *    via the YouTube IFrame Player API.
 * ═══════════════════════════════════════════════ */

let ytApiLoading = false
let ytApiReady = false
const ytApiCallbacks: (() => void)[] = []

function ensureYTApi(): Promise<void> {
    return new Promise((resolve) => {
        if (ytApiReady || (window as any).YT?.Player) {
            ytApiReady = true
            resolve()
            return
        }
        ytApiCallbacks.push(resolve)
        if (!ytApiLoading) {
            ytApiLoading = true
                ; (window as any).onYouTubeIframeAPIReady = () => {
                    ytApiReady = true
                    ytApiCallbacks.forEach(cb => cb())
                    ytApiCallbacks.length = 0
                }
            const tag = document.createElement('script')
            tag.src = 'https://www.youtube.com/iframe_api'
            document.head.appendChild(tag)
        }
    })
}

export function MediaPlayerApp({ windowId }: { windowId: string }) {
    const playerRef = useRef<any>(null)
    const audioPlayerDivRef = useRef<HTMLDivElement>(null)
    const vol = useVolume()
    const volState = useVolumeState()
    const readyRef = useRef(false)

    // Register this app in the volume store
    useEffect(() => {
        vol.registerApp(windowId, 'Lofi Radio', '🎵')
        return () => vol.unregisterApp(windowId)
    }, [vol, windowId])

    // Apply volume to the hidden YT audio player
    const applyVolume = useCallback(() => {
        const player = playerRef.current
        if (!player || !readyRef.current) return
        try {
            const effective = vol.getEffectiveVolume(windowId)
            if (effective === 0 || volState.masterMuted || volState.apps[windowId]?.muted) {
                player.mute()
            } else {
                player.unMute()
                player.setVolume(effective)
            }
        } catch {
            // Player might be destroyed
        }
    }, [vol, volState, windowId])

    // Initialize the HIDDEN YouTube audio player
    useEffect(() => {
        let destroyed = false

        ensureYTApi().then(() => {
            if (destroyed || !audioPlayerDivRef.current) return

            new (window as any).YT.Player(audioPlayerDivRef.current, {
                videoId: 'jfKfPfyJRdk',
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    iv_load_policy: 3,
                },
                events: {
                    onReady: (event: any) => {
                        if (destroyed) return
                        playerRef.current = event.target
                        readyRef.current = true
                        // Start muted so autoplay is allowed by browsers, then try to unmute
                        try {
                            event.target.mute()
                        } catch {}
                        try {
                            event.target.playVideo()
                        } catch {}

                        // After playback starts, attempt to apply desired volume and unmute
                        setTimeout(() => {
                            if (destroyed) return
                            try {
                                const effective = vol.getEffectiveVolume(windowId)
                                if (effective === 0 || volState.masterMuted || volState.apps[windowId]?.muted) {
                                    // keep muted
                                } else {
                                    try { event.target.unMute() } catch {}
                                    try { event.target.setVolume(effective) } catch {}
                                }
                            } catch {
                                // ignore
                            }
                        }, 500)
                    },
                },
            })
        })

        return () => {
            destroyed = true
            readyRef.current = false
            const p = playerRef.current
            if (p && typeof p.destroy === 'function') {
                try { p.destroy() } catch { }
            }
            playerRef.current = null
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Sync volume reactively
    useEffect(() => { applyVolume() }, [applyVolume])

    // Polling fallback for volume sync
    useEffect(() => {
        const id = setInterval(applyVolume, 300)
        return () => clearInterval(id)
    }, [applyVolume])

    return (
        <div style={{ height: '100%', backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
            {/* Fake WMP Header */}
            <div style={{
                backgroundColor: '#2b2b2b', color: '#fff', fontFamily: 'Tahoma, sans-serif',
                padding: '4px 8px', fontSize: 12, borderBottom: '1px solid #444',
                display: 'flex', alignItems: 'center', gap: 8
            }}>
                <span style={{ color: '#00FF00' }}>▶</span> Lofi Girl - lofi hip hop radio
            </div>

            {/* HIDDEN audio player (1x1 px, off-screen) — this is the one the volume mixer controls */}
            <div
                ref={audioPlayerDivRef}
                style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    top: -9999,
                    left: -9999,
                    opacity: 0,
                    pointerEvents: 'none',
                }}
            />

            {/* VISIBLE video display — just for visuals, muted */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
                <iframe
                    src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&mute=1"
                    title="Lofi Girl Visual"
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    style={{
                        position: 'absolute',
                        top: -60,
                        left: -12,
                        width: 'calc(100% + 24px)',
                        height: 'calc(100% + 120px)',
                        pointerEvents: 'none',
                    }}
                />
            </div>
        </div>
    )
}
