'use client'

import { useState } from 'react'
import { useWindowState } from './WindowManager'
import { XPTabButton } from './shared/XPTabButton'
import { xpButtonCompactStyle } from './shared/xpStyles'

/* ═══════════════════════════════════════════════
 *  Control Panel App
 * ═══════════════════════════════════════════════ */

interface ControlPanelAppProps {
    windowId: string
    currentBg: string
    onChangeBg: (bg: string) => void
}

const BACKGROUNDS = [
    { name: 'Classique XP (Bliss)', value: 'url(/wallpaper.jpg)' },
    { name: 'Vert Matrix', value: '#00FF00' },
    { name: 'Bleu Dégradé', value: 'linear-gradient(180deg, #245EDC 0%, #3A8FE8 30%, #5DBF4C 55%, #4CA33B 100%)' },
    { name: 'Noir Profond', value: '#000000' },
    { name: 'Gris Classique', value: '#ECE9D8' }
]

export function ControlPanelApp({ windowId, currentBg, onChangeBg }: ControlPanelAppProps) {
    const win = useWindowState(windowId)
    const [activeTab, setActiveTab] = useState<'themes' | 'desktop' | 'screensaver' | 'appearance' | 'settings'>('desktop')

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
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ACA899', margin: '8px 8px 0', position: 'relative', zIndex: 1 }}>
                <XPTabButton
                    active={activeTab === 'themes'}
                    onClick={() => setActiveTab('themes')}
                    label="Thèmes"
                />
                <XPTabButton
                    active={activeTab === 'desktop'}
                    onClick={() => setActiveTab('desktop')}
                    label="Bureau"
                />
                <XPTabButton active={activeTab === 'screensaver'} onClick={() => setActiveTab('screensaver')} label="Écran de veille" />
                <XPTabButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} label="Apparence" />
                <XPTabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Paramètres" />
            </div>

            {/* Content Area */}
            <div style={{
                flex: 1,
                backgroundColor: '#FFF',
                border: '1px solid #ACA899',
                borderTopColor: '#FFF',
                borderLeftColor: '#FFF',
                margin: '0 8px 8px',
                padding: 16,
                display: 'flex',
                flexDirection: 'column'
            }}>

                {/* Preview Screen */}
                <div style={{
                    height: 120,
                    width: 160,
                    margin: '0 auto 16px',
                    border: '12px solid #333',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: currentBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Fake taskbar in preview */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: 'linear-gradient(to bottom, #245edc, #3f8cf3)' }} />
                    </div>
                    {/* Monitor stand */}
                    <div style={{ position: 'absolute', bottom: -12, left: 0, right: 0, height: 12, background: '#333' }} />
                    <div style={{ position: 'absolute', bottom: -20, left: 40, right: 40, height: 8, background: '#222' }} />
                </div>

                {activeTab === 'desktop' && (
                    <fieldset style={{ border: '1px solid #ACA899', padding: 8, flex: 1 }}>
                        <legend>Arrière-plan</legend>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ border: '1px solid #ACA899', flex: 1, overflowY: 'auto', backgroundColor: '#FFF' }}>
                                {BACKGROUNDS.map((bg, i) => (
                                    <div
                                        key={i}
                                        onClick={() => onChangeBg(bg.value)}
                                        style={{
                                            padding: '2px 4px',
                                            backgroundColor: currentBg === bg.value ? '#316AC5' : 'transparent',
                                            color: currentBg === bg.value ? '#FFF' : '#000',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {bg.name}
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button style={xpButtonCompactStyle}>Parcourir...</button>
                            </div>
                        </div>
                    </fieldset>
                )}

                {activeTab === 'themes' && (
                    <fieldset style={{ border: '1px solid #ACA899', padding: 8, flex: 1 }}>
                        <legend>Thème</legend>
                        <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                            Un thème est un arrière-plan avec un ensemble de sons, d'icônes et d'autres éléments pour personnaliser votre ordinateur.
                        </p>
                        <select style={{ width: '100%', padding: 2 }}>
                            <option>Windows XP</option>
                            <option>Windows Classique</option>
                        </select>
                        <div style={{ marginTop: 16, color: '#999', fontStyle: 'italic', textAlign: 'center' }}>
                            (La fonctionnalité de changement de thème de fenêtre n'est pas encore implémentée dans cette version simulée).
                        </div>
                    </fieldset>
                )}

                {activeTab === 'screensaver' && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 16 }}>
                        <fieldset style={{ border: '1px solid #ACA899', padding: 8 }}>
                            <legend>Écran de veille</legend>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <select style={{ width: '100%', padding: 2, marginBottom: 8 }}>
                                        <option>Texte défilant 3D</option>
                                        <option>(Aucun)</option>
                                        <option>Béatitude</option>
                                        <option>Logos Windows XP</option>
                                    </select>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button style={xpButtonCompactStyle}>Paramètres</button>
                                        <button style={xpButtonCompactStyle}>Aperçu</button>
                                    </div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>Délai :</span>
                                    <input type="number" defaultValue={10} style={{ width: 40, padding: 2 }} />
                                    <span>minutes</span>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset style={{ border: '1px solid #ACA899', padding: 8 }}>
                            <legend>Gestion de l'alimentation</legend>
                            <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                                Pour régler l'alimentation de votre moniteur ou économiser l'énergie, cliquez sur Alimentation.
                            </p>
                            <button style={xpButtonCompactStyle}>Alimentation...</button>
                        </fieldset>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <fieldset style={{ border: '1px solid #ACA899', padding: 8, flex: 1 }}>
                        <legend>Apparence</legend>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <div style={{ marginBottom: 4 }}>Fenêtres et boutons :</div>
                                <select style={{ width: '100%', padding: 2 }}>
                                    <option>Style Windows XP</option>
                                    <option>Style Windows Classique</option>
                                </select>
                            </div>
                            <div>
                                <div style={{ marginBottom: 4 }}>Modèle de couleurs :</div>
                                <select style={{ width: '100%', padding: 2 }}>
                                    <option>Bleu par défaut</option>
                                    <option>Vert olive</option>
                                    <option>Argenté</option>
                                </select>
                            </div>
                            <div>
                                <div style={{ marginBottom: 4 }}>Taille de la police :</div>
                                <select style={{ width: '100%', padding: 2 }}>
                                    <option>Normale</option>
                                    <option>Grandes polices</option>
                                    <option>Très grandes polices</option>
                                </select>
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button style={xpButtonCompactStyle}>Effets...</button>
                                <button style={xpButtonCompactStyle}>Avancé</button>
                            </div>
                        </div>
                    </fieldset>
                )}

                {activeTab === 'settings' && (
                    <fieldset style={{ border: '1px solid #ACA899', padding: 8, flex: 1 }}>
                        <legend>Paramètres</legend>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1, borderRight: '1px solid #ACA899', paddingRight: 16 }}>
                                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Résolution de l'écran</div>
                                <input type="range" min="1" max="4" defaultValue="3" style={{ width: '100%' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666' }}>
                                    <span>Moins</span>
                                    <span>Plus</span>
                                </div>
                                <div style={{ textAlign: 'center', marginTop: 8 }}>1024 par 768 pixels</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Qualité de la couleur</div>
                                <select style={{ width: '100%', padding: 2 }}>
                                    <option>Maximale (32 bits)</option>
                                    <option>Moyenne (16 bits)</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button style={xpButtonCompactStyle}>Dépannage...</button>
                            <button style={xpButtonCompactStyle}>Avancé</button>
                        </div>
                    </fieldset>
                )}
            </div>

        </div>
    )
}
