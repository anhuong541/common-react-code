import { useEffect, useRef } from 'react'

export default function useEffectOnlyOnUpdate(effect: () => void | (() => void)) {
  const ignoreRef = useRef(true)
  useEffect(() => {
    let cleanUp: void | (() => void) = undefined
    if (!ignoreRef.current) {
      cleanUp = effect()
    }
    ignoreRef.current = false
    return cleanUp
  }, [effect])
}
