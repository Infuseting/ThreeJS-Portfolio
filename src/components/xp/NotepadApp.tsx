'use client'

import { useState } from 'react'
import { useWM } from './WindowManager'
import { MenuBar, MenuDef } from './MenuBar'
import { XPAlert } from './XPAlert'

export function NotepadApp({ windowId }: { windowId: string }) {
    const [text, setText] = useState('Bonjour !\n\nBienvenue sur mon portfolio.\nJe suis un développeur passionné...\nN\'hésitez pas à explorer l\'ordinateur et les differents elements disponibles en dehors de l\'ordinateur.')

    const wm = useWM()
    const [alert, setAlert] = useState<string | null>(null)

    const menus: MenuDef[] = [
        {
            label: 'Fichier',
            items: [
                { label: 'Nouveau', onClick: () => setText('') },
                { label: 'Ouvrir...', onClick: () => setAlert('Fonction non implémentée.') },
                { label: 'Enregistrer', onClick: () => setAlert('Tu ne peux pas enregistrer sur mon portfolio !') },
                { label: 'Enregistrer sous...', disabled: true },
                { divider: true },
                { label: 'Quitter', onClick: () => wm.closeWindow(windowId) },
            ],
        },
        {
            label: 'Edition',
            items: [
                { label: 'Annuler', disabled: true },
                { divider: true },
                { label: 'Couper', disabled: true },
                { label: 'Copier', disabled: true },
                { label: 'Coller', disabled: true },
                { label: 'Supprimer', onClick: () => setText('') },
            ],
        },
        {
            label: 'Format',
            items: [
                { label: 'Police...', disabled: true },
            ],
        },
        {
            label: 'Affichage',
            items: [
                { label: 'Barre d\'état', disabled: true },
            ],
        },
        {
            label: '?',
            items: [
                { label: 'À propos de Bloc-notes', onClick: () => setAlert('Bloc-notes XP (Version Portfolio)') },
            ],
        },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', fontFamily: 'Courier New, Courier, monospace', fontSize: 14 }}>
            <MenuBar menus={menus} />
            {alert && (
                <XPAlert
                    title="Bloc-notes"
                    message={alert}
                    onClose={() => setAlert(null)}
                />
            )}
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', padding: 4, resize: 'none', fontFamily: 'inherit', fontSize: 'inherit' }}
                spellCheck={false}
            />
        </div>
    )
}
