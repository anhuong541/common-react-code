// =============================================================================
// VALIDATION UTILS - Các hàm validate thường dùng trong dự án React
// =============================================================================

// -----------------------------------------------------------------------------
// PRIMITIVE CHECKS
// -----------------------------------------------------------------------------

/**
 * Kiểm tra giá trị có rỗng không (null, undefined, '', [], {})
 * @example isEmpty(null) => true | isEmpty('') => true | isEmpty([]) => true
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object')
    return Object.keys(value as object).length === 0
  return false
}

/**
 * Kiểm tra giá trị có tồn tại (không null, undefined, rỗng)
 */
export const isPresent = (value: unknown): boolean => !isEmpty(value)

// -----------------------------------------------------------------------------
// CONTACT
// -----------------------------------------------------------------------------

/**
 * Validate email
 * @example isValidEmail('test@gmail.com') => true
 * @example isValidEmail('test@') => false
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.trim())
}

/**
 * Validate số điện thoại Việt Nam (10 số, bắt đầu 0)
 * @example isValidPhoneVN('0912345678') => true
 * @example isValidPhoneVN('01234') => false
 */
export const isValidPhoneVN = (phone: string): boolean => {
  const regex = /^(0[3|5|7|8|9])+([0-9]{8})$/
  return regex.test(phone.trim())
}

/**
 * Validate số điện thoại quốc tế
 * @example isValidPhoneIntl('+84912345678') => true
 */
export const isValidPhoneIntl = (phone: string): boolean => {
  const regex = /^\+?[1-9]\d{6,14}$/
  return regex.test(phone.replace(/\s/g, ''))
}

// -----------------------------------------------------------------------------
// IDENTITY / DOCUMENTS
// -----------------------------------------------------------------------------

/**
 * Validate CCCD/CMND Việt Nam (9 hoặc 12 số)
 * @example isValidCCCD('012345678901') => true
 */
export const isValidCCCD = (value: string): boolean => {
  const regex = /^(\d{9}|\d{12})$/
  return regex.test(value.trim())
}

/**
 * Validate MST (Mã số thuế) Việt Nam (10 hoặc 13 số)
 */
export const isValidMST = (value: string): boolean => {
  const regex = /^(\d{10}|\d{10}-\d{3})$/
  return regex.test(value.trim())
}

// -----------------------------------------------------------------------------
// URL / WEB
// -----------------------------------------------------------------------------

/**
 * Validate URL
 * @example isValidUrl('https://google.com') => true
 * @example isValidUrl('google.com') => false
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Kiểm tra URL có phải https không
 */
export const isHttpsUrl = (url: string): boolean => {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

// -----------------------------------------------------------------------------
// PASSWORD
// -----------------------------------------------------------------------------

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4 // 0: rất yếu, 4: rất mạnh
  label: 'Rất yếu' | 'Yếu' | 'Trung bình' | 'Mạnh' | 'Rất mạnh'
  checks: {
    minLength: boolean // >= 8 ký tự
    hasUppercase: boolean // có chữ hoa
    hasLowercase: boolean // có chữ thường
    hasNumber: boolean // có số
    hasSpecial: boolean // có ký tự đặc biệt
  }
}

/**
 * Kiểm tra độ mạnh của password
 * @example checkPasswordStrength('Abc@1234') => { score: 4, label: 'Rất mạnh', checks: {...} }
 */
export const checkPasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const score = Object.values(checks).filter(Boolean).length as
    | 0
    | 1
    | 2
    | 3
    | 4
  const labels: PasswordStrength['label'][] = [
    'Rất yếu',
    'Yếu',
    'Trung bình',
    'Mạnh',
    'Rất mạnh',
  ]

  return { score, label: labels[score], checks }
}

/**
 * Validate password có đủ tiêu chí tối thiểu không
 * @example isValidPassword('Abc@1234') => true
 */
export const isValidPassword = (password: string): boolean => {
  return checkPasswordStrength(password).score >= 3
}

// -----------------------------------------------------------------------------
// NUMBERS
// -----------------------------------------------------------------------------

/**
 * Kiểm tra chuỗi có phải số nguyên dương không
 * @example isPositiveInteger('123') => true | isPositiveInteger('-1') => false
 */
export const isPositiveInteger = (value: string | number): boolean => {
  const n = Number(value)
  return Number.isInteger(n) && n > 0
}

/**
 * Kiểm tra có nằm trong khoảng [min, max] không
 */
export const isInRange = (value: number, min: number, max: number): boolean =>
  value >= min && value <= max

// -----------------------------------------------------------------------------
// FILE
// -----------------------------------------------------------------------------

/**
 * Validate file extension
 * @example isValidFileType(file, ['jpg', 'png', 'pdf']) => true/false
 */
export const isValidFileType = (
  file: File,
  allowedTypes: string[],
): boolean => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return allowedTypes.map((t) => t.toLowerCase()).includes(ext)
}

/**
 * Validate dung lượng file
 * @example isValidFileSize(file, 5 * 1024 * 1024) // max 5MB
 */
export const isValidFileSize = (file: File, maxBytes: number): boolean =>
  file.size <= maxBytes

/**
 * Validate file ảnh (jpg, jpeg, png, gif, webp, svg)
 */
export const isImageFile = (file: File): boolean =>
  isValidFileType(file, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])

// -----------------------------------------------------------------------------
// FORM HELPERS - Dùng cho React Hook Form, Formik...
// -----------------------------------------------------------------------------

/**
 * Tạo required validator (trả về message lỗi hoặc undefined)
 * @example required('Tên')('') => 'Tên không được để trống'
 * @example required('Tên')('John') => undefined
 */
export const required =
  (fieldName: string) =>
  (value: unknown): string | undefined =>
    isEmpty(value) ? `${fieldName} không được để trống` : undefined

/**
 * Tạo minLength validator
 * @example minLength('Mật khẩu', 8)('abc') => 'Mật khẩu phải có ít nhất 8 ký tự'
 */
export const minLength =
  (fieldName: string, min: number) =>
  (value: string): string | undefined =>
    value.length < min ? `${fieldName} phải có ít nhất ${min} ký tự` : undefined

/**
 * Tạo maxLength validator
 */
export const maxLength =
  (fieldName: string, max: number) =>
  (value: string): string | undefined =>
    value.length > max
      ? `${fieldName} không được vượt quá ${max} ký tự`
      : undefined

/**
 * Compose nhiều validators lại (trả về lỗi đầu tiên gặp)
 * @example
 * const validateEmail = composeValidators(
 *   required('Email'),
 *   (v) => isValidEmail(v) ? undefined : 'Email không hợp lệ'
 * )
 */
export const composeValidators =
  (...validators: ((value: string) => string | undefined)[]) =>
  (value: string): string | undefined => {
    for (const validate of validators) {
      const error = validate(value)
      if (error) return error
    }
    return undefined
  }
