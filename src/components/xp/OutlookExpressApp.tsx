'use client'

import { useState } from 'react'
import { useWindowState } from './WindowManager'

/* ═══════════════════════════════════════════════
 *  Outlook Express App
 * ═══════════════════════════════════════════════ */

interface OutlookExpressAppProps {
    windowId: string
}

type FolderType = 'inbox' | 'outbox' | 'sent' | 'deleted' | 'drafts'

interface Email {
    id: string
    from: string
    subject: string
    date: string
    body: string
    read: boolean
}

const MOCK_EMAILS: Record<FolderType, Email[]> = {
    inbox: [
        {
            id: '1',
            from: 'Jean Dupont',
            subject: 'Recommandation Suite Projet X',
            date: '12/03/2026 10:15',
            read: false,
            body: 'Bonjour Arthur,\n\nJe tenais à te remercier pour ton excellent travail sur l\'application React que nous avons livrée le mois dernier. Ton expertise en performance frontend a vraiment sauvé le projet !\n\nN\'hésite pas si tu as besoin d\'une référence professionnelle.\n\nBien à toi,\nJean',
        },
        {
            id: '2',
            from: 'Équipe RH - TechCorp',
            subject: 'Votre candidature - Développeur Frontend Senior',
            date: '10/03/2026 14:30',
            read: true,
            body: 'Bonjour Monsieur Serret,\n\nNous avons le plaisir de vous informer que votre profil correspond parfaitement à nos attentes. Seriez-vous disponible pour une entrevue vidéo ce jeudi ?\n\nCordialement,\nService Recrutement',
        },
        {
            id: '3',
            from: 'Microsoft Security',
            subject: 'Alerte : Nouveau périphérique détecté',
            date: '05/03/2026 08:00',
            read: true,
            body: 'Un nouvel ordinateur Windows XP s\'est connecté à votre compte. Si c\'est vous (et ça l\'est sûrement vu votre magnifique portfolio), veuillez ignorer cet e-mail.\n\nL\'équipe de sécurité nostalgique.',
        }
    ],
    outbox: [],
    sent: [
        {
            id: '4',
            from: 'Arthur Serret',
            subject: 'Déploiement du portfolio 3D',
            date: '04/03/2026 09:22',
            read: true,
            body: 'Salut l\'équipe,\n\nLe déploiement de la v1 du portfolio ThreeJS/Windows XP est terminé.\nTout semble fonctionner à merveille (à part peut-être IE6 qui fait des siennes... normal quoi).\n\nA+',
        }
    ],
    deleted: [],
    drafts: []
}

export function OutlookExpressApp({ windowId }: OutlookExpressAppProps) {
    const win = useWindowState(windowId)
    const [activeFolder, setActiveFolder] = useState<FolderType>('inbox')
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)

    // Create a local copy of emails to allow marking as read
    const [emails, setEmails] = useState(MOCK_EMAILS)

    if (!win) return null

    const currentFolderEmails = emails[activeFolder]
    const selectedEmail = currentFolderEmails.find(e => e.id === selectedEmailId)

    const handleSelectEmail = (id: string) => {
        setSelectedEmailId(id)
        // Mark as read
        setEmails(prev => {
            const next = { ...prev }
            next[activeFolder] = next[activeFolder].map(e =>
                e.id === id ? { ...e, read: true } : e
            )
            return next
        })
    }

    const handleNewMail = () => {
        window.location.href = 'mailto:serretarthur@gmail.com?subject=Contact depuis le Portfolio XP'
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ECE9D8',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Tahoma, sans-serif',
            fontSize: 12,
            userSelect: 'none'
        }}>
            {/* Menu Bar */}
            <div style={{ display: 'flex', backgroundColor: '#ECE9D8', padding: '2px 4px' }}>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>Fichier</div>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>Édition</div>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>Affichage</div>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>Outils</div>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>Message</div>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>?</div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 2, padding: '4px 8px', borderTop: '1px solid #FFF', borderBottom: '1px solid #ACA899' }}>
                <ToolbarButton icon="✉️" label="Nouveau message" onClick={handleNewMail} />
                <div style={{ width: 1, backgroundColor: '#ACA899', margin: '0 4px' }} />
                <ToolbarButton icon="🖨️" label="Imprimer" onClick={() => { }} disabled />
                <ToolbarButton icon="🗑️" label="Supprimer" onClick={() => { }} disabled />
                <div style={{ width: 1, backgroundColor: '#ACA899', margin: '0 4px' }} />
                <ToolbarButton icon="📤" label="Envoyer/Recevoir" onClick={() => { }} />
                <ToolbarButton icon="📔" label="Adresses" onClick={() => { }} />
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Left Sidebar (Folders) */}
                <div style={{ width: 200, backgroundColor: '#FFF', borderRight: '2px solid #ECE9D8', overflowY: 'auto', borderBottom: '1px solid #ACA899' }}>
                    <div style={{ padding: 4, fontWeight: 'bold' }}>Dossiers locaux</div>

                    <FolderItem
                        active={activeFolder === 'inbox'}
                        onClick={() => { setActiveFolder('inbox'); setSelectedEmailId(null) }}
                        icon="📥"
                        label="Boîte de réception"
                        unreadCount={emails.inbox.filter(e => !e.read).length}
                    />
                    <FolderItem
                        active={activeFolder === 'outbox'}
                        onClick={() => { setActiveFolder('outbox'); setSelectedEmailId(null) }}
                        icon="📤"
                        label="Boîte d'envoi"
                    />
                    <FolderItem
                        active={activeFolder === 'sent'}
                        onClick={() => { setActiveFolder('sent'); setSelectedEmailId(null) }}
                        icon="📨"
                        label="Éléments envoyés"
                    />
                    <FolderItem
                        active={activeFolder === 'deleted'}
                        onClick={() => { setActiveFolder('deleted'); setSelectedEmailId(null) }}
                        icon="🗑️"
                        label="Éléments supprimés"
                    />
                    <FolderItem
                        active={activeFolder === 'drafts'}
                        onClick={() => { setActiveFolder('drafts'); setSelectedEmailId(null) }}
                        icon="📝"
                        label="Brouillons"
                    />
                </div>

                {/* Right Area (Message List & Preview) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Message List */}
                    <div style={{ flex: 1, backgroundColor: '#FFF', borderBottom: '4px solid #ECE9D8', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#ECE9D8', textAlign: 'left', position: 'sticky', top: 0 }}>
                                <tr>
                                    <th style={{ width: 24, borderRight: '1px solid #ACA899', borderBottom: '1px solid #ACA899' }}>!</th>
                                    <th style={{ borderRight: '1px solid #ACA899', borderBottom: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>De</th>
                                    <th style={{ borderRight: '1px solid #ACA899', borderBottom: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>Objet</th>
                                    <th style={{ borderBottom: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>Reçu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentFolderEmails.map(email => (
                                    <tr
                                        key={email.id}
                                        onClick={() => handleSelectEmail(email.id)}
                                        style={{
                                            backgroundColor: selectedEmailId === email.id ? '#0A246A' : 'transparent',
                                            color: selectedEmailId === email.id ? '#FFF' : '#000',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <td style={{ textAlign: 'center' }}>{email.read ? '✉️' : '📩'}</td>
                                        <td style={{ padding: '2px 4px', fontWeight: email.read ? 'normal' : 'bold' }}>{email.from}</td>
                                        <td style={{ padding: '2px 4px', fontWeight: email.read ? 'normal' : 'bold' }}>{email.subject}</td>
                                        <td style={{ padding: '2px 4px', fontWeight: email.read ? 'normal' : 'bold' }}>{email.date}</td>
                                    </tr>
                                ))}
                                {currentFolderEmails.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#666' }}>
                                            Il n'y a pas d'éléments à afficher dans cet affichage.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Preview Pane */}
                    <div style={{ height: '45%', backgroundColor: '#FFF', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        {selectedEmail ? (
                            <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ backgroundColor: '#ECE9D8', padding: '4px 8px', marginBottom: 8, border: '1px solid #ACA899' }}>
                                    <div style={{ marginBottom: 2 }}><strong>De :</strong> {selectedEmail.from}</div>
                                    <div style={{ marginBottom: 2 }}><strong>Date :</strong> {selectedEmail.date}</div>
                                    <div><strong>Objet :</strong> {selectedEmail.subject}</div>
                                </div>
                                <div style={{ flex: 1, whiteSpace: 'pre-wrap', padding: 8 }}>
                                    {selectedEmail.body}
                                </div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
                                Aucun message n'est sélectionné.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div style={{ display: 'flex', borderTop: '1px solid #ACA899', padding: '2px 8px', gap: 16 }}>
                <div>{currentFolderEmails.length} message(s)</div>
                {emails.inbox.filter(e => !e.read).length > 0 && (
                    <div style={{ color: 'red' }}>{emails.inbox.filter(e => !e.read).length} non lu(s)</div>
                )}
            </div>
        </div>
    )
}

function ToolbarButton({ icon, label, onClick, disabled = false }: { icon: string, label: string, onClick: () => void, disabled?: boolean }) {
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
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2px 4px',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                border: (hover && !disabled) ? '1px solid' : '1px solid transparent',
                borderColor: active ? '#ACA899 #FFF #FFF #ACA899' : '#FFF #ACA899 #ACA899 #FFF',
                backgroundColor: (hover && !disabled) ? '#ECE9D8' : 'transparent',
            }}
        >
            <div style={{ fontSize: 24, marginBottom: 2 }}>{icon}</div>
            <div style={{ fontSize: 11 }}>{label}</div>
        </div>
    )
}

function FolderItem({ active, onClick, icon, label, unreadCount = 0 }: { active: boolean, onClick: () => void, icon: string, label: string, unreadCount?: number }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '2px 8px',
                backgroundColor: active ? '#0A246A' : 'transparent',
                color: active ? '#FFF' : '#000',
                cursor: 'pointer',
            }}
        >
            <span style={{ marginRight: 6, fontSize: 16 }}>{icon}</span>
            <span style={{ fontWeight: unreadCount > 0 ? 'bold' : 'normal' }}>{label}</span>
            {unreadCount > 0 && <span style={{ marginLeft: 6, fontWeight: 'bold' }}>({unreadCount})</span>}
        </div>
    )
}
