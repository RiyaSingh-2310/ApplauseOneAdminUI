import { apiRequest, toSearch } from '@/lib/http'
import type {
  LookupOption,
  PaginatedResult,
  Panelist,
  PanelistDetail,
  PanelistListQuery,
  UpdatePanelistInput,
} from '@/types'

export const panelistService = {
  list(query: PanelistListQuery = {}) {
    return apiRequest<PaginatedResult<Panelist>>(`/admin/panelists${toSearch(query)}`)
  },
  options() {
    return apiRequest<LookupOption[]>('/admin/panelists/options')
  },
  get(id: string) {
    return apiRequest<PanelistDetail>(`/admin/panelists/${id}`)
  },
  update(id: string, input: UpdatePanelistInput) {
    return apiRequest<PanelistDetail>(`/admin/panelists/${id}`, {
      method: 'PATCH',
      body: input,
    })
  },
  activate(id: string) {
    return apiRequest<Panelist>(`/admin/panelists/${id}/activate`, { method: 'POST' })
  },
  deactivate(id: string) {
    return apiRequest<Panelist>(`/admin/panelists/${id}/deactivate`, { method: 'POST' })
  },
}
