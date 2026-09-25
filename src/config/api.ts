const OFFICIAL_API_BASE_URL = 'https://applauseone.com/applauseoneapi'

export const API_BASE_URL = resolveApiBaseUrl()

export const apiConfig = {
  baseUrl: API_BASE_URL,
}

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') ?? ''
  if (configured === OFFICIAL_API_BASE_URL) return configured
  return OFFICIAL_API_BASE_URL
}

export function joinApiUrl(path: string) {
  const base = apiConfig.baseUrl.replace(/\/$/, '')
  let suffix = path.trim()
  if (!suffix) return base
  if (suffix.startsWith(base)) return suffix
  suffix = suffix.replace(/^https?:\/\/[^/]+/i, '')
  suffix = suffix.replace(/^\/applauseoneapi(?=\/|$)/, '')
  if (!suffix.startsWith('/')) suffix = `/${suffix}`
  return `${base}${suffix}`
}
