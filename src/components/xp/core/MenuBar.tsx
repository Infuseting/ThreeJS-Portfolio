'use client'

import React, { useState, useEffect, useRef } from 'react'

export interface MenuItemDef {
    label?: string
    onClick?: () => void
    disabled?: boolean
    divider?: boolean
}

export interface MenuDef {
    label: string
    items: MenuItemDef[]
}

interface MenuBarProps {
    menus: MenuDef[]
}

/**
 * A reusable Windows XP styled menu bar (File, Edit, View, etc.)
 */
export function MenuBar({ menus }: MenuBarProps) {
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close menus when clicking outside
    useEffect(() => {
        if (openMenuIndex === null) return
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpenMenuIndex(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [openMenuIndex])

    const handleMenuClick = (index: number) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index)
    }

    const handleMouseEnter = (index: number) => {
        if (openMenuIndex !== null && openMenuIndex !== index) {
            setOpenMenuIndex(index)
        }
    }

    const handleItemClick = (item: MenuItemDef) => {
        if (item.disabled || item.divider) return
        if (item.onClick) item.onClick()
        setOpenMenuIndex(null)
    }

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                padding: '2px 4px',
                backgroundColor: '#ECE9D8',
                borderBottom: '1px solid #ACA899',
                fontSize: 12,
                fontFamily: 'Tahoma, sans-serif',
                userSelect: 'none',
                position: 'relative',
                zIndex: 100, // ensure dropdowns appear on top
            }}
        >
            {menus.map((menu, index) => {
                const isOpen = openMenuIndex === index
                return (
                    <div
                        key={menu.label}
                        onPointerDown={() => handleMenuClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        style={{
                            padding: '2px 6px',
                            cursor: 'default',
                            backgroundColor: isOpen ? '#316AC5' : 'transparent',
                            color: isOpen ? '#fff' : '#000',
                            position: 'relative',
                        }}
                    >
                        {menu.label}

                        {/* Dropdown Menu */}
                        {isOpen && menu.items.length > 0 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    backgroundColor: '#ECE9D8',
                                    border: '1px solid #ACA899',
                                    boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                                    minWidth: 150,
                                    padding: '2px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    color: '#000', // reset color from parent
                                }}
                            >
                                {menu.items.map((item, i) => {
                                    if (item.divider) {
                                        return (
                                            <div
                                                key={`div-${i}`}
                                                style={{
                                                    height: 1,
                                                    backgroundColor: '#ACA899',
                                                    margin: '3px 2px',
                                                }}
                                            />
                                        )
                                    }
                                    return (
                                        <MenuBarItem
                                            key={`${item.label}-${i}`}
                                            item={item}
                                            onClick={() => handleItemClick(item)}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function MenuBarItem({ item, onClick }: { item: MenuItemDef; onClick: () => void }) {
    const [hover, setHover] = useState(false)
    const disabled = item.disabled

    return (
        <div
            onMouseEnter={() => !disabled && setHover(true)}
            onMouseLeave={() => !disabled && setHover(false)}
            onPointerDown={(e) => {
                e.stopPropagation()
                if (!disabled) onClick()
            }}
            style={{
                padding: '3px 16px 3px 20px',
                backgroundColor: hover && !disabled ? '#316AC5' : 'transparent',
                color: disabled ? '#ACA899' : hover ? '#fff' : '#000',
                cursor: 'default',
                whiteSpace: 'nowrap',
            }}
        >
            {item.label}
        </div>
    )
}
