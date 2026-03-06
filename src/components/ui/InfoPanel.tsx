'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
    useInfoPanel,
    hideInfoPanel,
    type SectionItem,
    type InfoPanelColumn,
    type FooterButton,
} from '@/components/stores/InfoPanelStore'

/* ═══════════════════════════════════════════════
 *  Info Panel
 *
 *  A premium glassmorphic overlay panel with
 *  smooth animations. Supports 1–3 equal-width
 *  columns, each containing rich content sections.
 *
 *  Usage:
 *    import { showInfoPanel } from './InfoPanelStore'
 *    showInfoPanel({ columns: [ { sections: [...] } ] })
 *
 *  Mount <InfoPanel /> once in your app tree.
 * ═══════════════════════════════════════════════ */

const DEFAULT_MAX_WIDTHS: Record<number, number> = {
    1: 480,
    2: 720,
    3: 960,
}

export function InfoPanel() {
    const { panel } = useInfoPanel()

    const handleClose = useCallback(() => {
        hideInfoPanel()
    }, [])

    // Close on Escape
    useEffect(() => {
        if (!panel) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [panel, handleClose])

    const colCount = panel ? Math.min(3, Math.max(1, panel.columns.length)) : 1
    const maxW = panel?.maxWidth ?? DEFAULT_MAX_WIDTHS[colCount] ?? 720

    return (
        <AnimatePresence>
            {panel && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'auto',
                    }}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={panel.persistent ? undefined : handleClose}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 100%)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                        }}
                    />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
                        style={{
                            position: 'relative',
                            width: '92%',
                            maxWidth: maxW,
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            borderRadius: 20,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
                            backdropFilter: 'blur(40px) saturate(1.5)',
                            WebkitBackdropFilter: 'blur(40px) saturate(1.5)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.1) inset',
                            color: '#fff',
                            fontFamily: 'var(--font-geist-sans), "Segoe UI", system-ui, -apple-system, sans-serif',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Close button */}
                        <motion.button
                            onClick={handleClose}
                            whileHover={{ scale: 1.15, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.7)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                zIndex: 10,
                                backdropFilter: 'blur(10px)',
                            }}
                            aria-label="Fermer"
                        >
                            ✕
                        </motion.button>

                        {/* Columns */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                                gap: colCount > 1 ? 1 : 0,
                                flex: 1,
                            }}
                        >
                            {panel.columns.slice(0, 3).map((col, colIdx) => (
                                <motion.div
                                    key={colIdx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + colIdx * 0.08, duration: 0.4, ease: 'easeOut' }}
                                    style={{
                                        padding: '32px 28px 24px',
                                        borderRight: colIdx < colCount - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <ColumnContent column={col} colIdx={colIdx} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer buttons */}
                        {panel.footerButtons && panel.footerButtons.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.35 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 12,
                                    padding: '16px 28px 24px',
                                    borderTop: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                {panel.footerButtons.map((btn, i) => (
                                    <FooterBtn key={i} btn={btn} index={i} />
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

/* ── Column Content ── */

function ColumnContent({ column, colIdx }: { column: InfoPanelColumn; colIdx: number }) {
    return (
        <>
            {column.sections.map((section, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + colIdx * 0.08 + i * 0.05, duration: 0.35, ease: 'easeOut' }}
                >
                    <SectionRenderer section={section} />
                </motion.div>
            ))}
        </>
    )
}

/* ── Section Renderers ── */

function SectionRenderer({ section }: { section: SectionItem }) {
    switch (section.type) {
        case 'title':
            return <TitleSection text={section.text} gradient={section.gradient} />
        case 'subtitle':
            return <SubtitleSection text={section.text} />
        case 'text':
            return <TextSection content={section.content} />
        case 'image':
            return <ImageSection src={section.src} alt={section.alt} height={section.height} rounded={section.rounded} />
        case 'divider':
            return <DividerSection />
        case 'links':
            return <LinksSection items={section.items} />
        case 'chips':
            return <ChipsSection items={section.items} />
        case 'buttons':
            return <ButtonsSection items={section.items} />
        case 'custom':
            return <>{section.render()}</>
        default:
            return null
    }
}

/* ── Title ── */
function TitleSection({ text, gradient }: { text: string; gradient?: string }) {
    return (
        <h2
            style={{
                fontSize: 26,
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: 6,
                letterSpacing: '-0.02em',
                background: gradient ?? 'linear-gradient(135deg, #fff 0%, #a8b8ff 50%, #7c6aef 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}
        >
            {text}
        </h2>
    )
}

/* ── Subtitle ── */
function SubtitleSection({ text }: { text: string }) {
    return (
        <p
            style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 16,
                fontWeight: 500,
                letterSpacing: '0.01em',
            }}
        >
            {text}
        </p>
    )
}

/* ── Text ── */
function TextSection({ content }: { content: string }) {
    return (
        <p
            style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.75)',
                marginBottom: 14,
                whiteSpace: 'pre-line',
            }}
        >
            {content}
        </p>
    )
}

/* ── Image ── */
function ImageSection({ src, alt, height, rounded }: { src: string; alt?: string; height?: number; rounded?: boolean }) {
    return (
        <motion.div
            style={{ marginBottom: 16, overflow: 'hidden', borderRadius: rounded !== false ? 12 : 0 }}
            whileHover={{ scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <img
                src={src}
                alt={alt ?? ''}
                style={{
                    width: '100%',
                    height: height ?? 'auto',
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: rounded !== false ? 12 : 0,
                }}
            />
        </motion.div>
    )
}

/* ── Divider ── */
function DividerSection() {
    return (
        <div
            style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                margin: '14px 0',
            }}
        />
    )
}

/* ── Links ── */
function LinksSection({ items }: { items: { label: string; url: string; icon?: string }[] }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {items.map((item, i) => (
                <motion.a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff',
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    }}
                >
                    {item.icon && <span style={{ fontSize: 15 }}>{item.icon}</span>}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ opacity: 0.35, fontSize: 11 }}>↗</span>
                </motion.a>
            ))}
        </div>
    )
}

/* ── Chips ── */
function ChipsSection({ items }: { items: { label: string; icon?: string }[] }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {items.map((item, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.12 + i * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '5px 12px',
                        borderRadius: 20,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: 11,
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.7)',
                    }}
                >
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                </motion.span>
            ))}
        </div>
    )
}

/* ── Inline Buttons ── */
function ButtonsSection({ items }: { items: { label: string; onClick: () => void; variant?: 'primary' | 'secondary'; icon?: string }[] }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {items.map((item, i) => (
                <motion.button
                    key={i}
                    onClick={item.onClick}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 18px',
                        borderRadius: 10,
                        border: item.variant === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.15)',
                        background: item.variant === 'primary'
                            ? 'linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%)'
                            : 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        letterSpacing: '0.01em',
                    }}
                >
                    {item.icon && <span style={{ fontSize: 14 }}>{item.icon}</span>}
                    {item.label}
                </motion.button>
            ))}
        </div>
    )
}

/* ── Footer Button ── */
function FooterBtn({ btn, index }: { btn: FooterButton; index: number }) {
    return (
        <motion.button
            onClick={btn.onClick}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + index * 0.05, type: 'spring', stiffness: 400, damping: 17 }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 28px',
                borderRadius: 12,
                border: btn.variant === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.15)',
                background: btn.variant === 'primary'
                    ? 'linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%)'
                    : 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.01em',
                boxShadow: btn.variant === 'primary' ? '0 4px 15px rgba(108,92,231,0.4)' : 'none',
            }}
        >
            {btn.icon && <span style={{ fontSize: 16 }}>{btn.icon}</span>}
            {btn.label}
        </motion.button>
    )
}
