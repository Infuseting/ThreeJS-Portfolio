'use client'

import { createContext, useContext, useCallback, useRef, useSyncExternalStore } from 'react'

/* ═══════════════════════════════════════════════
 *  Volume Context
 *
 *  Global audio volume management.
 *  - Master volume (0–100)
 *  - Per-app volumes keyed by window ID
 *  - Mute toggles (master + per-app)
 *  - subscribe/getSnapshot pattern for React 18
 * ═══════════════════════════════════════════════ */

export interface AppVolume {
    windowId: string
    appTitle: string
    appIcon: string
    volume: number      // 0–100
    muted: boolean
}

interface VolumeState {
    masterVolume: number
    masterMuted: boolean
    apps: Record<string, AppVolume>
}

type Listener = () => void

function createVolumeStore() {
    let state: VolumeState = {
        masterVolume: 80,
        masterMuted: false,
        apps: {},
    }

    const listeners = new Set<Listener>()

    function emit() {
        state = { ...state }
        listeners.forEach((l) => l())
    }

    return {
        subscribe(listener: Listener) {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        getSnapshot(): VolumeState {
            return state
        },

        setMasterVolume(v: number) {
            state.masterVolume = Math.max(0, Math.min(100, v))
            emit()
        },
        toggleMasterMute() {
            state.masterMuted = !state.masterMuted
            emit()
        },

        registerApp(windowId: string, title: string, icon: string) {
            if (!state.apps[windowId]) {
                state.apps = {
                    ...state.apps,
                    [windowId]: { windowId, appTitle: title, appIcon: icon, volume: 100, muted: false },
                }
                emit()
            }
        },
        unregisterApp(windowId: string) {
            const next = { ...state.apps }
            delete next[windowId]
            state.apps = next
            emit()
        },
        setAppVolume(windowId: string, v: number) {
            const app = state.apps[windowId]
            if (!app) return
            state.apps = { ...state.apps, [windowId]: { ...app, volume: Math.max(0, Math.min(100, v)) } }
            emit()
        },
        toggleAppMute(windowId: string) {
            const app = state.apps[windowId]
            if (!app) return
            state.apps = { ...state.apps, [windowId]: { ...app, muted: !app.muted } }
            emit()
        },

        /** Get the effective volume for an app (master * app, respecting mutes) */
        getEffectiveVolume(windowId: string): number {
            if (state.masterMuted) return 0
            const app = state.apps[windowId]
            if (!app || app.muted) return 0
            return Math.round((state.masterVolume / 100) * (app.volume / 100) * 100)
        },
    }
}

type VolumeStore = ReturnType<typeof createVolumeStore>

const VolumeCtx = createContext<VolumeStore | null>(null)

export function VolumeProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<VolumeStore | null>(null)
    if (!storeRef.current) {
        storeRef.current = createVolumeStore()
    }
    return <VolumeCtx.Provider value={storeRef.current}>{children}</VolumeCtx.Provider>
}

export function useVolume() {
    const store = useContext(VolumeCtx)
    if (!store) throw new Error('useVolume must be inside VolumeProvider')
    return store
}

export function useVolumeState() {
    const store = useVolume()
    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
