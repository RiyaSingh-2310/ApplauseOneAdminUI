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
import { Textarea } from '@/components/ui/textarea'
import { isValidUrl, required } from '@/lib/validators'
import type { ProjectAssignment, UpdateSurveyInput } from '@/types'

function toForm(assignment: ProjectAssignment): UpdateSurveyInput & { surveyName: string; surveyUrl: string; rewardPoints: number; remark: string } {
  return {
    surveyName: assignment.projectName,
    surveyUrl: assignment.surveyUrl,
    rewardPoints: assignment.rewardPoints,
    remark: assignment.remark ?? '',
  }
}

export function AssignProjectDialog({
  open,
  assignment,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  assignment?: ProjectAssignment | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UpdateSurveyInput) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && assignment ? (
        <EditSurveyForm
          key={assignment.id}
          assignment={assignment}
          pending={pending}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}

function EditSurveyForm({
  assignment,
  pending,
  onOpenChange,
  onSubmit,
}: {
  assignment: ProjectAssignment
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UpdateSurveyInput) => void
}) {
  const [form, setForm] = useState(() => toForm(assignment))
  const [errors, setErrors] = useState<Record<string, string>>({})

  function submit() {
    if (pending) return
    const next = {
      surveyName: required(form.surveyName, 'Survey name') ?? '',
      surveyUrl:
        required(form.surveyUrl, 'Survey URL') ??
        (!isValidUrl(form.surveyUrl) ? 'Enter a valid http(s) URL.' : ''),
      rewardPoints:
        Number.isInteger(form.rewardPoints) && form.rewardPoints > 0
          ? ''
          : 'Enter a positive whole number of reward points.',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    onSubmit({
      surveyName: form.surveyName.trim(),
      surveyUrl: form.surveyUrl.trim(),
      rewardPoints: form.rewardPoints,
      remark: form.remark.trim(),
    })
  }

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Edit assignment</DialogTitle>
        <DialogDescription>
          Update the survey name, URL, points, or remark. Use Mark completed to credit reward points.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Field label="Survey / project name" error={errors.surveyName}>
          <Input value={form.surveyName} onChange={(event) => setForm({ ...form, surveyName: event.target.value })} />
        </Field>
        <Field label="Survey URL" error={errors.surveyUrl}>
          <Input value={form.surveyUrl} onChange={(event) => setForm({ ...form, surveyUrl: event.target.value })} />
        </Field>
        <Field label="Reward points" error={errors.rewardPoints}>
          <Input
            type="number"
            min={1}
            step={1}
            value={form.rewardPoints}
            onChange={(event) => setForm({ ...form, rewardPoints: Number(event.target.value) })}
          />
        </Field>
        <Field label="Remark (optional)">
          <Textarea value={form.remark} onChange={(event) => setForm({ ...form, remark: event.target.value })} />
        </Field>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending ? 'Saving…' : 'Save assignment'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
