'use client'

import { useEffect, useRef } from 'react'
import { useVolume, useVolumeState } from '@/components/xp/contexts/VolumeContext'

/* ═══════════════════════════════════════════════
 *  AudioIframe — a wrapper for iframes that
 *  registers with the Volume Mixer and controls
 *  their audio via the Web Audio API when possible,
 *  or by muting/unmuting the iframe.
 *
 *  For same-origin iframes, we try to intercept
 *  audio elements inside. For cross-origin, we
 *  control `allow` attribute as a fallback.
 * ═══════════════════════════════════════════════ */

interface AudioIframeProps {
    windowId: string
    appTitle: string
    appIcon: string
    src: string
    title: string
    style?: React.CSSProperties
    allow?: string
}

export function AudioIframe({ windowId, appTitle, appIcon, src, title, style, allow }: AudioIframeProps) {
    const vol = useVolume()
    const volState = useVolumeState()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const gainNodeRef = useRef<GainNode | null>(null)
    const audioCtxRef = useRef<AudioContext | null>(null)
    const connectedRef = useRef(false)

    // Register with volume context
    useEffect(() => {
        vol.registerApp(windowId, appTitle, appIcon)
        return () => vol.unregisterApp(windowId)
    }, [vol, windowId, appTitle, appIcon])

    // Try to connect to same-origin iframe audio via Web Audio API
    useEffect(() => {
        const iframe = iframeRef.current
        if (!iframe || connectedRef.current) return

        const tryConnect = () => {
            try {
                const iframeDoc = iframe.contentWindow?.document
                if (!iframeDoc) return

                // Find all audio/video elements in the iframe
                const mediaElements = [
                    ...Array.from(iframeDoc.querySelectorAll('audio')),
                    ...Array.from(iframeDoc.querySelectorAll('video')),
                ] as HTMLMediaElement[]

                if (mediaElements.length === 0) return

                if (!audioCtxRef.current) {
                    audioCtxRef.current = new AudioContext()
                }
                const ctx = audioCtxRef.current
                const gain = ctx.createGain()
                gain.connect(ctx.destination)
                gainNodeRef.current = gain

                mediaElements.forEach((el) => {
                    try {
                        const source = ctx.createMediaElementSource(el)
                        source.connect(gain)
                    } catch {
                        // Element might already be connected
                    }
                })

                connectedRef.current = true
            } catch {
                // Cross-origin — can't access iframe contents, volume control via gain not possible
            }
        }

        // Try on load and also after a delay
        iframe.addEventListener('load', tryConnect)
        const timeout = setTimeout(tryConnect, 2000)

        return () => {
            iframe.removeEventListener('load', tryConnect)
            clearTimeout(timeout)
        }
    }, [])

    // Sync effective volume
    useEffect(() => {
        const effective = vol.getEffectiveVolume(windowId) / 100 // 0.0 – 1.0

        // Method 1: GainNode (works for same-origin iframes with audio/video elements)
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = effective
        }

        // Method 2: For same-origin iframes, try to set volume on their media elements directly
        const iframe = iframeRef.current
        if (iframe) {
            try {
                const iframeDoc = iframe.contentWindow?.document
                if (iframeDoc) {
                    const mediaElements = [
                        ...Array.from(iframeDoc.querySelectorAll('audio')),
                        ...Array.from(iframeDoc.querySelectorAll('video')),
                    ] as HTMLMediaElement[]

                    mediaElements.forEach((el) => {
                        el.volume = effective
                        el.muted = effective === 0
                    })
                }
            } catch {
                // Cross-origin — can't access
            }
        }
    }, [volState, vol, windowId])

    return (
        <iframe
            ref={iframeRef}
            src={src}
            title={title}
            style={{ width: '100%', height: '100%', border: 'none', ...style }}
            allow={allow || 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'}
        />
    )
}
