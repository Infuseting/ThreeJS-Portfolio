'use client'

import { useState } from 'react'
import { useWM, useWindowState } from './WindowManager'
import { MenuBar, MenuDef } from './MenuBar'
import { XPAlert } from './XPAlert'
import { XPToolbarButton } from './shared/XPToolbarButton'
import { unlockAchievement } from '@/components/AchievementStore'

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

const INITIAL_FILES: DeletedFile[] = [
    {
        id: '1',
        name: 'motivation.exe',
        icon: '⚙️',
        date: 'Lundi d\'hiver à 08h00',
        size: '0 Ko',
        originalLocation: 'C:\\Users\\Arthur\\Cerveau',
        content: 'Fichier introuvable. Avez-vous essayé de prendre un café ?'
    },
    {
        id: '2',
        name: 'code_sans_bugs.txt',
        icon: '📝',
        date: 'Jamais',
        size: 'Mythe',
        originalLocation: 'Terre du Milieu',
        content: 'Ce fichier est une légende urbaine racontée aux développeurs juniors pour les endormir le soir.'
    },
    {
        id: '3',
        name: 'client_feedback_v12_FINAL_v2_vrai.pdf',
        icon: '📄',
        date: 'Il y a 2 ans',
        size: '450 Mo (que des screenshots flous)',
        originalLocation: 'C:\\Projets\\AuSecours',
        content: '"Pouvez-vous juste rajouter un petit bouton qui fait de l\'intelligence artificielle ? Ça devrait prendre 5 minutes non ?"'
    },
    {
        id: '4',
        name: 'Internet Explorer 6.lnk',
        icon: '🌐',
        date: '2001',
        size: 'Trop lourd pour l\'humanité',
        originalLocation: 'C:\\Enfers',
        content: 'Veuillez laisser ce fichier dans la corbeille pour la sécurité globale d\'Internet.'
    }
]

export function RecycleBinApp({ windowId }: RecycleBinAppProps) {
    const win = useWindowState(windowId)
    const wm = useWM()
    const [files, setFiles] = useState<DeletedFile[]>(INITIAL_FILES)
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

    // Custom dialog for easter eggs
    const [alert, setAlert] = useState<{ title: string, message: string } | null>(null)

    const menus: MenuDef[] = [
        {
            label: 'Fichier',
            items: [
                { label: 'Restaurer', disabled: selectedFileId === null },
                { divider: true },
                { label: 'Vider la corbeille', onClick: () => setFiles([]), disabled: files.length === 0 },
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

    if (!win) return null

    const handleEmptyBin = () => {
        if (files.length === 0) return
        setAlert({
            title: 'Vider la corbeille',
            message: 'Êtes-vous sûr de vouloir supprimer définitivement ces éléments et perdre ces magnifiques blagues ?'
        })
    }

    const confirmEmpty = () => {
        setFiles([])
        setAlert(null)
    }

    const handleDoubleClick = (file: DeletedFile) => {
        setAlert({
            title: `Ouverture de ${file.name}`,
            message: file.content
        })
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
                            onClick={() => { unlockAchievement('recycle-restore'); setAlert({ title: 'Restauration impossible', message: 'Je crois qu\'il vaut mieux laisser ces éléments où ils sont...' }) }}
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
