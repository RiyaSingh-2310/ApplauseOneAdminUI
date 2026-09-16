import { apiRequest } from '@/lib/apiClient'
import { mapAuthSession } from '@/lib/mappers'
import { readSession } from '@/lib/session'
import type { AdminUser, AuthSession, LoginInput } from '@/types'
import type { ApiLoginData } from '@/types/api'

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
   * Token validity is enforced by apiRequest 401 handling on real API calls.
   */
  async me(): Promise<AdminUser> {
    const session = readSession()
    if (!session?.token) throw new Error('Your session has expired. Please sign in again.')
    return session.user
  },
}
