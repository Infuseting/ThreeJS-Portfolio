'use client'

import React, { useState } from 'react'
import { useAppState } from '../hooks/useAppState'
import { AppContentWithTabs, TabDef } from '../base/AppContent'
import { MenuDef } from '../../core/MenuBar'

/**
 * withTabbedApp - HOC pour les apps à onglets
 * 
 * Utilisé par: TaskManager, ControlPanel, VolumeMixer
 * Économies: ~100 lignes × 3 = 300 lignes
 */

export interface WithTabbedAppOptions {
  tabs: TabDef[]
  defaultTabId?: string
  menus?: (context: ReturnType<typeof useAppState>) => MenuDef[]
}

export function withTabbedApp<P extends Record<string, unknown>>(
  Component: React.ComponentType<P & { windowId: string; activeTabId: string; onTabChange: (tabId: string) => void }>,
  options: WithTabbedAppOptions,
): React.FC<P & { windowId: string }> {
  const WrappedComponent = ({ windowId, ...props }: P & { windowId: string }) => {
    const context = useAppState(windowId)
    const [activeTabId, setActiveTabId] = useState(options.defaultTabId || options.tabs[0]?.id || '')

    if (!context.win) return null

    const menus = options.menus ? options.menus(context) : []

    return (
      <AppContentWithTabs
        tabs={options.tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        menus={menus}
      >
        <Component {...(props as any)} windowId={windowId} activeTabId={activeTabId} onTabChange={setActiveTabId} />
      </AppContentWithTabs>
    )
  }

  WrappedComponent.displayName = `withTabbedApp(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}
