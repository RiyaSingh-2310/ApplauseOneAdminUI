import { useState } from 'react'
import { AdminBar, AdminDonut, AdminLine } from '@/components/charts/AdminCharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { AgeDistributionChart } from '@/components/analytics/AgeDistributionChart'
import { GenderDistributionChart } from '@/components/analytics/GenderDistributionChart'
import { PointsEconomyChart } from '@/components/analytics/PointsEconomyChart'
import { RegistrationTrendChart } from '@/components/analytics/RegistrationTrendChart'
import { RewardDistributionChart } from '@/components/analytics/RewardDistributionChart'
import { RewardStatusChart } from '@/components/analytics/RewardStatusChart'
import { ErrorState } from '@/components/shared/PageState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useChartTheme } from '@/hooks/useChartTheme'
import { usePanelistAnalytics, useRewardAnalytics } from '@/hooks/useAnalytics'
import { getErrorMessage } from '@/lib/errors'

export function AnalyticsPage() {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const panelists = usePanelistAnalytics()
  const rewards = useRewardAnalytics()
  const { colors } = useChartTheme()

  const trend = panelists.data?.registrationTrend[range] ?? []
  const economy = rewards.data?.pointsEconomy

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Panelist questionnaire distributions and the rewards economy."
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Analytics' }]}
      />

      {rewards.isError ? (
        <ErrorState message={getErrorMessage(rewards.error)} onRetry={() => rewards.refetch()} />
      ) : (
      <PointsEconomyChart
        issued={economy?.issued}
        redeemed={economy?.redeemed}
        outstanding={economy?.outstanding}
        loading={rewards.isLoading}
      />
      )}

      {panelists.isError ? (
        <div className="mt-4">
          <ErrorState message={getErrorMessage(panelists.error)} onRetry={() => panelists.refetch()} />
        </div>
      ) : (
      <>
      <div className="mt-4">
        <RegistrationTrendChart
          data={trend}
          loading={panelists.isLoading}
          action={
            <Tabs value={range} onValueChange={(value) => setRange(value as typeof range)}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GenderDistributionChart data={panelists.data?.gender} loading={panelists.isLoading} />
        <AgeDistributionChart data={panelists.data?.ageRange} loading={panelists.isLoading} />
        <ChartCard title="Education" loading={panelists.isLoading} empty={!panelists.data?.education.length}>
          <AdminBar data={panelists.data?.education ?? []} color={colors[2]} />
        </ChartCard>
        <ChartCard title="Employment status" loading={panelists.isLoading} empty={!panelists.data?.employment.length}>
          <AdminBar data={panelists.data?.employment ?? []} color={colors[3]} />
        </ChartCard>
        <ChartCard title="Household income" loading={panelists.isLoading} empty={!panelists.data?.householdIncome.length}>
          <AdminBar data={panelists.data?.householdIncome ?? []} color={colors[1]} />
        </ChartCard>
        <ChartCard
          title="Shopping preferences"
          loading={panelists.isLoading}
          empty={!panelists.data?.shoppingPreferences.length}
        >
          <AdminDonut data={panelists.data?.shoppingPreferences ?? []} />
        </ChartCard>
      </div>
      </>
      )}

      <h2 className="font-display mt-8 mb-4 text-2xl">Reward analytics</h2>
      {rewards.isError ? (
        <ErrorState message={getErrorMessage(rewards.error)} onRetry={() => rewards.refetch()} />
      ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Rewards issued" loading={rewards.isLoading} empty={!rewards.data?.issued.length}>
          <AdminLine data={rewards.data?.issued ?? []} />
        </ChartCard>
        <ChartCard title="Rewards redeemed" loading={rewards.isLoading} empty={!rewards.data?.redeemed.length}>
          <AdminLine data={rewards.data?.redeemed ?? []} color={colors[1]} />
        </ChartCard>
        <RewardDistributionChart data={rewards.data?.typeDistribution} loading={rewards.isLoading} />
        <RewardStatusChart data={rewards.data?.requestStatus} loading={rewards.isLoading} />
        <ChartCard title="Top rewards" loading={rewards.isLoading} empty={!rewards.data?.topRewards.length}>
          <AdminBar data={rewards.data?.topRewards ?? []} />
        </ChartCard>
      </div>
      )}
    </div>
  )
}
