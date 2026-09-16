import type {
  AdminSettings,
  AssignProjectInput,
  AssignmentStatus,
  PanelistDetail,
  PanelistStatus,
  ProjectAssignment,
  Reward,
  RewardInput,
  RewardRequest,
  RewardRequestStatus,
  RewardTransaction,
  UpdatePanelistInput,
} from '@/types'
import { fullName } from '@/lib/labels'
import { cloneSeed } from './seed'

const STORE_KEY = 'ao_admin_store_v1'
const SHARED_ASSIGNMENTS_KEY = 'ao.shared.assignments'

type StoreShape = ReturnType<typeof cloneSeed>

function load(): StoreShape {
  const raw = window.localStorage.getItem(STORE_KEY)
  if (!raw) return prepare(cloneSeed())
  try {
    return JSON.parse(raw) as StoreShape
  } catch {
    return prepare(cloneSeed())
  }
}

function prepare(data: StoreShape): StoreShape {
  const avery = data.panelists.find((panelist) => panelist.id === 'pnl_1001')
  if (avery) {
    avery.email = 'panelist@applauseone.com'
    avery.phone = '(415) 555-0148'
    avery.postalCode = '94107'
    avery.age = 29
    avery.ageRange = '25-34'
    avery.gender = 'other'
    avery.status = 'active'
    data.assignments
      .filter((item) => item.panelistId === avery.id)
      .forEach((item) => {
        item.panelistEmail = avery.email
        item.panelistName = `${avery.firstName} ${avery.lastName}`
      })
  }
  persist(data)
  return data
}

function persist(data: StoreShape) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(data))
  const shared = data.assignments
    .map((item) => ({
      id: item.id,
      name: item.projectName,
      description: item.remark ?? '',
      assignedAt: item.assignedAt,
      status: toPortalStatus(item.status),
      points: item.rewardPoints,
      surveyUrl: item.surveyUrl,
      panelistEmail: item.panelistEmail,
      panelistId: item.panelistId,
    }))
  window.localStorage.setItem(SHARED_ASSIGNMENTS_KEY, JSON.stringify(shared))
}

function toPortalStatus(status: AssignmentStatus) {
  if (status === 'complete') return 'completed'
  if (status === 'terminate' || status === 'quota_full') return 'expired'
  return 'new'
}

function nextId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}`
}

class AdminMockStore {
  private data = load()

  reset() {
    this.data = prepare(cloneSeed())
  }

  snapshot() {
    return this.data
  }

  save() {
    persist(this.data)
  }

  settings() {
    return this.data.settings
  }

  updateSettings(input: AdminSettings) {
    this.data.settings = { ...input }
    this.save()
    return this.data.settings
  }

  panelists() {
    return this.data.panelists
  }

  panelist(id: string): PanelistDetail | undefined {
    const panelist = this.data.panelists.find((item) => item.id === id)
    if (!panelist) return undefined
    return {
      ...panelist,
      assignments: this.data.assignments
        .filter((item) => item.panelistId === id)
        .sort((a, b) => +new Date(b.assignedAt) - +new Date(a.assignedAt)),
      recentRewards: this.data.transactions
        .filter((item) => item.panelistId === id)
        .sort((a, b) => +new Date(b.transactionDate) - +new Date(a.transactionDate)),
    }
  }

  updatePanelist(id: string, input: UpdatePanelistInput) {
    const panelist = this.data.panelists.find((item) => item.id === id)
    if (!panelist) return undefined
    Object.assign(panelist, input)
    this.data.assignments
      .filter((item) => item.panelistId === id)
      .forEach((item) => {
        item.panelistName = fullName(panelist.firstName, panelist.lastName)
        item.panelistEmail = panelist.email
      })
    this.save()
    return this.panelist(id)
  }

  setPanelistStatus(id: string, status: PanelistStatus) {
    const panelist = this.data.panelists.find((item) => item.id === id)
    if (!panelist) return undefined
    panelist.status = status
    this.save()
    return panelist
  }

  assignments() {
    return this.data.assignments
  }

  assignment(id: string) {
    return this.data.assignments.find((item) => item.id === id)
  }

  assignProject(input: AssignProjectInput) {
    const panelist = this.data.panelists.find((item) => item.id === input.panelistId)
    if (!panelist) return undefined
    const assignment: ProjectAssignment = {
      id: nextId('asg'),
      projectName: input.projectName,
      panelistId: panelist.id,
      panelistName: fullName(panelist.firstName, panelist.lastName),
      panelistEmail: panelist.email,
      surveyUrl: input.surveyUrl,
      assignedAt: new Date().toISOString(),
      status: 'active',
      rewardPoints: input.rewardPoints,
      completedAt: '',
      remark: input.remark ?? '',
    }
    this.data.assignments.unshift(assignment)
    panelist.assignedProjectCount += 1
    this.data.dashboard.activeProjects += 1
    this.data.activity.unshift({
      id: nextId('act'),
      title: 'Project assigned',
      detail: `${assignment.projectName} → ${assignment.panelistName}`,
      at: assignment.assignedAt,
      kind: 'project',
    })
    this.save()
    return assignment
  }

  updateAssignment(id: string, input: Partial<AssignProjectInput>) {
    const assignment = this.data.assignments.find((item) => item.id === id)
    if (!assignment) return undefined
    if (input.panelistId && input.panelistId !== assignment.panelistId) {
      const panelist = this.data.panelists.find((item) => item.id === input.panelistId)
      if (panelist) {
        assignment.panelistId = panelist.id
        assignment.panelistName = fullName(panelist.firstName, panelist.lastName)
        assignment.panelistEmail = panelist.email
      }
    }
    if (input.projectName) assignment.projectName = input.projectName
    if (input.surveyUrl) assignment.surveyUrl = input.surveyUrl
    if (input.rewardPoints !== undefined) assignment.rewardPoints = input.rewardPoints
    if (input.remark !== undefined) assignment.remark = input.remark
    this.save()
    return assignment
  }

  removeAssignment(id: string) {
    const index = this.data.assignments.findIndex((item) => item.id === id)
    if (index === -1) return false
    const assignment = this.data.assignments[index]
    this.data.assignments.splice(index, 1)
    const panelist = this.data.panelists.find((item) => item.id === assignment.panelistId)
    if (panelist) panelist.assignedProjectCount = Math.max(0, panelist.assignedProjectCount - 1)
    this.data.dashboard.activeProjects = Math.max(0, this.data.dashboard.activeProjects - 1)
    this.save()
    return true
  }

  rewards() {
    return this.data.rewards
  }

  reward(id: string) {
    return this.data.rewards.find((item) => item.id === id)
  }

  createReward(input: RewardInput) {
    const reward: Reward = {
      id: nextId('rwd'),
      logoKey: input.logoKey || input.name.slice(0, 2).toUpperCase(),
      ...input,
    }
    this.data.rewards.unshift(reward)
    this.save()
    return reward
  }

  updateReward(id: string, input: RewardInput) {
    const reward = this.data.rewards.find((item) => item.id === id)
    if (!reward) return undefined
    Object.assign(reward, input)
    if (input.logoKey) reward.logoKey = input.logoKey
    this.save()
    return reward
  }

  deleteReward(id: string) {
    const index = this.data.rewards.findIndex((item) => item.id === id)
    if (index === -1) return false
    this.data.rewards.splice(index, 1)
    this.save()
    return true
  }

  rewardTypes() {
    const unique = [...new Set(this.data.rewards.map((item) => item.type))]
    return unique.map((value) => ({ value, label: value }))
  }

  requests() {
    return this.data.requests
  }

  request(id: string) {
    return this.data.requests.find((item) => item.id === id || item.requestId === id)
  }

  setRequestStatus(id: string, status: RewardRequestStatus) {
    const request = this.request(id)
    if (!request) return undefined
    const previous = request.status
    request.status = status
    const panelist = this.data.panelists.find((item) => item.id === request.panelistId)

    if (previous === 'pending' && status !== 'pending') {
      this.data.dashboard.pendingRewardRequests = Math.max(0, this.data.dashboard.pendingRewardRequests - 1)
    }
    if (status === 'approved' || status === 'completed') {
      if (panelist) {
        panelist.pendingPoints = Math.max(0, panelist.pendingPoints - request.points)
        if (status === 'completed') {
          panelist.rewardPoints = Math.max(0, panelist.rewardPoints - request.points)
          panelist.redeemedPoints += request.points
          this.data.dashboard.totalPointsRedeemed += request.points
          this.data.rewardAnalytics.pointsEconomy.redeemed += request.points
          this.data.rewardAnalytics.pointsEconomy.outstanding = Math.max(
            0,
            this.data.rewardAnalytics.pointsEconomy.outstanding - request.points,
          )
        }
      }
      this.upsertTransaction(request, status)
    }
    if (status === 'rejected') {
      if (panelist) panelist.pendingPoints = Math.max(0, panelist.pendingPoints - request.points)
      this.upsertTransaction(request, status)
    }

    this.data.activity.unshift({
      id: nextId('act'),
      title: `Reward request ${status}`,
      detail: `${request.rewardName} · ${request.panelistName}`,
      at: new Date().toISOString(),
      kind: 'reward',
    })
    this.save()
    return request
  }

  transactions() {
    return this.data.transactions
  }

  dashboard() {
    return {
      ...this.data.dashboard,
      recentActivity: this.data.activity.slice(0, 6),
    }
  }

  panelistAnalytics() {
    return this.data.panelistAnalytics
  }

  rewardAnalytics() {
    return this.data.rewardAnalytics
  }

  private upsertTransaction(request: RewardRequest, status: RewardRequestStatus) {
    const existing = this.data.transactions.find((item) => item.requestId === request.requestId)
    const transaction: RewardTransaction = {
      id: existing?.id ?? nextId('txn'),
      requestId: request.requestId,
      panelistId: request.panelistId,
      panelistName: request.panelistName,
      rewardId: request.rewardId,
      rewardName: request.rewardName,
      rewardType: request.rewardType,
      points: request.points,
      value: request.cashValue,
      currency: request.currency,
      transactionDate: new Date().toISOString(),
      status,
    }
    if (existing) Object.assign(existing, transaction)
    else this.data.transactions.unshift(transaction)
  }
}

export const mockStore = new AdminMockStore()

export function matchesSearch(haystack: string, needle?: string) {
  if (!needle) return true
  return haystack.toLowerCase().includes(needle.trim().toLowerCase())
}

export function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 10,
): { data: T[]; total: number; page: number; pageSize: number } {
  const start = (page - 1) * pageSize
  return {
    data: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}

export function sortBy<T>(items: T[], sortByKey?: string, sortDir: 'asc' | 'desc' = 'desc') {
  if (!sortByKey) return items
  const copy = [...items]
  copy.sort((a, b) => {
    const left = (a as Record<string, unknown>)[sortByKey]
    const right = (b as Record<string, unknown>)[sortByKey]
    const result = String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true })
    return sortDir === 'asc' ? result : -result
  })
  return copy
}

