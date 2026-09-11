import { apiRequest } from '@/lib/http'
import type { AdminUser, AuthSession, ForgotPasswordInput, LoginInput } from '@/types'

/**
 * Authentication API boundary.
 * Temporary development mode: mock HTTP accepts any valid form and returns a session.
 * Later: replace the mock implementation with a real token response — Login UI stays the same.
 */
export const adminAuthService = {
  login(input: LoginInput) {
    return apiRequest<AuthSession>('/admin/auth/login', {
      method: 'POST',
      body: input,
      auth: false,
    })
  },
  forgotPassword(input: ForgotPasswordInput) {
    return apiRequest<{ ok: boolean }>('/admin/auth/forgot-password', {
      method: 'POST',
      body: input,
      auth: false,
    })
  },
  me() {
    return apiRequest<AdminUser>('/admin/auth/me')
  },
}
