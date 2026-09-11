import { useState } from 'react'
import { Field } from '@/components/shared/Field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { usePanelistOptions } from '@/hooks/usePanelists'
import { addDaysIso, startOfDayIso, toInputDate } from '@/lib/format'
import { isValidUrl, required } from '@/lib/validators'
import type { AssignProjectInput, AssignmentStatus, ProjectAssignment } from '@/types'

function toForm(assignment?: ProjectAssignment | null, presetPanelistId?: string): AssignProjectInput {
  return {
    panelistId: assignment?.panelistId ?? presetPanelistId ?? '',
    projectName: assignment?.projectName ?? '',
    surveyUrl: assignment?.surveyUrl ?? '',
    rewardPoints: assignment?.rewardPoints ?? 150,
    assignedAt: toInputDate(assignment?.assignedAt ?? startOfDayIso()),
    expiryDate: toInputDate(assignment?.expiryDate ?? addDaysIso(startOfDayIso(), 14)),
    status: assignment?.status ?? 'assigned',
    description: assignment?.description ?? '',
  }
}

export function AssignProjectDialog({
  open,
  assignment,
  presetPanelistId,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  assignment?: ProjectAssignment | null
  presetPanelistId?: string
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AssignProjectInput) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AssignProjectForm
          key={assignment?.id ?? `new-${presetPanelistId ?? 'none'}`}
          assignment={assignment}
          presetPanelistId={presetPanelistId}
          pending={pending}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}

function AssignProjectForm({
  assignment,
  presetPanelistId,
  pending,
  onOpenChange,
  onSubmit,
}: {
  assignment?: ProjectAssignment | null
  presetPanelistId?: string
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AssignProjectInput) => void
}) {
  const [form, setForm] = useState<AssignProjectInput>(() => toForm(assignment, presetPanelistId))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const options = usePanelistOptions()

  function submit() {
    const next = {
      panelistId: required(form.panelistId, 'Panelist') ?? '',
      projectName: required(form.projectName, 'Project name') ?? '',
      surveyUrl:
        required(form.surveyUrl, 'Survey URL') ??
        (!isValidUrl(form.surveyUrl) ? 'Enter a valid http(s) URL.' : ''),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    onSubmit({
      ...form,
      assignedAt: new Date(form.assignedAt).toISOString(),
      expiryDate: new Date(form.expiryDate).toISOString(),
    })
  }

  return (
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{assignment ? 'Edit assignment' : 'Assign project'}</DialogTitle>
          <DialogDescription>
            The newest assignment appears first in the panelist portal Assigned Projects list.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Select panelist" className="sm:col-span-2" error={errors.panelistId}>
            <Select value={form.panelistId} onValueChange={(value) => setForm({ ...form, panelistId: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a panelist" />
              </SelectTrigger>
              <SelectContent>
                {(options.data ?? []).map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Project / survey name" className="sm:col-span-2" error={errors.projectName}>
            <Input value={form.projectName} onChange={(event) => setForm({ ...form, projectName: event.target.value })} />
          </Field>
          <Field label="Survey URL" className="sm:col-span-2" error={errors.surveyUrl}>
            <Input value={form.surveyUrl} onChange={(event) => setForm({ ...form, surveyUrl: event.target.value })} />
          </Field>
          <Field label="Reward points">
            <Input
              type="number"
              min={0}
              value={form.rewardPoints}
              onChange={(event) => setForm({ ...form, rewardPoints: Number(event.target.value) })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value as AssignmentStatus })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Assignment date">
            <Input
              type="date"
              value={form.assignedAt.slice(0, 10)}
              onChange={(event) => setForm({ ...form, assignedAt: event.target.value })}
            />
          </Field>
          <Field label="Expiry date">
            <Input
              type="date"
              value={form.expiryDate.slice(0, 10)}
              onChange={(event) => setForm({ ...form, expiryDate: event.target.value })}
            />
          </Field>
          <Field label="Optional description" className="sm:col-span-2">
            <Textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Saving…' : assignment ? 'Save assignment' : 'Assign project'}
          </Button>
        </DialogFooter>
      </DialogContent>
  )
}
