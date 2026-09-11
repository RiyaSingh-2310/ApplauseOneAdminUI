import type { ListQuery } from './common.types'

export type RewardAvailability = 'in_stock' | 'limited' | 'unavailable'
export type RewardStatus = 'active' | 'inactive'
export type RewardRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'

export interface Reward {
  id: string
  name: string
  type: string
  provider: string
  logoKey: string
  description: string
  pointsRequired: number
  cashValue: number
  currency: string
  availability: RewardAvailability
  status: RewardStatus
  processingTime: string
}

export interface RewardRequest {
  id: string
  requestId: string
  panelistId: string
  panelistName: string
  rewardId: string
  rewardName: string
  rewardType: string
  points: number
  cashValue: number
  currency: string
  requestedAt: string
  status: RewardRequestStatus
  notes?: string
}

export interface RewardTransaction {
  id: string
  requestId: string
  panelistId: string
  panelistName: string
  rewardId: string
  rewardName: string
  rewardType: string
  points: number
  value: number
  currency: string
  transactionDate: string
  status: RewardRequestStatus
}

export interface RewardListQuery extends ListQuery {
  type?: string | 'all'
  status?: RewardStatus | 'all'
}

export interface RewardRequestListQuery extends ListQuery {
  status?: RewardRequestStatus | 'all'
  panelistId?: string
}

export interface RewardHistoryQuery extends ListQuery {
  status?: RewardRequestStatus | 'all'
  rewardType?: string | 'all'
  panelistId?: string
  dateFrom?: string
  dateTo?: string
}

export interface RewardInput {
  name: string
  type: string
  provider: string
  description: string
  pointsRequired: number
  cashValue: number
  currency: string
  availability: RewardAvailability
  status: RewardStatus
  processingTime: string
  logoKey?: string
}
