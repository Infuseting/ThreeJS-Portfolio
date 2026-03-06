'use client'

import { useState, useRef, useEffect } from 'react'
import { unlockAchievement } from '@/components/stores/AchievementStore'

export function CmdApp({ windowId }: { windowId: string }) {
    const [history, setHistory] = useState([
        'Microsoft Windows XP [version 5.1.2600]',
        '(C) Copyright 1985-2001 Microsoft Corp.',
        ''
    ])
    const [input, setInput] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleCommand = (cmd: string) => {
        const trimmed = cmd.trim()
        let output: string[] = []

        if (trimmed) {
            const lowerCmd = trimmed.toLowerCase()

            if (lowerCmd === 'color 0a') unlockAchievement('matrix')
            if (lowerCmd.includes('rm -rf') || lowerCmd.includes('del /s /q') || lowerCmd === 'format c:') unlockAchievement('hackerman')
            if (lowerCmd === 'ping infuseting.fr') {
                unlockAchievement('ping-pong')
                output = ['Envoi d\'une requête \'ping\' sur infuseting.fr [104.21.XX.XX] avec 32 octets de données :', 'Réponse de 104.21.XX.XX : octets=32 temps<1ms TTL=64', 'Pong !']
                setHistory([...history, `C:\\SerretA>${cmd}`, ...output, ''])
                setInput('')
                return
            }

            const args = trimmed.split(' ')
            const command = args[0].toLowerCase()

            switch (command) {
                case 'help':
                    output = ['Commandes disponibles : help, whoami, skills, projects, clear, echo, date']
                    break
                case 'whoami':
                    unlockAchievement('identity-crisis')
                    output = ['Développeur Passionné', 'Étudiant en BUT Informatique']
                    break
                case 'skills':
                    output = [
                        'Langages: Dart, Rust, Python, Java, PHP, SQL, TypeScript/JS',
                        'Frameworks & Outils: React, Next.js, Flutter, Tauri, FastMCP',
                        'Concepts: Architecture Modulaire, SOLID, AGILE, SCRUM, Model Context Protocol (MCP)'
                    ]
                    break
                case 'projects':
                    output = [
                        '- UnicaenEDT : Application mobile de gestion d\'emploi du temps (Flutter)',
                        '- Jan : Contribution open-source a un ChatGPT souverain, écosystème (Rust/Tauri)',
                        '- UnicaenEDT MCP : Serveur FastMCP permettant à une IA d\'interagir avec l\'EDT (Python)',
                        '- InvasionZ : Développement d\'un serveur Minecraft (Java)',
                        '- Portfolio Sarah Mahe : Site vitrine de communicante (React)',
                        '- Geoshare : WebApp de visualisation géospatiale (React/SQL)'
                    ]
                    break
                case 'clear':
                    setHistory([])
                    setInput('')
                    return
                case 'date':
                    const currentDate = new Date()
                    output = [currentDate.toString()]

                    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
                    let nextBirthday = new Date(currentDate.getFullYear(), 5, 28)

                    if (today.getTime() > nextBirthday.getTime()) {
                        nextBirthday = new Date(currentDate.getFullYear() + 1, 5, 28)
                    }

                    const diffTime = nextBirthday.getTime() - today.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                    if (diffDays === 0) {
                        output.push(`🎉 Joyeux anniversaire Arthur ! Vous avez ${currentDate.getFullYear() - 2006} ans aujourd'hui ! 🎂`)
                    } else {
                        output.push(`ℹ️ C'est votre anniversaire dans ${diffDays} jour${diffDays > 1 ? 's' : ''}.`)
                    }
                    break
                case 'echo':
                    output = [args.slice(1).join(' ')]
                    break
                default:
                    output = [`'${command}' n'est pas reconnu en tant que commande interne`, 'ou externe, un programme exécutable ou un fichier de commandes.']
            }
        }

        setHistory([...history, `C:\\SerretA>${cmd}`, ...output, ''])
        setInput('')
    }

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }, [history])

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000', color: '#ccc', fontFamily: 'Consolas, "Courier New", monospace', fontSize: 13, padding: 4, overflowX: 'hidden', overflowY: 'auto' }}
            onClick={() => inputRef.current?.focus()}
            ref={containerRef}
        >
            {history.map((line, i) => (
                <div key={i} style={{ minHeight: 18, whiteSpace: 'pre-wrap' }}>{line}</div>
            ))}
            <div style={{ display: 'flex' }}>
                <span>C:\SerretA&gt;</span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommand(input)
                    }}
                    style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', marginLeft: 4 }}
                    autoFocus
                    spellCheck={false}
                />
            </div>
        </div>
    )
}
