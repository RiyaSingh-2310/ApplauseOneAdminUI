import type {
  AgeRange,
  AssignmentStatus,
  CompletionStatus,
  Education,
  Employment,
  Gender,
  HouseholdIncome,
  PanelistStatus,
  RewardAvailability,
  RewardRequestStatus,
  RewardStatus,
} from '@/types'

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other / Prefer not to say',
}

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  '18-24': '18–24',
  '25-34': '25–34',
  '35-44': '35–44',
  '45-54': '45–54',
  '55+': '55+',
}

export const EDUCATION_LABELS: Record<Education, string> = {
  high_school: 'High school',
  some_college: 'Some college',
  bachelors: "Bachelor's",
  masters: "Master's",
  doctorate: 'Doctorate',
}

export const EMPLOYMENT_LABELS: Record<Employment, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  self_employed: 'Self-employed',
  unemployed: 'Unemployed',
  student: 'Student',
  retired: 'Retired',
}

export const INCOME_LABELS: Record<HouseholdIncome, string> = {
  under_25k: 'Under $25k',
  '25k_49k': '$25k–$49k',
  '50k_74k': '$50k–$74k',
  '75k_99k': '$75k–$99k',
  '100k_149k': '$100k–$149k',
  '150k_plus': '$150k+',
}

export const PANELIST_STATUS_LABELS: Record<PanelistStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
}

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  active: 'Active',
  complete: 'Complete',
  terminate: 'Terminated',
  quota_full: 'Quota full',
}

export const COMPLETION_STATUS_LABELS: Record<CompletionStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  expired: 'Expired',
}

export const REWARD_STATUS_LABELS: Record<RewardStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
}

export const AVAILABILITY_LABELS: Record<RewardAvailability, string> = {
  in_stock: 'Available',
  limited: 'Limited',
  unavailable: 'Unavailable',
}

export const REQUEST_STATUS_LABELS: Record<RewardRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
}

/**
 * Display-only labels for payment methods returned by the backend/Client catalog.
 * Filter/API values must remain the raw `name` from payment_methods.
 */
const PAYMENT_METHOD_DISPLAY: Record<string, string> = {
  paypal: 'PayPal',
  uip: 'UPI',
  upi: 'UPI',
  cash: 'Cash',
  'gift card': 'Gift Card',
  'gift_card': 'Gift Card',
  amazon: 'Amazon',
  'amazon pay': 'Amazon Pay',
  flipkart: 'Flipkart',
  myntra: 'Myntra',
  gpay: 'GPay',
  'bank transfer': 'Bank Transfer',
}

export function paymentMethodLabel(name: string) {
  const key = name.trim().toLowerCase()
  return PAYMENT_METHOD_DISPLAY[key] ?? name.trim()
}

export function fullName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(' ')
}

export function isAssignablePanelist(panelist: { status: PanelistStatus; isVerified: boolean }) {
  return panelist.status === 'active' && panelist.isVerified
}
