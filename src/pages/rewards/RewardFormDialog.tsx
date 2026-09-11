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
import { useRewardTypes } from '@/hooks/useRewards'
import { required } from '@/lib/validators'
import type { Reward, RewardAvailability, RewardInput, RewardStatus } from '@/types'

const empty: RewardInput = {
  name: '',
  type: '',
  provider: '',
  description: '',
  pointsRequired: 500,
  cashValue: 5,
  currency: 'USD',
  availability: 'in_stock',
  status: 'active',
  processingTime: 'Within 24 hours',
  logoKey: '',
}

export function RewardFormDialog({
  open,
  reward,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  reward?: Reward | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: RewardInput) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <RewardForm
          key={reward?.id ?? 'new'}
          reward={reward}
          pending={pending}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}

function RewardForm({
  reward,
  pending,
  onOpenChange,
  onSubmit,
}: {
  reward?: Reward | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: RewardInput) => void
}) {
  const [form, setForm] = useState<RewardInput>(() =>
    reward
      ? {
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
      : empty,
  )
  const [customType, setCustomType] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const types = useRewardTypes()

  function submit() {
    const type = form.type === '__custom' ? customType : form.type
    const next = {
      name: required(form.name, 'Reward name') ?? '',
      type: required(type, 'Reward type') ?? '',
      provider: required(form.provider, 'Provider') ?? '',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    onSubmit({ ...form, type, logoKey: form.logoKey || form.name.slice(0, 2).toUpperCase() })
  }

  return (
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{reward ? 'Edit reward' : 'Create reward'}</DialogTitle>
          <DialogDescription>Reward options are controlled by configuration, not hardcoded providers.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Reward name" error={errors.name}>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Provider" error={errors.provider}>
            <Input value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} />
          </Field>
          <Field label="Reward type" className="sm:col-span-2" error={errors.type}>
            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select or add a type" />
              </SelectTrigger>
              <SelectContent>
                {(types.data ?? []).map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
                <SelectItem value="__custom">Other (custom)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {form.type === '__custom' ? (
            <Field label="Custom type" className="sm:col-span-2">
              <Input value={customType} onChange={(event) => setCustomType(event.target.value)} />
            </Field>
          ) : null}
          <Field label="Logo / icon">
            <Input
              maxLength={2}
              value={form.logoKey}
              onChange={(event) => setForm({ ...form, logoKey: event.target.value.toUpperCase() })}
            />
          </Field>
          <Field label="Processing time">
            <Input
              value={form.processingTime}
              onChange={(event) => setForm({ ...form, processingTime: event.target.value })}
            />
          </Field>
          <Field label="Points required">
            <Input
              type="number"
              min={0}
              value={form.pointsRequired}
              onChange={(event) => setForm({ ...form, pointsRequired: Number(event.target.value) })}
            />
          </Field>
          <Field label="Cash value">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.cashValue}
              onChange={(event) => setForm({ ...form, cashValue: Number(event.target.value) })}
            />
          </Field>
          <Field label="Currency">
            <Input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
          </Field>
          <Field label="Availability">
            <Select
              value={form.availability}
              onValueChange={(value) => setForm({ ...form, availability: value as RewardAvailability })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">Available</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as RewardStatus })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
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
            {pending ? 'Saving…' : reward ? 'Save reward' : 'Create reward'}
          </Button>
        </DialogFooter>
      </DialogContent>
  )
}
