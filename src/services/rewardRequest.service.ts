import { apiRequest, toSearch } from '@/lib/http'
import type { PaginatedResult, RewardRequest, RewardRequestListQuery } from '@/types'

export const rewardRequestService = {
  list(query: RewardRequestListQuery = {}) {
    return apiRequest<PaginatedResult<RewardRequest>>(`/admin/reward-requests${toSearch(query)}`)
  },
  get(id: string) {
    return apiRequest<RewardRequest>(`/admin/reward-requests/${id}`)
  },
  approve(id: string) {
    return apiRequest<RewardRequest>(`/admin/reward-requests/${id}/approve`, { method: 'POST' })
  },
  reject(id: string) {
    return apiRequest<RewardRequest>(`/admin/reward-requests/${id}/reject`, { method: 'POST' })
  },
  complete(id: string) {
    return apiRequest<RewardRequest>(`/admin/reward-requests/${id}/complete`, { method: 'POST' })
  },
}
