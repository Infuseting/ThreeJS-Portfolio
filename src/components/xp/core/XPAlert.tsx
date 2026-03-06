import React from 'react'
import { xpButtonStyle } from '../shared/xpStyles'

interface XPAlertProps {
    title: string
    message: React.ReactNode
    icon?: string
    buttons?: { label: string; onClick: () => void }[]
    onClose: () => void
}

export function XPAlert({ title, message, icon = '⚠️', buttons, onClose }: XPAlertProps) {
    const renderButtons = buttons || [{ label: 'OK', onClick: onClose }]

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: 350, backgroundColor: '#ECE9D8', border: '1px solid #0055EA',
                boxShadow: '2px 2px 10px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
                fontFamily: 'Tahoma, sans-serif',
                fontSize: 12,
                color: '#000',
                userSelect: 'none'
            }}>
                <div style={{
                    background: 'linear-gradient(90deg, #0A246A 0%, #A6C2F7 100%)',
                    color: 'white', fontWeight: 'bold', padding: '4px 6px',
                    borderBottom: '1px solid #0055EA', display: 'flex', justifyContent: 'space-between'
                }}>
                    <span>{title}</span>
                    <span
                        style={{ backgroundColor: '#ECA0A0', color: '#FFF', border: '1px solid #FFF', padding: '0 4px', cursor: 'pointer', borderRadius: 2 }}
                        onClick={onClose}
                    >X</span>
                </div>

                <div style={{ padding: 16, display: 'flex', gap: 16 }}>
                    <div style={{ fontSize: 32, userSelect: 'none' }}>{icon}</div>
                    <div style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{message}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '0 16px 16px' }}>
                    {renderButtons.map((btn, i) => (
                        <button key={i} onClick={btn.onClick} style={xpButtonStyle}>{btn.label}</button>
                    ))}
                </div>
            </div>
        </div>
    )
}
