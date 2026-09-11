import { isValidEmail } from '@/lib/validators'

export const MIN_PASSWORD_LENGTH = 8

export function validateAdminEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email address is required.'
  if (!isValidEmail(value)) return 'Please enter a valid email address.'
  return undefined
}

export function validateAdminPassword(value: string): string | undefined {
  if (!value) return 'Password is required.'
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return undefined
}
