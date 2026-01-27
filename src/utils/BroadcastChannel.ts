'use client'

import { useEffect } from 'react'

let bc: BroadcastChannel | null = null

/**
 * Example code for handle the BroadcastChannel events
 * @returns BroadcastChannel instance
 */

const initBroadcastChannel = () => {
  if (typeof window !== 'undefined' && !bc) {
    bc = new BroadcastChannel('auth')
  }
  return bc
}

export const notifyLogout = () => {
  const channel = initBroadcastChannel()
  if (channel) {
    channel.postMessage({ type: 'LOGOUT' })
  }
}

// TODO: Add user type at (user: any)
export const notifyLogin = (user: null) => {
  const channel = initBroadcastChannel()
  if (channel) {
    channel.postMessage({ type: 'LOGIN', user })
  }
}

export const useListenAuthEvents = (
  onLogout: () => void,
  onLogin?: (user: null) => void // TODO: Add user type
) => {
  useEffect(() => {
    const channel = initBroadcastChannel()
    if (channel) {
      channel.onmessage = event => {
        const { type, user } = event.data

        if (type === 'LOGOUT') {
          return onLogout()
        } else if (type === 'LOGIN' && onLogin) {
          return onLogin(user)
        }
      }
    }
  }, [])
}

export const cleanupAuthSync = () => {
  if (bc) {
    bc.close()
    bc = null
  }
}
