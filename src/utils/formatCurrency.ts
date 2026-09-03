// =============================================================================
// CURRENCY UTILS - Định dạng và parse tiền tệ
// =============================================================================
// Toàn bộ hàm trong file dựa trên Intl.NumberFormat nên số chữ số thập phân
// luôn tuân theo chuẩn ISO 4217 của từng đơn vị tiền tệ (VND 0, USD 2, KWD 3).
// Không hardcode số lẻ theo từng mã tiền.

/** Locale mặc định dùng cho mọi hàm trong file. */
export const DEFAULT_CURRENCY_LOCALE = 'vi-VN'

/** Đơn vị tiền tệ mặc định, theo mã ISO 4217. */
export const DEFAULT_CURRENCY = 'VND'

/**
 * Chuỗi trả về khi đầu vào không phải số hợp lệ.
 * Cố tình KHÔNG dùng '0' để tránh việc dữ liệu thiếu bị hiển thị thành mức giá 0.
 */
export const DEFAULT_CURRENCY_FALLBACK = '--'

export type CurrencyInput = number | string | bigint | null | undefined

export interface FormatCurrencyOptions {
  /** Mã tiền tệ ISO 4217. Mặc định 'VND'. */
  currency?: string
  /** Locale dùng để định dạng. Mặc định 'vi-VN'. */
  locale?: string
  /** Rút gọn số lớn theo locale: 1500000 => '1,5 Tr ₫'. */
  compact?: boolean
  /** false thì chỉ in phần số, bỏ ký hiệu tiền tệ. Mặc định true. */
  showSymbol?: boolean
  /** Ghi đè số chữ số thập phân tối thiểu. */
  minimumFractionDigits?: number
  /** Ghi đè số chữ số thập phân tối đa. */
  maximumFractionDigits?: number
  /**
   * Đổi non-breaking space (U+00A0) mà Intl chèn vào thành dấu cách thường.
   * Bật khi cần so sánh chuỗi hoặc viết test.
   */
  normalizeSpace?: boolean
  /** Giá trị trả về khi đầu vào không hợp lệ. Mặc định '--'. */
  fallback?: string
}

export interface ParseCurrencyOptions {
  /** Locale của chuỗi đầu vào. Phải khớp với locale đã dùng để format. */
  locale?: string
  /** Giá trị trả về khi không parse được. Mặc định null. */
  fallback?: number | null
}

// -----------------------------------------------------------------------------
// INTERNAL
// -----------------------------------------------------------------------------

/**
 * Cache các instance Intl.NumberFormat.
 * Khởi tạo Intl.NumberFormat là thao tác đắt, tái sử dụng giúp bảng dữ liệu dài
 * không phải dựng lại formatter trên từng dòng.
 */
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

/** Chuẩn hóa đầu vào về number hữu hạn, trả null nếu không hợp lệ. */
const toFiniteNumber = (value: CurrencyInput): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string' && value.trim() === '') return null

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Lấy dấu phân cách hàng nghìn và dấu thập phân thật sự của một locale. */
const getSeparators = (locale: string): { group: string; decimal: string } => {
  const parts = getFormatter(locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
  }).formatToParts(12345.6)

  return {
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
  }
}

// -----------------------------------------------------------------------------
// PUBLIC API
// -----------------------------------------------------------------------------

/**
 * Số chữ số thập phân chuẩn của một đơn vị tiền tệ, do Intl quyết định.
 * @example getCurrencyFractionDigits('VND') => 0
 * @example getCurrencyFractionDigits('USD') => 2
 * @example getCurrencyFractionDigits('KWD') => 3
 */
export const getCurrencyFractionDigits = (
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_CURRENCY_LOCALE,
): number => {
  try {
    const resolved = getFormatter(locale, {
      style: 'currency',
      currency,
    }).resolvedOptions()
    return resolved.maximumFractionDigits ?? 2
  } catch {
    return 2
  }
}

/**
 * Định dạng số thành chuỗi tiền tệ.
 * Trả về `fallback` nếu đầu vào là null, undefined, chuỗi rỗng hoặc NaN.
 *
 * @example formatCurrency(1500000) => '1.500.000 ₫'
 * @example formatCurrency(1500000, { currency: 'USD', locale: 'en-US' }) => '$1,500,000.00'
 * @example formatCurrency(1500000, { compact: true }) => '1,5 Tr ₫'
 * @example formatCurrency(1500000, { showSymbol: false }) => '1.500.000'
 * @example formatCurrency(null) => '--'
 */
export const formatCurrency = (
  value: CurrencyInput,
  options: FormatCurrencyOptions = {},
): string => {
  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_CURRENCY_LOCALE,
    compact = false,
    showSymbol = true,
    minimumFractionDigits,
    maximumFractionDigits,
    normalizeSpace = false,
    fallback = DEFAULT_CURRENCY_FALLBACK,
  } = options

  const amount = toFiniteNumber(value)
  if (amount === null) return fallback

  const numberFormatOptions: Intl.NumberFormatOptions = showSymbol
    ? { style: 'currency', currency, currencyDisplay: 'symbol' }
    : { style: 'decimal' }

  if (compact) {
    // Ở chế độ rút gọn, số lẻ của đơn vị tiền tệ không còn ý nghĩa.
    numberFormatOptions.notation = 'compact'
    numberFormatOptions.compactDisplay = 'short'
    numberFormatOptions.maximumFractionDigits = maximumFractionDigits ?? 1
    if (minimumFractionDigits !== undefined) {
      numberFormatOptions.minimumFractionDigits = minimumFractionDigits
    }
  } else {
    const fractionDigits = getCurrencyFractionDigits(currency, locale)
    const min = minimumFractionDigits ?? fractionDigits
    // maximumFractionDigits luôn phải >= minimumFractionDigits, nếu không Intl ném RangeError.
    numberFormatOptions.minimumFractionDigits = min
    numberFormatOptions.maximumFractionDigits =
      maximumFractionDigits ?? Math.max(fractionDigits, min)
  }

  let result: string
  try {
    result = getFormatter(locale, numberFormatOptions).format(amount)
  } catch {
    // Mã tiền tệ hoặc locale không hợp lệ thì vẫn in ra được con số.
    result = getFormatter(DEFAULT_CURRENCY_LOCALE, { style: 'decimal' }).format(
      amount,
    )
  }

  return normalizeSpace ? result.replace(/\u00a0/g, ' ') : result
}

/**
 * Định dạng tiền lưu ở đơn vị nhỏ nhất (cents, xu) thành chuỗi tiền tệ.
 * Dùng khi backend trả số nguyên để tránh sai số dấu phẩy động.
 *
 * @example formatCurrencyFromMinorUnits(150000, { currency: 'USD', locale: 'en-US' }) => '$1,500.00'
 * @example formatCurrencyFromMinorUnits(1500000) => '1.500.000 ₫'
 */
export const formatCurrencyFromMinorUnits = (
  minorUnits: CurrencyInput,
  options: FormatCurrencyOptions = {},
): string => {
  const amount = toFiniteNumber(minorUnits)
  if (amount === null) return options.fallback ?? DEFAULT_CURRENCY_FALLBACK

  const fractionDigits = getCurrencyFractionDigits(
    options.currency ?? DEFAULT_CURRENCY,
    options.locale ?? DEFAULT_CURRENCY_LOCALE,
  )

  return formatCurrency(amount / Math.pow(10, fractionDigits), options)
}

/**
 * Parse chuỗi tiền tệ về number.
 * Dấu phân cách được đọc từ chính locale thay vì đoán bằng regex, nên round-trip
 * format rồi parse cho kết quả đúng ở mọi locale.
 * Trả về `fallback` (mặc định null) nếu không đọc được số nào.
 *
 * @example parseCurrency('1.500.000 ₫') => 1500000
 * @example parseCurrency('$1,500,000.00', { locale: 'en-US' }) => 1500000
 * @example parseCurrency('(1.500 ₫)') => -1500
 * @example parseCurrency('không phải số') => null
 */
export const parseCurrency = (
  value: string | number | null | undefined,
  options: ParseCurrencyOptions = {},
): number | null => {
  const { locale = DEFAULT_CURRENCY_LOCALE, fallback = null } = options

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback
  }
  if (value === null || value === undefined) return fallback

  const raw = value.trim()
  if (raw === '') return fallback

  // Dấu ngoặc đơn là quy ước kế toán cho số âm. U+2212 là dấu trừ của một số locale.
  const isNegative =
    /^\(.*\)$/.test(raw) || raw.includes('-') || raw.includes('\u2212')

  const { group, decimal } = getSeparators(locale)

  const normalized = raw
    .split(group)
    .join('')
    .replace(new RegExp(`[^0-9${escapeRegExp(decimal)}]`, 'g'), '')
    .replace(decimal, '.')

  if (normalized === '' || normalized === '.') return fallback

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return fallback

  return isNegative ? -parsed : parsed
}

/**
 * Lấy ký hiệu của một đơn vị tiền tệ theo locale.
 * @example getCurrencySymbol('VND') => '₫'
 * @example getCurrencySymbol('USD', 'en-US') => '$'
 */
export const getCurrencySymbol = (
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_CURRENCY_LOCALE,
): string => {
  try {
    return (
      getFormatter(locale, { style: 'currency', currency })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? currency
    )
  } catch {
    return currency
  }
}
