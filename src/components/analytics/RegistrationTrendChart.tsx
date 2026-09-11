import type { ReactNode } from 'react'
import { AdminLine } from '@/components/charts/AdminCharts'
import { ChartCard } from '@/components/charts/ChartCard'
import type { TrendPoint } from '@/types'

export function RegistrationTrendChart({
  data,
  loading,
  action,
}: {
  data?: TrendPoint[]
  loading?: boolean
  action?: ReactNode
}) {
  return (
    <ChartCard
      title="Registration trend"
      description="New panelists over the selected period."
      loading={loading}
      empty={!data?.length}
      action={action}
    >
      <AdminLine data={data ?? []} />
    </ChartCard>
  )
}
