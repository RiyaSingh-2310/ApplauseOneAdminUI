import { downloadCsv } from '@/lib/csv'
import { apiRequest, toSearch } from '@/lib/http'
import type { PaginatedResult, RewardHistoryQuery, RewardTransaction } from '@/types'

export const rewardHistoryService = {
  list(query: RewardHistoryQuery = {}) {
    return apiRequest<PaginatedResult<RewardTransaction>>(`/admin/reward-history${toSearch(query)}`)
  },
  async export(query: RewardHistoryQuery = {}) {
    const csv = await apiRequest<string>(`/admin/reward-history/export${toSearch(query)}`)
    downloadCsv(csv, 'applause-one-reward-history.csv')
  },
}
