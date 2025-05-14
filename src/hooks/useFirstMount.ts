import { useRef } from 'react'

export default function useFirstMount() {
  const isMountRef = useRef(false)
  isMountRef.current = true
  return { isMount: isMountRef.current }
}
