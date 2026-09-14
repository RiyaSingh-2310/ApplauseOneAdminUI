export interface ApiAdmin {
  id: number | string
  name: string
  email: string
  contact_no?: string | null
  status?: string
}

export interface ApiLoginData {
  token: string
  admin: ApiAdmin
}

export interface ApiPanelist {
  id: number | string
  name: string
  email: string
  phone?: string | null
  photo?: string | null
  is_verified?: number | string
  balance_point?: number | string
  status?: string
  onboarding_step?: number | string
  onboarding_completed_at?: string | null
  created_at?: string
  updated_at?: string | null
}

export interface ApiPanelistAnswer {
  id?: number | string
  question_id?: number | string
  question_text?: string
  step_name?: string
  answer_text?: string | null
  answer_ref_id?: number | string | null
}

export interface ApiPanelistListData {
  items: ApiPanelist[]
  page: number
  limit: number
  total: number
}

export interface ApiPanelistDetailData {
  panelist: ApiPanelist
  answers?: ApiPanelistAnswer[]
}

export interface ApiRewardRequest {
  id: number | string
  user_id?: number | string
  reward_points?: number | string
  requested_by?: string | null
  status?: string
  action_by?: string | null
  action_date?: string | null
  payment_methord?: string | null
  payment_method?: string | null
  remark?: string | null
  comment?: string | null
  created_at?: string
  updated_at?: string | null
  panelist_name?: string | null
  panelist_email?: string | null
  balance_point?: number | string | null
}

export interface ApiRewardRequestListData {
  requests: ApiRewardRequest[]
}

export interface ApiSettings {
  id?: number | string
  registration_reward_points?: number | string
  minimum_payout?: number | string
  amazon_enabled?: number | string
  flipkart_enabled?: number | string
  paypal_enabled?: number | string
  created_at?: string
  updated_at?: string
}

export interface ApiSettingsData {
  settings: ApiSettings
}

export interface ApiSettingsInput {
  registration_reward_points?: number
  minimum_payout?: number
  amazon_enabled?: 0 | 1
  flipkart_enabled?: 0 | 1
  paypal_enabled?: 0 | 1
}
