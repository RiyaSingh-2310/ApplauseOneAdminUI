export const env = {
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
}

export function isMockMode() {
  return env.useMock || !env.apiBaseUrl
}
