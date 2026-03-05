'use client'

import { useSyncExternalStore } from 'react'

/* ═══════════════════════════════════════════════
 *  Info Panel Store
 *
 *  Controls which info panel is currently shown.
 *  Any component can call showPanel / hidePanel.
 *
 *  Layout: 1–3 equal-width columns, each column
 *  is a list of section items (title, text, image,
 *  links, buttons, divider, custom).
 *  Optional footer buttons at the bottom.
 * ═══════════════════════════════════════════════ */

export type SectionItem =
    | { type: 'title'; text: string; gradient?: string }
    | { type: 'subtitle'; text: string }
    | { type: 'text'; content: string }
    | { type: 'image'; src: string; alt?: string; height?: number; rounded?: boolean }
    | { type: 'divider' }
    | { type: 'links'; items: { label: string; url: string; icon?: string }[] }
    | { type: 'chips'; items: { label: string; icon?: string }[] }
    | { type: 'buttons'; items: { label: string; onClick: () => void; variant?: 'primary' | 'secondary'; icon?: string }[] }
    | { type: 'custom'; render: () => React.ReactNode }

export interface InfoPanelColumn {
    sections: SectionItem[]
}

export interface FooterButton {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
    icon?: string
}

export interface InfoPanelData {
    /** 1 to 3 columns of equal width */
    columns: InfoPanelColumn[]
    /** Optional buttons at the very bottom of the panel */
    footerButtons?: FooterButton[]
    /** Optional max-width override (default scales with column count) */
    maxWidth?: number
    /** If true, clicking backdrop won't close the panel */
    persistent?: boolean
}

interface StoreState {
    panel: InfoPanelData | null
}

type Listener = () => void

function createInfoPanelStore() {
    let state: StoreState = { panel: null }
    const listeners = new Set<Listener>()

    function emit() {
        listeners.forEach((l) => l())
    }

    function subscribe(l: Listener) {
        listeners.add(l)
        return () => { listeners.delete(l) }
    }

    function getSnapshot(): StoreState {
        return state
    }

    function showPanel(data: InfoPanelData) {
        state = { panel: data }
        emit()
    }

    function hidePanel() {
        if (!state.panel) return
        state = { panel: null }
        emit()
    }

    return { subscribe, getSnapshot, showPanel, hidePanel }
}

/* ── Singleton instance ── */
const store = createInfoPanelStore()

export const showInfoPanel = store.showPanel
export const hideInfoPanel = store.hidePanel

/** Imperative check — useful outside React. */
export function isInfoPanelOpen(): boolean {
    return store.getSnapshot().panel !== null
}

export function useInfoPanel(): StoreState {
    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
