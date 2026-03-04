'use client'

import { useState } from 'react'
import { useWM } from './WindowManager'

export function NotepadApp({ windowId }: { windowId: string }) {
    const [text, setText] = useState('Bonjour !\n\nBienvenue sur mon portfolio.\nJe suis un développeur passionné...\nN\'hésitez pas à explorer l\'ordinateur et les differents elements disponibles en dehors de l\'ordinateur.')

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', fontFamily: 'Courier New, Courier, monospace', fontSize: 14 }}>
            <div style={{ display: 'flex', gap: 10, padding: '2px 4px', backgroundColor: '#ECE9D8', borderBottom: '1px solid #ACA899' }}>
                <span style={{ cursor: 'pointer', padding: '0 4px', userSelect: 'none' }}>Fichier</span>
                <span style={{ cursor: 'pointer', padding: '0 4px', userSelect: 'none' }}>Edition</span>
                <span style={{ cursor: 'pointer', padding: '0 4px', userSelect: 'none' }}>Format</span>
                <span style={{ cursor: 'pointer', padding: '0 4px', userSelect: 'none' }}>Affichage</span>
                <span style={{ cursor: 'pointer', padding: '0 4px', userSelect: 'none' }}>?</span>
            </div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', padding: 4, resize: 'none', fontFamily: 'inherit', fontSize: 'inherit' }}
                spellCheck={false}
            />
        </div>
    )
}
