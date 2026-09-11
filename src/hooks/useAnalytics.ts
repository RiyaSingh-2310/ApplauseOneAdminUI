import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query'
import { analyticsService } from '@/services/analytics.service'

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => analyticsService.dashboard(),
  })
}

export function usePanelistAnalytics() {
  return useQuery({
    queryKey: queryKeys.panelistAnalytics,
    queryFn: () => analyticsService.panelists(),
  })
}

export function useRewardAnalytics() {
  return useQuery({
    queryKey: queryKeys.rewardAnalytics,
    queryFn: () => analyticsService.rewards(),
  })
}
