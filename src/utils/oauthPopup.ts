interface OAuthResult {
  success: boolean
  token?: string
  refreshToken?: string
  expiresIn?: number
  user?: {
    id: string
    email: string
    fullName: string
  }
  error?: string
}

interface PopupOptions {
  width?: number
  height?: number
  title?: string
  timeout?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/v1/as/jobseekers/auth'

/**
 * Utility class để xử lý OAuth authentication thông qua popup window
 */
export class OAuthPopupHandler {
  private static readonly DEFAULT_POPUP_OPTIONS: PopupOptions = {
    width: 500,
    height: 600,
    title: 'OAuth Authentication',
    timeout: 300000, // 5 minutes
  }

  /**
   * Mở popup window cho OAuth authentication
   * @param url - URL của OAuth provider
   * @param options - Tùy chọn cho popup window
   * @returns Promise với kết quả authentication
   */
  static async openOAuthPopup(
    url: string,
    options: PopupOptions = {},
  ): Promise<OAuthResult> {
    return new Promise((resolve, reject) => {
      const popupOptions = { ...this.DEFAULT_POPUP_OPTIONS, ...options }

      // Tính toán vị trí center cho popup
      const left =
        window.screenX + (window.outerWidth - popupOptions.width!) / 2
      const top =
        window.screenY + (window.outerHeight - popupOptions.height!) / 2

      // Tạo popup window
      const popup = window.open(
        url,
        popupOptions.title,
        `width=${popupOptions.width},height=${popupOptions.height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
      )

      if (!popup) {
        reject(
          new Error(
            'Popup bị chặn. Vui lòng cho phép popup cho trang web này.',
          ),
        )
        return
      }

      // Timeout để tránh popup bị treo
      const timeout = setTimeout(() => {
        cleanup()
        resolve({
          success: false,
          error: 'Đăng nhập hết thời gian chờ',
        })
      }, popupOptions.timeout!)

      // Cleanup function để đảm bảo tất cả listeners được remove
      const cleanup = () => {
        clearTimeout(timeout)
        clearInterval(checkClosed)
        window.removeEventListener('message', messageListener)

        // Force đóng popup nếu chưa đóng
        if (!popup.closed) {
          popup.close()
        }
      }

      // Lắng nghe message từ popup
      const messageListener = (event: MessageEvent) => {
        // Kiểm tra origin để đảm bảo bảo mật (cho phép cả wildcard cho development)
        const allowedOrigins = [
          window.location.origin,
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        ]

        // Trong development, cho phép wildcard origin
        const isAllowedOrigin =
          allowedOrigins.includes(event.origin) ||
          event.origin === window.location.origin

        if (!isAllowedOrigin && event.origin !== 'null') {
          console.warn(
            'OAuth Popup: Message from unauthorized origin:',
            event.origin,
          )
          return
        }

        if (event.data && event.data.type === 'OAUTH_RESULT') {
          // Cleanup ngay lập tức
          cleanup()

          if (event.data.success) {
            // Trong popup (sau khi login xong):

            resolve({
              success: true,
              token: event.data.token,
              refreshToken: event.data.refreshToken,
              expiresIn: event.data.expiresIn,
              user: event.data.user,
            })
          } else {
            resolve({
              success: false,
              error: event.data.error || 'Đăng nhập thất bại',
            })
          }
        }
      }

      // Lắng nghe khi popup bị đóng thủ công
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          cleanup()
          resolve({
            success: false,
            error: 'Đăng nhập bị hủy',
          })
        }
      }, 1000)

      window.addEventListener('message', messageListener)
    })
  }

  /**
   * Xử lý Google OAuth
   */
  static async handleGoogleOAuth(): Promise<OAuthResult> {
    const newUrlRedirect = `${window.location.origin}/oauth`
    const googleAuthUrl = `${API_URL}/google?redirect_uri=${encodeURIComponent(newUrlRedirect)}`

    return this.openOAuthPopup(googleAuthUrl, {
      title: 'Đăng nhập với Google',
    })
  }

  /**
   * Xử lý Facebook OAuth
   */
  static async handleFacebookOAuth(): Promise<OAuthResult> {
    const newUrlRedirect = `${window.location.origin}/oauth`
    const facebookAuthUrl = `${API_URL}/facebook?redirect_uri=${encodeURIComponent(newUrlRedirect)}`

    return this.openOAuthPopup(facebookAuthUrl, {
      title: 'Đăng nhập với Facebook',
    })
  }
}

/**
 * Hook để sử dụng OAuth popup trong React components
 */
export const useOAuthPopup = () => {
  const handleGoogleLogin = async (): Promise<OAuthResult> => {
    try {
      return await OAuthPopupHandler.handleGoogleOAuth()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định',
      }
    }
  }

  const handleFacebookLogin = async (): Promise<OAuthResult> => {
    try {
      return await OAuthPopupHandler.handleFacebookOAuth()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định',
      }
    }
  }

  return {
    handleGoogleLogin,
    handleFacebookLogin,
  }
}
