'use client'

import React, { useState } from 'react'
import { useAppState } from '../hooks/useAppState'
import { AppContentWithSidebar } from '../base/AppContent'
import { MenuDef } from '../../core/MenuBar'

/**
 * withNavigationApp - HOC pour les apps avec navigation (FileExplorer, VSCode)
 * 
 * Utilisé par: FileExplorer, VSCode
 */

export interface Breadcrumb {
  label: string
  path: string
  icon?: string
}

export interface WithNavigationAppOptions {
  menus?: (context: ReturnType<typeof useAppState>) => MenuDef[]
  initialPath?: string
  initialBreadcrumbs?: Breadcrumb[]
}

export function withNavigationApp<P extends Record<string, unknown>>(
  Component: React.ComponentType<P & {
    windowId: string
    breadcrumbs: Breadcrumb[]
    onNavigate: (breadcrumb: Breadcrumb) => void
    onNavigateBack: () => void
    onNavigateForward: () => void
    currentPath: string
  }>,
  options: WithNavigationAppOptions = {}
): React.FC<P & { windowId: string }> {
  const WrappedComponent = ({ windowId, ...props }: P & { windowId: string }) => {
    const context = useAppState(windowId)
    const [navigationHistory, setNavigationHistory] = useState<Breadcrumb[][]>([
      options.initialBreadcrumbs || [{ label: 'Poste de travail', path: '/' }]
    ])
    const [historyIndex, setHistoryIndex] = useState(0)

    if (!context.win) return null

    const currentBreadcrumbs = navigationHistory[historyIndex] || (
      options.initialBreadcrumbs || [{ label: 'Poste de travail', path: '/' }]
    )
    const currentPath = currentBreadcrumbs[currentBreadcrumbs.length - 1]?.path || '/'

    const handleNavigate = (breadcrumb: Breadcrumb) => {
      const newBreadcrumbs = [...currentBreadcrumbs, breadcrumb]
      const newHistory = navigationHistory.slice(0, historyIndex + 1)
      newHistory.push(newBreadcrumbs)
      setNavigationHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }

    const handleNavigateBack = () => {
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1)
      }
    }

    const handleNavigateForward = () => {
      if (historyIndex < navigationHistory.length - 1) {
        setHistoryIndex(historyIndex + 1)
      }
    }

    const menus = options.menus ? options.menus(context) : []

    return (
      <AppContentWithSidebar
        menus={menus}
      >
        <Component
          {...(props as any)}
          windowId={windowId}
          breadcrumbs={currentBreadcrumbs}
          onNavigate={handleNavigate}
          onNavigateBack={handleNavigateBack}
          onNavigateForward={handleNavigateForward}
          currentPath={currentPath}
        />
      </AppContentWithSidebar>
    )
  }

  WrappedComponent.displayName = `withNavigationApp(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}
