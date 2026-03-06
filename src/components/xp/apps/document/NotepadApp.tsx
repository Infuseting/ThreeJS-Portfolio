'use client'

import { useState, useEffect } from 'react'
import { AppContent } from '@/components/xp/infrastructure/base/AppContent'
import { useAppState } from '@/components/xp/infrastructure/hooks/useAppState'
import { useAppAlert } from '@/components/xp/infrastructure/hooks/useAppAlert'
import { FILE_EDIT_VIEW_HELP } from '@/components/xp/infrastructure/registries/menuRegistry'
import { unlockAchievement } from '@/components/stores/AchievementStore'

const INITIAL_TEXT = 'Bonjour !\n\nBienvenue sur mon portfolio.\nJe suis un développeur passionné...\nN\'hésitez pas à explorer l\'ordinateur et les differents elements disponibles en dehors de l\'ordinateur.'

export function NotepadApp({ windowId }: { windowId: string }) {
    const context = useAppState(windowId)
    const alert = useAppAlert('Bloc-notes')
    const [text, setText] = useState(INITIAL_TEXT)
    const [isSaved, setIsSaved] = useState(true)

    // Trigger ecrivain-rate achievement on close if text is modified and unsaved
    useEffect(() => {
        context.registerCloseHook(() => {
            if (!isSaved && text !== INITIAL_TEXT) {
                unlockAchievement('ecrivain-rate')
            }
            return true // allow window to close
        })
        return () => context.unregisterCloseHook()
    }, [context, isSaved, text])

    // Trigger grand-oeuvre achievement if text length > 1000
    useEffect(() => {
        if (text.length > 1000) {
            unlockAchievement('grand-oeuvre')
        }
    }, [text])

    // Guard: window might not exist
    if (!context.win) return null

    const handleSave = () => {
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'portfolio_notes.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setIsSaved(true)
    }

    const menus = FILE_EDIT_VIEW_HELP({
        onNew: () => { setText(''); setIsSaved(true) },
        onOpen: () => alert.showAlert('Fonction non implémentée. (Mais tu peux essayer de glisser-déposer un fichier ! ...ah non, pas encore)'),
        onSave: handleSave,
        onQuit: () => context.closeWindow(),
        onDelete: () => { setText(''); setIsSaved(false) },
        onAbout: () => alert.showAlert('Bloc-notes XP (Version Portfolio)'),
        appName: 'Bloc-notes',
    })

    return (
        <AppContent
            menus={menus}
            alert={alert.alert}
            alertTitle="Bloc-notes"
            onCloseAlert={alert.closeAlert}
            backgroundColor="#fff"
        >
            <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setIsSaved(false) }}
                style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    display: 'block',
                    border: 'none',
                    outline: 'none',
                    padding: 8,
                    resize: 'none',
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: 14,
                    backgroundColor: '#fff',
                    color: '#000',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                }}
                spellCheck={false}
            />
        </AppContent>
    )
}
