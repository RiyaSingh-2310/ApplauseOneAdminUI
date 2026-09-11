export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatPoints(value: number) {
  return `${formatNumber(value)} pts`
}

export function toInputDate(iso: string) {
  return iso.slice(0, 10)
}

export function startOfDayIso(date = new Date()) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next.toISOString()
}

export function addDaysIso(iso: string, days: number) {
  const date = new Date(iso)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}
