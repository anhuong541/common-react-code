'use client'

import { createContext } from 'react'

const ToggleStateContext = createContext<{
  handleOpen: (key: string) => void
  handleClose: (key: string) => void
  handleToggle: (key: string) => void
  isToggleOpen: (key: string) => boolean
}>({
  handleOpen: () => {},
  handleClose: () => {},
  handleToggle: () => {},
  isToggleOpen: () => false
})

export default ToggleStateContext
