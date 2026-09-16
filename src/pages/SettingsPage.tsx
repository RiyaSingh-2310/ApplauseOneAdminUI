import { useState } from 'react'
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
import { getErrorMessage } from '@/lib/errors'
import { validateNonNegativePoints } from '@/lib/validators'
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
  const { theme } = useTheme()
  const settings = useSettings()
  const save = useSaveSettings()
  const [draft, setDraft] = useState<AdminSettings | null>(null)
  const [pointsError, setPointsError] = useState<string>()
  const [payoutError, setPayoutError] = useState<string>()
  const form = draft ?? settings.data ?? null

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
                <Button type="button" variant="outline" size="sm" disabled>
                  Change photo
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="admin-name">Name</Label>
                <Input id="admin-name" value={user?.name ?? ''} disabled readOnly />
                <p className="text-xs text-muted-foreground">Name updates are not supported by the Admin API.</p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" value={user?.email ?? ''} disabled readOnly />
                <p className="text-xs text-muted-foreground">Email is read-only for the signed-in administrator.</p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="admin-role">Role</Label>
                <Input id="admin-role" value={user?.role ?? 'Administrator'} disabled readOnly />
              </div>
            </div>

            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">Appearance</CardTitle>
            <CardDescription>Light and dark themes persist across sessions.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Currently using {theme} mode.</p>
            </div>
            <ThemeToggle />
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
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Amazon enabled</span>
              <Switch
                checked={form.amazonEnabled}
                onCheckedChange={(checked) => setDraft({ ...form, amazonEnabled: checked })}
              />
            </label>
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Flipkart enabled</span>
              <Switch
                checked={form.flipkartEnabled}
                onCheckedChange={(checked) => setDraft({ ...form, flipkartEnabled: checked })}
              />
            </label>
            <label className="flex items-center justify-between gap-4 text-sm">
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
              Password changes require an Admin API that is not currently published for this panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-dashed bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
              No change-password endpoint is available on{' '}
              <span className="font-medium text-foreground">/admin</span>. Current password, new password, and
              confirm password cannot be submitted until the backend adds a supported route. Fake success states
              are intentionally disabled.
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current password</Label>
                <Input id="current-password" type="password" autoComplete="current-password" disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" autoComplete="new-password" disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" disabled />
              </div>
            </div>
            <Button type="button" disabled>
              Update password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
