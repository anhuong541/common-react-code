import ClientProvider from './ClientProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ClientProvider>{children}</ClientProvider>
}
