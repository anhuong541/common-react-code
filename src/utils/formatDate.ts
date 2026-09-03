// =============================================================================
// DATE UTILS - Các hàm xử lý ngày tháng
// Tiền tệ và số: formatCurrency.ts, formatNumber.ts. Chuỗi: formatString.ts.
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
