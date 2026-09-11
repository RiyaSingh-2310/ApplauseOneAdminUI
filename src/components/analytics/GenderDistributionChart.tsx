import { AdminDonut } from '@/components/charts/AdminCharts'
import { ChartCard } from '@/components/charts/ChartCard'
import type { ChartDatum } from '@/types'

export function GenderDistributionChart({ data, loading }: { data?: ChartDatum[]; loading?: boolean }) {
  return (
    <ChartCard title="Gender distribution" loading={loading} empty={!data?.length}>
      <AdminDonut data={data ?? []} />
    </ChartCard>
  )
}
