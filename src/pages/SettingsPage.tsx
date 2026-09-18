import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PointsInput } from '@/components/ui/points-input'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/AuthContext'
import { useSaveSettings, useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'
import {
  MAX_ADMIN_NAME_LENGTH,
  validateAdminName,
  validateAdminPassword,
  validatePasswordConfirmation,
} from '@/lib/authValidation'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import { validateNonNegativePoints } from '@/lib/validators'
import { adminAuthService } from '@/services/adminAuth.service'
import type { AdminSettings } from '@/types'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const settings = useSettings()
  const save = useSaveSettings()
  const [draft, setDraft] = useState<AdminSettings | null>(null)
  const [pointsError, setPointsError] = useState<string>()
  const [payoutError, setPayoutError] = useState<string>()
  const [name, setName] = useState(user?.name ?? '')
  const [nameBaseline, setNameBaseline] = useState(user?.name ?? '')
  const [nameError, setNameError] = useState<string>()
  const [namePending, setNamePending] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string
    next?: string
    confirm?: string
  }>({})
  const [passwordPending, setPasswordPending] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const form = draft ?? settings.data ?? null

  const sessionName = user?.name ?? ''
  if (sessionName !== nameBaseline) {
    setNameBaseline(sessionName)
    setName(sessionName)
    setNameError(undefined)
  }

  const nameDirty = name.trim() !== sessionName.trim()
  const nameValid = !validateAdminName(name)
  const canUpdateName = Boolean(user) && nameDirty && nameValid && !namePending

  const passwordFormValid = useMemo(() => {
    const currentError = !currentPassword.trim()
      ? 'Current password is required.'
      : validateAdminPassword(currentPassword)
    const nextError = validateAdminPassword(newPassword)
    const confirmError = validatePasswordConfirmation(newPassword, confirmPassword)
    return !currentError && !nextError && !confirmError
  }, [confirmPassword, currentPassword, newPassword])

  if (settings.isLoading) return <LoadingSkeleton />
  if (settings.isError) {
    return <ErrorState message={getErrorMessage(settings.error)} onRetry={() => settings.refetch()} />
  }
  if (!form) return null

  function saveSettings() {
    if (!form || save.isPending) return
    const registrationError = validateNonNegativePoints(
      form.registrationRewardPoints,
      'Registration reward points',
    )
    const nextPayoutError = validateNonNegativePoints(form.minimumPayout, 'Minimum payout')
    setPointsError(registrationError)
    setPayoutError(nextPayoutError)
    if (registrationError || nextPayoutError) return
    save.mutate(form, { onSuccess: () => setDraft(null) })
  }

  async function updateName() {
    if (!canUpdateName) return
    const error = validateAdminName(name)
    setNameError(error)
    if (error) return
    setNamePending(true)
    try {
      await adminAuthService.updateProfile({ name: name.trim() })
    } catch (error) {
      notify.error(error)
    } finally {
      setNamePending(false)
    }
  }

  async function submitPasswordChange() {
    setPasswordTouched(true)
    const currentError = !currentPassword.trim()
      ? 'Current password is required.'
      : validateAdminPassword(currentPassword)
    const nextError = validateAdminPassword(newPassword)
    const confirmError = validatePasswordConfirmation(newPassword, confirmPassword)
    setPasswordErrors({
      current: currentError,
      next: nextError,
      confirm: confirmError,
    })
    if (currentError || nextError || confirmError || passwordPending) return

    setPasswordPending(true)
    try {
      await adminAuthService.changePassword({
        currentPassword,
        newPassword,
      })
    } catch (error) {
      notify.error(error)
    } finally {
      setPasswordPending(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Administrator profile, appearance, payout configuration, and password options."
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Settings' }]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">Administrator</CardTitle>
            <CardDescription>Profile details from your signed-in admin session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar size="lg" className="size-16">
                <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                  {user ? initials(user.name) : 'AO'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">Profile photo</p>
                <p className="text-xs text-muted-foreground">
                  Photo upload is not available — the Admin API does not expose a profile-photo endpoint.
                </p>
                <Button type="button" variant="outline" size="sm" disabled className="cursor-not-allowed">
                  Change photo
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="admin-name">Name</Label>
                <Input
                  id="admin-name"
                  value={name}
                  maxLength={MAX_ADMIN_NAME_LENGTH}
                  aria-invalid={Boolean(nameError)}
                  onChange={(event) => {
                    setName(event.target.value.slice(0, MAX_ADMIN_NAME_LENGTH))
                    setNameError(undefined)
                  }}
                />
                {nameError ? (
                  <p className="text-xs text-destructive">{nameError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Name can be edited here. Saving requires an Admin profile-update API that is not published yet.
                  </p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" value={user?.email ?? ''} disabled readOnly className="cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email is read-only for the signed-in administrator.</p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="admin-role">Role</Label>
                <Input
                  id="admin-role"
                  value={user?.role ?? 'Administrator'}
                  disabled
                  readOnly
                  className="cursor-not-allowed"
                />
              </div>
            </div>

            <Button type="button" disabled={!canUpdateName} onClick={() => void updateName()}>
              {namePending ? 'Updating…' : 'Update'}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">Appearance</CardTitle>
            <CardDescription>Theme preferences and session controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Currently using {theme} mode.</p>
              </div>
              <ThemeToggle />
            </div>
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm text-muted-foreground">If you want to logout, click here.</p>
              <Button type="button" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">Payout settings</CardTitle>
            <CardDescription>Registration points, minimum payout, and enabled payment methods.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="registration-points">Registration reward points</Label>
              <PointsInput
                id="registration-points"
                value={form.registrationRewardPoints}
                onValueChange={(value) => {
                  setPointsError(undefined)
                  setDraft({
                    ...form,
                    registrationRewardPoints: value ? Number(value) : 0,
                  })
                }}
              />
              {pointsError ? <p className="text-xs text-destructive">{pointsError}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minimum-payout">Minimum payout</Label>
              <PointsInput
                id="minimum-payout"
                value={form.minimumPayout}
                onValueChange={(value) => {
                  setPayoutError(undefined)
                  setDraft({
                    ...form,
                    minimumPayout: value ? Number(value) : 0,
                  })
                }}
              />
              {payoutError ? <p className="text-xs text-destructive">{payoutError}</p> : null}
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
              <span>Amazon enabled</span>
              <Switch
                checked={form.amazonEnabled}
                onCheckedChange={(checked) => setDraft({ ...form, amazonEnabled: checked })}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
              <span>Flipkart enabled</span>
              <Switch
                checked={form.flipkartEnabled}
                onCheckedChange={(checked) => setDraft({ ...form, flipkartEnabled: checked })}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
              <span>PayPal enabled</span>
              <Switch
                checked={form.paypalEnabled}
                onCheckedChange={(checked) => setDraft({ ...form, paypalEnabled: checked })}
              />
            </label>
            <div className="sm:col-span-2">
              <Button disabled={save.isPending} onClick={saveSettings}>
                {save.isPending ? 'Saving…' : 'Save settings'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">Change password</CardTitle>
            <CardDescription>
              Enter your current and new password. Saving requires an Admin change-password API that is not
              published yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current password</Label>
                <PasswordInput
                  id="current-password"
                  value={currentPassword}
                  autoComplete="current-password"
                  placeholder="Current password"
                  invalid={Boolean(passwordTouched && passwordErrors.current)}
                  describedBy={passwordErrors.current ? 'current-password-error' : undefined}
                  onChange={(value) => {
                    setCurrentPassword(value)
                    setPasswordErrors((current) => ({ ...current, current: undefined }))
                  }}
                />
                {passwordTouched && passwordErrors.current ? (
                  <p id="current-password-error" className="text-xs text-destructive" role="alert">
                    {passwordErrors.current}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <PasswordInput
                  id="new-password"
                  value={newPassword}
                  autoComplete="new-password"
                  placeholder="New password"
                  invalid={Boolean(passwordTouched && passwordErrors.next)}
                  describedBy={passwordErrors.next ? 'new-password-error' : undefined}
                  onChange={(value) => {
                    setNewPassword(value)
                    setPasswordErrors((current) => ({ ...current, next: undefined, confirm: undefined }))
                  }}
                />
                {passwordTouched && passwordErrors.next ? (
                  <p id="new-password-error" className="text-xs text-destructive" role="alert">
                    {passwordErrors.next}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <PasswordInput
                  id="confirm-password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  invalid={Boolean(passwordTouched && passwordErrors.confirm)}
                  describedBy={passwordErrors.confirm ? 'confirm-password-error' : undefined}
                  onChange={(value) => {
                    setConfirmPassword(value)
                    setPasswordErrors((current) => ({ ...current, confirm: undefined }))
                  }}
                />
                {passwordTouched && passwordErrors.confirm ? (
                  <p id="confirm-password-error" className="text-xs text-destructive" role="alert">
                    {passwordErrors.confirm}
                  </p>
                ) : null}
              </div>
            </div>
            <Button
              type="button"
              disabled={!passwordFormValid || passwordPending}
              onClick={() => void submitPasswordChange()}
            >
              {passwordPending ? 'Updating…' : 'Update password'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
