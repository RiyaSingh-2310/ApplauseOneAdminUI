import { apiRequest } from '@/lib/apiClient'
import { ApiError } from '@/lib/errors'
import { mapAuthSession } from '@/lib/mappers'
import { readSession } from '@/lib/session'
import type { AdminUser, AuthSession, LoginInput } from '@/types'
import type { ApiLoginData } from '@/types/api'

/**
 * Admin auth against the published ApplauseOne Admin OpenAPI contract.
 * Documented admin auth surface today: POST /admin/login only.
 * There is no admin change-password, profile-update, photo-upload, or logout route.
 */
export const adminAuthService = {
  async login(input: LoginInput): Promise<AuthSession> {
    const data = await apiRequest<ApiLoginData>('/admin/login', {
      method: 'POST',
      body: { email: input.email, password: input.password },
      auth: false,
    })
    if (!data?.token || !data.admin) {
      throw new Error('Login did not return a token.')
    }
    return mapAuthSession(data, input)
  },
  /**
   * Restore the signed-in admin from the local session.
   * Does not call /admin/settings — that belongs only on the Settings page.
   */
  async me(): Promise<AdminUser> {
    const session = readSession()
    if (!session?.token) throw new Error('Your session has expired. Please sign in again.')
    return session.user
  },
  /**
   * Intentionally does not invent an endpoint.
   * OpenAPI + live probes: no /admin change-password route exists.
   */
  async changePassword(_input: {
    currentPassword: string
    newPassword: string
  }): Promise<never> {
    void _input
    throw new ApiError(
      'Change password is not available. The Admin API does not expose a password-change endpoint.',
      501,
    )
  },
  /**
   * Intentionally does not invent an endpoint.
   * OpenAPI + live probes: no /admin profile update route exists.
   * Panelist PUT /me rejects admin tokens (401).
   */
  async updateProfile(_input: { name: string }): Promise<never> {
    void _input
    throw new ApiError(
      'Updating the administrator name is not available. The Admin API does not expose a profile-update endpoint.',
      501,
    )
  },
}
