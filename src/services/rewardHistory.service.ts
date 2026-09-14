import { downloadCsv, toCsv } from '@/lib/csv'
import { paginateRows, sortRows, toTransaction } from '@/lib/mappers'
import { fetchRewardRequests } from '@/services/rewardRequest.service'
import type { PaginatedResult, RewardHistoryQuery, RewardTransaction } from '@/types'

export const rewardHistoryService = {
  async list(query: RewardHistoryQuery = {}): Promise<PaginatedResult<RewardTransaction>> {
    const rows = filterHistory((await fetchRewardRequests(query.status)).map(toTransaction), query)
    const sorted = sortRows(
      rows,
      query.sortBy === 'transactionDate' ? 'transactionDate' : query.sortBy,
      query.sortDir,
    )
    return paginateRows(sorted, query.page ?? 1, query.pageSize ?? 10)
  },
  async export(query: RewardHistoryQuery = {}) {
    const result = await rewardHistoryService.list({ ...query, page: 1, pageSize: 1000 })
    const csv = toCsv(
      result.data.map((item) => ({
        Request: item.requestId,
        Panelist: item.panelistName,
        Reward: item.rewardName,
        Points: item.points,
        Status: item.status,
        Date: item.transactionDate,
      })),
    )
    downloadCsv(csv, 'applause-one-reward-history.csv')
  },
}

function filterHistory(rows: RewardTransaction[], query: RewardHistoryQuery) {
  const search = query.search?.trim().toLowerCase()
  return rows.filter((item) => {
    if (query.status && query.status !== 'all' && item.status !== query.status) return false
    if (query.rewardType && query.rewardType !== 'all' && item.rewardType !== query.rewardType) return false
    if (query.panelistId && item.panelistId !== query.panelistId) return false
    if (query.dateFrom && item.transactionDate.slice(0, 10) < query.dateFrom) return false
    if (query.dateTo && item.transactionDate.slice(0, 10) > query.dateTo) return false
    if (!search) return true
    return `${item.requestId} ${item.panelistName} ${item.rewardName}`.toLowerCase().includes(search)
  })
}
