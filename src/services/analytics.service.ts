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
import type { ApiPanelistDetailData, ApiPanelistListData, ApiRewardRequestListData, ApiSurveyListData } from '@/types/api'

async function loadSummaries() {
  const [panelists, requestData, activeSurveys] = await Promise.all([
    listPanelists(),
    apiRequest<ApiRewardRequestListData>('/admin/reward-requests'),
    apiRequest<ApiSurveyListData>(`/admin/surveys${toSearch({ status: 'active', page: 1, limit: 1 })}`),
  ])
  const requests = (requestData.requests ?? []).map(mapRewardRequest)
  return {
    panelists: panelists.rows,
    requests,
    total: panelists.total,
    activeProjects: activeSurveys.total ?? 0,
  }
}

async function listPanelists() {
  const rows: ReturnType<typeof mapPanelist>[] = []
  let page = 1
  let total = Infinity
  while (rows.length < total && page <= 20) {
    const data = await apiRequest<ApiPanelistListData>(`/admin/panelists${toSearch({ page, limit: 100 })}`)
    total = data.total ?? data.items?.length ?? 0
    rows.push(...(data.items ?? []).map((item) => mapPanelist(item)))
    if (!data.items?.length) break
    page += 1
  }
  return { rows, total: Number.isFinite(total) ? total : rows.length }
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
    const { panelists, requests, total, activeProjects } = await loadSummaries()
    return { ...buildDashboard(panelists, requests), totalPanelists: total, activeProjects }
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
