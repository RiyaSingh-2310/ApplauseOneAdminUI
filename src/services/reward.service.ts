import { ApiError } from '@/lib/errors'
import { fetchRewardRequests } from '@/services/rewardRequest.service'
import type { LookupOption, PaginatedResult, Reward, RewardInput, RewardListQuery } from '@/types'

const UNAVAILABLE = 'A rewards catalog API is not available. Payout methods are managed in Settings.'

export const rewardService = {
  async list(query: RewardListQuery = {}): Promise<PaginatedResult<Reward>> {
    return { data: [], total: 0, page: 1, pageSize: query.pageSize ?? 10 }
  },
  async types(): Promise<LookupOption[]> {
    const requests = await fetchRewardRequests()
    const unique = [...new Set(requests.map((item) => item.rewardType).filter(Boolean))]
    return unique.map((item) => ({ value: item, label: item }))
  },
  create(input: RewardInput): Promise<Reward> {
    void input
    throw new ApiError(UNAVAILABLE, 404)
  },
  update(id: string, input: RewardInput): Promise<Reward> {
    void id
    void input
    throw new ApiError(UNAVAILABLE, 404)
  },
  remove(id: string): Promise<{ ok: boolean }> {
    void id
    throw new ApiError(UNAVAILABLE, 404)
  },
}
