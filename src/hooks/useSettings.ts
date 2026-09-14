import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { queryKeys } from '@/lib/query'
import { settingsService } from '@/services/settings.service'
import type { AdminSettings } from '@/types'

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => settingsService.get(),
  })
}

export function useSaveSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AdminSettings) => settingsService.update(input),
    onSuccess: () => {
      notify.success('Settings saved.')
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
    onError: (error) => notify.error(error),
  })
}
