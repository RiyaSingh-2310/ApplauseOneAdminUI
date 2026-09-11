import { Plus } from 'lucide-react'
import { useState } from 'react'
import { DataTable } from '@/components/common/DataTable'
import { FilterToolbar } from '@/components/common/FilterToolbar'
import { RowActions } from '@/components/common/RowActions'
import { SearchField } from '@/components/common/SearchField'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvailabilityBadge, RewardStatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useListQuery } from '@/hooks/useListQuery'
import { useCreateReward, useDeleteReward, useRewardList, useRewardTypes, useUpdateReward } from '@/hooks/useRewards'
import { getErrorMessage } from '@/lib/errors'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { Reward, RewardInput, RewardListQuery, RewardStatus } from '@/types'
import { RewardFormDialog } from './RewardFormDialog'

const defaultQuery: RewardListQuery = {
  page: 1,
  pageSize: 10,
  sortBy: 'name',
  sortDir: 'asc',
  type: 'all',
  status: 'all',
}

function toInput(reward: Reward): RewardInput {
  return {
    name: reward.name,
    type: reward.type,
    provider: reward.provider,
    description: reward.description,
    pointsRequired: reward.pointsRequired,
    cashValue: reward.cashValue,
    currency: reward.currency,
    availability: reward.availability,
    status: reward.status,
    processingTime: reward.processingTime,
    logoKey: reward.logoKey,
  }
}

export function RewardsPage() {
  const { search, setSearch, filters, setFilters, query, reset, setPage } = useListQuery(defaultQuery)
  const list = useRewardList(query)
  const types = useRewardTypes()
  const [filterOpen, setFilterOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Reward | null>(null)
  const [removing, setRemoving] = useState<Reward | null>(null)
  const create = useCreateReward(() => setFormOpen(false))
  const update = useUpdateReward(() => setEditing(null))
  const remove = useDeleteReward(() => setRemoving(null))
  const rows = list.data?.data ?? []

  function renderFilters() {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          value={filters.type ?? 'all'}
          onValueChange={(value) => setFilters((current) => ({ ...current, page: 1, type: value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(types.data ?? []).map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(value) =>
            setFilters((current) => ({ ...current, page: 1, status: value as RewardStatus | 'all' }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Rewards"
        description="Manage the catalog panelists can redeem. Availability comes from the backend."
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Rewards' }]}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Add reward
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
                placeholder="Search rewards"
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
        emptyTitle="No rewards found."
        page={list.data?.page}
        pageSize={list.data?.pageSize}
        total={list.data?.total ?? 0}
        onPageChange={setPage}
      >
        <div className="space-y-3 p-4 md:hidden">
          {rows.map((reward) => (
            <div key={reward.id} className="rounded-2xl border px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{reward.name}</p>
                  <p className="text-xs text-muted-foreground">{reward.provider}</p>
                </div>
                <RewardStatusBadge status={reward.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatNumber(reward.pointsRequired)} pts · {formatCurrency(reward.cashValue, reward.currency)}
              </p>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reward</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Cash value</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Processing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((reward) => (
              <TableRow key={reward.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-secondary text-xs font-semibold text-primary">
                      {reward.logoKey}
                    </span>
                    <div>
                      <p className="font-medium">{reward.name}</p>
                      <p className="max-w-xs truncate text-xs text-muted-foreground">{reward.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{reward.type}</TableCell>
                <TableCell>{reward.provider}</TableCell>
                <TableCell>{formatNumber(reward.pointsRequired)}</TableCell>
                <TableCell>{formatCurrency(reward.cashValue, reward.currency)}</TableCell>
                <TableCell>
                  <AvailabilityBadge value={reward.availability} />
                </TableCell>
                <TableCell>
                  <RewardStatusBadge status={reward.status} />
                </TableCell>
                <TableCell>{reward.processingTime}</TableCell>
                <TableCell className="text-right">
                  <RowActions>
                    <DropdownMenuItem onClick={() => setEditing(reward)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        update.mutate({
                          id: reward.id,
                          input: {
                            ...toInput(reward),
                            status: reward.status === 'active' ? 'inactive' : 'active',
                          },
                        })
                      }
                    >
                      {reward.status === 'active' ? 'Disable' : 'Enable'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRemoving(reward)}>Delete</DropdownMenuItem>
                  </RowActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </DataTable>

      <RewardFormDialog
        open={formOpen || Boolean(editing)}
        reward={editing}
        pending={create.isPending || update.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false)
            setEditing(null)
          }
        }}
        onSubmit={(input) => {
          if (editing) update.mutate({ id: editing.id, input })
          else create.mutate(input)
        }}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Delete this reward?"
        description="Panelists will no longer see this option in the catalog."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        onConfirm={() => removing && remove.mutate(removing.id)}
      />
    </div>
  )
}
