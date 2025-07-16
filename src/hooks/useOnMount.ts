import { useEffect } from 'react'

export default function useOnMount(effect: () => void) {
  useEffect(() => {
    effect()
  }, [])
}
