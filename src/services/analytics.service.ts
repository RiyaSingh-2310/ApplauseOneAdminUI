import { apiRequest } from '@/lib/http'
import type { DashboardAnalytics, PanelistAnalytics, RewardAnalytics } from '@/types'

export const analyticsService = {
  dashboard() {
    return apiRequest<DashboardAnalytics>('/admin/analytics/dashboard')
  },
  panelists() {
    return apiRequest<PanelistAnalytics>('/admin/analytics/panelists')
  },
  rewards() {
    return apiRequest<RewardAnalytics>('/admin/analytics/rewards')
  },
}

export { settingsService } from './settings.service'
