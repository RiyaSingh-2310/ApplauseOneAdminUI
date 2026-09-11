import { ApiError } from '@/lib/errors'
import { toCsv } from '@/lib/csv'
import { formatDateTime } from '@/lib/format'
import type {
  AssignProjectInput,
  AdminSettings,
  AuthSession,
  LoginInput,
  RewardInput,
  UpdatePanelistInput,
} from '@/types'
import { matchesSearch, mockStore, paginate, sortBy } from './store'

function wait(ms = 420) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function fail(message: string, status = 400): never {
  throw new ApiError(message, status)
}

function parsePath(path: string) {
  const url = new URL(path, 'http://admin.local')
  return { pathname: url.pathname, search: url.searchParams }
}

function requireAdmin() {
  const raw =
    window.localStorage.getItem('ao_admin_session') ??
    window.sessionStorage.getItem('ao_admin_session')
  if (!raw) fail('Your session has expired. Please sign in again.', 401)
}

function queryNumber(search: URLSearchParams, key: string, fallback: number) {
  const value = Number(search.get(key))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export async function mockRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { pathname, search } = parsePath(path)
  const key = `${method} ${pathname}`

  if (key === 'POST /admin/auth/login') {
    await wait(160)
    const payload = body as LoginInput
    const email = payload.email.trim()
    const session: AuthSession = {
      token: `dev.${Date.now()}`,
      expiresAt: Date.now() + (payload.remember ? 8 : 4) * 60 * 60 * 1000,
      remember: payload.remember,
      user: {
        id: 'adm_dev',
        name: email.split('@')[0] || 'Administrator',
        email,
        role: 'Administrator',
      },
    }
    return session as T
  }

  await wait()

  if (key === 'POST /admin/auth/forgot-password') {
    return { ok: true } as T
  }

  requireAdmin()

  if (key === 'GET /admin/auth/me') {
    const raw =
      window.localStorage.getItem('ao_admin_session') ??
      window.sessionStorage.getItem('ao_admin_session')
    if (!raw) fail('Your session has expired. Please sign in again.', 401)
    const session = JSON.parse(raw) as AuthSession
    return session.user as T
  }

  if (key === 'GET /admin/settings') return mockStore.settings() as T
  if (key === 'PATCH /admin/settings') return mockStore.updateSettings(body as AdminSettings) as T
  if (key === 'POST /admin/settings/reset') {
    mockStore.reset()
    return { ok: true } as T
  }

  if (key === 'GET /admin/analytics/dashboard') return mockStore.dashboard() as T
  if (key === 'GET /admin/analytics/panelists') return mockStore.panelistAnalytics() as T
  if (key === 'GET /admin/analytics/rewards') return mockStore.rewardAnalytics() as T

  if (key === 'GET /admin/panelists/options') {
    return mockStore.panelists().map((panelist) => ({
      value: panelist.id,
      label: `${panelist.firstName} ${panelist.lastName}`,
    })) as T
  }

  if (key === 'GET /admin/panelists') {
    const status = search.get('status')
    const gender = search.get('gender')
    const ageRange = search.get('ageRange')
    const from = search.get('registeredFrom')
    const to = search.get('registeredTo')
    const filtered = mockStore.panelists().filter((panelist) => {
      const haystack = `${panelist.firstName} ${panelist.lastName} ${panelist.email}`
      if (!matchesSearch(haystack, search.get('search') ?? undefined)) return false
      if (status && panelist.status !== status) return false
      if (gender && panelist.gender !== gender) return false
      if (ageRange && panelist.ageRange !== ageRange) return false
      if (from && panelist.registeredAt.slice(0, 10) < from) return false
      if (to && panelist.registeredAt.slice(0, 10) > to) return false
      return true
    })
    const sorted = sortBy(filtered, search.get('sortBy') ?? 'registeredAt', (search.get('sortDir') as 'asc' | 'desc') ?? 'desc')
    return paginate(sorted, queryNumber(search, 'page', 1), queryNumber(search, 'pageSize', 10)) as T
  }

  const panelistMatch = pathname.match(/^\/admin\/panelists\/([^/]+)(?:\/(activate|deactivate))?$/)
  if (panelistMatch) {
    const [, id, action] = panelistMatch
    if (method === 'GET') {
      const detail = mockStore.panelist(id)
      if (!detail) fail('Panelist not found.', 404)
      return detail as T
    }
    if (method === 'PATCH') {
      const updated = mockStore.updatePanelist(id, body as UpdatePanelistInput)
      if (!updated) fail('Panelist not found.', 404)
      return updated as T
    }
    if (method === 'POST' && action === 'activate') {
      const updated = mockStore.setPanelistStatus(id, 'active')
      if (!updated) fail('Panelist not found.', 404)
      return updated as T
    }
    if (method === 'POST' && action === 'deactivate') {
      const updated = mockStore.setPanelistStatus(id, 'inactive')
      if (!updated) fail('Panelist not found.', 404)
      return updated as T
    }
  }

  if (key === 'GET /admin/projects') {
    const status = search.get('status')
    const panelistId = search.get('panelistId')
    const filtered = mockStore.assignments().filter((item) => {
      const haystack = `${item.projectName} ${item.panelistName} ${item.panelistEmail} ${item.surveyUrl}`
      if (!matchesSearch(haystack, search.get('search') ?? undefined)) return false
      if (status && item.status !== status) return false
      if (panelistId && item.panelistId !== panelistId) return false
      return true
    })
    const sorted = sortBy(filtered, search.get('sortBy') ?? 'assignedAt', (search.get('sortDir') as 'asc' | 'desc') ?? 'desc')
    return paginate(sorted, queryNumber(search, 'page', 1), queryNumber(search, 'pageSize', 10)) as T
  }

  if (key === 'POST /admin/projects') {
    const created = mockStore.assignProject(body as AssignProjectInput)
    if (!created) fail('Select a valid panelist before assigning a project.')
    return created as T
  }

  const projectMatch = pathname.match(/^\/admin\/projects\/([^/]+)$/)
  if (projectMatch) {
    const id = projectMatch[1]
    if (method === 'GET') {
      const item = mockStore.assignment(id)
      if (!item) fail('Assignment not found.', 404)
      return item as T
    }
    if (method === 'PATCH') {
      const updated = mockStore.updateAssignment(id, body as AssignProjectInput)
      if (!updated) fail('Assignment not found.', 404)
      return updated as T
    }
    if (method === 'DELETE') {
      if (!mockStore.removeAssignment(id)) fail('Assignment not found.', 404)
      return { ok: true } as T
    }
  }

  if (key === 'GET /admin/rewards/types') return mockStore.rewardTypes() as T

  if (key === 'GET /admin/rewards') {
    const type = search.get('type')
    const status = search.get('status')
    const filtered = mockStore.rewards().filter((item) => {
      const haystack = `${item.name} ${item.type} ${item.provider} ${item.description}`
      if (!matchesSearch(haystack, search.get('search') ?? undefined)) return false
      if (type && item.type !== type) return false
      if (status && item.status !== status) return false
      return true
    })
    const sorted = sortBy(filtered, search.get('sortBy') ?? 'name', (search.get('sortDir') as 'asc' | 'desc') ?? 'asc')
    return paginate(sorted, queryNumber(search, 'page', 1), queryNumber(search, 'pageSize', 10)) as T
  }

  if (key === 'POST /admin/rewards') return mockStore.createReward(body as RewardInput) as T

  const rewardMatch = pathname.match(/^\/admin\/rewards\/([^/]+)$/)
  if (rewardMatch && rewardMatch[1] !== 'types') {
    const id = rewardMatch[1]
    if (method === 'PATCH') {
      const updated = mockStore.updateReward(id, body as RewardInput)
      if (!updated) fail('Reward not found.', 404)
      return updated as T
    }
    if (method === 'DELETE') {
      if (!mockStore.deleteReward(id)) fail('Reward not found.', 404)
      return { ok: true } as T
    }
  }

  if (key === 'GET /admin/reward-requests') {
    const status = search.get('status')
    const panelistId = search.get('panelistId')
    const filtered = mockStore.requests().filter((item) => {
      const haystack = `${item.requestId} ${item.panelistName} ${item.rewardName}`
      if (!matchesSearch(haystack, search.get('search') ?? undefined)) return false
      if (status && item.status !== status) return false
      if (panelistId && item.panelistId !== panelistId) return false
      return true
    })
    const sorted = sortBy(filtered, search.get('sortBy') ?? 'requestedAt', (search.get('sortDir') as 'asc' | 'desc') ?? 'desc')
    return paginate(sorted, queryNumber(search, 'page', 1), queryNumber(search, 'pageSize', 10)) as T
  }

  const requestMatch = pathname.match(/^\/admin\/reward-requests\/([^/]+)(?:\/(approve|reject|complete))?$/)
  if (requestMatch) {
    const [, id, action] = requestMatch
    if (method === 'GET') {
      const item = mockStore.request(id)
      if (!item) fail('Reward request not found.', 404)
      return item as T
    }
    if (method === 'POST' && action) {
      const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'completed'
      const updated = mockStore.setRequestStatus(id, status)
      if (!updated) fail('Reward request not found.', 404)
      return updated as T
    }
  }

  if (key === 'GET /admin/reward-history' || key === 'GET /admin/reward-history/export') {
    const status = search.get('status')
    const rewardType = search.get('rewardType')
    const panelistId = search.get('panelistId')
    const from = search.get('dateFrom')
    const to = search.get('dateTo')
    const filtered = mockStore.transactions().filter((item) => {
      const haystack = `${item.requestId} ${item.panelistName} ${item.rewardName} ${item.rewardType}`
      if (!matchesSearch(haystack, search.get('search') ?? undefined)) return false
      if (status && item.status !== status) return false
      if (rewardType && item.rewardType !== rewardType) return false
      if (panelistId && item.panelistId !== panelistId) return false
      if (from && item.transactionDate.slice(0, 10) < from) return false
      if (to && item.transactionDate.slice(0, 10) > to) return false
      return true
    })
    const sorted = sortBy(filtered, search.get('sortBy') ?? 'transactionDate', (search.get('sortDir') as 'asc' | 'desc') ?? 'desc')
    if (key === 'GET /admin/reward-history/export') {
      return toCsv(
        sorted.map((item) => ({
          requestId: item.requestId,
          panelist: item.panelistName,
          reward: item.rewardName,
          type: item.rewardType,
          points: item.points,
          value: item.value,
          currency: item.currency,
          date: formatDateTime(item.transactionDate),
          status: item.status,
        })),
      ) as T
    }
    return paginate(sorted, queryNumber(search, 'page', 1), queryNumber(search, 'pageSize', 10)) as T
  }

  fail(`No mock handler for ${key}`, 404)
}
