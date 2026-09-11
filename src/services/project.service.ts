import { apiRequest, toSearch } from '@/lib/http'
import type {
  AssignProjectInput,
  PaginatedResult,
  ProjectAssignment,
  ProjectListQuery,
} from '@/types'

export const projectService = {
  list(query: ProjectListQuery = {}) {
    return apiRequest<PaginatedResult<ProjectAssignment>>(`/admin/projects${toSearch(query)}`)
  },
  get(id: string) {
    return apiRequest<ProjectAssignment>(`/admin/projects/${id}`)
  },
  assign(input: AssignProjectInput) {
    return apiRequest<ProjectAssignment>('/admin/projects', {
      method: 'POST',
      body: input,
    })
  },
  update(id: string, input: AssignProjectInput) {
    return apiRequest<ProjectAssignment>(`/admin/projects/${id}`, {
      method: 'PATCH',
      body: input,
    })
  },
  remove(id: string) {
    return apiRequest<{ ok: boolean }>(`/admin/projects/${id}`, { method: 'DELETE' })
  },
}
