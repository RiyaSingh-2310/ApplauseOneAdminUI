import { ExternalLink } from 'lucide-react'
import { AssignmentStatusBadge, SurveyRewardBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatDate, formatDateTime, formatNumber } from '@/lib/format'
import type { ProjectAssignment } from '@/types'

export function AssignmentDetailsSheet({
  assignment,
  onOpenChange,
}: {
  assignment: ProjectAssignment | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={Boolean(assignment)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{assignment?.projectName ?? 'Assignment'}</SheetTitle>
        </SheetHeader>
        {assignment ? (
          <div className="space-y-3 p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Panelist:</span> {assignment.panelistName}
            </p>
            <p>
              <span className="text-muted-foreground">Panelist ID:</span> {assignment.panelistId}
            </p>
            {assignment.panelistEmail ? (
              <p>
                <span className="text-muted-foreground">Email:</span> {assignment.panelistEmail}
              </p>
            ) : null}
            <p>
              <span className="text-muted-foreground">Assignment ID:</span> {assignment.id}
            </p>
            <p className="break-all">
              <span className="text-muted-foreground">Survey URL:</span> {assignment.surveyUrl}
            </p>
            <p>
              <span className="text-muted-foreground">Assigned:</span> {formatDateTime(assignment.assignedAt)}
            </p>
            {assignment.completedAt ? (
              <p>
                <span className="text-muted-foreground">Completed:</span> {formatDateTime(assignment.completedAt)}
              </p>
            ) : null}
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Assignment status:</span>
              <AssignmentStatusBadge status={assignment.status} />
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Reward status:</span>
              <SurveyRewardBadge status={assignment.status} />
            </p>
            <p>
              <span className="text-muted-foreground">Reward points:</span> {formatNumber(assignment.rewardPoints)}
            </p>
            {assignment.remark ? (
              <p>
                <span className="text-muted-foreground">Remark:</span> {assignment.remark}
              </p>
            ) : null}
            {assignment.createdByName ? (
              <p>
                <span className="text-muted-foreground">Created by:</span> {assignment.createdByName}
              </p>
            ) : null}
            {assignment.updatedByName ? (
              <p>
                <span className="text-muted-foreground">Updated by:</span> {assignment.updatedByName}
              </p>
            ) : null}
            {assignment.updatedAt ? (
              <p>
                <span className="text-muted-foreground">Updated:</span> {formatDate(assignment.updatedAt)}
              </p>
            ) : null}
            {assignment.surveyUrl ? (
              <Button asChild variant="outline">
                <a href={assignment.surveyUrl} target="_blank" rel="noreferrer">
                  Open survey
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
