'use client'

import { useState, useEffect, useRef } from 'react'
import { useWindowState } from './WindowManager'

/* ═══════════════════════════════════════════════
 *  Task Manager (Gestionnaire des tâches)
 * ═══════════════════════════════════════════════ */

interface TaskManagerAppProps {
    windowId: string
}

type TabType = 'applications' | 'processus' | 'performances' | 'reseau' | 'utilisateurs'

const FAKE_PROCESSES = [
    { nom: 'System Idle Process', pr: 'SYSTEM', cpu: '90', mem: '20 Ko' },
    { nom: 'ReactJS.exe', pr: 'Arthur', cpu: '02', mem: '145 200 Ko' },
    { nom: 'ThreeJS.exe', pr: 'Arthur', cpu: '05', mem: '350 400 Ko' },
    { nom: 'Node.exe', pr: 'Arthur', cpu: '00', mem: '85 100 Ko' },
    { nom: 'TypeScript.exe', pr: 'Arthur', cpu: '01', mem: '120 000 Ko' },
    { nom: 'Tailwind.exe', pr: 'Arthur', cpu: '00', mem: '45 000 Ko' },
    { nom: 'explorer.exe', pr: 'Arthur', cpu: '01', mem: '24 300 Ko' },
    { nom: 'csrss.exe', pr: 'SYSTEM', cpu: '00', mem: '4 000 Ko' },
    { nom: 'smss.exe', pr: 'SYSTEM', cpu: '00', mem: '1 200 Ko' },
    { nom: 'svchost.exe', pr: 'SYSTEM', cpu: '00', mem: '15 400 Ko' },
    { nom: 'services.exe', pr: 'SYSTEM', cpu: '00', mem: '5 600 Ko' },
    { nom: 'lsass.exe', pr: 'SYSTEM', cpu: '00', mem: '6 800 Ko' },
    { nom: 'winlogon.exe', pr: 'SYSTEM', cpu: '00', mem: '4 500 Ko' },
]

export function TaskManagerApp({ windowId }: TaskManagerAppProps) {
    const win = useWindowState(windowId)
    const [activeTab, setActiveTab] = useState<TabType>('performances')
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Fake dynamic metrics
    const [cpuUsage, setCpuUsage] = useState(15)
    const [memUsage, setMemUsage] = useState(1245) // MB
    const [netUsage, setNetUsage] = useState(0.5) // %
    const historyRef = useRef<number[]>(Array(50).fill(15))
    const netHistoryRef = useRef<number[]>(Array(50).fill(0.5))
    const netCanvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (activeTab !== 'performances') return

        const intervalId = setInterval(() => {
            // Simulate fluctuation between 5 and 30
            const newCpu = Math.max(0, Math.min(100, cpuUsage + (Math.random() * 10 - 5)))
            setCpuUsage(Math.round(newCpu))

            const newMem = memUsage + (Math.random() * 20 - 10)
            setMemUsage(Math.round(newMem))

            // Update history
            historyRef.current.push(newCpu)
            if (historyRef.current.length > 50) {
                historyRef.current.shift()
            }

            // Draw canvas
            const canvas = canvasRef.current
            if (canvas) {
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height)

                    // Draw grid
                    ctx.strokeStyle = '#008000'
                    ctx.lineWidth = 1
                    for (let i = 0; i < canvas.width; i += 20) {
                        ctx.beginPath()
                        ctx.moveTo(i, 0)
                        ctx.lineTo(i, canvas.height)
                        ctx.stroke()
                    }
                    for (let i = 0; i < canvas.height; i += 20) {
                        ctx.beginPath()
                        ctx.moveTo(0, i)
                        ctx.lineTo(canvas.width, i)
                        ctx.stroke()
                    }

                    // Draw line
                    ctx.strokeStyle = '#00FF00'
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    const data = historyRef.current
                    const stepX = canvas.width / (data.length - 1)
                    data.forEach((val, i) => {
                        const x = i * stepX
                        const y = canvas.height - (val / 100) * canvas.height
                        if (i === 0) ctx.moveTo(x, y)
                        else ctx.lineTo(x, y)
                    })
                    ctx.stroke()

                    // Fill under line
                    ctx.lineTo(canvas.width, canvas.height)
                    ctx.lineTo(0, canvas.height)
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'
                    ctx.fill()
                }
            }
        }, 1000)

        return () => clearInterval(intervalId)
    }, [activeTab, cpuUsage, memUsage])

    // Effect for Network (reseau) Tab Animation
    useEffect(() => {
        if (activeTab !== 'reseau') return

        const intervalId = setInterval(() => {
            // Simulate network spikes between 0% and 5%
            const newNet = Math.max(0, Math.min(10, netUsage + (Math.random() * 2 - 1)))
            setNetUsage(Number(newNet.toFixed(2)))

            netHistoryRef.current.push(newNet)
            if (netHistoryRef.current.length > 50) {
                netHistoryRef.current.shift()
            }

            const canvas = netCanvasRef.current
            if (canvas) {
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height)

                    // Grid
                    ctx.strokeStyle = '#008000'
                    ctx.lineWidth = 1
                    for (let i = 0; i < canvas.width; i += 20) {
                        ctx.beginPath()
                        ctx.moveTo(i, 0)
                        ctx.lineTo(i, canvas.height)
                        ctx.stroke()
                    }
                    for (let i = 0; i < canvas.height; i += 20) {
                        ctx.beginPath()
                        ctx.moveTo(0, i)
                        ctx.lineTo(canvas.width, i)
                        ctx.stroke()
                    }

                    // Line Chart
                    ctx.strokeStyle = '#FFFF00' // Yellow line for network
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    const data = netHistoryRef.current
                    const stepX = canvas.width / (data.length - 1)
                    data.forEach((val, i) => {
                        const x = i * stepX
                        // Normalize 0-10% to canvas height for visibility
                        const normalizedY = (val / 10) * canvas.height
                        const y = canvas.height - normalizedY
                        if (i === 0) ctx.moveTo(x, y)
                        else ctx.lineTo(x, y)
                    })
                    ctx.stroke()
                }
            }
        }, 1000)

        return () => clearInterval(intervalId)
    }, [activeTab, netUsage])

    if (!win) return null

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ECE9D8',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Tahoma, sans-serif',
            fontSize: 12
        }}>
            {/* Menu Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid #fff', backgroundColor: '#ECE9D8', padding: '2px 4px' }}>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>Fichier</div>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>Options</div>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>Affichage</div>
                <div style={{ padding: '2px 6px', cursor: 'pointer' }}>?</div>
            </div>
            <div style={{ borderBottom: '1px solid #ACA899' }} />

            {/* Content Area */}
            <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #ACA899', position: 'relative', zIndex: 1 }}>
                    <TabButton
                        active={activeTab === 'applications'}
                        onClick={() => setActiveTab('applications')}
                        label="Applications"
                    />
                    <TabButton
                        active={activeTab === 'processus'}
                        onClick={() => setActiveTab('processus')}
                        label="Processus"
                    />
                    <TabButton
                        active={activeTab === 'performances'}
                        onClick={() => setActiveTab('performances')}
                        label="Performances"
                    />
                    <TabButton
                        active={activeTab === 'reseau'}
                        onClick={() => setActiveTab('reseau')}
                        label="Mise en réseau"
                    />
                    <TabButton
                        active={activeTab === 'utilisateurs'}
                        onClick={() => setActiveTab('utilisateurs')}
                        label="Utilisateurs"
                    />
                </div>

                {/* Tab Content */}
                <div style={{
                    flex: 1,
                    backgroundColor: '#FFF',
                    border: '1px solid #ACA899',
                    borderTopColor: '#FFF',
                    borderLeftColor: '#FFF',
                    padding: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {activeTab === 'applications' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ border: '1px solid #ACA899', flex: 1, overflowY: 'scroll', backgroundColor: '#FFF' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#ECE9D8', textAlign: 'left' }}>
                                        <tr>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>Tâche</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal', width: 100 }}>État</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '2px 4px' }}>📁 Exploration des compétences</td>
                                            <td style={{ padding: '2px 4px' }}>En cours d'exécution</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '2px 4px' }}>🌐 Recherche de nouveaux défis</td>
                                            <td style={{ padding: '2px 4px' }}>En cours d'exécution</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
                                <button style={btnStyle}>Fin de tâche</button>
                                <button style={btnStyle}>Basculer vers</button>
                                <button style={btnStyle}>Nouvelle tâche...</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'processus' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ border: '1px solid #ACA899', flex: 1, overflowY: 'scroll', backgroundColor: '#FFF' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#ECE9D8', textAlign: 'left' }}>
                                        <tr>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>Nom de l'image</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>Nom d'utilisateur</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal', textAlign: 'right' }}>Process...</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal', textAlign: 'right' }}>Util. mém...</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {FAKE_PROCESSES.map((proc, i) => (
                                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFF' : '#F9F9F9' }}>
                                                <td style={{ padding: '2px 4px' }}>{proc.nom}</td>
                                                <td style={{ padding: '2px 4px' }}>{proc.pr}</td>
                                                <td style={{ padding: '2px 4px', textAlign: 'right' }}>{proc.cpu}</td>
                                                <td style={{ padding: '2px 4px', textAlign: 'right' }}>{proc.mem}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input type="checkbox" id="showAll" />
                                    <label htmlFor="showAll" style={{ marginLeft: 4 }}>Afficher les processus de tous les utilisateurs</label>
                                </div>
                                <button style={btnStyle}>Terminer le processus</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performances' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: 16, height: 160 }}>
                                {/* CPU Usage */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '2px', border: '1px solid #ACA899', borderBottom: 'none', backgroundColor: '#ECE9D8' }}>
                                        Utilisation de l'UC
                                    </div>
                                    <div style={{ border: '1px solid #ACA899', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                                        <div style={{ color: '#00FF00', fontSize: 24, fontFamily: 'monospace' }}>{cpuUsage} %</div>
                                    </div>

                                    <div style={{ padding: '2px', border: '1px solid #ACA899', borderBottom: 'none', marginTop: 8, backgroundColor: '#ECE9D8' }}>
                                        Historique de l'utilisation de l'UC
                                    </div>
                                    <div style={{ flex: 1, border: '1px solid #ACA899', backgroundColor: '#000', position: 'relative' }}>
                                        <canvas
                                            ref={canvasRef}
                                            width={200}
                                            height={80}
                                            style={{ width: '100%', height: '100%', display: 'block' }}
                                        />
                                    </div>
                                </div>

                                {/* RAM Usage */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '2px', border: '1px solid #ACA899', borderBottom: 'none', backgroundColor: '#ECE9D8' }}>
                                        Utilisation du fichier d'échange
                                    </div>
                                    <div style={{ border: '1px solid #ACA899', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                                        <div style={{ color: '#00FF00', fontSize: 24, fontFamily: 'monospace' }}>{memUsage} Mo</div>
                                    </div>

                                    <div style={{ padding: '2px', border: '1px solid #ACA899', borderBottom: 'none', marginTop: 8, backgroundColor: '#ECE9D8' }}>
                                        Historique de l'utilisation du fichier d'échange
                                    </div>
                                    <div style={{ flex: 1, border: '1px solid #ACA899', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <div style={{ color: '#008000', fontSize: 10 }}>[Graphique simulé]</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, marginTop: 16, display: 'flex', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <fieldset style={{ border: '1px solid #ACA899', padding: 8, height: '100%' }}>
                                        <legend style={{ color: '#000' }}>Totaux</legend>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Handles</span><span>12453</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Threads</span><span>452</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Processus</span><span>{FAKE_PROCESSES.length}</span></div>
                                    </fieldset>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <fieldset style={{ border: '1px solid #ACA899', padding: 8, height: '100%' }}>
                                        <legend style={{ color: '#000' }}>Mémoire physique (Ko)</legend>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total</span><span>4194304</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Disponible</span><span>2048102</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cache système</span><span>1054231</span></div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reseau' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '2px', border: '1px solid #ACA899', borderBottom: 'none', backgroundColor: '#ECE9D8' }}>
                                Connexion au réseau local
                            </div>
                            <div style={{ flex: 1, border: '1px solid #ACA899', backgroundColor: '#000', position: 'relative' }}>
                                <canvas
                                    ref={netCanvasRef}
                                    width={400}
                                    height={120}
                                    style={{ width: '100%', height: '100%', display: 'block' }}
                                />
                            </div>

                            <div style={{ border: '1px solid #ACA899', marginTop: 16, flex: 1, backgroundColor: '#FFF', overflowY: 'scroll' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#ECE9D8', textAlign: 'left' }}>
                                        <tr>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>Carte de...</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>Util. du ré...</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>Vitesse de l...</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>État</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '2px 4px' }}>Connexion au réseau local</td>
                                            <td style={{ padding: '2px 4px', textAlign: 'right' }}>{netUsage} %</td>
                                            <td style={{ padding: '2px 4px', textAlign: 'right' }}>1 Gbps</td>
                                            <td style={{ padding: '2px 4px' }}>Opérationnel</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'utilisateurs' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ border: '1px solid #ACA899', flex: 1, overflowY: 'scroll', backgroundColor: '#FFF' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#ECE9D8', textAlign: 'left' }}>
                                        <tr>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal' }}>Utilisateur</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal', width: 60 }}>ID</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal', width: 100 }}>État</th>
                                            <th style={{ border: '1px solid #ACA899', padding: '2px 4px', fontWeight: 'normal', width: 120 }}>Nom de client</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>👤 Arthur</td>
                                            <td style={{ padding: '2px 4px' }}>0</td>
                                            <td style={{ padding: '2px 4px' }}>Actif</td>
                                            <td style={{ padding: '2px 4px' }}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
                                <button style={btnStyle} disabled>Se déconnecter</button>
                                <button style={btnStyle} disabled>Ouvrir une session</button>
                                <button style={btnStyle} disabled>Envoyer un message...</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div style={{ display: 'flex', borderTop: '1px solid #ACA899', borderBottom: '1px solid #FFF', padding: '2px 4px', gap: 16 }}>
                <div>Processus : {FAKE_PROCESSES.length}</div>
                <div>Util. de l'UC : {cpuUsage} %</div>
                <div>Charge dédiée : {memUsage}M / 8192M</div>
            </div>
        </div>
    )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: '2px 8px',
                border: '1px solid #ACA899',
                borderBottom: active ? '1px solid #FFF' : '1px solid #ACA899',
                backgroundColor: active ? '#FFF' : '#ECE9D8',
                cursor: 'pointer',
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                marginRight: 2,
                transform: active ? 'translateY(1px)' : 'none',
                zIndex: active ? 2 : 0,
                position: 'relative'
            }}
        >
            {label}
        </div>
    )
}

const btnStyle = {
    padding: '2px 12px',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: 11,
    cursor: 'pointer'
}
