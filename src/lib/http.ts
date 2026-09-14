import { env, isMockMode } from '@/lib/env'
import { ApiError } from '@/lib/errors'
import { messageFromEnvelope, type ApiEnvelope } from '@/lib/apiEnvelope'
import { clearSession, getAccessToken } from '@/lib/session'
import { mockRequest } from '@/mocks/handlers'

const UNAUTHORIZED_EVENT = 'ao:unauthorized'

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
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
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
    throw new ApiError(messageFromEnvelope(payload, response.status, authRequest), response.status)
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T
  }
  return payload as T
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
