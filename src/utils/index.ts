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

export function parseValue(value: string | number | boolean | object | null) {
  if (typeof value === 'string') {
    return JSON.parse(value)
  }
  return value
}

export function hexID(id: number, baseID = 900000000) {
  return (baseID + id).toString(16).toUpperCase()
}

export function reverseHexID(hex: string, baseID = 900000000) {
  return parseInt(hex, 16) - baseID
}

export function isHexID(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'number') return false

  const str = String(value).toUpperCase()
  const hexPattern = /^[0-9A-F]{6,8}$/
  const hasLetter = /[A-F]/.test(str)

  return hexPattern.test(str) && hasLetter
}
