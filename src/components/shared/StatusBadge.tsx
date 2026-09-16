import { Badge } from '@/components/ui/badge'
import {
  ASSIGNMENT_STATUS_LABELS,
  AVAILABILITY_LABELS,
  COMPLETION_STATUS_LABELS,
  PANELIST_STATUS_LABELS,
  REQUEST_STATUS_LABELS,
  REWARD_STATUS_LABELS,
} from '@/lib/labels'
import { cn } from '@/lib/utils'
import type {
  AssignmentStatus,
  CompletionStatus,
  PanelistStatus,
  RewardAvailability,
  RewardRequestStatus,
  RewardStatus,
} from '@/types'

const tones = {
  success: 'border-transparent bg-success-foreground text-success',
  warning: 'border-transparent bg-warning-foreground text-warning',
  danger: 'border-transparent bg-destructive/10 text-destructive',
  info: 'border-transparent bg-info-foreground text-info',
  muted: 'border-transparent bg-muted text-muted-foreground',
  gold: 'border-transparent bg-accent text-gold-foreground',
} as const

function ToneBadge({
  tone,
  children,
}: {
  tone: keyof typeof tones
  children: string
}) {
  return (
    <Badge variant="outline" className={cn('font-medium', tones[tone])}>
      {children}
    </Badge>
  )
}

export function PanelistStatusBadge({ status }: { status: PanelistStatus }) {
  const tone = status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'muted'
  return <ToneBadge tone={tone}>{PANELIST_STATUS_LABELS[status]}</ToneBadge>
}

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const tone =
    status === 'complete'
      ? 'success'
      : status === 'terminate'
        ? 'danger'
        : status === 'quota_full'
          ? 'warning'
          : 'info'
  return <ToneBadge tone={tone}>{ASSIGNMENT_STATUS_LABELS[status]}</ToneBadge>
}

export function SurveyRewardBadge({ status }: { status: AssignmentStatus }) {
  const issued = status === 'complete'
  return <ToneBadge tone={issued ? 'success' : 'muted'}>{issued ? 'Issued' : 'Not issued'}</ToneBadge>
}

export function CompletionStatusBadge({ status }: { status: CompletionStatus }) {
  const tone =
    status === 'completed'
      ? 'success'
      : status === 'in_progress'
        ? 'warning'
        : status === 'expired'
          ? 'muted'
          : 'info'
  return <ToneBadge tone={tone}>{COMPLETION_STATUS_LABELS[status]}</ToneBadge>
}

export function RequestStatusBadge({ status }: { status: RewardRequestStatus }) {
  const tone =
    status === 'completed'
      ? 'success'
      : status === 'approved'
        ? 'info'
        : status === 'rejected'
          ? 'danger'
          : 'warning'
  return <ToneBadge tone={tone}>{REQUEST_STATUS_LABELS[status]}</ToneBadge>
}

export function RewardStatusBadge({ status }: { status: RewardStatus }) {
  return <ToneBadge tone={status === 'active' ? 'success' : 'muted'}>{REWARD_STATUS_LABELS[status]}</ToneBadge>
}

export function AvailabilityBadge({ value }: { value: RewardAvailability }) {
  const tone = value === 'in_stock' ? 'success' : value === 'limited' ? 'warning' : 'muted'
  return <ToneBadge tone={tone}>{AVAILABILITY_LABELS[value]}</ToneBadge>
}
