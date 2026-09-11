import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { queryKeys } from '@/lib/query'
import { rewardRequestService } from '@/services/rewardRequest.service'
import type { RewardRequestListQuery } from '@/types'

export function useRewardRequestList(query: RewardRequestListQuery) {
  return useQuery({
    queryKey: queryKeys.rewardRequests(query),
    queryFn: () => rewardRequestService.list(query),
  })
}

function invalidateRequests(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['reward-requests'] })
  void queryClient.invalidateQueries({ queryKey: ['reward-history'] })
  void queryClient.invalidateQueries({ queryKey: ['panelists'] })
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
  void queryClient.invalidateQueries({ queryKey: queryKeys.rewardAnalytics })
}

export function useRewardRequestAction(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string
      action: 'approve' | 'reject' | 'complete'
    }) => {
      if (action === 'approve') return rewardRequestService.approve(id)
      if (action === 'reject') return rewardRequestService.reject(id)
      return rewardRequestService.complete(id)
    },
    onSuccess: (_data, variables) => {
      notify.success(
        variables.action === 'approve'
          ? 'Reward request approved.'
          : variables.action === 'reject'
            ? 'Reward request rejected.'
            : 'Reward request marked as completed.',
      )
      invalidateRequests(queryClient)
      onSuccess?.()
    },
    onError: (error) => notify.error(error),
  })
}
