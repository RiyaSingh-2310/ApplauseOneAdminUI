import { useMemo, useState } from 'react'
import { SearchField } from '@/components/common/SearchField'
import { Field } from '@/components/shared/Field'
import { PaginationBar } from '@/components/shared/PaginationBar'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePanelistList } from '@/hooks/usePanelists'
import { formatNumber } from '@/lib/format'
import { fullName } from '@/lib/labels'
import { isValidUrl } from '@/lib/validators'
import type { AssignPanelistsInput, AssignmentSummary, SelectedPanelist } from '@/types'

export function AssignPanelistsDialog({
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AssignPanelistsInput) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AssignPanelistsForm pending={pending} onOpenChange={onOpenChange} onSubmit={onSubmit} />
      ) : null}
    </Dialog>
  )
}

function AssignPanelistsForm({
  pending,
  onOpenChange,
  onSubmit,
}: {
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AssignPanelistsInput) => void
}) {
  const [step, setStep] = useState<'select' | 'review'>('select')
  const [surveyName, setSurveyName] = useState('')
  const [surveyUrl, setSurveyUrl] = useState('')
  const [rewardPoints, setRewardPoints] = useState('100')
  const [remark, setRemark] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Map<string, SelectedPanelist>>(new Map())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const debouncedSearch = useDebouncedValue(search)
  const list = usePanelistList({
    search: debouncedSearch,
    page,
    pageSize: 8,
    status: 'active',
    sortBy: 'registeredAt',
    sortDir: 'desc',
  })
  const rows = list.data?.data ?? []
  const points = Number(rewardPoints)
  const summary = useMemo<AssignmentSummary>(
    () => ({
      surveyName: surveyName.trim(),
      surveyUrl: surveyUrl.trim(),
      panelistCount: selected.size,
      panelists: [...selected.values()],
      rewardPointsPerPanelist: Number.isFinite(points) ? points : 0,
      totalRewardPoints: selected.size * (Number.isFinite(points) ? points : 0),
      remark: remark.trim() || undefined,
    }),
    [points, remark, selected, surveyName, surveyUrl],
  )

  function toggle(panelist: SelectedPanelist, checked: boolean) {
    setSelected((current) => {
      const next = new Map(current)
      if (checked) next.set(panelist.id, panelist)
      else next.delete(panelist.id)
      return next
    })
  }

  function togglePage(checked: boolean) {
    setSelected((current) => {
      const next = new Map(current)
      for (const panelist of rows) {
        const item = {
          id: panelist.id,
          name: fullName(panelist.firstName, panelist.lastName) || panelist.email,
          email: panelist.email,
        }
        if (checked) next.set(item.id, item)
        else next.delete(item.id)
      }
      return next
    })
  }

  function goToReview() {
    const next = {
      surveyName: surveyName.trim() ? '' : 'Enter a survey or project name.',
      surveyUrl: !surveyUrl.trim()
        ? 'Enter a survey URL.'
        : isValidUrl(surveyUrl.trim())
          ? ''
          : 'Enter a valid http(s) URL.',
      panelists: selected.size ? '' : 'Select at least one panelist.',
      rewardPoints:
        Number.isInteger(points) && points > 0 ? '' : 'Enter a positive whole number of reward points.',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    setStep('review')
  }

  function submit() {
    if (pending) return
    onSubmit({
      surveyName: summary.surveyName,
      surveyUrl: summary.surveyUrl,
      panelistIds: [...new Set(summary.panelists.map((item) => item.id))],
      rewardPoints: summary.rewardPointsPerPanelist,
      remark: summary.remark,
    })
  }

  const pageIds = rows.map((item) => item.id)
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{step === 'select' ? 'Assign panelists' : 'Review assignment'}</DialogTitle>
        <DialogDescription>
          {step === 'select'
            ? 'Choose live panelists, a survey URL, and reward points. Completing an assignment later credits points once.'
            : 'Confirm the assignment before it is sent to the Admin survey API.'}
        </DialogDescription>
      </DialogHeader>

      {step === 'select' ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Survey / project name" className="sm:col-span-2" error={errors.surveyName}>
              <Input
                value={surveyName}
                placeholder="e.g. Brand feedback Q3"
                onChange={(event) => setSurveyName(event.target.value)}
              />
            </Field>
            <Field
              label="Survey URL"
              className="sm:col-span-2"
              error={errors.surveyUrl}
              hint="Use {panelist_id} in the URL if the survey vendor should receive the panelist id."
            >
              <Input
                value={surveyUrl}
                placeholder="https://surveys.example.com/s/brand?uid={panelist_id}"
                onChange={(event) => setSurveyUrl(event.target.value)}
              />
            </Field>
            <Field label="Reward points per panelist" error={errors.rewardPoints}>
              <Input
                type="number"
                min={1}
                step={1}
                value={rewardPoints}
                onChange={(event) => setRewardPoints(event.target.value)}
              />
            </Field>
            <div className="flex items-end text-sm text-muted-foreground">
              {selected.size} selected · {formatNumber(summary.totalRewardPoints)} pts total
            </div>
            <Field label="Remark (optional)" className="sm:col-span-2">
              <Textarea
                value={remark}
                placeholder="Internal note for this assignment"
                onChange={(event) => setRemark(event.target.value)}
              />
            </Field>
          </div>

          <SearchField
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search panelists by name or email"
            searching={search !== debouncedSearch}
          />
          {errors.panelists ? <p className="text-xs text-destructive">{errors.panelists}</p> : null}

          {list.isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : list.isError ? (
            <ErrorState message="Unable to load panelists." onRetry={() => list.refetch()} />
          ) : rows.length === 0 ? (
            <EmptyState title="No panelists found." description="Try a different search." />
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              <div className="flex items-center gap-3 border-b bg-secondary/40 px-4 py-2 text-sm">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={(value) => togglePage(value === true)}
                  aria-label="Select all on this page"
                />
                <span>Select all on this page</span>
              </div>
              <div className="divide-y md:hidden">
                {rows.map((panelist) => {
                  const name = fullName(panelist.firstName, panelist.lastName) || panelist.email
                  return (
                    <label key={panelist.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                      <Checkbox
                        checked={selected.has(panelist.id)}
                        onCheckedChange={(value) =>
                          toggle({ id: panelist.id, name, email: panelist.email }, value === true)
                        }
                      />
                      <span>
                        <span className="font-medium">{name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          ID {panelist.id} · {panelist.email}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
              <div className="hidden md:block">
                {rows.map((panelist) => {
                  const name = fullName(panelist.firstName, panelist.lastName) || panelist.email
                  return (
                    <label
                      key={panelist.id}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/40"
                    >
                      <Checkbox
                        checked={selected.has(panelist.id)}
                        onCheckedChange={(value) =>
                          toggle({ id: panelist.id, name, email: panelist.email }, value === true)
                        }
                      />
                      <span className="min-w-0 flex-1 font-medium">{name}</span>
                      <span className="hidden text-muted-foreground sm:inline">ID {panelist.id}</span>
                      <span className="truncate text-xs text-muted-foreground">{panelist.email}</span>
                    </label>
                  )
                })}
              </div>
              <div className="px-3">
                <PaginationBar
                  page={list.data?.page ?? page}
                  pageSize={list.data?.pageSize ?? 8}
                  total={list.data?.total ?? 0}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="grid gap-3 rounded-2xl border bg-secondary/30 p-4 sm:grid-cols-2">
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">Survey / project:</span> {summary.surveyName}
            </p>
            <p className="sm:col-span-2 break-all">
              <span className="text-muted-foreground">Survey URL:</span> {summary.surveyUrl}
            </p>
            <p>
              <span className="text-muted-foreground">Selected panelists:</span> {summary.panelistCount}
            </p>
            <p>
              <span className="text-muted-foreground">Points per panelist:</span>{' '}
              {formatNumber(summary.rewardPointsPerPanelist)}
            </p>
            <p>
              <span className="text-muted-foreground">Total potential points:</span>{' '}
              {formatNumber(summary.totalRewardPoints)}
            </p>
            {summary.remark ? (
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">Remark:</span> {summary.remark}
              </p>
            ) : null}
          </div>
          <ScrollArea className="h-48 rounded-2xl border">
            <ul className="divide-y">
              {summary.panelists.map((panelist) => (
                <li key={panelist.id} className="px-4 py-2.5">
                  <p className="font-medium">{panelist.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ID {panelist.id} · {panelist.email}
                  </p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}

      <DialogFooter>
        {step === 'review' ? (
          <Button variant="outline" onClick={() => setStep('select')} disabled={pending}>
            Back
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
        )}
        {step === 'select' ? (
          <Button onClick={goToReview}>Review assignment</Button>
        ) : (
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Assigning…' : 'Assign panelists'}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  )
}
