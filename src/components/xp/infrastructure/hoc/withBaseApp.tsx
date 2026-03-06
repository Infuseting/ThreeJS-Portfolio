'use client'

import React from 'react'
import { useAppState } from '../hooks/useAppState'
import { useAppAlert } from '../hooks/useAppAlert'
import { AppContent, AppContentProps } from '../base/AppContent'
import { MenuDef } from '../../core/MenuBar'

/**
 * withBaseApp - HOC générique pour tous les composants App
 * 
 * Encapsule:
 * - Vérification de l'existence de la fenêtre (guard clause)
 * - Gestion de l'état d'app (useAppState)
 * - Gestion des alerts (useAppAlert)
 * - Layout (AppContent)
 * - Menus standards
 * 
 * Utilisé par: Tous les apps (20+)
 * Économies: ~1000 lignes de code dupliqué
 * 
 * Utilisation et options:
 * 
 * // Version simple avec menus statiques
 * export const MyApp = withBaseApp(MyAppContent, {
 *   menus: [{ label: 'File', items: [...] }],
 *   backgroundColor: '#fff'
 * })
 * 
 * // Version avec menus dynamiques (générés depuis le contexte)
 * export const MyApp = withBaseApp(MyAppContent, {
 *   menus: (context, alert) => [
 *     { label: 'File', items: [
 *       { label: 'Quit', onClick: () => context.closeWindow() }
 *     ]}
 *   ],
 *   backgroundColor: '#fff'
 * })
 * 
 * // Composant avec accès au contexte et body principal
 * function MyAppContent({ context, alert }: BaseAppComponentProps) {
 *   return <div>Mon contenu</div>
 * }
 */

export interface BaseAppComponentProps {
  // Context réutilisable
  context: ReturnType<typeof useAppState>
  
  // Alert hook result
  alert: ReturnType<typeof useAppAlert>
  
  // Children (contenu de l'app)
  children?: React.ReactNode
}

export interface WithBaseAppOptions {
  // Menus - Peuvent être statiques ou dynamiques (générés du contexte)
  menus?: MenuDef[] | ((context: ReturnType<typeof useAppState>, alert: ReturnType<typeof useAppAlert>) => MenuDef[])
  
  // Styling
  backgroundColor?: string
  contentOverflow?: 'auto' | 'hidden' | 'visible'
  padding?: number | string
  
  // Alert
  alertTitle?: string
  showAlert?: boolean
  
  // Comportement
  shouldGuard?: boolean  // Si false, n'utilise pas le guard clause
}

export function withBaseApp<P extends Record<string, unknown>>(
  Component: React.ComponentType<BaseAppComponentProps & P>,
  options: WithBaseAppOptions = {}
): React.FC<P & { windowId: string }> {
  const {
    menus,
    backgroundColor = '#ECE9D8',
    contentOverflow = 'auto',
    padding = 0,
    alertTitle = 'Alerte',
    showAlert = true,
    shouldGuard = true,
  } = options

  const WrappedComponent = ({ windowId, ...props }: P & { windowId: string }) => {
    const context = useAppState(windowId)
    const alert = useAppAlert(alertTitle)

    // Guard: Retourne null si la fenêtre n'existe pas
    if (shouldGuard && !context.win) {
      return null
    }

    // Résoudre les menus (statique ou dynamique)
    const resolvedMenus = typeof menus === 'function' ? menus(context, alert) : menus

    return (
      <AppContent
        menus={resolvedMenus}
        alert={showAlert ? alert.alert : undefined}
        alertTitle={alertTitle}
        onCloseAlert={() => alert.closeAlert()}
        backgroundColor={backgroundColor}
        contentOverflow={contentOverflow}
        padding={padding}
      >
        <Component
          {...(props as any)}
          context={context}
          alert={alert}
        />
      </AppContent>
    )
  }

  WrappedComponent.displayName = `withBaseApp(${Component.displayName || Component.name || 'Component'})`
  return WrappedComponent
}

/**
 * Variante: withBaseAppContent pour les apps qui ont besoin du AppContent directement
 */
export function withBaseAppContent<P extends Record<string, unknown>>(
  Component: React.ComponentType<BaseAppComponentProps & P>,
  getContentProps: (context: ReturnType<typeof useAppState>, alert: ReturnType<typeof useAppAlert>) => Partial<AppContentProps>,
  options: WithBaseAppOptions = {}
): React.FC<P & { windowId: string }> {
  const {
    alertTitle = 'Alerte',
    showAlert = true,
    shouldGuard = true,
  } = options

  const WrappedComponent = ({ windowId, ...props }: P & { windowId: string }) => {
    const context = useAppState(windowId)
    const alert = useAppAlert(alertTitle)

    if (shouldGuard && !context.win) {
      return null
    }

    const contentProps = getContentProps(context, alert)

    return (
      <AppContent
        alert={showAlert ? alert.alert : undefined}
        alertTitle={alertTitle}
        onCloseAlert={() => alert.closeAlert()}
        {...contentProps}
      >
        <Component
          {...(props as any)}
          context={context}
          alert={alert}
        />
      </AppContent>
    )
  }

  WrappedComponent.displayName = `withBaseAppContent(${Component.displayName || Component.name || 'Component'})`
  return WrappedComponent
}

/**
 * Compose plusieurs HOCs (utile pour ajouter fonctionnalités progressivement)
 */
export function composeHOCs<P extends { windowId: string }>(
  ...hocs: Array<(component: React.FC<P>) => React.FC<P>>
) {
  return (component: React.FC<P>): React.FC<P> => {
    let current = component
    for (const hoc of hocs.reverse()) {
      current = hoc(current)
    }
    return current as React.FC<P>
  }
}
