import { ToggleStateContextProvider } from './toggle-context'

export default function ContextProvider({ children }: { children: React.ReactNode }) {
  return <ToggleStateContextProvider>{children}</ToggleStateContextProvider>
}
