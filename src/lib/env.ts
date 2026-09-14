export const env = {
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  apiBaseUrl: resolveApiBaseUrl(),
}

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '')
  if (configured) return configured
  return import.meta.env.DEV ? '/applauseoneapi' : 'https://arserviceco.com/applauseoneapi'
}

export function isMockMode() {
  return env.useMock
}
