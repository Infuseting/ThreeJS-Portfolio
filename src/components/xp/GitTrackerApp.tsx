'use client'

import { useState, useEffect } from 'react'
import { useWM, useWindowState } from './WindowManager'
import { MenuBar, MenuDef } from './MenuBar'
import { XPAlert } from './XPAlert'

/* ═══════════════════════════════════════════════
 *  Git Tracker App (GitHub API)
 * ═══════════════════════════════════════════════ */

interface GitTrackerAppProps {
    windowId: string
}

interface RepoData {
    id: number
    name: string
    description: string | null
    html_url: string
    stargazers_count: number
    language: string | null
    updated_at: string
}

export function GitTrackerApp({ windowId }: GitTrackerAppProps) {
    const wm = useWM()
    const win = useWindowState(windowId)
    const [repos, setRepos] = useState<RepoData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [alert, setAlert] = useState<string | null>(null)

    const menus: MenuDef[] = [
        {
            label: 'Fichier',
            items: [
                { label: 'Fermer', onClick: () => wm.closeWindow(windowId) }
            ]
        },
        {
            label: 'Édition',
            items: [
                { label: 'Couper', disabled: true },
                { label: 'Copier', disabled: true },
                { label: 'Coller', disabled: true }
            ]
        },
        {
            label: 'Affichage',
            items: [
                { label: 'Actualiser', onClick: () => { setLoading(true); setRepos([]); /* will trigger effect indirectly if we changed key, but let's just show an alert or let it re-fetch */ } }
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
                { label: 'Options Internet...', disabled: true }
            ]
        },
        {
            label: '?',
            items: [
                { label: 'À propos de Git Tracker', onClick: () => setAlert('Git Tracker XP\nAffiche les dépôts publics GitHub.') }
            ]
        }
    ]

    useEffect(() => {
        let isMounted = true

        async function fetchRepos() {
            try {
                setLoading(true)
                // Using public unauthenticated API for the username 'Infuseting'
                const res = await fetch('https://api.github.com/users/Infuseting/repos?sort=updated&per_page=10')
                if (!res.ok) {
                    throw new Error('Erreur de chargement GitHub API')
                }
                const data = await res.json()
                if (isMounted) {
                    setRepos(data)
                    setError(null)
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchRepos()

        return () => {
            isMounted = false
        }
    }, [])

    if (!win) return null

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#FFF',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Tahoma, sans-serif',
            fontSize: 12,
            color: '#000'
        }}>
            {/* Menu & Toolbar */}
            <div style={{ backgroundColor: '#ECE9D8', borderBottom: '1px solid #ACA899' }}>
                <MenuBar menus={menus} />
                {alert && (
                    <XPAlert
                        title="Git Tracker"
                        message={alert}
                        onClose={() => setAlert(null)}
                    />
                )}
                <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', borderTop: '1px solid #FFF', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 20 }}>⬅️</span> Précédente
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 20 }}>➡️</span>
                    </div>
                    <div style={{ width: 1, height: 20, backgroundColor: '#ACA899' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => window.open('https://github.com/Infuseting', '_blank')}>
                        <span style={{ fontSize: 20 }}>🐙</span> Mon Profil GitHub
                    </div>
                </div>

                {/* Address Bar */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', borderTop: '1px solid #FFF', borderBottom: '1px solid #ACA899' }}>
                    <span style={{ marginRight: 8 }}>Adresse</span>
                    <div style={{ flex: 1, backgroundColor: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 4 }}>🐙</span> https://api.github.com/users/Infuseting/repos
                    </div>
                    <button style={{ marginLeft: 8, padding: '2px 12px', fontSize: 11, fontFamily: 'Tahoma' }}>OK</button>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                        ⏳ Recherche des dépôts en cours...
                    </div>
                )}

                {error && !loading && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'red' }}>
                        ❌ {error}
                    </div>
                )}

                {!loading && !error && repos.length === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                        Aucun dépôt public trouvé.
                    </div>
                )}

                {!loading && !error && repos.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontWeight: 'bold', fontSize: 14, borderBottom: '1px solid #ccc', paddingBottom: 4, marginBottom: 8 }}>
                            Dépôts publics (mis à jour récemment)
                        </div>

                        {repos.map((repo) => (
                            <div
                                key={repo.id}
                                style={{
                                    display: 'flex',
                                    border: '1px dashed #ccc',
                                    padding: 8,
                                    backgroundColor: '#F9F9F9',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(repo.html_url, '_blank')}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBF3FD'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F9F9F9'}
                            >
                                <div style={{ fontSize: 32, marginRight: 16 }}>📁</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#0000FF', fontWeight: 'bold', textDecoration: 'underline', marginBottom: 4 }}>
                                        {repo.name}
                                    </div>
                                    <div style={{ color: '#333', marginBottom: 4 }}>
                                        {repo.description || 'Aucune description disponible.'}
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, color: '#666', fontSize: 10 }}>
                                        {repo.language && <span>🟢 {repo.language}</span>}
                                        <span>⭐ {repo.stargazers_count}</span>
                                        <span>Modifié le: {new Date(repo.updated_at).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div style={{ display: 'flex', backgroundColor: '#ECE9D8', borderTop: '1px solid #ACA899', padding: '2px 8px' }}>
                <div style={{ flex: 1 }}>{repos.length} objet(s)</div>
                <div>Mon Ordinateur</div>
            </div>
        </div>
    )
}
