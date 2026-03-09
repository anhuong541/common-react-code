import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

// -----------------------------------------------------------------------------
// useClickOutside
// Detect click bên ngoài element (dùng cho dropdown, modal, tooltip...)
// -----------------------------------------------------------------------------
/**
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setOpen(false));
 * return <div ref={ref}>...</div>
 */
export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
): void => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// -----------------------------------------------------------------------------
// useHover
// Detect hover vào element
// -----------------------------------------------------------------------------
/**
 * @example
 * const [hoverRef, isHovered] = useHover<HTMLDivElement>();
 * return <div ref={hoverRef}>{isHovered ? 'Đang hover' : 'Chưa hover'}</div>
 */
export const useHover = <T extends HTMLElement>(): [
  RefObject<T | null>,
  boolean,
] => {
  const ref = useRef<T>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onEnter = () => setIsHovered(true)
    const onLeave = () => setIsHovered(false)

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return [ref, isHovered]
}

// -----------------------------------------------------------------------------
// useFocus
// Detect element có đang được focus không
// -----------------------------------------------------------------------------
/**
 * @example
 * const [focusRef, isFocused] = useFocus<HTMLInputElement>();
 * return <input ref={focusRef} className={isFocused ? 'ring-2' : ''} />
 */
export const useFocus = <T extends HTMLElement>(): [
  RefObject<T | null>,
  boolean,
] => {
  const ref = useRef<T>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onFocus = () => setIsFocused(true)
    const onBlur = () => setIsFocused(false)

    el.addEventListener('focus', onFocus)
    el.addEventListener('blur', onBlur)
    return () => {
      el.removeEventListener('focus', onFocus)
      el.removeEventListener('blur', onBlur)
    }
  }, [])

  return [ref, isFocused]
}

// -----------------------------------------------------------------------------
// useIntersectionObserver
// Detect element có đang visible trong viewport không (lazy load, infinite scroll, animations...)
// -----------------------------------------------------------------------------
/**
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
 * return <div ref={ref}>{isVisible ? 'Đang nhìn thấy' : 'Ngoài viewport'}</div>
 */
export const useIntersectionObserver = <T extends HTMLElement>(
  options: IntersectionObserverInit = {},
): [RefObject<T | null>, boolean, IntersectionObserverEntry | null] => {
  const ref = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      setEntry(entry)
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.threshold, options.root, options.rootMargin])

  return [ref, isIntersecting, entry]
}

// -----------------------------------------------------------------------------
// useResizeObserver
// Theo dõi kích thước của element khi thay đổi
// -----------------------------------------------------------------------------
/**
 * @example
 * const [ref, size] = useResizeObserver<HTMLDivElement>();
 * return <div ref={ref}>Width: {size.width}px</div>
 */
export const useResizeObserver = <T extends HTMLElement>(): [
  RefObject<T | null>,
  { width: number; height: number },
] => {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, size]
}

// -----------------------------------------------------------------------------
// useWindowSize
// Lấy kích thước của window, tự cập nhật khi resize
// -----------------------------------------------------------------------------
/**
 * @example
 * const { width, height } = useWindowSize();
 * const isMobile = width < 768;
 */
export const useWindowSize = (): { width: number; height: number } => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handler = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return size
}

// -----------------------------------------------------------------------------
// useScrollPosition
// Theo dõi vị trí scroll của window hoặc một element
// -----------------------------------------------------------------------------
/**
 * @example
 * const { x, y } = useScrollPosition();
 * const isScrolled = y > 100;
 */
export const useScrollPosition = (
  element?: RefObject<HTMLElement | null>,
): { x: number; y: number } => {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const target = element?.current ?? window

    const handler = () => {
      if (element?.current) {
        setPosition({
          x: element.current.scrollLeft,
          y: element.current.scrollTop,
        })
      } else {
        setPosition({ x: window.scrollX, y: window.scrollY })
      }
    }

    target.addEventListener('scroll', handler, { passive: true })
    return () => target.removeEventListener('scroll', handler)
  }, [element])

  return position
}

// -----------------------------------------------------------------------------
// useScrollLock
// Khóa / mở scroll của body (dùng khi mở modal, drawer...)
// -----------------------------------------------------------------------------
/**
 * @example
 * const { lock, unlock, isLocked } = useScrollLock();
 * // Khi mở modal: lock() | Khi đóng modal: unlock()
 */
export const useScrollLock = () => {
  const [isLocked, setIsLocked] = useState(false)

  const lock = useCallback(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    setIsLocked(true)
  }, [])

  const unlock = useCallback(() => {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    setIsLocked(false)
  }, [])

  // Tự unlock khi component unmount
  useEffect(
    () => () => {
      unlock()
    },
    [unlock],
  )

  return { lock, unlock, isLocked }
}

// -----------------------------------------------------------------------------
// useKeyPress
// Detect phím được nhấn
// -----------------------------------------------------------------------------
/**
 * @example
 * const isEscPressed = useKeyPress('Escape');
 * const isEnterPressed = useKeyPress('Enter');
 * useEffect(() => { if (isEscPressed) setOpen(false); }, [isEscPressed]);
 */
export const useKeyPress = (targetKey: string): boolean => {
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true)
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false)
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [targetKey])

  return isPressed
}

// -----------------------------------------------------------------------------
// useKeyboardShortcut
// Đăng ký keyboard shortcut (Ctrl+S, Ctrl+K, Escape...)
// -----------------------------------------------------------------------------
/**
 * @example
 * useKeyboardShortcut({ key: 's', ctrl: true }, () => handleSave());
 * useKeyboardShortcut({ key: 'Escape' }, () => setOpen(false));
 */
export const useKeyboardShortcut = (
  shortcut: {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  },
  handler: (e: KeyboardEvent) => void,
  options: { enabled?: boolean } = {},
): void => {
  const { enabled = true } = options
  const savedHandler = useRef(handler)
  savedHandler.current = handler

  useEffect(() => {
    if (!enabled) return

    const listener = (e: KeyboardEvent) => {
      const match =
        e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!shortcut.ctrl === e.ctrlKey &&
        !!shortcut.shift === e.shiftKey &&
        !!shortcut.alt === e.altKey &&
        !!shortcut.meta === e.metaKey

      if (match) {
        e.preventDefault()
        savedHandler.current(e)
      }
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [
    shortcut.key,
    shortcut.ctrl,
    shortcut.shift,
    shortcut.alt,
    shortcut.meta,
    enabled,
  ])
}

// -----------------------------------------------------------------------------
// useMutationObserver
// Theo dõi sự thay đổi của DOM (thêm/xóa node, thay đổi attribute...)
// -----------------------------------------------------------------------------
/**
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useMutationObserver(ref, (mutations) => console.log(mutations), {
 *   childList: true,
 *   subtree: true,
 * });
 */
export const useMutationObserver = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: MutationCallback,
  options: MutationObserverInit = { childList: true, subtree: true },
): void => {
  const savedCallback = useRef(callback)
  savedCallback.current = callback

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new MutationObserver((...args) =>
      savedCallback.current(...args),
    )
    observer.observe(el, options)
    return () => observer.disconnect()
  }, [ref])
}

// -----------------------------------------------------------------------------
// useElementSize
// Kết hợp useRef + ResizeObserver để lấy size của element (tiện hơn useResizeObserver)
// -----------------------------------------------------------------------------
/**
 * @example
 * const { ref, width, height } = useElementSize<HTMLDivElement>();
 * return <div ref={ref}>Size: {width} x {height}</div>
 */
export const useElementSize = <T extends HTMLElement>(): {
  ref: RefObject<T | null>
  width: number
  height: number
} => {
  const [ref, size] = useResizeObserver<T>()
  return { ref, ...size }
}

// -----------------------------------------------------------------------------
// useDragAndDrop
// Xử lý drag and drop cơ bản cho một element
// -----------------------------------------------------------------------------
/**
 * @example
 * const { ref, isDragging, dragProps } = useDragAndDrop();
 * return (
 *   <div ref={ref} {...dragProps} style={{ opacity: isDragging ? 0.5 : 1 }}>
 *     Kéo thả tôi
 *   </div>
 * )
 */
export const useDragAndDrop = <T extends HTMLElement>() => {
  const ref = useRef<T>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const startOffset = useRef({ x: 0, y: 0 })

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      startPos.current = { x: e.clientX, y: e.clientY }
      startOffset.current = { ...position }
    },
    [position],
  )

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: MouseEvent) => {
      setPosition({
        x: startOffset.current.x + (e.clientX - startPos.current.x),
        y: startOffset.current.y + (e.clientY - startPos.current.y),
      })
    }
    const onUp = () => setIsDragging(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging])

  return {
    ref,
    isDragging,
    position,
    dragProps: { onMouseDown },
  }
}

// -----------------------------------------------------------------------------
// useClipboard
// Copy text + track trạng thái đã copy (tự reset sau timeout)
// -----------------------------------------------------------------------------
/**
 * @example
 * const { copy, isCopied } = useClipboard();
 * return (
 *   <button onClick={() => copy('Hello!')}>
 *     {isCopied ? '✓ Đã copy' : 'Copy'}
 *   </button>
 * )
 */
export const useClipboard = (resetDelay: number = 2000) => {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text)
        setIsCopied(true)
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setIsCopied(false), resetDelay)
        return true
      } catch {
        return false
      }
    },
    [resetDelay],
  )

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return { copy, isCopied }
}

// -----------------------------------------------------------------------------
// useMediaQuery
// Theo dõi CSS media query, tự cập nhật khi thay đổi
// -----------------------------------------------------------------------------
/**
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', handler)
    setMatches(media.matches)
    return () => media.removeEventListener('change', handler)
  }, [query])

  return matches
}

// -----------------------------------------------------------------------------
// useDocumentTitle
// Cập nhật document title, tự restore về title cũ khi unmount
// -----------------------------------------------------------------------------
/**
 * @example
 * useDocumentTitle('Trang chủ | MyApp');
 * useDocumentTitle(`${product.name} | Shop`, { restoreOnUnmount: true });
 */
export const useDocumentTitle = (
  title: string,
  options: { restoreOnUnmount?: boolean } = {},
): void => {
  const { restoreOnUnmount = false } = options
  const originalTitle = useRef(document.title)

  useEffect(() => {
    document.title = title
    return () => {
      if (restoreOnUnmount) document.title = originalTitle.current
    }
  }, [title, restoreOnUnmount])
}

// -----------------------------------------------------------------------------
// useFocusTrap
// Giữ focus trong một element (accessibility cho modal, dialog...)
// -----------------------------------------------------------------------------
/**
 * @example
 * const trapRef = useFocusTrap(isModalOpen);
 * return <div ref={trapRef} role="dialog">...</div>
 */
export const useFocusTrap = <T extends HTMLElement>(
  enabled: boolean = true,
): RefObject<T | null> => {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    first?.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [enabled])

  return ref
}
