import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { queryKeys } from '@/lib/query'
import { rewardService } from '@/services/reward.service'
import type { RewardInput, RewardListQuery } from '@/types'

export function useRewardList(query: RewardListQuery) {
  return useQuery({
    queryKey: queryKeys.rewards(query),
    queryFn: () => rewardService.list(query),
  })
}

export function useRewardTypes() {
  return useQuery({
    queryKey: queryKeys.rewardTypes,
    queryFn: () => rewardService.types(),
  })
}

function invalidateRewards(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['rewards'] })
}

export function useCreateReward(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rewardService.create,
    onSuccess: () => {
      notify.success('Reward created successfully.')
      invalidateRewards(queryClient)
      onSuccess?.()
    },
    onError: (error) => notify.error(error),
  })
}

export function useUpdateReward(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RewardInput }) =>
      rewardService.update(id, input),
    onSuccess: () => {
      notify.success('Reward updated successfully.')
      invalidateRewards(queryClient)
      onSuccess?.()
    },
    onError: (error) => notify.error(error),
  })
}

export function useDeleteReward(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rewardService.remove,
    onSuccess: () => {
      notify.success('Reward deleted successfully.')
      invalidateRewards(queryClient)
      onSuccess?.()
    },
    onError: (error) => notify.error(error),
  })
}
