import { MOCK_ADMIN_CREDENTIALS } from './adminAuth.mock'
import type {
  ActivityItem,
  AdminSettings,
  AdminUser,
  DashboardAnalytics,
  Panelist,
  PanelistAnalytics,
  ProjectAssignment,
  Reward,
  RewardAnalytics,
  RewardRequest,
  RewardTransaction,
  TrendPoint,
} from '@/types'
import {
  AGE_RANGE_LABELS,
  EDUCATION_LABELS,
  EMPLOYMENT_LABELS,
  GENDER_LABELS,
  INCOME_LABELS,
  fullName,
} from '@/lib/labels'

export const DEMO_ADMIN_PASSWORD = MOCK_ADMIN_CREDENTIALS.password

export const demoAdmin: AdminUser = {
  id: 'adm_100',
  name: 'Jordan Hale',
  email: MOCK_ADMIN_CREDENTIALS.email,
  role: 'Administrator',
}

export const defaultSettings: AdminSettings = {
  registrationRewardPoints: 100,
  minimumPayout: 500,
  amazonEnabled: true,
  flipkartEnabled: true,
  paypalEnabled: true,
}

const firstNames = [
  'Avery', 'Maya', 'Noah', 'Priya', 'Liam', 'Sofia', 'Ethan', 'Amara',
  'Owen', 'Chloe', 'Julian', 'Elena', 'Marcus', 'Hannah', 'Theo', 'Isla',
  'Kai', 'Nora', 'Bennett', 'Leah', 'Adrian', 'Camille', 'Diego', 'Grace',
]
const lastNames = [
  'Chen', 'Patel', 'Brooks', 'Nguyen', 'Walsh', 'Reyes', 'Kim', 'Okoye',
  'Foster', 'Bennett', 'Vargas', 'Shah', 'Cole', 'Ibrahim', 'Lane', 'Park',
  'Diaz', 'Hughes', 'Moore', 'Singh', 'Hart', 'Duval', 'Santos', 'Quinn',
]
const cities = ['94107', '10011', '60614', '78702', '98109', '30308', '80205', '02116', '85004', '37203']
const shopping = ['In-store', 'Online', 'Both equally', 'Mobile apps', 'Warehouse clubs']
const categories = ['Technology', 'Food', 'Travel', 'Home', 'Beauty', 'Fashion', 'Finance']

function ageRangeFromAge(age: number) {
  if (age <= 24) return '18-24' as const
  if (age <= 34) return '25-34' as const
  if (age <= 44) return '35-44' as const
  if (age <= 54) return '45-54' as const
  return '55+' as const
}

function daysAgo(days: number, hours = 10) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hours, (days * 7) % 60, 0, 0)
  return date.toISOString()
}

function buildPanelists(): Panelist[] {
  return firstNames.map((firstName, index) => {
    const lastName = lastNames[index]
    const age = 21 + ((index * 7) % 47)
    const genders = ['female', 'male', 'other'] as const
    const educations = ['high_school', 'some_college', 'bachelors', 'masters', 'doctorate'] as const
    const employments = ['full_time', 'part_time', 'self_employed', 'unemployed', 'student', 'retired'] as const
    const incomes = ['under_25k', '25k_49k', '50k_74k', '75k_99k', '100k_149k', '150k_plus'] as const
    const statuses = ['active', 'active', 'active', 'pending', 'inactive'] as const
    const points = 180 + index * 95
    const redeemed = Math.round(points * (0.35 + (index % 4) * 0.08))

    return {
      id: `pnl_${1001 + index}`,
      firstName,
      lastName,
      email:
        index === 0
          ? 'panelist@applauseone.com'
          : `${firstName}.${lastName}`.toLowerCase() + '@email.com',
      phone: `(415) 555-${String(1400 + index).padStart(4, '0')}`,
      postalCode: cities[index % cities.length],
      gender: genders[index % 3 === 2 && index % 7 !== 0 ? 0 : index % 3],
      age,
      ageRange: ageRangeFromAge(age),
      education: educations[index % educations.length],
      employment: employments[index % employments.length],
      householdIncome: incomes[index % incomes.length],
      householdSize: 1 + (index % 5),
      status: index === 0 ? 'active' : statuses[index % statuses.length],
      rewardPoints: points - redeemed,
      redeemedPoints: redeemed,
      pendingPoints: index % 5 === 0 ? 500 : 0,
      lifetimePointsIssued: points + 400,
      assignedProjectCount: 1 + (index % 4),
      completedProjectCount: index % 4,
      registeredAt: daysAgo(2 + index * 3, 9 + (index % 8)),
      surveyPreferences: {
        shoppingPreference: shopping[index % shopping.length],
        preferredCategories: categories.slice(index % 3, (index % 3) + 3),
        typicalSpend: ['Under $250', '$250–$500', '$500–$1,000', '$1,000+'][index % 4],
        researchParticipation: ['A few times a week', 'Weekly', 'A few times a month', 'Evenings only'][index % 4],
      },
    }
  })
}

export const seedPanelists = buildPanelists()

const projectCatalog = [
  {
    name: 'Consumer Research Study',
    url: 'https://research.applauseone.com/surveys/consumer-study-910',
    points: 180,
    description: 'Share how you discover and compare everyday household brands.',
  },
  {
    name: 'Mobile App Feedback Study',
    url: 'https://research.applauseone.com/surveys/app-feedback-904',
    points: 220,
    description: 'Evaluate a new checkout experience on a shopping app.',
  },
  {
    name: 'Product Feedback Study',
    url: 'https://research.applauseone.com/surveys/product-feedback-888',
    points: 150,
    description: 'Rate packaging, value, and likelihood to recommend.',
  },
  {
    name: 'Weekend Shopping Preferences',
    url: 'https://research.applauseone.com/surveys/weekend-shop-872',
    points: 120,
    description: 'Tell us how you plan groceries, dining, and errands.',
  },
  {
    name: 'Streaming Habit Pulse',
    url: 'https://research.applauseone.com/surveys/streaming-851',
    points: 90,
    description: 'A short study on entertainment discovery and subscriptions.',
  },
  {
    name: 'Home Wellness Routine',
    url: 'https://research.applauseone.com/surveys/wellness-840',
    points: 160,
    description: 'Describe products you use for sleep, focus, and recovery.',
  },
  {
    name: 'Grocery Trade-off Study',
    url: 'https://research.applauseone.com/surveys/grocery-833',
    points: 140,
    description: 'Compare private label and national brand decisions.',
  },
]

export const seedAssignments: ProjectAssignment[] = seedPanelists.flatMap((panelist, panelistIndex) => {
  const count = 1 + (panelistIndex % 3)
  return Array.from({ length: count }, (_, offset) => {
    const project = projectCatalog[(panelistIndex + offset) % projectCatalog.length]
    const statuses = ['assigned', 'in_progress', 'completed', 'expired'] as const
    const completions = ['not_started', 'in_progress', 'completed', 'expired'] as const
    const status = statuses[(panelistIndex + offset) % statuses.length]
    return {
      id: `asg_${2000 + panelistIndex * 10 + offset}`,
      projectName: project.name,
      panelistId: panelist.id,
      panelistName: fullName(panelist.firstName, panelist.lastName),
      panelistEmail: panelist.email,
      surveyUrl: project.url,
      assignedAt: daysAgo(offset + panelistIndex, 14),
      expiryDate: daysAgo(-(14 + offset), 18),
      status,
      completionStatus: completions[(panelistIndex + offset) % completions.length],
      rewardPoints: project.points,
      description: project.description,
    }
  })
})

export const seedRewards: Reward[] = [
  {
    id: 'rwd_paypal',
    name: 'PayPal Cash',
    type: 'PayPal',
    provider: 'PayPal',
    logoKey: 'PP',
    description: 'Transfer cash to a PayPal account after approval.',
    pointsRequired: 500,
    cashValue: 5,
    currency: 'USD',
    availability: 'in_stock',
    status: 'active',
    processingTime: 'Usually within minutes',
  },
  {
    id: 'rwd_cash',
    name: 'Direct Cash Payout',
    type: 'Cash',
    provider: 'Treasury',
    logoKey: 'CA',
    description: 'Cash payout processed through the configured payment rail.',
    pointsRequired: 1000,
    cashValue: 10,
    currency: 'USD',
    availability: 'limited',
    status: 'active',
    processingTime: '2–3 business days',
  },
  {
    id: 'rwd_amazon',
    name: 'Amazon',
    type: 'Gift Cards',
    provider: 'Amazon',
    logoKey: 'AZ',
    description: 'Digital gift code for millions of products.',
    pointsRequired: 500,
    cashValue: 5,
    currency: 'USD',
    availability: 'in_stock',
    status: 'active',
    processingTime: 'Within 24 hours',
  },
  {
    id: 'rwd_walmart',
    name: 'Walmart',
    type: 'Gift Cards',
    provider: 'Walmart',
    logoKey: 'WM',
    description: 'Groceries, electronics, and home essentials.',
    pointsRequired: 750,
    cashValue: 10,
    currency: 'USD',
    availability: 'in_stock',
    status: 'active',
    processingTime: 'Within 24 hours',
  },
  {
    id: 'rwd_starbucks',
    name: 'Starbucks',
    type: 'Gift Cards',
    provider: 'Starbucks',
    logoKey: 'SB',
    description: 'Coffee, drinks, and food at participating locations.',
    pointsRequired: 500,
    cashValue: 5,
    currency: 'USD',
    availability: 'in_stock',
    status: 'active',
    processingTime: 'Within 24 hours',
  },
  {
    id: 'rwd_netflix',
    name: 'Netflix',
    type: 'Digital Rewards',
    provider: 'Netflix',
    logoKey: 'NF',
    description: 'Stream movies and TV with a digital gift code.',
    pointsRequired: 1500,
    cashValue: 15,
    currency: 'USD',
    availability: 'in_stock',
    status: 'active',
    processingTime: 'Within 24 hours',
  },
  {
    id: 'rwd_apple',
    name: 'Apple',
    type: 'Digital Rewards',
    provider: 'Apple',
    logoKey: 'AP',
    description: 'App Store, iTunes, and Apple services credit.',
    pointsRequired: 1000,
    cashValue: 10,
    currency: 'USD',
    availability: 'in_stock',
    status: 'active',
    processingTime: 'Within 24 hours',
  },
  {
    id: 'rwd_google',
    name: 'Google Play',
    type: 'Digital Rewards',
    provider: 'Google',
    logoKey: 'GP',
    description: 'Apps, games, movies, and books on Google Play.',
    pointsRequired: 1000,
    cashValue: 10,
    currency: 'USD',
    availability: 'limited',
    status: 'active',
    processingTime: 'Within 24 hours',
  },
  {
    id: 'rwd_target',
    name: 'Target',
    type: 'Gift Cards',
    provider: 'Target',
    logoKey: 'TG',
    description: 'Everyday shopping and seasonal finds.',
    pointsRequired: 750,
    cashValue: 10,
    currency: 'USD',
    availability: 'unavailable',
    status: 'inactive',
    processingTime: 'Coming soon',
  },
  {
    id: 'rwd_unicef',
    name: 'UNICEF',
    type: 'Other',
    provider: 'UNICEF',
    logoKey: 'UN',
    description: 'Donate points toward children’s emergency relief.',
    pointsRequired: 500,
    cashValue: 5,
    currency: 'USD',
    availability: 'in_stock',
    status: 'active',
    processingTime: 'Processed after approval',
  },
]

const requestStatuses = ['pending', 'approved', 'rejected', 'completed'] as const

export const seedRequests: RewardRequest[] = seedPanelists.slice(0, 16).map((panelist, index) => {
  const reward = seedRewards[index % (seedRewards.length - 1)]
  return {
    id: `req_${300 + index}`,
    requestId: `RR-104${String(18 + index).padStart(2, '0')}`,
    panelistId: panelist.id,
    panelistName: fullName(panelist.firstName, panelist.lastName),
    rewardId: reward.id,
    rewardName: reward.name,
    rewardType: reward.type,
    points: reward.pointsRequired,
    cashValue: reward.cashValue,
    currency: reward.currency,
    requestedAt: daysAgo(index + 1, 11),
    status: index < 4 ? 'pending' : requestStatuses[index % requestStatuses.length],
    notes: index % 6 === 0 ? 'Flagged for a second review of payout details.' : undefined,
  }
})

export const seedTransactions: RewardTransaction[] = seedRequests
  .filter((request) => request.status !== 'pending')
  .map((request, index) => ({
    id: `txn_${400 + index}`,
    requestId: request.requestId,
    panelistId: request.panelistId,
    panelistName: request.panelistName,
    rewardId: request.rewardId,
    rewardName: request.rewardName,
    rewardType: request.rewardType,
    points: request.points,
    value: request.cashValue,
    currency: request.currency,
    transactionDate: request.requestedAt,
    status: request.status,
  }))

export const seedActivity: ActivityItem[] = [
  {
    id: 'act_12',
    title: 'Project assigned',
    detail: 'Consumer Research Study → Avery Chen',
    at: daysAgo(0, 14),
    kind: 'project',
  },
  {
    id: 'act_11',
    title: 'Reward request submitted',
    detail: 'PayPal Cash · Maya Patel · 500 pts',
    at: daysAgo(1, 13),
    kind: 'reward',
  },
  {
    id: 'act_10',
    title: 'New panelist registered',
    detail: 'Noah Brooks completed the questionnaire.',
    at: daysAgo(2, 9),
    kind: 'panelist',
  },
  {
    id: 'act_09',
    title: 'Reward approved',
    detail: 'Amazon gift card for Priya Nguyen',
    at: daysAgo(3, 16),
    kind: 'reward',
  },
  {
    id: 'act_08',
    title: 'Project completed',
    detail: 'Product Feedback Study · Liam Walsh',
    at: daysAgo(4, 12),
    kind: 'project',
  },
]

function series(points: number, startValue: number, step: number, label: (index: number) => { date: string; label: string }): TrendPoint[] {
  return Array.from({ length: points }, (_, index) => {
    const meta = label(index)
    const wave = Math.round(Math.sin(index / 2.4) * 18)
    return {
      date: meta.date,
      label: meta.label,
      value: Math.max(8, startValue + index * step + wave),
    }
  })
}

function defined<T>(items: Array<T | undefined>): T[] {
  return items.filter((item): item is T => item != null)
}

function countBy<T extends string>(items: T[], labels: Record<T, string>) {
  const totals = new Map<T, number>()
  for (const item of items) totals.set(item, (totals.get(item) ?? 0) + 1)
  return [...totals.entries()].map(([key, value]) => ({
    key,
    label: labels[key],
    value,
  }))
}

export const seedDashboard: DashboardAnalytics = {
  totalPanelists: 12458,
  newRegistrations: 324,
  activePanelists: 10872,
  pendingRewardRequests: 48,
  totalPointsIssued: 2_400_000,
  totalPointsRedeemed: 1_800_000,
  activeProjects: 186,
  recentActivity: seedActivity,
}

export const seedPanelistAnalytics: PanelistAnalytics = {
  gender: countBy(defined(seedPanelists.map((item) => item.gender)), GENDER_LABELS).map((item, index) => ({
    ...item,
    value: [5720, 6110, 628][index] ?? item.value,
  })),
  ageRange: countBy(defined(seedPanelists.map((item) => item.ageRange)), AGE_RANGE_LABELS).map((item, index) => ({
    ...item,
    value: [2140, 3980, 2870, 2010, 1458][index] ?? item.value,
  })),
  education: countBy(defined(seedPanelists.map((item) => item.education)), EDUCATION_LABELS).map((item, index) => ({
    ...item,
    value: [1860, 2740, 4920, 2210, 728][index] ?? item.value,
  })),
  employment: countBy(defined(seedPanelists.map((item) => item.employment)), EMPLOYMENT_LABELS).map((item, index) => ({
    ...item,
    value: [6840, 1490, 1120, 740, 1580, 688][index] ?? item.value,
  })),
  householdIncome: countBy(defined(seedPanelists.map((item) => item.householdIncome)), INCOME_LABELS).map((item, index) => ({
    ...item,
    value: [980, 2140, 3010, 2760, 2280, 1288][index] ?? item.value,
  })),
  shoppingPreferences: shopping.map((label, index) => ({
    key: label.toLowerCase().replaceAll(' ', '_'),
    label,
    value: [3120, 4280, 2890, 1460, 708][index] ?? 400,
  })),
  registrationTrend: {
    daily: series(14, 18, 1, (index) => {
      const date = new Date()
      date.setDate(date.getDate() - (13 - index))
      return { date: date.toISOString(), label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    }),
    weekly: series(12, 54, 3, (index) => ({
      date: daysAgo((11 - index) * 7),
      label: `W${index + 1}`,
    })),
    monthly: series(12, 210, 12, (index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - index))
      return { date: date.toISOString(), label: date.toLocaleDateString('en-US', { month: 'short' }) }
    }),
  },
}

export const seedRewardAnalytics: RewardAnalytics = {
  issued: series(12, 118000, 4200, (index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - index))
    return { date: date.toISOString(), label: date.toLocaleDateString('en-US', { month: 'short' }) }
  }),
  redeemed: series(12, 82000, 3600, (index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - index))
    return { date: date.toISOString(), label: date.toLocaleDateString('en-US', { month: 'short' }) }
  }),
  typeDistribution: [
    { key: 'gift_cards', label: 'Gift Cards', value: 42 },
    { key: 'paypal', label: 'PayPal', value: 28 },
    { key: 'cash', label: 'Cash', value: 14 },
    { key: 'digital', label: 'Digital Rewards', value: 11 },
    { key: 'other', label: 'Other', value: 5 },
  ],
  requestStatus: [
    { key: 'pending', label: 'Pending', value: 48 },
    { key: 'approved', label: 'Approved', value: 126 },
    { key: 'rejected', label: 'Rejected', value: 19 },
    { key: 'completed', label: 'Completed', value: 312 },
  ],
  topRewards: [
    { key: 'paypal', label: 'PayPal Cash', value: 186 },
    { key: 'amazon', label: 'Amazon', value: 154 },
    { key: 'starbucks', label: 'Starbucks', value: 98 },
    { key: 'walmart', label: 'Walmart', value: 76 },
    { key: 'netflix', label: 'Netflix', value: 41 },
  ],
  pointsEconomy: {
    issued: 2_400_000,
    redeemed: 1_800_000,
    outstanding: 600_000,
  },
}

export function cloneSeed() {
  return {
    admin: { ...demoAdmin, password: DEMO_ADMIN_PASSWORD },
    settings: { ...defaultSettings },
    panelists: structuredClone(seedPanelists),
    assignments: structuredClone(seedAssignments),
    rewards: structuredClone(seedRewards),
    requests: structuredClone(seedRequests),
    transactions: structuredClone(seedTransactions),
    activity: structuredClone(seedActivity),
    dashboard: structuredClone(seedDashboard),
    panelistAnalytics: structuredClone(seedPanelistAnalytics),
    rewardAnalytics: structuredClone(seedRewardAnalytics),
  }
}
