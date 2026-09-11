import { apiRequest } from '@/lib/http'
import type { AdminSettings } from '@/types'

export const settingsService = {
  get() {
    return apiRequest<AdminSettings>('/admin/settings')
  },
  update(input: AdminSettings) {
    return apiRequest<AdminSettings>('/admin/settings', { method: 'PATCH', body: input })
  },
  resetDemo() {
    return apiRequest<{ ok: boolean }>('/admin/settings/reset', { method: 'POST' })
  },
}
