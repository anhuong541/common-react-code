import { useState } from 'react'

import { useDebouncedCallback } from './useDebounce'

/**
 * This hook search is for handle search input submit from other onchange event
 * ! Don't use it for handle setState change
 *
 */
export default function useSearchCallback(initialValue?: string) {
  const [search, setSearch] = useState(initialValue || '')

  const handleSearch = useDebouncedCallback((searchSting: string) => {
    setSearch(searchSting)
  }, 500)

  return { handleSearch, search, setSearch }
}
