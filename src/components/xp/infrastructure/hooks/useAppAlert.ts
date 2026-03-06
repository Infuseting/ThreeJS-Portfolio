'use client'

import { useState } from 'react'
import React from 'react'
import { XPAlert } from '@/components/xp/core/XPAlert'

/**
 * useAppAlert - Hook pour gérer les dialogs d'alerte (notifications)
 * 
 * Élimine la duplication du pattern useState + XPAlert dans 10 apps
 * ~50 lignes économisées × 10 apps = 500 lignes
 */

export interface UseAppAlertReturn {
  // State
  alert: string | null
  alertTitle: string

  // Actions
  showAlert: (message: string, title?: string) => void
  closeAlert: () => void
  
  // Component à rendre
  AlertComponent: React.ReactElement | null
}

export function useAppAlert(defaultTitle: string = 'Alerte'): UseAppAlertReturn {
  const [alert, setAlert] = useState<string | null>(null)
  const [alertTitle, setAlertTitle] = useState(defaultTitle)

  const showAlert = (message: string, title = defaultTitle) => {
    setAlert(message)
    setAlertTitle(title)
  }

  const closeAlert = () => setAlert(null)

  const AlertComponent = alert ? (
    React.createElement(XPAlert, {
      title: alertTitle,
      message: alert,
      onClose: closeAlert,
    })
  ) : null

  return {
    alert,
    alertTitle,
    showAlert,
    closeAlert,
    AlertComponent,
  }
}

/**
 * Variante: Hook pour les confirmations (oui/non)
 */
export interface UseConfirmReturn extends UseAppAlertReturn {
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void
  confirm: (() => void) | null
  cancel: (() => void) | null
}

export function useAppConfirm(defaultTitle: string = 'Confirmation'): UseConfirmReturn {
  const alert = useAppAlert(defaultTitle)
  const [confirm, setConfirm] = useState<(() => void) | null>(null)
  const [cancel, setCancel] = useState<(() => void) | null>(null)

  const showConfirm = (message: string, onConfirm: () => void, onCancel: () => void = () => {}) => {
    alert.showAlert(message, defaultTitle)
    setConfirm(() => onConfirm)
    setCancel(() => onCancel)
  }

  return {
    ...alert,
    showConfirm,
    confirm,
    cancel,
  }
}
