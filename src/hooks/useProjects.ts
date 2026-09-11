import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { queryKeys } from '@/lib/query'
import { projectService } from '@/services/project.service'
import type { AssignProjectInput, ProjectListQuery } from '@/types'

export function useProjectList(query: ProjectListQuery) {
  return useQuery({
    queryKey: queryKeys.projects(query),
    queryFn: () => projectService.list(query),
  })
}

function invalidateProjects(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['projects'] })
  void queryClient.invalidateQueries({ queryKey: ['panelists'] })
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
}

export function useAssignProject(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectService.assign,
    onSuccess: () => {
      notify.success('Project assigned successfully.')
      invalidateProjects(queryClient)
      onSuccess?.()
    },
    onError: (error) => notify.error(error),
  })
}

export function useUpdateProject(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssignProjectInput }) =>
      projectService.update(id, input),
    onSuccess: () => {
      notify.success('Assignment updated successfully.')
      invalidateProjects(queryClient)
      onSuccess?.()
    },
    onError: (error) => notify.error(error),
  })
}

export function useRemoveProject(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectService.remove,
    onSuccess: () => {
      notify.success('Project removed successfully.')
      invalidateProjects(queryClient)
      onSuccess?.()
    },
    onError: (error) => notify.error(error),
  })
}
