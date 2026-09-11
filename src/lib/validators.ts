export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.trim())
}

export function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function required(value: string, label: string) {
  return value.trim() ? undefined : `${label} is required.`
}
