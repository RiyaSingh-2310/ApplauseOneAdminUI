import { ApiError } from '@/lib/errors'
import type { AssignProjectInput, PaginatedResult, ProjectAssignment, ProjectListQuery } from '@/types'

const UNAVAILABLE = 'Project assignment is not available on the hosted API yet.'

export const projectService = {
  async list(query: ProjectListQuery = {}): Promise<PaginatedResult<ProjectAssignment>> {
    return { data: [], total: 0, page: query.page ?? 1, pageSize: query.pageSize ?? 10 }
  },
  get(id: string): Promise<ProjectAssignment> {
    void id
    throw new ApiError(UNAVAILABLE, 404)
  },
  assign(input: AssignProjectInput): Promise<ProjectAssignment> {
    void input
    throw new ApiError(UNAVAILABLE, 404)
  },
  update(id: string, input: AssignProjectInput): Promise<ProjectAssignment> {
    void id
    void input
    throw new ApiError(UNAVAILABLE, 404)
  },
  remove(id: string): Promise<{ ok: boolean }> {
    void id
    throw new ApiError(UNAVAILABLE, 404)
  },
}
