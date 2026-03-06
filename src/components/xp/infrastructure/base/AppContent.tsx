'use client'

import React from 'react'
import { MenuBar, MenuDef } from '../../core/MenuBar'
import { XPAlert } from '../../core/XPAlert'

/**
 * AppContent - Wrapper pour le layout commun des apps XP
 * 
 * Encapsule:
 * - MenuBar (optionnel)
 * - Alert component (optionnel)
 * - Contenu principal avec flex layout
 * - Styling XP standard (#ECE9D8)
 * 
 * Élimine ~30 lignes de layout duplicate par app × 20 apps = 600 lignes
 */

export interface AppContentProps {
  // Layout
  children: React.ReactNode
  backgroundColor?: string
  direction?: 'column' | 'row'
  
  // Menus
  menus?: MenuDef[]
  
  // Alert
  alert?: string | null
  alertTitle?: string
  onCloseAlert?: () => void
  AlertComponent?: React.ReactElement | null
  
  // Styling
  className?: string
  containerStyle?: React.CSSProperties
  contentStyle?: React.CSSProperties
  
  // Options
  contentOverflow?: 'auto' | 'hidden' | 'visible'
  padding?: number | string
}

/**
 * Layout standard pour les apps XP
 * 
 * Structure:
 * ┌─────────────────────┐
 * │    MenuBar          │  (si menus fournis)
 * ├─────────────────────┤
 * │                     │
 * │   Contenu           │  (flex: 1, children)
 * │                     │
 * └─────────────────────┘
 */
export function AppContent({
  children,
  backgroundColor = '#ECE9D8',
  direction = 'column',
  menus,
  alert,
  alertTitle = 'Alerte',
  onCloseAlert,
  AlertComponent,
  containerStyle,
  contentStyle,
  contentOverflow = 'auto',
  padding = 0,
  className,
}: AppContentProps) {
  // Créer l'alerte si fournie, ou utiliser le composant pré-créé
  const alertElement = AlertComponent || (alert && (
    <XPAlert
      title={alertTitle}
      message={alert}
      onClose={onCloseAlert || (() => {})}
    />
  ))

  const defaultContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    height: '100%',
    backgroundColor,
    fontFamily: 'Tahoma, sans-serif',
    fontSize: 12,
    color: '#000',
    ...containerStyle,
  }

  const defaultContentStyle: React.CSSProperties = {
    flex: 1,
    overflow: contentOverflow,
    padding,
    ...contentStyle,
  }

  return (
    <div style={defaultContainerStyle} className={className}>
      {menus && <MenuBar menus={menus} />}
      {alertElement}
      <div style={defaultContentStyle}>
        {children}
      </div>
    </div>
  )
}

/**
 * Variante: Layout avec sidebar (utile pour FileExplorer, VSCode)
 */
export interface AppContentWithSidebarProps extends AppContentProps {
  sidebar?: React.ReactNode
  sidebarWidth?: number
  sidebarBackground?: string
}

export function AppContentWithSidebar({
  sidebar,
  sidebarWidth = 250,
  sidebarBackground = '#ECE9D8',
  ...appContentProps
}: AppContentWithSidebarProps) {
  if (!sidebar) return <AppContent {...appContentProps} />

  return (
    <AppContent
      {...appContentProps}
      direction="row"
      contentStyle={{ display: 'flex', ...appContentProps.contentStyle }}
    >
      <div style={{
        width: sidebarWidth,
        backgroundColor: sidebarBackground,
        borderRight: '1px solid #ACA899',
        overflow: 'auto',
        flex: 'shrink',
      }}>
        {sidebar}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {appContentProps.children}
      </div>
    </AppContent>
  )
}

/**
 * Variante: Layout avec tabs (utile pour TaskManager, ControlPanel)
 */
export interface TabDef {
  id: string
  label: string
  icon?: string
}

export interface AppContentWithTabsProps extends AppContentProps {
  tabs: TabDef[]
  activeTabId: string
  onSelectTab: (tabId: string) => void
  tabsPosition?: 'top' | 'bottom'
}

const TabBarComponent = ({ tabs, activeTabId, onSelectTab }: {
  tabs: TabDef[]
  activeTabId: string
  onSelectTab: (id: string) => void
}) => (
  <div style={{
    display: 'flex',
    borderBottom: '1px solid #ACA899',
    backgroundColor: '#ECE9D8',
    gap: 0,
    padding: '2px 4px',
  }}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onSelectTab(tab.id)}
        style={{
          padding: '2px 8px',
          backgroundColor: activeTabId === tab.id ? '#fff' : '#ECE9D8',
          border: activeTabId === tab.id ? '1px solid #ACA899' : '1px solid #C0C0C0',
          borderBottom: activeTabId === tab.id ? 'none' : 'inherit',
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: 'Tahoma, sans-serif',
          marginRight: 2,
        }}
      >
        {tab.icon && `${tab.icon} `}
        {tab.label}
      </button>
    ))}
  </div>
)

export function AppContentWithTabs({
  tabs,
  activeTabId,
  onSelectTab,
  tabsPosition = 'top',
  ...appContentProps
}: AppContentWithTabsProps) {
  return (
    <AppContent
      {...appContentProps}
      direction="column"
      containerStyle={{
        display: 'flex',
        flexDirection: 'column',
        ...appContentProps.containerStyle,
      }}
    >
      {tabsPosition === 'top' && <TabBarComponent tabs={tabs} activeTabId={activeTabId} onSelectTab={onSelectTab} />}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {appContentProps.children}
      </div>
      {tabsPosition === 'bottom' && <TabBarComponent tabs={tabs} activeTabId={activeTabId} onSelectTab={onSelectTab} />}
    </AppContent>
  )
}
