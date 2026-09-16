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
import { required, sanitizePhoneInput, validateOptionalPhone } from '@/lib/validators'
import type { Panelist, PanelistStatus, UpdatePanelistInput } from '@/types'

export function PanelistEditDialog({
  open,
  panelist,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  panelist: Panelist | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UpdatePanelistInput) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && panelist ? (
        <PanelistEditForm
          key={panelist.id}
          panelist={panelist}
          pending={pending}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}

function PanelistEditForm({
  panelist,
  pending,
  onOpenChange,
  onSubmit,
}: {
  panelist: Panelist
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UpdatePanelistInput) => void
}) {
  const [form, setForm] = useState<UpdatePanelistInput>({
    firstName: panelist.firstName,
    lastName: panelist.lastName,
    email: panelist.email,
    phone: panelist.phone,
    postalCode: panelist.postalCode,
    status: panelist.status === 'active' ? 'active' : 'inactive',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function submit() {
    const next = {
      firstName: required(form.firstName, 'First name') ?? '',
      lastName: '',
      email: '',
      phone: validateOptionalPhone(form.phone) ?? '',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    onSubmit({
      ...form,
      phone: form.phone.trim(),
    })
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit panelist</DialogTitle>
        <DialogDescription>Update contact details and account status.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName}>
          <Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
        </Field>
        <Field label="Email" className="sm:col-span-2" error={errors.email}>
          <Input value={form.email} disabled />
        </Field>
        <Field label="Phone (optional)" error={errors.phone}>
          <Input
            inputMode="numeric"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: sanitizePhoneInput(event.target.value) })}
          />
        </Field>
        <Field label="Status" className="sm:col-span-2">
          <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as PanelistStatus })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
