import { ExternalLink, Plus } from 'lucide-react'
import { useState } from 'react'
import { DataTable } from '@/components/common/DataTable'
import { FilterToolbar } from '@/components/common/FilterToolbar'
import { RowActions } from '@/components/common/RowActions'
import { SearchField } from '@/components/common/SearchField'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { SortableHeader } from '@/components/shared/SortableHeader'
import { AssignmentStatusBadge, CompletionStatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useListQuery } from '@/hooks/useListQuery'
import { useAssignProject, useProjectList, useRemoveProject, useUpdateProject } from '@/hooks/useProjects'
import { getErrorMessage } from '@/lib/errors'
import { formatDate, formatNumber } from '@/lib/format'
import { ASSIGNMENT_STATUS_LABELS } from '@/lib/labels'
import type { AssignmentStatus, ProjectAssignment, ProjectListQuery } from '@/types'
import { AssignProjectDialog } from './AssignProjectDialog'

const defaultQuery: ProjectListQuery = {
  page: 1,
  pageSize: 10,
  sortBy: 'assignedAt',
  sortDir: 'desc',
  status: 'all',
}

export function ProjectsPage() {
  const { search, setSearch, filters, setFilters, query, reset, sort, setPage } = useListQuery(defaultQuery)
  const list = useProjectList(query)
  const [filterOpen, setFilterOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectAssignment | null>(null)
  const [viewing, setViewing] = useState<ProjectAssignment | null>(null)
  const [removing, setRemoving] = useState<ProjectAssignment | null>(null)
  const assign = useAssignProject(() => setAssignOpen(false))
  const update = useUpdateProject(() => setEditing(null))
  const remove = useRemoveProject(() => setRemoving(null))
  const rows = list.data?.data ?? []

  function renderFilters() {
    return (
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(value) =>
          setFilters((current) => ({ ...current, page: 1, status: value as AssignmentStatus | 'all' }))
        }
      >
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {Object.entries(ASSIGNMENT_STATUS_LABELS)
            .filter(([value]) => value !== 'removed')
            .map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div>
      <PageHeader
        title="Assigned Projects"
        description="Match surveys to panelists and keep completion status current."
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Assigned Projects' }]}
        actions={
          <Button onClick={() => setAssignOpen(true)}>
            <Plus className="size-4" />
            Assign project
          </Button>
        }
      />

      <DataTable
        toolbar={
          <FilterToolbar
            search={
              <SearchField
                value={search}
                onChange={(value) => {
                  setSearch(value)
                  setFilters((current) => ({ ...current, page: 1 }))
                }}
                placeholder="Search project, panelist, or URL"
                searching={search !== query.search}
              />
            }
            renderFilters={renderFilters}
            mobileOpen={filterOpen}
            onMobileOpenChange={setFilterOpen}
            onClear={reset}
          />
        }
        loading={list.isLoading}
        error={list.isError ? getErrorMessage(list.error) : undefined}
        onRetry={() => list.refetch()}
        emptyTitle="No projects assigned."
        emptyDescription="Project assignment is not available on the hosted API yet."
        page={list.data?.page}
        pageSize={list.data?.pageSize}
        total={list.data?.total ?? 0}
        onPageChange={setPage}
      >
        <div className="space-y-3 p-4 md:hidden">
          {rows.map((item) => (
            <div key={item.id} className="rounded-2xl border px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.projectName}</p>
                  <p className="text-xs text-muted-foreground">{item.panelistName}</p>
                </div>
                <AssignmentStatusBadge status={item.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(item.assignedAt)} · {formatNumber(item.rewardPoints)} pts
              </p>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader
                  label="Project name"
                  column="projectName"
                  sortBy={filters.sortBy}
                  sortDir={filters.sortDir}
                  onSort={sort}
                />
              </TableHead>
              <TableHead>Panelist</TableHead>
              <TableHead>Assigned date</TableHead>
              <TableHead>Survey URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reward points</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.projectName}</TableCell>
                <TableCell>
                  <div>
                    <p>{item.panelistName}</p>
                    <p className="text-xs text-muted-foreground">{item.panelistEmail}</p>
                  </div>
                </TableCell>
                <TableCell>{formatDate(item.assignedAt)}</TableCell>
                <TableCell className="max-w-48 truncate text-primary">{item.surveyUrl}</TableCell>
                <TableCell>
                  <AssignmentStatusBadge status={item.status} />
                </TableCell>
                <TableCell>{formatNumber(item.rewardPoints)}</TableCell>
                <TableCell>
                  <CompletionStatusBadge status={item.completionStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <RowActions>
                    <DropdownMenuItem onClick={() => setViewing(item)}>View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAssignOpen(true)}>Assign</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditing(item)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={item.surveyUrl} target="_blank" rel="noreferrer">
                        Open URL
                        <ExternalLink className="size-3.5" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRemoving(item)}>Remove</DropdownMenuItem>
                  </RowActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </DataTable>

      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{viewing?.projectName}</SheetTitle>
          </SheetHeader>
          {viewing ? (
            <div className="space-y-3 p-4 text-sm">
              <p><span className="text-muted-foreground">Panelist:</span> {viewing.panelistName}</p>
              <p><span className="text-muted-foreground">Assigned:</span> {formatDate(viewing.assignedAt)}</p>
              <p><span className="text-muted-foreground">Expires:</span> {formatDate(viewing.expiryDate)}</p>
              <p><span className="text-muted-foreground">Points:</span> {formatNumber(viewing.rewardPoints)}</p>
              <p className="leading-6">{viewing.description}</p>
              <Button asChild variant="outline">
                <a href={viewing.surveyUrl} target="_blank" rel="noreferrer">
                  Open Survey
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <AssignProjectDialog
        open={assignOpen || Boolean(editing)}
        assignment={editing}
        pending={assign.isPending || update.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setAssignOpen(false)
            setEditing(null)
          }
        }}
        onSubmit={(input) => {
          if (editing) update.mutate({ id: editing.id, input })
          else assign.mutate(input)
        }}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove this assignment?"
        description="The survey will no longer appear in the panelist portal."
        confirmLabel="Remove"
        destructive
        pending={remove.isPending}
        onConfirm={() => removing && remove.mutate(removing.id)}
      />
    </div>
  )
}
