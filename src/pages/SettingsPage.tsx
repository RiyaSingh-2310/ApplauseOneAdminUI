import { useState } from 'react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/AuthContext'
import { useSaveSettings, useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'
import { getErrorMessage } from '@/lib/errors'
import type { AdminSettings } from '@/types'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const settings = useSettings()
  const save = useSaveSettings()
  const [draft, setDraft] = useState<AdminSettings | null>(null)
  const form = draft ?? settings.data ?? null

  if (settings.isLoading) return <LoadingSkeleton />
  if (settings.isError) return <ErrorState message={getErrorMessage(settings.error)} onRetry={() => settings.refetch()} />
  if (!form) return null

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Appearance, administrator profile, and payout configuration."
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Settings' }]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">Administrator</CardTitle>
            <CardDescription>Signed in with a live admin token.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {user?.name}</p>
            <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
            <p><span className="text-muted-foreground">Role:</span> {user?.role}</p>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
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
              <Input
                id="registration-points"
                type="number"
                min={0}
                value={form.registrationRewardPoints}
                onChange={(event) =>
                  setDraft({ ...form, registrationRewardPoints: Number(event.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minimum-payout">Minimum payout</Label>
              <Input
                id="minimum-payout"
                type="number"
                min={0}
                value={form.minimumPayout}
                onChange={(event) => setDraft({ ...form, minimumPayout: Number(event.target.value) })}
              />
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
              <Button
                disabled={save.isPending}
                onClick={() =>
                  save.mutate(form, {
                    onSuccess: () => setDraft(null),
                  })
                }
              >
                {save.isPending ? 'Saving…' : 'Save settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
