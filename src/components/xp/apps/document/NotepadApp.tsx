'use client'

import { useState } from 'react'
import { withBaseApp } from '@/components/xp/infrastructure/hoc/withBaseApp'
import { FILE_EDIT_VIEW_HELP } from '@/components/xp/infrastructure/registries/menuRegistry'

const INITIAL_TEXT = 'Bonjour !\n\nBienvenue sur mon portfolio.\nJe suis un développeur passionné...\nN\'hésitez pas à explorer l\'ordinateur et les differents elements disponibles en dehors de l\'ordinateur.'

/**
 * Composant de contenu - Logique métier uniquement (gestion du texte)
 * Le layout, les menus, les alerts sont fournis par le HOC
 */
function NotepadContent() {
    const [text, setText] = useState(INITIAL_TEXT)

    return (
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
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
    )
}

/**
 * App Notepad refactorisé avec HOC withBaseApp
 * 
 * Avant: 90 lignes
 * Après: ~30 lignes (67% réduction)
 * 
 * Avantages:
 * - Extraction de la logique commune (layout, alert handling)
 * - Réutilisabilité des menus (FILE_EDIT_VIEW_HELP)
 * - Composant plus lisible et focalisé sur la logique métier
 * - Comportement uniforme avec autres apps
 * - Plus facile à tester isolément
 * - Maintien unifié des patterns XP
 */
export const NotepadApp = withBaseApp(NotepadContent, {
    menus: (context, alert) => FILE_EDIT_VIEW_HELP({
        onNew: () => {},
        onOpen: () => alert.showAlert('Fonction non implémentée.'),
        onSave: () => alert.showAlert('Tu ne peux pas enregistrer sur mon portfolio !'),
        onQuit: () => context.closeWindow(),
        onDelete: () => {},
        onAbout: () => alert.showAlert('Bloc-notes XP (Version Portfolio)'),
        appName: 'Bloc-notes',
    }),
    backgroundColor: '#fff',
    alertTitle: 'Bloc-notes',
    showAlert: true,
})
