// =============================================================================
// NUMBER UTILS - Định dạng số, phần trăm, dung lượng
// =============================================================================
// Tách khỏi formatCurrency.ts vì đây là định dạng số thuần, không gắn với đơn vị
// tiền tệ và không phụ thuộc chuẩn ISO 4217.

/** Locale mặc định dùng cho mọi hàm trong file. */
export const DEFAULT_NUMBER_LOCALE = 'vi-VN'

/** Chuỗi trả về khi đầu vào không phải số hợp lệ. */
export const DEFAULT_NUMBER_FALLBACK = '--'

export type NumberInput = number | string | bigint | null | undefined

export interface FormatNumberOptions {
  locale?: string
  /** Số chữ số thập phân cố định. Ghi đè cả min lẫn max. */
  decimals?: number
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  /** Đổi non-breaking space (U+00A0) thành dấu cách thường. */
  normalizeSpace?: boolean
  fallback?: string
}

// -----------------------------------------------------------------------------
// INTERNAL
// -----------------------------------------------------------------------------

const formatterCache = new Map<string, Intl.NumberFormat>()

const getFormatter = (
  locale: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  const key = `${locale}|${JSON.stringify(options)}`
  const cached = formatterCache.get(key)
  if (cached) return cached

  const formatter = new Intl.NumberFormat(locale, options)
  formatterCache.set(key, formatter)
  return formatter
}

const toFiniteNumber = (value: NumberInput): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string' && value.trim() === '') return null

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const applySpaceOption = (text: string, normalizeSpace?: boolean): string =>
  normalizeSpace ? text.replace(/\u00a0/g, ' ') : text

// -----------------------------------------------------------------------------
// PUBLIC API
// -----------------------------------------------------------------------------

/**
 * Định dạng số có dấu phân cách hàng nghìn theo locale.
 *
 * @example formatNumber(1500000) => '1.500.000'
 * @example formatNumber(1500000.5, { decimals: 2 }) => '1.500.000,50'
 * @example formatNumber(1500000, { locale: 'en-US' }) => '1,500,000'
 * @example formatNumber(undefined) => '--'
 */
export const formatNumber = (
  value: NumberInput,
  options: FormatNumberOptions = {},
): string => {
  const {
    locale = DEFAULT_NUMBER_LOCALE,
    decimals,
    minimumFractionDigits,
    maximumFractionDigits,
    normalizeSpace,
    fallback = DEFAULT_NUMBER_FALLBACK,
  } = options

  const parsed = toFiniteNumber(value)
  if (parsed === null) return fallback

  const min = decimals ?? minimumFractionDigits ?? 0
  const max = decimals ?? maximumFractionDigits ?? Math.max(min, 3)

  return applySpaceOption(
    getFormatter(locale, {
      style: 'decimal',
      minimumFractionDigits: min,
      maximumFractionDigits: Math.max(min, max),
    }).format(parsed),
    normalizeSpace,
  )
}

/**
 * Rút gọn số lớn theo quy ước của locale.
 * Locale 'vi-VN' cho ra 'N', 'Tr', 'T'; locale 'en-US' cho ra 'K', 'M', 'B'.
 *
 * @example compactNumber(1500) => '1,5 N'
 * @example compactNumber(1500000) => '1,5 Tr'
 * @example compactNumber(1500000, { locale: 'en-US' }) => '1.5M'
 */
export const compactNumber = (
  value: NumberInput,
  options: FormatNumberOptions = {},
): string => {
  const {
    locale = DEFAULT_NUMBER_LOCALE,
    decimals,
    maximumFractionDigits,
    normalizeSpace,
    fallback = DEFAULT_NUMBER_FALLBACK,
  } = options

  const parsed = toFiniteNumber(value)
  if (parsed === null) return fallback

  return applySpaceOption(
    getFormatter(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: decimals ?? maximumFractionDigits ?? 1,
    }).format(parsed),
    normalizeSpace,
  )
}

export interface FormatPercentOptions extends FormatNumberOptions {
  /**
   * true (mặc định): đầu vào là tỉ lệ, 0.753 => '75,3%'.
   * false: đầu vào đã là phần trăm, 75.3 => '75,3%'.
   */
  isRatio?: boolean
}

/**
 * Định dạng phần trăm theo locale, dấu thập phân đúng với ngôn ngữ.
 *
 * @example formatPercent(0.753) => '75,3%'
 * @example formatPercent(0.753, { decimals: 0 }) => '75%'
 * @example formatPercent(75.3, { isRatio: false }) => '75,3%'
 */
export const formatPercent = (
  value: NumberInput,
  options: FormatPercentOptions = {},
): string => {
  const {
    locale = DEFAULT_NUMBER_LOCALE,
    decimals = 1,
    isRatio = true,
    normalizeSpace,
    fallback = DEFAULT_NUMBER_FALLBACK,
  } = options

  const parsed = toFiniteNumber(value)
  if (parsed === null) return fallback

  return applySpaceOption(
    getFormatter(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(isRatio ? parsed : parsed / 100),
    normalizeSpace,
  )
}

/**
 * Làm tròn tới n chữ số thập phân, tránh sai số dấu phẩy động.
 * Cách nhân rồi chia thông thường cho kết quả sai ở các mốc 0.5.
 *
 * @example roundTo(3.14159, 2) => 3.14
 * @example roundTo(1.005, 2) => 1.01
 * @example roundTo(-1.005, 2) => -1.01
 */
export const roundTo = (value: number, decimals: number = 2): number => {
  if (!Number.isFinite(value)) return NaN

  // Dịch dấu thập phân bằng chuỗi thay vì nhân với lũy thừa 10,
  // vì 1.005 * 100 cho ra 100.49999999999999.
  const shift = (input: number, exponent: number): number => {
    const [mantissa, currentExponent = '0'] = input.toString().split('e')
    return Number(`${mantissa}e${Number(currentExponent) + exponent}`)
  }

  const sign = value < 0 ? -1 : 1
  const rounded = Math.round(shift(Math.abs(value), decimals))
  return sign * shift(rounded, -decimals)
}

export interface FormatBytesOptions extends FormatNumberOptions {
  /**
   * true (mặc định): dùng bội số 1024 với nhãn KB, MB.
   * false: dùng bội số 1000 theo chuẩn SI.
   */
  binary?: boolean
}

/**
 * Chuyển số byte thành chuỗi dễ đọc.
 *
 * @example formatBytes(1024) => '1 KB'
 * @example formatBytes(1048576) => '1 MB'
 * @example formatBytes(1500, { binary: false }) => '1,5 KB'
 */
export const formatBytes = (
  bytes: NumberInput,
  options: FormatBytesOptions = {},
): string => {
  const {
    locale = DEFAULT_NUMBER_LOCALE,
    decimals = 2,
    binary = true,
    normalizeSpace,
    fallback = DEFAULT_NUMBER_FALLBACK,
  } = options

  const parsed = toFiniteNumber(bytes)
  if (parsed === null) return fallback

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const base = binary ? 1024 : 1000
  const sign = parsed < 0 ? '-' : ''
  const abs = Math.abs(parsed)

  if (abs < 1) return `${sign}${abs} ${units[0]}`

  const exponent = Math.min(
    Math.floor(Math.log(abs) / Math.log(base)),
    units.length - 1,
  )
  const size = abs / Math.pow(base, exponent)

  const formatted = formatNumber(roundTo(size, decimals), {
    locale,
    maximumFractionDigits: decimals,
    normalizeSpace,
  })

  return `${sign}${formatted} ${units[exponent]}`
}
