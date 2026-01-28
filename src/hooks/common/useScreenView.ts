import { useState } from 'react'
import { useDebouncedCallback } from './useDebounce'
import useOnMount from './useOnMount'

export default function useScreenView() {
  const [screenView, setScreenView] = useState<number | null>(null)

  const handleScreenView = useDebouncedCallback(() => {
    setScreenView(window?.innerWidth)
  }, 500)

  useOnMount(() => handleScreenView())
  useOnMount(() => {
    window?.addEventListener('resize', handleScreenView)

    return () => {
      window?.removeEventListener('resize', handleScreenView)
    }
  })

  return {
    screenView: Number(screenView),
    isLaptop: screenView ? screenView < 1024 : false,
    isTablet: screenView ? screenView < 768 : false,
    isMobile: screenView ? screenView < 480 : false,
  }
}
