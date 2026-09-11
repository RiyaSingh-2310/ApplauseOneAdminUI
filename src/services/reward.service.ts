import { apiRequest, toSearch } from '@/lib/http'
import type { LookupOption, PaginatedResult, Reward, RewardInput, RewardListQuery } from '@/types'

export const rewardService = {
  list(query: RewardListQuery = {}) {
    return apiRequest<PaginatedResult<Reward>>(`/admin/rewards${toSearch(query)}`)
  },
  types() {
    return apiRequest<LookupOption[]>('/admin/rewards/types')
  },
  create(input: RewardInput) {
    return apiRequest<Reward>('/admin/rewards', { method: 'POST', body: input })
  },
  update(id: string, input: RewardInput) {
    return apiRequest<Reward>(`/admin/rewards/${id}`, { method: 'PATCH', body: input })
  },
  remove(id: string) {
    return apiRequest<{ ok: boolean }>(`/admin/rewards/${id}`, { method: 'DELETE' })
  },
}
