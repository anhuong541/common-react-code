import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes))

export function getLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const storedValue = localStorage.getItem(key)
    if (storedValue === null) return null
    return JSON.parse(storedValue) as T
  } catch (error) {
    console.error('Error parsing the localStorage value for key:', key, error)
    return null
  }
}
