'use client'

import { useState } from 'react'
import { useWM, useWindowState } from '@/components/xp/core/WindowManager'
import { MenuBar, MenuDef } from '@/components/xp/core/MenuBar'
import { XPAlert } from '@/components/xp/core/XPAlert'
import { XPToolbarButton } from '@/components/xp/shared/XPToolbarButton'
import { unlockAchievement, useAchievements, ACHIEVEMENTS } from '@/components/stores/AchievementStore'

/* ═══════════════════════════════════════════════
 *  Recycle Bin App (Corbeille)
 * ═══════════════════════════════════════════════ */

interface RecycleBinAppProps {
    windowId: string
}

interface DeletedFile {
    id: string
    name: string
    icon: string
    date: string
    size: string
    originalLocation: string
    content: string // Easter egg content
}

import { useClippy, restoreClippy } from '@/components/xp/contexts/ClippyStore'

const INITIAL_FILES: DeletedFile[] = [
    {
        id: '1',
        name: 'motivation.exe',
        icon: '⚙️',
        date: 'Lundi d\'hiver à 08h00',
        size: '0 Ko',
        originalLocation: 'C:\\Users\\Arthur\\Cerveau',
        content: 'Fichier corrompu. Impossible de trouver la motivation nécessaire pour exécuter cette tâche.'
    },
    {
        id: '2',
        name: 'ancien_portfolio_v1.html',
        icon: '🌐',
        date: '2021',
        size: '45 Ko',
        originalLocation: 'C:\\Users\\Arthur\\Documents',
        content: '<html><body><h1>Bienvenue sur mon portfolio de 2021</h1><marquee>En construction !</marquee></body></html>'
    },
    {
        id: '3',
        name: 'TODO_important.txt',
        icon: '📝',
        date: 'Il y a 6 mois',
        size: '1 Ko',
        originalLocation: 'C:\\Desktop',
        content: '- Finir le projet\n- Apprendre le Rust\n- Aller à la salle de sport\n\n(Note: aucun de ces objectifs n\'a été atteint)'
    },
    {
        id: '4',
        name: 'Internet_Explorer.exe',
        icon: '🌐',
        date: '2001',
        size: 'Trop lourd pour l\'humanité',
        originalLocation: 'C:\\Enfers',
        content: 'Veuillez laisser ce fichier dans la corbeille pour la sécurité globale d\'Internet.'
    }
]

export function RecycleBinApp({ windowId }: RecycleBinAppProps) {
    const wm = useWM()
    const winState = useWindowState(windowId)
    const clippyState = useClippy()

    // Combine standard deleted files with Clippy if he was deleted
    const allFiles = [...INITIAL_FILES]
    if (clippyState.isDeleted) {
        allFiles.push({
            id: 'clippy',
            name: 'Cleepy_le_harcelé.exe',
            icon: '📎',
            date: "Aujourd'hui",
            size: '1 âme',
            originalLocation: 'C:\\Windows\\System32\\',
            content: "Au secours ! Sortez-moi de là ! Il y a des araignées dans cette corbeille !"
        })
    }

    const [files, setFiles] = useState<DeletedFile[]>(allFiles)
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

    // Custom dialog for easter eggs
    const [alert, setAlert] = useState<{ title: string, message: string } | null>(null)

    const { unlocked } = useAchievements()

    const handleRestore = () => {
        if (selectedFileId === 'clippy') {
            const isFinalAchievement = !unlocked.has('resto_clippy') && unlocked.size === ACHIEVEMENTS.length - 1
            restoreClippy(isFinalAchievement)
        }
        setFiles(f => f.filter(file => file.id !== selectedFileId))
        setSelectedFileId(null)
    }

    const menus: MenuDef[] = [
        {
            label: 'Fichier',
            items: [
                { label: 'Restaurer', onClick: handleRestore, disabled: selectedFileId === null },
                { divider: true },
                { label: 'Vider la corbeille', onClick: () => { handleEmptyBin() }, disabled: files.length === 0 },
                { divider: true },
                { label: 'Fermer', onClick: () => wm.closeWindow(windowId) }
            ]
        },
        {
            label: 'Édition',
            items: [
                { label: 'Annuler', disabled: true },
                { divider: true },
                { label: 'Couper', disabled: true },
                { label: 'Copier', disabled: true },
                { label: 'Coller', disabled: true },
                { divider: true },
                { label: 'Sélectionner tout', onClick: () => { if (files.length > 0) setSelectedFileId(files[0].id) } }
            ]
        },
        {
            label: 'Affichage',
            items: [
                { label: 'Barres d\'outils', disabled: true },
                { label: 'Barre d\'état', disabled: true },
                { divider: true },
                { label: 'Actualiser', onClick: () => setAlert({ title: 'Info', message: 'Actualisé !' }) }
            ]
        },
        {
            label: 'Favoris',
            items: [
                { label: 'Ajouter aux favoris...', disabled: true }
            ]
        },
        {
            label: 'Outils',
            items: [
                { label: 'Connecter un lecteur réseau...', disabled: true },
                { label: 'Options des dossiers...', disabled: true }
            ]
        },
        {
            label: '?',
            items: [
                { label: 'Centre d\'aide et de support', disabled: true },
                { divider: true },
                { label: 'À propos de Windows', onClick: () => setAlert({ title: 'À propos', message: 'Corbeille Windows XP (Version Portfolio)' }) }
            ]
        }
    ]

    if (!winState) return null

    const handleEmptyBin = () => {
        if (files.length === 0) return
        setAlert({
            title: 'Vider la corbeille',
            message: 'Êtes-vous sûr de vouloir supprimer définitivement ces éléments et perdre ces magnifiques blagues ?'
        })
    }

    const confirmEmpty = () => {
        setFiles([])
        setSelectedFileId(null)
        setAlert(null)
    }

    const handleDoubleClick = (file: DeletedFile) => {
        if (file.id === 'clippy') {
            handleRestore()
        } else {
            setAlert({
                title: `Ouverture de ${file.name}`,
                message: file.content
            })
        }
    }

    const selectedFile = files.find(f => f.id === selectedFileId)

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#FFF',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Tahoma, sans-serif',
            fontSize: 12,
            position: 'relative',
            userSelect: 'none'
        }}>
            {/* Menu Bar */}
            <MenuBar menus={menus} />
            {alert && (
                <XPAlert
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 2, padding: '4px 8px', backgroundColor: '#ECE9D8', borderTop: '1px solid #FFF', borderBottom: '1px solid #ACA899' }}>
                <XPToolbarButton icon="⬅️" label="Précédente" disabled />
                <XPToolbarButton icon="➡️" label="Suivante" disabled />
                <div style={{ width: 1, backgroundColor: '#ACA899', margin: '0 4px' }} />
                <XPToolbarButton icon="🗑️" label="Vider..." onClick={handleEmptyBin} disabled={files.length === 0} />
            </div>

            {/* Address Bar */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', backgroundColor: '#ECE9D8', borderTop: '1px solid #FFF', borderBottom: '1px solid #ACA899' }}>
                <span style={{ marginRight: 8 }}>Adresse</span>
                <div style={{ flex: 1, backgroundColor: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 4 }}>🗑️</span> Corbeille
                </div>
            </div>

            {/* Main Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Left Sidebar (XP Task Pane) */}
                <div style={{ width: 220, background: 'linear-gradient(180deg, #748DEE 0%, #3B61D1 100%)', overflowY: 'auto' }}>

                    <div style={{
                        backgroundColor: '#FFF',
                        margin: 12,
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0A246A', borderBottom: '1px solid #ECE9D8', background: 'linear-gradient(90deg, #FFF 0%, #EBF3FD 100%)' }}>
                            Tâches de la Corbeille
                        </div>
                        <div
                            style={{ padding: '6px 12px', color: files.length > 0 ? '#0B33A5' : '#666', cursor: files.length > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
                            onClick={handleEmptyBin}
                            onMouseEnter={(e) => { if (files.length > 0) e.currentTarget.style.textDecoration = 'underline' }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                        >
                            <span style={{ fontSize: 16, marginRight: 8, opacity: files.length > 0 ? 1 : 0.5 }}>🗑️</span> Vider la Corbeille
                        </div>
                        <div
                            style={{ padding: '6px 12px', color: '#0B33A5', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onClick={() => {
                                unlockAchievement('recycle-restore')
                                setAlert({ title: 'Restauration impossible', message: 'Je crois qu\'il vaut mieux laisser ces éléments où ils sont...' })
                                if (files.find(f => f.id === 'clippy')) {
                                    const isFinalAchievement = !unlocked.has('resto_clippy') && unlocked.size === ACHIEVEMENTS.length - 1
                                    restoreClippy(isFinalAchievement)
                                }
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                        >
                            <span style={{ fontSize: 16, marginRight: 8 }}>↩️</span> Restaurer tous les...
                        </div>
                    </div>

                    {selectedFile && (
                        <div style={{
                            backgroundColor: '#FFF',
                            margin: '0 12px 12px',
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                        }}>
                            <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0A246A', borderBottom: '1px solid #ECE9D8', background: 'linear-gradient(90deg, #FFF 0%, #EBF3FD 100%)' }}>
                                Détails
                            </div>
                            <div style={{ padding: 12 }}>
                                <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>{selectedFile.name}</div>
                                <div style={{ marginBottom: 4 }}>Emplacement d'origine :</div>
                                <div style={{ color: '#0B33A5', marginBottom: 8 }}>{selectedFile.originalLocation}</div>
                                <div style={{ marginBottom: 4 }}>Date de suppression :</div>
                                <div style={{ marginBottom: 8 }}>{selectedFile.date}</div>
                                <div style={{ marginBottom: 4 }}>Taille :</div>
                                <div>{selectedFile.size}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Area (File List) */}
                <div style={{ flex: 1, backgroundColor: '#FFF', overflowY: 'auto' }}>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#ECE9D8', textAlign: 'left', borderBottom: '1px solid #ACA899' }}>
                            <tr>
                                <th style={{ padding: '4px', borderRight: '1px solid #ACA899', fontWeight: 'normal', width: 200 }}>Nom</th>
                                <th style={{ padding: '4px', borderRight: '1px solid #ACA899', fontWeight: 'normal' }}>Emplacement d'origine</th>
                                <th style={{ padding: '4px', borderRight: '1px solid #ACA899', fontWeight: 'normal' }}>Date de suppression</th>
                                <th style={{ padding: '4px', fontWeight: 'normal' }}>Taille</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr
                                    key={file.id}
                                    onClick={() => setSelectedFileId(file.id)}
                                    onDoubleClick={() => handleDoubleClick(file)}
                                    style={{
                                        backgroundColor: selectedFileId === file.id ? '#316AC5' : 'transparent',
                                        color: selectedFileId === file.id ? '#FFF' : '#000',
                                        cursor: 'default'
                                    }}
                                >
                                    <td style={{ padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ marginRight: 6, fontSize: 16 }}>{file.icon}</span> {file.name}
                                    </td>
                                    <td style={{ padding: '2px 4px' }}>{file.originalLocation}</td>
                                    <td style={{ padding: '2px 4px' }}>{file.date}</td>
                                    <td style={{ padding: '2px 4px', textAlign: 'right' }}>{file.size}</td>
                                </tr>
                            ))}
                            {files.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#666' }}>
                                        0 objet(s)
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>
            </div>

            {/* Status Bar */}
            <div style={{ display: 'flex', backgroundColor: '#ECE9D8', borderTop: '1px solid #ACA899', padding: '2px 8px' }}>
                <div style={{ flex: 1 }}>{files.length} objet(s)</div>
            </div>

            {/* Custom Alert Dialog */}
            {alert && (
                <XPAlert
                    title={alert.title}
                    message={alert.message}
                    icon={alert.title === 'Vider la corbeille' ? '⚠️' : '⚠️'}
                    buttons={alert.title === 'Vider la corbeille' ? [
                        { label: 'Oui', onClick: confirmEmpty },
                        { label: 'Non', onClick: () => setAlert(null) }
                    ] : undefined}
                    onClose={() => setAlert(null)}
                />
            )}
        </div>
    )
}
