import { useState } from 'react'

import { useDebouncedCallback } from './useDebounce'

export default function useSearchCallback() {
  const [search, setSearch] = useState('')

  const handleSearch = useDebouncedCallback((searchSting: string) => {
    setSearch(searchSting)
  }, 500)

  return { handleSearch, search, setSearch }
}
