import { Coins, Gift, Wallet } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'
import { KpiSkeleton } from '@/components/shared/PageState'
import { formatCompact } from '@/lib/format'

export function PointsEconomyChart({
  issued,
  redeemed,
  outstanding,
  loading,
}: {
  issued?: number
  redeemed?: number
  outstanding?: number
  loading?: boolean
}) {
  if (loading || issued === undefined || redeemed === undefined || outstanding === undefined) {
    return <KpiSkeleton count={3} />
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <KpiCard label="Total points issued" value={formatCompact(issued)} icon={Coins} />
      <KpiCard label="Total points redeemed" value={formatCompact(redeemed)} icon={Gift} />
      <KpiCard label="Outstanding points" value={formatCompact(outstanding)} icon={Wallet} />
    </div>
  )
}
