import { createContext } from 'react'

const ToggleStateContext = createContext<{
  modalsOpen: Record<string, boolean>
  handleOpen: (key: string) => void
  handleClose: (key: string) => void
  handleToggle: (key: string) => void
  isModalOpen: (key: string) => boolean
}>({
  modalsOpen: {},
  handleOpen: () => {},
  handleClose: () => {},
  handleToggle: () => {},
  isModalOpen: () => false
})

export default ToggleStateContext
