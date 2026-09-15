import { ApiError } from '@/lib/errors'

export interface ApiEnvelope<T = unknown> {
  success?: boolean
  message?: string
  data?: T
  errors?: Record<string, unknown>
}

const STATUS_FALLBACK: Record<number, string> = {
  400: 'The request could not be processed.',
  401: 'Invalid email or password.',
  403: 'You do not have permission to do that.',
  404: 'The requested record was not found.',
  409: 'This action conflicts with the current data.',
  405: 'This request method is not allowed by the API.',
  422: 'Please check the highlighted fields and try again.',
  500: 'The server could not complete this request. Please try again.',
}

export function messageFromEnvelope(
  payload: ApiEnvelope | null,
  status: number,
  authRequest: boolean,
  method?: string,
  url?: string,
) {
  const fromFields = fieldMessages(payload?.errors)
  if (payload?.message) {
    return fromFields ? `${payload.message} ${fromFields}` : payload.message
  }
  if (fromFields) return fromFields
  if (status === 401) {
    return authRequest
      ? 'Your session has expired. Please sign in again.'
      : 'Invalid email or password.'
  }
  if (status === 405) {
    const fallback = STATUS_FALLBACK[405]
    if (import.meta.env.DEV && method && url) return `${fallback} (${method} ${url})`
    return fallback
  }
  return STATUS_FALLBACK[status] ?? 'Something went wrong. Please try again.'
}

function fieldMessages(errors?: Record<string, unknown>) {
  if (!errors) return ''
  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => String(value).trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(' ')
}

export function asApiError(error: unknown, status = 400) {
  if (error instanceof ApiError) return error
  return new ApiError(error instanceof Error ? error.message : 'Something went wrong. Please try again.', status)
}
