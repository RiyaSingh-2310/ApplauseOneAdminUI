import { AdminBar } from '@/components/charts/AdminCharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { useChartTheme } from '@/hooks/useChartTheme'
import type { ChartDatum } from '@/types'

export function AgeDistributionChart({ data, loading }: { data?: ChartDatum[]; loading?: boolean }) {
  const { colors } = useChartTheme()
  return (
    <ChartCard title="Age range" loading={loading} empty={!data?.length}>
      <AdminBar data={data ?? []} color={colors[1]} />
    </ChartCard>
  )
}
