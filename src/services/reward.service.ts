import { apiRequest } from '@/lib/apiClient'
import { ApiError } from '@/lib/errors'
import { paymentMethodLabel } from '@/lib/labels'
import type { LookupOption, PaginatedResult, Reward, RewardInput, RewardListQuery } from '@/types'
import type { ApiPublicSettings } from '@/types/api'

const UNAVAILABLE = 'A rewards catalog API is not available. Payout methods are managed in Settings.'

/**
 * Same source of truth as the Client UI reward catalog:
 * GET /settings → payment_methods (dropdown_master PaymentMethord, with PayPal gated by settings).
 */
export const rewardService = {
  async list(query: RewardListQuery = {}): Promise<PaginatedResult<Reward>> {
    return { data: [], total: 0, page: 1, pageSize: query.pageSize ?? 10 }
  },
  async types(): Promise<LookupOption[]> {
    const settings = await apiRequest<ApiPublicSettings>('/settings', { auth: false })
    const methods = settings.payment_methods ?? []
    const seen = new Set<string>()
    const options: LookupOption[] = []
    for (const method of methods) {
      const value = method.name?.trim()
      if (!value) continue
      const key = value.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      options.push({ value, label: paymentMethodLabel(value) })
    }
    return options
  },
  create(input: RewardInput): Promise<Reward> {
    void input
    throw new ApiError(UNAVAILABLE, 404)
  },
  update(id: string, input: RewardInput): Promise<Reward> {
    void id
    void input
    throw new ApiError(UNAVAILABLE, 404)
  },
  remove(id: string): Promise<{ ok: boolean }> {
    void id
    throw new ApiError(UNAVAILABLE, 404)
  },
}
