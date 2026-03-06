'use client'

import { useState, useEffect, useRef } from 'react'
import { useWindowState, useWM } from '@/components/xp/core/WindowManager'
import { XPTabButton } from '@/components/xp/shared/XPTabButton'
import { unlockAchievement } from '@/components/stores/AchievementStore'

export function DateTimePropApp({ windowId }: { windowId: string }) {
    const win = useWindowState(windowId)
    const wm = useWM()
    const [date, setDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [activeTab, setActiveTab] = useState<'date' | 'fuseau' | 'internet'>('date')
    const [timezone, setTimezone] = useState('(GMT+01:00) Bruxelles, Copenhague, Madrid, Paris')
    const [autoSync, setAutoSync] = useState(true)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close window when clicking outside
    useEffect(() => {
        const handleDown = (e: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {

                // Allow clicking the taskbar clock without immediately reopening/closing
                // We'll rely on a small timeout to let the toggler run first if needed.
                wm.closeWindow(windowId)
            }
        }

        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleDown)
            document.addEventListener('touchstart', handleDown)
        }, 10)

        return () => {
            clearTimeout(timer)
            document.removeEventListener('mousedown', handleDown)
            document.removeEventListener('touchstart', handleDown)
        }
    }, [windowId, wm])

    // Update the clock every second for the analog clock preview
    useEffect(() => {
        const interval = setInterval(() => {
            setDate(new Date())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    if (!win) return null

    const monthNames = [
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"
    ]

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = (month: number, year: number) => {
        let day = new Date(year, month, 1).getDay()
        // Make Monday first day (0=Monday, 6=Sunday)
        return day === 0 ? 6 : day - 1
    }

    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()
    const numDays = daysInMonth(currentMonth, currentYear)
    const firstDay = firstDayOfMonth(currentMonth, currentYear)

    const handlePrevMonth = () => {
        setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
    }
    const handleNextMonth = () => {
        setSelectedDate(new Date(currentYear, currentMonth + 1, 1))
    }

    // Render calendar grid
    const renderCalendar = () => {
        const grid = []
        const weekDays = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']

        // Header
        grid.push(
            <div key="header" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 4, textAlign: 'center', fontWeight: 'normal', fontSize: 11 }}>
                {weekDays.map(d => <div key={d}>{d}</div>)}
            </div>
        )

        let days = []
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} />)
        }
        for (let i = 1; i <= numDays; i++) {
            const isToday = i === date.getDate() && currentMonth === date.getMonth() && currentYear === date.getFullYear()
            days.push(
                <div key={i} style={{
                    textAlign: 'center',
                    padding: '2px 0',
                    backgroundColor: isToday ? '#000080' : 'transparent',
                    color: isToday ? '#FFF' : '#000',
                    cursor: 'pointer',
                    borderRadius: isToday ? 2 : 0,
                }}>
                    {i}
                </div>
            )
        }

        grid.push(
            <div key="days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, backgroundColor: '#FFF', border: '1px solid #7F9DB9', padding: 4 }}>
                {days}
            </div>
        )

        return grid
    }

    return (
        <div ref={containerRef} style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ECE9D8',
            fontFamily: 'Tahoma, sans-serif',
            fontSize: 12,
            display: 'flex',
            flexDirection: 'column',
            padding: 8,
            boxSizing: 'border-box'
        }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ACA899', position: 'relative', zIndex: 1, marginBottom: 8 }}>
                <XPTabButton active={activeTab === 'date'} onClick={() => setActiveTab('date')} label="Date et heure" />
                <XPTabButton active={activeTab === 'fuseau'} onClick={() => setActiveTab('fuseau')} label="Fuseau horaire" />
                <XPTabButton active={activeTab === 'internet'} onClick={() => setActiveTab('internet')} label="Temps Internet" />
            </div>

            {/* Content area */}
            <div style={{ flex: 1, backgroundColor: '#ECE9D8', border: '1px solid #ACA899', borderTop: 'none', marginTop: -9, padding: '12px 12px 8px 12px' }}>

                {activeTab === 'date' && (
                    <div style={{ display: 'flex', gap: 12, height: '100%' }}>
                        {/* Left side: Date */}
                        <div style={{ flex: '1.2' }}>
                            <fieldset style={{ margin: 0, padding: '8px 10px', borderColor: '#D7D3C9', borderStyle: 'groove', borderWidth: 2, height: '100%', boxSizing: 'border-box' }}>
                                <legend style={{ padding: '0 4px' }}>Date</legend>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                                    <select value={currentMonth} onChange={(e) => setSelectedDate(new Date(currentYear, parseInt(e.target.value), 1))} style={{ flex: 1, fontSize: 11 }}>
                                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        value={currentYear}
                                        onChange={(e) => {
                                            const y = parseInt(e.target.value)
                                            setSelectedDate(new Date(y, currentMonth, 1))
                                        }}
                                        style={{ width: 55, fontSize: 11 }}
                                    />
                                </div>
                                {renderCalendar()}
                            </fieldset>
                        </div>

                        {/* Right side: Time */}
                        <div style={{ flex: 1 }}>
                            <fieldset style={{ margin: 0, padding: 8, borderColor: '#D7D3C9', borderStyle: 'groove', borderWidth: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
                                <legend style={{ padding: '0 4px' }}>Heure</legend>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                    {/* Analog Clock */}
                                    {/* Analog Clock (SVG for perfect circularity) */}
                                    <svg width="115" height="115" viewBox="0 0 100 100" style={{ margin: '8px auto' }}>
                                        {/* Shadow/Outer ring */}
                                        <circle cx="50" cy="50" r="49" fill="#F1F1F1" stroke="#ACA899" strokeWidth="1" />
                                        <circle cx="50" cy="50" r="47" fill="#FFF" stroke="#FFF" strokeWidth="1" />

                                        {/* Face marks */}
                                        {[...Array(12)].map((_, i) => {
                                            const angle = i * 30
                                            const isMain = i % 3 === 0
                                            return (
                                                <line
                                                    key={i}
                                                    x1="50" y1={isMain ? "8" : "10"}
                                                    x2="50" y2={isMain ? "16" : "14"}
                                                    stroke="#000"
                                                    strokeWidth={isMain ? "2" : "1"}
                                                    transform={`rotate(${angle} 50 50)`}
                                                />
                                            )
                                        })}

                                        {/* Hands */}
                                        {/* Hour hand */}
                                        <line
                                            x1="50" y1="50" x2="50" y2="25"
                                            stroke="#000" strokeWidth="3" strokeLinecap="round"
                                            transform={`rotate(${(date.getHours() % 12) * 30 + date.getMinutes() * 0.5} 50 50)`}
                                        />
                                        {/* Minute hand */}
                                        <line
                                            x1="50" y1="50" x2="50" y2="15"
                                            stroke="#000" strokeWidth="2" strokeLinecap="round"
                                            transform={`rotate(${date.getMinutes() * 6} 50 50)`}
                                        />
                                        {/* Second hand */}
                                        <line
                                            x1="50" y1="55" x2="50" y2="10"
                                            stroke="red" strokeWidth="1" strokeLinecap="round"
                                            transform={`rotate(${date.getSeconds() * 6} 50 50)`}
                                        />
                                        {/* Center cap */}
                                        <circle cx="50" cy="50" r="3" fill="#000" />
                                        <circle cx="50" cy="50" r="1.5" fill="#888" />
                                    </svg>

                                    {/* Text time */}
                                    <div style={{
                                        display: 'flex', gap: 2, alignItems: 'center', marginTop: 12,
                                        backgroundColor: '#FFF', border: '1px solid #7F9DB9', padding: '4px 12px',
                                        fontSize: 13, fontFamily: 'monospace'
                                    }}>
                                        <input
                                            type="number"
                                            value={date.getHours()}
                                            min={0} max={23}
                                            onChange={(e) => {
                                                const h = parseInt(e.target.value)
                                                const d = new Date(date)
                                                d.setHours(h)
                                                setDate(d)
                                            }}
                                            style={{ width: 24, fontSize: 13, border: 'none', outline: 'none', background: 'transparent', textAlign: 'right', fontFamily: 'monospace' }}
                                        />:
                                        <span>{date.getMinutes().toString().padStart(2, '0')}</span>:
                                        <span>{date.getSeconds().toString().padStart(2, '0')}</span>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                )}

                {activeTab === 'fuseau' && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            style={{ width: '100%', padding: 2, fontSize: 11 }}
                        >
                            <option value="(GMT-08:00) Pacifique (États-Unis et Canada); Tijuana">(GMT-08:00) Pacifique (États-Unis et Canada); Tijuana</option>
                            <option value="(GMT-05:00) Heure de l'Est (États-Unis et Canada)">(GMT-05:00) Heure de l'Est (États-Unis et Canada)</option>
                            <option value="(GMT+00:00) Londres, Casablanca, Monrovia">(GMT+00:00) Londres, Casablanca, Monrovia</option>
                            <option value="(GMT+01:00) Bruxelles, Copenhague, Madrid, Paris">(GMT+01:00) Bruxelles, Copenhague, Madrid, Paris</option>
                            <option value="(GMT+09:00) Osaka, Sapporo, Tokyo">(GMT+09:00) Osaka, Sapporo, Tokyo</option>
                        </select>

                        <div style={{
                            flex: 1,
                            border: '1px solid #ACA899',
                            background: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: 'linear-gradient(to bottom, #d6e2f0 0%, #ffffff 100%)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Simplistic World Map mockup */}
                            <div style={{ color: '#0053AA', opacity: 0.1, fontSize: 100 }}>🌍</div>
                            <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 11, color: '#333' }}>
                                {timezone}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" id="dst" defaultChecked />
                            <label htmlFor="dst" style={{ fontSize: 11 }}>Ajuster l'horloge pour l'observation de l'heure d'été</label>
                        </div>
                    </div>
                )}

                {activeTab === 'internet' && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="checkbox"
                                id="autosync"
                                checked={autoSync}
                                onChange={(e) => setAutoSync(e.target.checked)}
                            />
                            <label htmlFor="autosync" style={{ fontSize: 11, fontWeight: 'bold' }}>Synchroniser automatiquement avec un serveur de temps Internet</label>
                        </div>

                        <fieldset style={{ margin: 0, padding: 12, borderColor: '#D7D3C9', borderStyle: 'groove', borderWidth: 2, opacity: autoSync ? 1 : 0.6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{ fontSize: 11 }}>Serveur :</span>
                                <select disabled={!autoSync} style={{ flex: 1, padding: 2, fontSize: 11 }}>
                                    <option>time.windows.com</option>
                                    <option>time.nist.gov</option>
                                </select>
                                <button disabled={!autoSync} style={{ padding: '1px 8px', fontSize: 11 }}>Mettre à jour</button>
                            </div>

                            <p style={{ fontSize: 11, margin: 0, color: '#333', lineHeight: 1.4 }}>
                                La synchronisation a réussi le {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR')} sur time.windows.com.
                            </p>
                        </fieldset>

                        <p style={{ fontSize: 11, margin: 0, color: '#333', lineHeight: 1.4 }}>
                            La synchronisation du temps Internet ne peut se produire que lorsque votre ordinateur est connecté à Internet.
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button onClick={() => wm.closeWindow(windowId)} style={{ width: 75, padding: '2px 4px' }}>OK</button>
                <button onClick={() => wm.closeWindow(windowId)} style={{ width: 75, padding: '2px 4px' }}>Annuler</button>
                <button disabled style={{ width: 75, padding: '2px 4px' }}>Appliquer</button>
            </div>
        </div>
    )
}
