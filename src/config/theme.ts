export const THEME_STORAGE_KEY = 'ao_admin_theme'

export type ThemeMode = 'light' | 'dark'

export const CHART_COLOR_VARS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

export function readCssColor(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function getChartColors() {
  return [
    readCssColor('--chart-1', '#0f6e6a'),
    readCssColor('--chart-2', '#c4a35a'),
    readCssColor('--chart-3', '#16827d'),
    readCssColor('--chart-4', '#3a4d5f'),
    readCssColor('--chart-5', '#1d5f8a'),
  ]
}

export function getChartSurface() {
  return {
    grid: readCssColor('--border', '#e5ddd0'),
    tooltipBg: readCssColor('--popover', '#ffffff'),
    tooltipText: readCssColor('--popover-foreground', '#122033'),
    tooltipBorder: readCssColor('--border', '#e5ddd0'),
    tick: readCssColor('--muted-foreground', '#6b7a88'),
  }
}
