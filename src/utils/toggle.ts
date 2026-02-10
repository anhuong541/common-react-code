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
    listeners.forEach((listener) => listener())
  }

  const toggle = (key: string) => {
    const current = state[key] ?? false
    setToggle(key, !current)
  }

  return {
    getState,
    subscribe,
    setToggle,
    toggle,
  }
}
