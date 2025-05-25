'use client'

import ToggleStateContext from './ToggleContext'
import { useCallback, useMemo, useSyncExternalStore } from 'react'

type ToggleState = Record<string, boolean>
type Listener = () => void

export type ToggleStore = {
  getState: () => ToggleState
  subscribe: (listener: Listener) => () => void
  setToggle: (key: string, value: boolean) => void
  toggle: (key: string) => void
}

export const createToggleStore = (): ToggleStore => {
  let state: ToggleState = {}
  const listeners = new Set<Listener>()

  const getState = () => state

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const setToggle = (key: string, value: boolean) => {
    state = { ...state, [key]: value }
    listeners.forEach(listener => listener())
  }

  const toggle = (key: string) => {
    const current = state[key] ?? false
    setToggle(key, !current)
  }

  return {
    getState,
    subscribe,
    setToggle,
    toggle
  }
}

export const toggleStore = createToggleStore()
/**
 * NOTE:
 * - This template is handle the toggle modal solution and save it to global state
 *
 * []
 */
export default function ToggleStateContextProvider({ children }: { children: React.ReactNode }) {
  const handleOpen = useCallback((key: string) => {
    toggleStore.setToggle(key, true)
  }, [])

  const handleClose = useCallback((key: string) => {
    toggleStore.setToggle(key, false)
  }, [])

  const handleToggle = useCallback((key: string) => {
    toggleStore.toggle(key)
  }, [])

  const isToggleOpen = (key: string) => {
    return useSyncExternalStore(
      callback => toggleStore.subscribe(callback),
      () => toggleStore.getState()[key] ?? false,
      () => false // <-- getServerSnapshot fallback (for SSR)
    )
  }

  const contextValue = useMemo(
    () => ({ handleOpen, handleClose, handleToggle, isToggleOpen }),
    [handleClose, handleOpen, handleToggle, isToggleOpen]
  )

  return <ToggleStateContext value={contextValue}>{children}</ToggleStateContext>
}
