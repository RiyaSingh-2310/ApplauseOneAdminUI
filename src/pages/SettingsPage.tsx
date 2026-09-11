import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/AuthContext'
import { useResetDemo, useSaveSettings, useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'
import { isMockMode } from '@/lib/env'
import { getErrorMessage } from '@/lib/errors'
import { useState } from 'react'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [resetOpen, setResetOpen] = useState(false)
  const settings = useSettings()
  const save = useSaveSettings()
  const reset = useResetDemo(() => setResetOpen(false))

  if (settings.isLoading) return <LoadingSkeleton />
  if (settings.isError) return <ErrorState message={getErrorMessage(settings.error)} onRetry={() => settings.refetch()} />
  if (!settings.data) return null

  const current = settings.data

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Appearance, administrator profile, and workspace preferences."
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
            <CardDescription>Signed in with a token-ready admin session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {user?.name}</p>
            <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
            <p><span className="text-muted-foreground">Role:</span> {user?.role}</p>
            <p><span className="text-muted-foreground">Data mode:</span> {isMockMode() ? 'Mock services' : 'Live API'}</p>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">Workspace</CardTitle>
            <CardDescription>These preferences stay on this administrator account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Default table page size</Label>
              <Select
                value={String(current.defaultPageSize)}
                onValueChange={(value) => save.mutate({ ...current, defaultPageSize: Number(value) })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Email alerts for new panelists</span>
              <Switch
                checked={current.emailAlerts}
                onCheckedChange={(checked) => save.mutate({ ...current, emailAlerts: checked })}
              />
            </label>
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Alerts for pending reward requests</span>
              <Switch
                checked={current.requestAlerts}
                onCheckedChange={(checked) => save.mutate({ ...current, requestAlerts: checked })}
              />
            </label>
          </CardContent>
        </Card>
      </div>

      {isMockMode() ? (
        <Card className="mt-4 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">Demo data</CardTitle>
            <CardDescription>
              Restore the original mock panelists, assignments, and reward ledger for this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setResetOpen(true)}>
              Reset mock data
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset demo data?"
        description="Local assignments, reward decisions, and catalog edits in this browser will be restored to the seed set."
        confirmLabel="Reset"
        destructive
        pending={reset.isPending}
        onConfirm={() => reset.mutate()}
      />
    </div>
  )
}
