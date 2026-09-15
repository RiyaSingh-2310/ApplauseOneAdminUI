import { isMockMode, joinApiUrl } from '@/lib/env'
import { ApiError } from '@/lib/errors'
import { messageFromEnvelope, type ApiEnvelope } from '@/lib/apiEnvelope'
import { clearSession, getAccessToken } from '@/lib/session'
import { mockRequest } from '@/mocks/handlers'

const UNAUTHORIZED_EVENT = 'ao:unauthorized'
const REQUEST_TIMEOUT_MS = 20_000

export function emitUnauthorized() {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
}

export function onUnauthorized(handler: () => void) {
  window.addEventListener(UNAUTHORIZED_EVENT, handler)
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler)
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

export function toSearch(query: object = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '' || value === 'all') continue
    params.set(key, String(value))
  }
  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const authRequest = options.auth !== false
  const url = joinApiUrl(path)

  if (isMockMode()) {
    return mockRequest<T>(method, path, options.body)
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (authRequest) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: 'omit',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new ApiError('The request timed out. Please try again.', 0)
    }
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0)
  }

  if (response.status === 204) return undefined as T

  const payload = await readPayload(response)

  if (response.status === 401) {
    if (authRequest) {
      clearSession()
      emitUnauthorized()
    }
    throw new ApiError(messageFromEnvelope(payload, response.status, authRequest), 401)
  }

  if (!response.ok) {
    throw new ApiError(messageFromEnvelope(payload, response.status, authRequest, method, url), response.status)
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T
  }
  return payload as T
}

function isTimeoutError(error: unknown) {
  return error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')
}

async function readPayload(response: Response): Promise<ApiEnvelope | null> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
    const text = await response.text()
    return { data: text as unknown as undefined }
  }
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as ApiEnvelope
  } catch {
    return { message: response.statusText }
  }
}
