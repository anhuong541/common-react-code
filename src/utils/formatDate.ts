// =============================================================================
// FORMAT UTILS - Các hàm định dạng thường dùng trong dự án React
// =============================================================================

// -----------------------------------------------------------------------------
// DATE - Định dạng ngày tháng
// -----------------------------------------------------------------------------

/**
 * Định dạng Date thành chuỗi theo pattern
 * @example formatDate(new Date(), 'DD/MM/YYYY') => '01/03/2026'
 * @example formatDate(new Date(), 'YYYY-MM-DD') => '2026-03-01'
 * @example formatDate(new Date(), 'DD/MM/YYYY HH:mm') => '01/03/2026 14:30'
 */
export const formatDate = (
  date: Date | string | number,
  pattern: string = 'DD/MM/YYYY',
): string => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const pad = (n: number) => String(n).padStart(2, '0')

  const map: Record<string, string> = {
    YYYY: String(d.getFullYear()),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  }

  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => map[match])
}

/**
 * Trả về thời gian tương đối (relative time)
 * @example timeAgo(new Date(Date.now() - 60000)) => 'cách đây 1 phút'
 * @example timeAgo(new Date(Date.now() - 3600000)) => 'cách đây 1 giờ'
 */
export const timeAgo = (date: Date | string | number): string => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffMonth / 12)

  if (diffSec < 60) return 'vừa xong'
  if (diffMin < 60) return `cách đây ${diffMin} phút`
  if (diffHour < 24) return `cách đây ${diffHour} giờ`
  if (diffDay < 30) return `cách đây ${diffDay} ngày`
  if (diffMonth < 12) return `cách đây ${diffMonth} tháng`
  return `cách đây ${diffYear} năm`
}

/**
 * Kiểm tra ngày có phải hôm nay không
 */
export const isToday = (date: Date | string | number): boolean => {
  const d = new Date(date)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/**
 * Lấy ngày đầu / cuối của tháng
 * @example getStartOfMonth(new Date()) => Date (ngày 1 đầu tháng, 00:00:00)
 */
export const getStartOfMonth = (date: Date = new Date()): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1)

export const getEndOfMonth = (date: Date = new Date()): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

/**
 * Tính số ngày giữa 2 ngày
 * @example daysBetween(new Date('2026-01-01'), new Date('2026-01-10')) => 9
 */
export const daysBetween = (
  dateA: Date | string,
  dateB: Date | string,
): number => {
  const a = new Date(dateA)
  const b = new Date(dateB)
  return Math.abs(
    Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)),
  )
}

/**
 * Thêm/bớt ngày vào một ngày
 * @example addDays(new Date(), 7) => ngày sau 7 ngày
 * @example addDays(new Date(), -3) => ngày 3 ngày trước
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// -----------------------------------------------------------------------------
// CURRENCY / NUMBER - Định dạng tiền tệ và số
// -----------------------------------------------------------------------------

/**
 * Định dạng số thành tiền tệ
 * @example formatCurrency(1500000) => '1.500.000 ₫'
 * @example formatCurrency(1500000, 'USD') => '$1,500,000.00'
 * @example formatCurrency(1500000, 'VND', 'vi-VN') => '1.500.000 ₫'
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'VND',
  locale: string = 'vi-VN',
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount)
}

/**
 * Định dạng số có dấu phân cách hàng nghìn
 * @example formatNumber(1500000) => '1.500.000'
 * @example formatNumber(1500000.5, 2) => '1.500.000,50'
 */
export const formatNumber = (
  value: number,
  decimals: number = 0,
  locale: string = 'vi-VN',
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Rút gọn số lớn thành K, M, B
 * @example compactNumber(1500) => '1.5K'
 * @example compactNumber(1500000) => '1.5M'
 * @example compactNumber(2000000000) => '2B'
 */
export const compactNumber = (value: number): string => {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (abs >= 1_000_000_000)
    return `${sign}${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (abs >= 1_000_000)
    return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (abs >= 1_000)
    return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${sign}${abs}`
}

/**
 * Định dạng phần trăm
 * @example formatPercent(0.753) => '75.3%'
 * @example formatPercent(0.753, 0) => '75%'
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Parse chuỗi tiền tệ về number
 * @example parseCurrency('1.500.000 ₫') => 1500000
 */
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0
}

/**
 * Làm tròn số đến n chữ số thập phân
 * @example roundTo(3.14159, 2) => 3.14
 */
export const roundTo = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

// -----------------------------------------------------------------------------
// STRING - Định dạng chuỗi
// -----------------------------------------------------------------------------

/**
 * Viết hoa chữ cái đầu mỗi từ
 * @example capitalizeWords('hello world') => 'Hello World'
 */
export const capitalizeWords = (str: string): string =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Rút gọn chuỗi có dấu "..."
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
 * Tạo slug từ chuỗi
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

/**
 * Chuyển bytes thành chuỗi dễ đọc
 * @example formatBytes(1024) => '1 KB'
 * @example formatBytes(1048576) => '1 MB'
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}
