import { useEffect, useState } from 'react'

export default function useFirstMount() {
  const [isMount, setIsMount] = useState(false)
  useEffect(() => {
    setIsMount(true)
  }, [])
  return { isMount }
}
