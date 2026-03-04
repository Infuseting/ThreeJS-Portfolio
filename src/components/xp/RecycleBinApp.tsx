'use client'

import { useState } from 'react'
import { useWindowState } from './WindowManager'

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
    const [files, setFiles] = useState<DeletedFile[]>(INITIAL_FILES)
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

    // Custom dialog for easter eggs
    const [alert, setAlert] = useState<{ title: string, message: string } | null>(null)

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
            <div style={{ display: 'flex', backgroundColor: '#ECE9D8', padding: '2px 4px', borderBottom: '1px solid #ACA899' }}>
                <div style={{ padding: '2px 6px' }}>Fichier</div>
                <div style={{ padding: '2px 6px' }}>Édition</div>
                <div style={{ padding: '2px 6px' }}>Affichage</div>
                <div style={{ padding: '2px 6px' }}>Favoris</div>
                <div style={{ padding: '2px 6px' }}>Outils</div>
                <div style={{ padding: '2px 6px' }}>?</div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 2, padding: '4px 8px', backgroundColor: '#ECE9D8', borderTop: '1px solid #FFF', borderBottom: '1px solid #ACA899' }}>
                <ToolbarButton icon="⬅️" label="Précédente" disabled />
                <ToolbarButton icon="➡️" label="Suivante" disabled />
                <div style={{ width: 1, backgroundColor: '#ACA899', margin: '0 4px' }} />
                <ToolbarButton icon="🗑️" label="Vider..." onClick={handleEmptyBin} disabled={files.length === 0} />
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
                            onClick={() => { setAlert({ title: 'Restauration impossible', message: 'Je crois qu\'il vaut mieux laisser ces éléments où ils sont...' }) }}
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
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        width: 350, backgroundColor: '#ECE9D8', border: '1px solid #0055EA',
                        boxShadow: '2px 2px 10px rgba(0,0,0,0.5)',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{
                            background: 'linear-gradient(90deg, #0A246A 0%, #A6C2F7 100%)',
                            color: 'white', fontWeight: 'bold', padding: '4px 6px',
                            borderBottom: '1px solid #0055EA', display: 'flex', justifyContent: 'space-between'
                        }}>
                            <span>{alert.title}</span>
                            <span
                                style={{ backgroundColor: '#ECA0A0', color: '#FFF', border: '1px solid #FFF', padding: '0 4px', cursor: 'pointer', borderRadius: 2 }}
                                onClick={() => setAlert(null)}
                            >X</span>
                        </div>

                        <div style={{ padding: 16, display: 'flex', gap: 16 }}>
                            <div style={{ fontSize: 32 }}>⚠️</div>
                            <div style={{ flex: 1 }}>{alert.message}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '0 16px 16px' }}>
                            {alert.title === 'Vider la corbeille' ? (
                                <>
                                    <button onClick={confirmEmpty} style={btnStyle}>Oui</button>
                                    <button onClick={() => setAlert(null)} style={btnStyle}>Non</button>
                                </>
                            ) : (
                                <button onClick={() => setAlert(null)} style={btnStyle}>OK</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ToolbarButton({ icon, label, onClick, disabled = false }: { icon: string, label: string, onClick?: () => void, disabled?: boolean }) {
    const [hover, setHover] = useState(false)
    const [active, setActive] = useState(false)

    return (
        <div
            onClick={disabled ? undefined : onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => { setHover(false); setActive(false) }}
            onMouseDown={() => setActive(true)}
            onMouseUp={() => setActive(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '2px 6px',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                border: (hover && !disabled) ? '1px solid' : '1px solid transparent',
                borderColor: active ? '#ACA899 #FFF #FFF #ACA899' : '#FFF #ACA899 #ACA899 #FFF',
                backgroundColor: (hover && !disabled) ? 'rgba(0,0,0,0.05)' : 'transparent',
            }}
        >
            <div style={{ fontSize: 18, marginRight: 4 }}>{icon}</div>
            <div style={{ fontSize: 11 }}>{label}</div>
        </div>
    )
}

const btnStyle = {
    minWidth: 70,
    padding: '4px 12px',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: 11,
    cursor: 'pointer',
    backgroundColor: '#ECE9D8',
    border: '1px solid #003399',
    borderRadius: 3
}
