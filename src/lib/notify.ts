import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'

export const notify = {
  success(message: string) {
    toast.success(message)
  },
  error(error: unknown, fallback?: string) {
    toast.error(getErrorMessage(error, fallback))
  },
  info(message: string) {
    toast.info(message)
  },
}
