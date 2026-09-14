import { decodeJwtExpiry } from '@/lib/jwt'
import type {
  AgeRange,
  AuthSession,
  ChartDatum,
  DashboardAnalytics,
  Education,
  Employment,
  Gender,
  HouseholdIncome,
  LoginInput,
  PaginatedResult,
  Panelist,
  PanelistAnalytics,
  PanelistDetail,
  RewardAnalytics,
  RewardRequest,
  RewardRequestStatus,
  RewardTransaction,
  TrendPoint,
} from '@/types'
import type {
  ApiAdmin,
  ApiLoginData,
  ApiPanelist,
  ApiPanelistAnswer,
  ApiRewardRequest,
  ApiSettings,
} from '@/types/api'

export function asString(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback
  return String(value)
}

export function asNumber(value: unknown, fallback = 0) {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

export function asFlag(value: unknown) {
  return value === 1 || value === '1' || value === true || value === 'true'
}

export function toIsoDate(value?: string | null) {
  if (!value) return ''
  return value.includes('T') ? value : value.replace(' ', 'T')
}

export function splitName(name: string) {
  const trimmed = name.trim()
  const index = trimmed.indexOf(' ')
  if (index === -1) return { firstName: trimmed, lastName: '' }
  return { firstName: trimmed.slice(0, index), lastName: trimmed.slice(index + 1) }
}

export function joinName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(' ').trim()
}

export function paginateRows<T>(rows: T[], page = 1, pageSize = 10): PaginatedResult<T> {
  const safePage = Math.max(1, page)
  const safeSize = Math.max(1, pageSize)
  const start = (safePage - 1) * safeSize
  return {
    data: rows.slice(start, start + safeSize),
    total: rows.length,
    page: safePage,
    pageSize: safeSize,
  }
}

export function sortRows<T>(rows: T[], sortBy?: string, sortDir: 'asc' | 'desc' = 'desc') {
  if (!sortBy) return rows
  const copy = [...rows]
  copy.sort((left, right) => {
    const a = (left as Record<string, unknown>)[sortBy]
    const b = (right as Record<string, unknown>)[sortBy]
    const av = a instanceof Date ? a.getTime() : a
    const bv = b instanceof Date ? b.getTime() : b
    if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
    return sortDir === 'asc'
      ? String(av ?? '').localeCompare(String(bv ?? ''))
      : String(bv ?? '').localeCompare(String(av ?? ''))
  })
  return copy
}

export function mapAdminUser(admin: ApiAdmin) {
  return {
    id: asString(admin.id),
    name: admin.name,
    email: admin.email,
    role: 'Administrator',
  }
}

export function mapAuthSession(data: ApiLoginData, input: LoginInput): AuthSession {
  return {
    token: data.token,
    expiresAt: decodeJwtExpiry(data.token) ?? Date.now() + 7 * 24 * 60 * 60 * 1000,
    remember: input.remember,
    user: mapAdminUser(data.admin),
  }
}

export function mapPanelist(item: ApiPanelist, answers: ApiPanelistAnswer[] = []): Panelist {
  const { firstName, lastName } = splitName(item.name ?? '')
  const verified = asFlag(item.is_verified)
  const status = item.status === 'inactive' ? 'inactive' : verified ? 'active' : 'pending'
  const demographics = parseDemographics(answers)
  return {
    id: asString(item.id),
    firstName,
    lastName,
    email: item.email ?? '',
    phone: item.phone ?? '',
    postalCode: '',
    gender: demographics.gender,
    age: demographics.age,
    ageRange: demographics.ageRange,
    education: demographics.education,
    employment: demographics.employment,
    householdIncome: demographics.householdIncome,
    householdSize: demographics.householdSize,
    status,
    rewardPoints: asNumber(item.balance_point),
    redeemedPoints: 0,
    pendingPoints: 0,
    lifetimePointsIssued: asNumber(item.balance_point),
    assignedProjectCount: 0,
    completedProjectCount: 0,
    registeredAt: toIsoDate(item.created_at),
    surveyPreferences: {
      shoppingPreference: answerText(answers, 'shopping method') || '—',
      preferredCategories: answers
        .filter((item) => /categor|interest/i.test(item.question_text ?? ''))
        .map((item) => item.answer_text ?? '')
        .filter(Boolean),
      typicalSpend: answerText(answers, 'budget') || '—',
      researchParticipation: answerText(answers, 'frequency') || '—',
    },
  }
}

export function mapPanelistDetail(
  item: ApiPanelist,
  answers: ApiPanelistAnswer[] = [],
  requests: RewardRequest[] = [],
): PanelistDetail {
  const panelist = mapPanelist(item, answers)
  const mine = requests.filter((request) => request.panelistId === panelist.id)
  const redeemed = mine.filter((request) => request.status === 'approved').reduce((sum, item) => sum + item.points, 0)
  const pending = mine.filter((request) => request.status === 'pending').reduce((sum, item) => sum + item.points, 0)
  return {
    ...panelist,
    redeemedPoints: redeemed,
    pendingPoints: pending,
    lifetimePointsIssued: panelist.rewardPoints + redeemed,
    assignments: [],
    recentRewards: mine.map(toTransaction),
  }
}

export function mapRewardRequest(item: ApiRewardRequest): RewardRequest {
  const method = item.payment_method || item.payment_methord || 'Reward'
  const points = asNumber(item.reward_points)
  const status = normalizeRequestStatus(item.status)
  return {
    id: asString(item.id),
    requestId: `RR-${asString(item.id).padStart(4, '0')}`,
    panelistId: asString(item.user_id),
    panelistName: item.panelist_name || item.requested_by || 'Panelist',
    rewardId: method.toLowerCase().replace(/\s+/g, '-'),
    rewardName: method,
    rewardType: method,
    points,
    cashValue: 0,
    currency: 'USD',
    requestedAt: toIsoDate(item.created_at),
    status,
    notes: [item.remark, item.comment].filter(Boolean).join(' · ') || undefined,
  }
}

export function toTransaction(item: RewardRequest): RewardTransaction {
  return {
    id: item.id,
    requestId: item.requestId,
    panelistId: item.panelistId,
    panelistName: item.panelistName,
    rewardId: item.rewardId,
    rewardName: item.rewardName,
    rewardType: item.rewardType,
    points: item.points,
    value: item.cashValue,
    currency: item.currency,
    transactionDate: item.requestedAt,
    status: item.status,
  }
}

export function mapSettings(item: ApiSettings) {
  return {
    registrationRewardPoints: asNumber(item.registration_reward_points),
    minimumPayout: asNumber(item.minimum_payout),
    amazonEnabled: asFlag(item.amazon_enabled),
    flipkartEnabled: asFlag(item.flipkart_enabled),
    paypalEnabled: asFlag(item.paypal_enabled),
  }
}

export function buildDashboard(
  panelists: Panelist[],
  requests: RewardRequest[],
): DashboardAnalytics {
  const now = Date.now()
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000
  const redeemed = requests.filter((item) => item.status === 'approved')
  const pending = requests.filter((item) => item.status === 'pending')
  const recentPanelists = [...panelists]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, 4)
    .map((item) => ({
      id: `pnl-${item.id}`,
      title: 'New panelist registered',
      detail: `${[item.firstName, item.lastName].filter(Boolean).join(' ')} joined the panel.`,
      at: item.registeredAt,
      kind: 'panelist' as const,
    }))
  const recentRequests = [...requests]
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
    .slice(0, 4)
    .map((item) => ({
      id: `req-${item.id}`,
      title: `Reward request ${item.status}`,
      detail: `${item.panelistName} · ${item.rewardName} · ${item.points} pts`,
      at: item.requestedAt,
      kind: 'reward' as const,
    }))
  return {
    totalPanelists: panelists.length,
    newRegistrations: panelists.filter((item) => new Date(item.registeredAt).getTime() >= monthAgo).length,
    activePanelists: panelists.filter((item) => item.status === 'active').length,
    pendingRewardRequests: pending.length,
    totalPointsIssued: panelists.reduce((sum, item) => sum + item.rewardPoints, 0) + redeemed.reduce((sum, item) => sum + item.points, 0),
    totalPointsRedeemed: redeemed.reduce((sum, item) => sum + item.points, 0),
    activeProjects: 0,
    recentActivity: [...recentRequests, ...recentPanelists]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 6),
  }
}

export function buildPanelistAnalytics(details: Panelist[]): PanelistAnalytics {
  return {
    gender: countBy(details, (item) => item.gender, (key) => labelLookup(key)),
    ageRange: countBy(details, (item) => item.ageRange, (key) => key),
    education: countBy(details, (item) => item.education, (key) => key),
    employment: countBy(details, (item) => item.employment, (key) => key),
    householdIncome: countBy(details, (item) => item.householdIncome, (key) => key),
    shoppingPreferences: countBy(
      details.flatMap((item) => item.surveyPreferences.preferredCategories),
      (item) => item,
      (key) => key,
    ),
    registrationTrend: {
      daily: trendBy(details, 'day'),
      weekly: trendBy(details, 'week'),
      monthly: trendBy(details, 'month'),
    },
  }
}

export function buildRewardAnalytics(requests: RewardRequest[], panelists: Panelist[]): RewardAnalytics {
  const approved = requests.filter((item) => item.status === 'approved')
  const outstanding = panelists.reduce((sum, item) => sum + item.rewardPoints, 0)
  const redeemed = approved.reduce((sum, item) => sum + item.points, 0)
  return {
    issued: trendBy(
      panelists.map((item) => ({ registeredAt: item.registeredAt, value: item.rewardPoints })),
      'day',
      'registeredAt',
      'value',
    ),
    redeemed: trendBy(
      approved.map((item) => ({ registeredAt: item.requestedAt, value: item.points })),
      'day',
      'registeredAt',
      'value',
    ),
    typeDistribution: countBy(requests, (item) => item.rewardType, (key) => key),
    requestStatus: countBy(requests, (item) => item.status, (key) => key),
    topRewards: countBy(approved, (item) => item.rewardName, (key) => key),
    pointsEconomy: {
      issued: outstanding + redeemed,
      redeemed,
      outstanding,
    },
  }
}

function normalizeRequestStatus(status?: string): RewardRequestStatus {
  if (status === 'approved' || status === 'rejected' || status === 'completed' || status === 'pending') return status
  return 'pending'
}

function parseDemographics(answers: ApiPanelistAnswer[]) {
  const gender = parseGender(answerText(answers, 'gender'))
  const ageRange = parseAgeRange(answerText(answers, 'age'))
  return {
    gender,
    ageRange,
    age: ageFromRange(ageRange),
    education: parseEducation(answerText(answers, 'education')),
    employment: parseEmployment(answerText(answers, 'employment')),
    householdIncome: parseIncome(answerText(answers, 'income')),
    householdSize: asNumber(answerText(answers, 'household size'), 0),
  }
}

function answerText(answers: ApiPanelistAnswer[], needle: string) {
  const match = answers.find((item) => (item.question_text ?? '').toLowerCase().includes(needle))
  return match?.answer_text?.trim() ?? ''
}

function parseGender(value: string): Gender | undefined {
  const text = value.toLowerCase()
  if (text.includes('female')) return 'female'
  if (text.includes('male')) return 'male'
  if (text) return 'other'
  return undefined
}

function parseAgeRange(value: string): AgeRange | undefined {
  if (value.includes('18')) return '18-24'
  if (value.includes('25')) return '25-34'
  if (value.includes('35')) return '35-44'
  if (value.includes('45')) return '45-54'
  if (value.includes('55')) return '55+'
  return undefined
}

function ageFromRange(range?: AgeRange) {
  if (range === '18-24') return 21
  if (range === '25-34') return 30
  if (range === '35-44') return 40
  if (range === '45-54') return 50
  if (range === '55+') return 60
  return 0
}

function parseEducation(value: string): Education | undefined {
  const text = value.toLowerCase()
  if (text.includes('doctor')) return 'doctorate'
  if (text.includes('master')) return 'masters'
  if (text.includes('bachelor')) return 'bachelors'
  if (text.includes('college')) return 'some_college'
  if (text.includes('high')) return 'high_school'
  return undefined
}

function parseEmployment(value: string): Employment | undefined {
  const text = value.toLowerCase()
  if (text.includes('student')) return 'student'
  if (text.includes('retired')) return 'retired'
  if (text.includes('self')) return 'self_employed'
  if (text.includes('part')) return 'part_time'
  if (text.includes('unemploy')) return 'unemployed'
  if (text.includes('full') || text.includes('employ')) return 'full_time'
  return undefined
}

function parseIncome(value: string): HouseholdIncome | undefined {
  const text = value.replace(/\s/g, '').toLowerCase()
  if (text.includes('150')) return '150k_plus'
  if (text.includes('100')) return '100k_149k'
  if (text.includes('75')) return '75k_99k'
  if (text.includes('50')) return '50k_74k'
  if (text.includes('25')) return '25k_49k'
  if (text.includes('under') || text.includes('<')) return 'under_25k'
  return undefined
}

function countBy<T>(
  rows: T[],
  keyOf: (item: T) => string | undefined,
  labelOf: (key: string) => string,
): ChartDatum[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = keyOf(row)
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].map(([key, value]) => ({ key, label: labelOf(key), value }))
}

function trendBy(
  rows: Array<Record<string, unknown>> | Panelist[],
  unit: 'day' | 'week' | 'month',
  dateKey = 'registeredAt',
  valueKey?: string,
): TrendPoint[] {
  const buckets = new Map<string, number>()
  for (const row of rows as Array<Record<string, unknown>>) {
    const raw = String(row[dateKey] ?? '')
    if (!raw) continue
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) continue
    const key =
      unit === 'month'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : unit === 'week'
          ? weekKey(date)
          : raw.slice(0, 10)
    const amount = valueKey ? asNumber(row[valueKey], 0) : 1
    buckets.set(key, (buckets.get(key) ?? 0) + amount)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, label: date, value }))
}

function weekKey(date: Date) {
  const next = new Date(date)
  next.setDate(next.getDate() - next.getDay())
  return next.toISOString().slice(0, 10)
}

function labelLookup(key: string) {
  return key.charAt(0).toUpperCase() + key.slice(1)
}
