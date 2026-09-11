import type { ListQuery } from './common.types'

export type AssignmentStatus =
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'removed'
export type CompletionStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'expired'

export interface ProjectAssignment {
  id: string
  projectName: string
  panelistId: string
  panelistName: string
  panelistEmail: string
  surveyUrl: string
  assignedAt: string
  expiryDate: string
  status: AssignmentStatus
  completionStatus: CompletionStatus
  rewardPoints: number
  description?: string
}

export interface AssignProjectInput {
  panelistId: string
  projectName: string
  surveyUrl: string
  rewardPoints: number
  assignedAt: string
  expiryDate: string
  status: AssignmentStatus
  description?: string
}

export interface ProjectListQuery extends ListQuery {
  status?: AssignmentStatus | 'all'
  panelistId?: string
}
