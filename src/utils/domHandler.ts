// =============================================================================
// DOM / BROWSER UTILS - Các hàm thao tác DOM & Browser thường dùng trong React
// =============================================================================

// -----------------------------------------------------------------------------
// CLIPBOARD
// -----------------------------------------------------------------------------

/**
 * Copy text vào clipboard
 * @example await copyToClipboard('Hello!') => true/false
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback cho browser cũ
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch {
    return false
  }
}

/**
 * Đọc text từ clipboard
 * @example const text = await readFromClipboard()
 */
export const readFromClipboard = async (): Promise<string> => {
  try {
    return await navigator.clipboard.readText()
  } catch {
    return ''
  }
}

// -----------------------------------------------------------------------------
// SCROLL
// -----------------------------------------------------------------------------

/**
 * Cuộn đến phần tử theo id hoặc element
 * @example scrollToElement('section-about')
 * @example scrollToElement('section-about', { behavior: 'instant', offset: -80 })
 */
export const scrollToElement = (
  target: string | HTMLElement,
  options: { behavior?: ScrollBehavior; offset?: number } = {},
): void => {
  const { behavior = 'smooth', offset = 0 } = options
  const element =
    typeof target === 'string' ? document.getElementById(target) : target
  if (!element) return

  const top = element.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior })
}

/**
 * Cuộn lên đầu trang
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth'): void => {
  window.scrollTo({ top: 0, behavior })
}

/**
 * Lấy vị trí scroll hiện tại
 */
export const getScrollPosition = (): { x: number; y: number } => ({
  x: window.scrollX,
  y: window.scrollY,
})

/**
 * Kiểm tra đã scroll đến cuối trang chưa
 * @example isScrolledToBottom(100) // true nếu còn cách đáy <= 100px
 */
export const isScrolledToBottom = (threshold: number = 0): boolean => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  return scrollTop + clientHeight >= scrollHeight - threshold
}

/**
 * Khóa / mở scroll của body (dùng cho modal, drawer)
 */
export const lockBodyScroll = (): void => {
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`
}

export const unlockBodyScroll = (): void => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

// -----------------------------------------------------------------------------
// LOCAL STORAGE / SESSION STORAGE
// -----------------------------------------------------------------------------

/**
 * Wrapper an toàn cho localStorage (tự parse/stringify JSON, không throw lỗi)
 */
export const storage = {
  get<T>(key: string, fallback?: T): T | undefined {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : fallback
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  clear(): void {
    localStorage.clear()
  },

  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  },
}

/**
 * Wrapper an toàn cho sessionStorage
 */
export const sessionStorage = {
  get<T>(key: string, fallback?: T): T | undefined {
    try {
      const item = window.sessionStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : fallback
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  remove(key: string): void {
    window.sessionStorage.removeItem(key)
  },
}

// -----------------------------------------------------------------------------
// URL / QUERY STRING
// -----------------------------------------------------------------------------

/**
 * Parse query string thành object
 * @example parseQueryString('?page=1&limit=10') => { page: '1', limit: '10' }
 */
export const parseQueryString = (
  search: string = window.location.search,
): Record<string, string> => {
  const params = new URLSearchParams(search)
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

/**
 * Chuyển object thành query string
 * @example buildQueryString({ page: 1, limit: 10 }) => '?page=1&limit=10'
 */
export const buildQueryString = (
  params: Record<string, string | number | boolean | undefined | null>,
): string => {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  )
  if (filtered.length === 0) return ''
  return (
    '?' +
    new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString()
  )
}

/**
 * Lấy một param từ URL hiện tại
 * @example getQueryParam('page') => '1'
 */
export const getQueryParam = (
  key: string,
  search: string = window.location.search,
): string | null => new URLSearchParams(search).get(key)

// -----------------------------------------------------------------------------
// DEVICE / BROWSER DETECTION
// -----------------------------------------------------------------------------

/**
 * Kiểm tra đang chạy trên môi trường browser (không phải SSR)
 */
export const isBrowser = (): boolean => typeof window !== 'undefined'

/**
 * Kiểm tra thiết bị mobile
 */
export const isMobile = (): boolean => {
  if (!isBrowser()) return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
}

/**
 * Kiểm tra iOS
 */
export const isIOS = (): boolean => {
  if (!isBrowser()) return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Lấy kích thước viewport
 */
export const getViewportSize = (): { width: number; height: number } => ({
  width: window.innerWidth,
  height: window.innerHeight,
})

// -----------------------------------------------------------------------------
// FILE / DOWNLOAD
// -----------------------------------------------------------------------------

/**
 * Download file từ URL
 * @example downloadFile('https://example.com/file.pdf', 'report.pdf')
 */
export const downloadFile = (url: string, filename: string): void => {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Download nội dung string thành file (JSON, CSV, TXT...)
 * @example downloadAsFile('{"a":1}', 'data.json', 'application/json')
 */
export const downloadAsFile = (
  content: string,
  filename: string,
  mimeType: string = 'text/plain',
): void => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  URL.revokeObjectURL(url)
}

/**
 * Đọc file thành base64
 */
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

/**
 * Đọc file thành text
 */
export const fileToText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })

// -----------------------------------------------------------------------------
// MISC DOM
// -----------------------------------------------------------------------------

/**
 * Set document title (dùng kèm với React Router)
 */
export const setDocumentTitle = (title: string, suffix: string = ''): void => {
  document.title = suffix ? `${title} | ${suffix}` : title
}

/**
 * Copy style từ element này sang element khác (dùng cho canvas, screenshot)
 */
export const getElementDimensions = (
  element: HTMLElement,
): { width: number; height: number; top: number; left: number } => {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
  }
}

/**
 * Kiểm tra element có đang visible trong viewport không
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
