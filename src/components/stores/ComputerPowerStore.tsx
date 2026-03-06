'use client'

import { useSyncExternalStore } from 'react'

/* ─────────────────────────────────────────────
 *  Computer Power Store
 *
 *  Manages the power state (ON, OFF, BOOTING, SHUTTING_DOWN)
 *  of the virtual computer.
 * ───────────────────────────────────────────── */

export type PowerStatus = 'OFF' | 'BOOTING' | 'ON' | 'SHUTTING_DOWN'

export interface PowerState {
  status: PowerStatus
}

interface PowerStore {
  get: () => PowerState
  turnOn: () => void
  turnOff: () => void
  forceOff: () => void
  subscribe: (listener: () => void) => () => void
}

function createPowerStore(initialStatus: PowerStatus = 'ON'): PowerStore {
  let state: PowerState = { status: initialStatus }
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((l) => l())

  let timeoutId: NodeJS.Timeout | null = null

  const setStatus = (status: PowerStatus) => {
    state = { status }
    notify()
  }

  return {
    get: () => state,
    turnOn: () => {
      if (state.status !== 'OFF') return
      setStatus('BOOTING')
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setStatus('ON')
        timeoutId = null
      }, 3500) // 3.5s boot time
    },
    turnOff: () => {
      if (state.status !== 'ON') return
      setStatus('SHUTTING_DOWN')
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setStatus('OFF')
        timeoutId = null
      }, 2500) // 2.5s shutdown time
    },
    forceOff: () => {
      setStatus('OFF')
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/* ── Global Store Instance ── */

const powerStore = createPowerStore('OFF')

export function useComputerPower(): PowerState {
  return useSyncExternalStore(powerStore.subscribe, powerStore.get, powerStore.get)
}

export function useComputerPowerActions() {
  return {
    turnOn: powerStore.turnOn,
    turnOff: powerStore.turnOff,
    forceOff: powerStore.forceOff,
  }
}
