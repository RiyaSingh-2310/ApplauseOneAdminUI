import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { PageHeader } from '@/components/shared/PageHeader'
import { AssignmentStatusBadge, PanelistStatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { usePanelist } from '@/hooks/usePanelists'
import { getErrorMessage } from '@/lib/errors'
import { formatCurrency, formatDate, formatNumber, formatPoints } from '@/lib/format'
import {
  AGE_RANGE_LABELS,
  EDUCATION_LABELS,
  EMPLOYMENT_LABELS,
  GENDER_LABELS,
  INCOME_LABELS,
  fullName,
} from '@/lib/labels'

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

export function PanelistDetailPage() {
  const { id = '' } = useParams()
  const detail = usePanelist(id)

  if (detail.isLoading) return <LoadingSkeleton rows={6} />
  if (detail.isError) return <ErrorState message={getErrorMessage(detail.error)} onRetry={() => detail.refetch()} />
  if (!detail.data) return <EmptyState title="Panelist not found." />

  const panelist = detail.data
  const name = fullName(panelist.firstName, panelist.lastName)

  return (
    <div>
      <PageHeader
        title={name}
        description={panelist.email}
        crumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Panelists', to: '/admin/panelists' },
          { label: name },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/panelists">
              <ArrowLeft className="size-4" />
              Back to panelists
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <PanelistStatusBadge status={panelist.status} />
        <span className="text-sm text-muted-foreground">Member since {formatDate(panelist.registeredAt)}</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">Personal information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label="Name" value={name} />
            <Info label="Email" value={panelist.email} />
            <Info label="Phone" value={panelist.phone} />
            <Info label="ZIP / Postal code" value={panelist.postalCode} />
          </CardContent>
          <Separator />
          <CardHeader>
            <CardTitle className="font-display text-xl">Demographics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label="Age" value={`${panelist.age} · ${AGE_RANGE_LABELS[panelist.ageRange]}`} />
            <Info label="Gender" value={GENDER_LABELS[panelist.gender]} />
            <Info label="Education" value={EDUCATION_LABELS[panelist.education]} />
            <Info label="Employment" value={EMPLOYMENT_LABELS[panelist.employment]} />
            <Info label="Household income" value={INCOME_LABELS[panelist.householdIncome]} />
            <Info label="Household size" value={panelist.householdSize} />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-xl">Reward summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-secondary px-3 py-3">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="font-display text-2xl">{formatNumber(panelist.rewardPoints)}</p>
              </div>
              <div className="rounded-2xl bg-secondary px-3 py-3">
                <p className="text-xs text-muted-foreground">Redeemed</p>
                <p className="font-display text-2xl">{formatNumber(panelist.redeemedPoints)}</p>
              </div>
              <div className="rounded-2xl bg-secondary px-3 py-3">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="font-display text-2xl">{formatNumber(panelist.pendingPoints)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-xl">Activity</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Projects assigned" value={panelist.assignedProjectCount} />
              <Info label="Projects completed" value={panelist.completedProjectCount} />
              <Info label="Rewards earned" value={formatPoints(panelist.lifetimePointsIssued)} />
              <Info label="Rewards redeemed" value={formatPoints(panelist.redeemedPoints)} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-4 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Survey preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Shopping preference" value={panelist.surveyPreferences.shoppingPreference} />
          <Info label="Typical spend" value={panelist.surveyPreferences.typicalSpend} />
          <Info label="Research participation" value={panelist.surveyPreferences.researchParticipation} />
          <Info label="Preferred categories" value={panelist.surveyPreferences.preferredCategories.join(', ')} />
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Assigned projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {panelist.assignments.length === 0 ? (
            <EmptyState title="No projects assigned." />
          ) : (
            panelist.assignments.map((assignment) => (
              <div key={assignment.id} className="flex flex-col gap-2 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{assignment.projectName}</p>
                  <p className="text-xs text-muted-foreground">
                    Assigned {formatDate(assignment.assignedAt)} · {formatPoints(assignment.rewardPoints)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AssignmentStatusBadge status={assignment.status} />
                  <Button asChild size="sm" variant="outline">
                    <a href={assignment.surveyUrl} target="_blank" rel="noreferrer">
                      Open Survey
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Recent rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {panelist.recentRewards.length === 0 ? (
            <EmptyState title="No reward activity yet." />
          ) : (
            panelist.recentRewards.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.rewardName}</p>
                  <p className="text-xs text-muted-foreground">{item.requestId}</p>
                </div>
                <div className="text-right">
                  <p>{formatPoints(item.points)}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.value, item.currency)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
