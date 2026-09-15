export const HOSTED_API_BASE_URL = 'https://arserviceco.com/applauseoneapi'

export const env = {
  useMock: import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true',
  apiBaseUrl: resolveApiBaseUrl(),
}

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') ?? ''

  if (import.meta.env.DEV) {
    return configured || '/applauseoneapi'
  }

  if (isUsableProductionBaseUrl(configured)) return configured
  return HOSTED_API_BASE_URL
}

function isUsableProductionBaseUrl(value: string) {
  if (!value.startsWith('https://')) return false
  return !/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value)
}

export function isMockMode() {
  return env.useMock
}

export function joinApiUrl(path: string) {
  const base = env.apiBaseUrl.replace(/\/$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}
