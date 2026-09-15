import { apiRequest, toSearch } from '@/lib/apiClient'
import {
  buildDashboard,
  buildPanelistAnalytics,
  buildRewardAnalytics,
  mapPanelist,
  mapPanelistDetail,
  mapRewardRequest,
} from '@/lib/mappers'
import type { DashboardAnalytics, PanelistAnalytics, RewardAnalytics } from '@/types'
import type { ApiPanelistDetailData, ApiPanelistListData, ApiRewardRequestListData } from '@/types/api'

async function loadSummaries() {
  const [panelistPage, requestData] = await Promise.all([
    apiRequest<ApiPanelistListData>(`/admin/panelists${toSearch({ page: 1, limit: 100 })}`),
    apiRequest<ApiRewardRequestListData>('/admin/reward-requests'),
  ])
  const requests = (requestData.requests ?? []).map(mapRewardRequest)
  const panelists = (panelistPage.items ?? []).map((item) => mapPanelist(item))
  return {
    panelists,
    requests,
    total: panelistPage.total ?? panelists.length,
  }
}

async function loadDetails() {
  const workspace = await loadSummaries()
  const details = await Promise.all(
    workspace.panelists.slice(0, 100).map(async (item) => {
      try {
        const detail = await apiRequest<ApiPanelistDetailData>(`/admin/panelists/${item.id}`)
        return mapPanelistDetail(detail.panelist, detail.answers ?? [], workspace.requests)
      } catch {
        return item
      }
    }),
  )
  return { ...workspace, panelists: details }
}

export const analyticsService = {
  async dashboard(): Promise<DashboardAnalytics> {
    const { panelists, requests, total } = await loadSummaries()
    return { ...buildDashboard(panelists, requests), totalPanelists: total }
  },
  async panelists(): Promise<PanelistAnalytics> {
    const { panelists } = await loadDetails()
    return buildPanelistAnalytics(panelists)
  },
  async rewards(): Promise<RewardAnalytics> {
    const { panelists, requests } = await loadSummaries()
    return buildRewardAnalytics(requests, panelists)
  },
}
