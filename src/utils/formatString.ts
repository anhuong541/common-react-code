import he from 'he'

export const toKebabCase = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isString(string: unknown): string is string {
  return typeof string === 'string'
}

/**
 * Truncates a block of text to fit within a character limit, with a bias towards ending on a
 * full sentence. If no complete sentence fits within the limit, it falls back to a word-based
 * truncation with an ellipsis.
 *
 * @param {string} text - The text to truncate.
 * @param {number} limit - The maximum number of characters allowed before truncation.
 * @param {string} [locale=en_US] - The locale to use when breaking the text into segments.
 * @returns {string} Truncated text clipped to the limit, ideally ending on a natural stopping point.
 */
export function truncateAroundLimit(
  text: string,
  limit: number,
  locale: string = 'en-US',
): string {
  // If the text is shorter than the limit, return all the text, unaltered.
  if (text.length <= limit) {
    return text
  }

  const decodedText = he.decode(text)

  const isSegemnterSupported = typeof Intl.Segmenter === 'function'
  const terminatingPunctuation = '…'

  // A very naive fallback if the browser doesn't support `Segementer`,
  // which just truncates the text to the last space before the `limit`.
  if (!isSegemnterSupported) {
    const truncatedText = decodedText.slice(0, limit)
    const indexOfLastSpace = truncatedText.lastIndexOf(' ')
    if (indexOfLastSpace) {
      return (
        truncatedText.slice(0, indexOfLastSpace).trim() + terminatingPunctuation
      )
    } else {
      // If the text is an _exteremly_ long word or block of text, like a URL
      return truncatedText.trim() + terminatingPunctuation
    }
  }

  const sentences = Array.from(
    new Intl.Segmenter(locale, { granularity: 'sentence' }).segment(text),
    (s) => s.segment,
  )

  let result = ''
  for (const sentence of sentences) {
    // If there is still room to add another sentence without going over the limit, add it.
    if (result.length + sentence.length <= limit) {
      result += sentence
    } else {
      break
    }
  }

  result = result.trim()

  // If the result we built based on full sentences is close-enough to the desired limit
  // (e.g. within the threshold of 75% of 160), we can use it.
  if (result.length >= limit * 0.75) {
    return result
  }

  // Otherwise, fallback to building up single words until we approach the limit.
  const segments = Array.from(
    new Intl.Segmenter(locale, { granularity: 'word' }).segment(decodedText),
  )

  result = ''
  for (const { segment } of segments) {
    if (result.length + segment.length <= limit) {
      result += segment
    } else {
      break
    }
  }

  return result.trim() + terminatingPunctuation
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function commaSeparatedList(items: Array<string>, locale = 'en') {
  return new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
  }).format(items)
}

export function stripTags(text: string) {
  return text.replace(/(<([^>]+)>)/gi, '')
}

export function stripUnicodeWhitespace(text: string) {
  return text.replace(/[\u0000-\u001F]/g, '')
}

// -----------------------------------------------------------------------------
// Chuyển sang từ formatDate.ts vì đây là các hàm xử lý chuỗi, không phải ngày tháng.
// -----------------------------------------------------------------------------

/**
 * Viết hoa chữ cái đầu mỗi từ
 * @example capitalizeWords('hello world') => 'Hello World'
 */
export const capitalizeWords = (str: string): string =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Rút gọn chuỗi theo số ký tự, cắt cứng và thêm hậu tố.
 * Cần cắt theo câu hoặc theo từ thì dùng `truncateAroundLimit` ở trên.
 * @example truncateText('Hello World React', 10) => 'Hello W...'
 */
export const truncateText = (
  str: string,
  maxLength: number,
  suffix: string = '...',
): string => {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Xóa dấu tiếng Việt (dùng cho search, slug...)
 * @example removeVietnameseTones('Xin chào Việt Nam') => 'Xin chao Viet Nam'
 */
export const removeVietnameseTones = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

/**
 * Tạo slug từ chuỗi, có bỏ dấu tiếng Việt trước.
 * Khác `toKebabCase` ở chỗ `toKebabCase` không xử lý dấu nên 'Việt' thành 'vi-t'.
 * @example slugify('Xin chào Việt Nam!') => 'xin-chao-viet-nam'
 */
export const slugify = (str: string): string =>
  removeVietnameseTones(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')

/**
 * Highlight từ khóa tìm kiếm trong chuỗi (trả về HTML string)
 * @example highlightText('Hello World', 'world') => 'Hello <mark>World</mark>'
 */
export const highlightText = (text: string, keyword: string): string => {
  if (!keyword.trim()) return text
  const regex = new RegExp(
    `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  )
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Mask chuỗi nhạy cảm (email, phone, card...)
 * @example maskEmail('example@gmail.com') => 'ex****@gmail.com'
 * @example maskPhone('0912345678') => '091****678'
 */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@')
  if (!domain) return email
  return `${local.slice(0, 2)}****@${domain}`
}

export const maskPhone = (phone: string): string =>
  phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')

/**
 * Đếm số từ trong chuỗi
 * @example wordCount('Hello beautiful world') => 3
 */
export const wordCount = (str: string): number =>
  str.trim().split(/\s+/).filter(Boolean).length
