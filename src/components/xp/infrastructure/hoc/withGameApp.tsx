'use client'

import React from 'react'
import { useAppState } from '../hooks/useAppState'
import { AppContent } from '../base/AppContent'
import { MenuDef } from '../../core/MenuBar'

/**
 * withGameApp - HOC pour les jeux (Minesweeper, Tetris, Pinball, Slither.io)
 * 
 * Utilisé par: MinesweeperApp, TetrisApp, PinballApp (futur)
 */

export interface WithGameAppOptions {
  menus?: MenuDef[] | ((context: ReturnType<typeof useAppState>) => MenuDef[])
  backgroundColor?: string
  padding?: number | string
}

export function withGameApp<P extends Record<string, unknown>>(
  Component: React.ComponentType<P & { windowId: string }>,
  options: WithGameAppOptions = {}
): React.FC<P & { windowId: string }> {
  const WrappedComponent = ({ windowId, ...props }: P & { windowId: string }) => {
    const context = useAppState(windowId)

    if (!context.win) return null

    const resolvedMenus = typeof options.menus === 'function' ? options.menus(context) : options.menus

    return (
      <AppContent
        menus={resolvedMenus}
        backgroundColor={options.backgroundColor || '#C0C0C0'}
        contentOverflow="hidden"
        padding={options.padding || 4}
      >
        <Component {...(props as any)} windowId={windowId} />
      </AppContent>
    )
  }

  WrappedComponent.displayName = `withGameApp(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}
