import type { ChartDatum, TrendPoint } from './common.types'

export interface ActivityItem {
  id: string
  title: string
  detail: string
  at: string
  kind: 'panelist' | 'project' | 'reward'
}

export interface DashboardAnalytics {
  totalPanelists: number
  newRegistrations: number
  activePanelists: number
  pendingRewardRequests: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  activeProjects: number
  recentActivity: ActivityItem[]
}

export interface PanelistAnalytics {
  gender: ChartDatum[]
  ageRange: ChartDatum[]
  education: ChartDatum[]
  employment: ChartDatum[]
  householdIncome: ChartDatum[]
  shoppingPreferences: ChartDatum[]
  registrationTrend: {
    daily: TrendPoint[]
    weekly: TrendPoint[]
    monthly: TrendPoint[]
  }
}

export interface RewardAnalytics {
  issued: TrendPoint[]
  redeemed: TrendPoint[]
  typeDistribution: ChartDatum[]
  requestStatus: ChartDatum[]
  topRewards: ChartDatum[]
  pointsEconomy: {
    issued: number
    redeemed: number
    outstanding: number
  }
}
