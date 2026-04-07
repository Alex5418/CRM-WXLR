// ===== Enums & Constants =====

export const BIZ_TYPES = {
  fama: 'FAMA授权',
  joint_dev: '联合开发',
  oem_cross_border: '代工/跨境',
} as const

export type BizType = keyof typeof BIZ_TYPES

export const STAGES = {
  lead: '线索',
  contacted: '已联系',
  sampling: '打样中',
  contract_signing: '签约中',
  production: '生产中',
  live: '已上线',
  completed: '已完结',
} as const

export type Stage = keyof typeof STAGES

export const STAGE_ORDER: Stage[] = [
  'lead', 'contacted', 'sampling', 'contract_signing',
  'production', 'live', 'completed',
]

export const STAGE_COLORS: Record<Stage, string> = {
  lead: '#94a3b8',
  contacted: '#60a5fa',
  sampling: '#f59e0b',
  contract_signing: '#a78bfa',
  production: '#fb923c',
  live: '#34d399',
  completed: '#6b7280',
}

export const CUSTOMER_STATUSES = {
  active: '活跃',
  inactive: '不活跃',
  blacklist: '黑名单',
} as const

export type CustomerStatus = keyof typeof CUSTOMER_STATUSES

export const STAFF_ROLES = {
  admin: '管理员',
  sales: '销售',
  manager: '经理',
} as const

export type StaffRole = keyof typeof STAFF_ROLES

export const LICENSE_TYPES = {
  disney: 'Disney',
  marvel: 'Marvel',
  starwars: 'Star Wars',
  other: '其他',
} as const

export type LicenseType = keyof typeof LICENSE_TYPES

export const CUSTOMER_SOURCES = {
  exhibition: '展会',
  referral: '转介绍',
  outbound: '主动拓客',
  other: '其他',
} as const

// ===== Data Models =====

export interface Customer {
  _id: string
  company_name: string
  short_name?: string
  contact_person?: string
  contact_phone?: string
  contact_wechat?: string
  region?: string
  industry?: string
  source?: string
  status: CustomerStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface Project {
  _id: string
  customer_id: string
  biz_type: BizType
  product_category: string
  stage: Stage
  owner_id: string
  co_owners?: string[]
  est_revenue?: number
  priority?: 'high' | 'medium' | 'low'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Contract {
  _id: string
  project_id: string
  customer_id: string
  license_type: LicenseType
  licensed_categories: string[]
  sign_date?: string
  start_date?: string
  expiry_date?: string
  royalty_rate?: number
  contract_value?: number
  file_urls?: string[]
  is_active: boolean
  remind_days?: number
  created_at: string
}

export interface Staff {
  _id: string
  name: string
  role: StaffRole
  phone?: string
  wechat_openid?: string
  is_active: boolean
}

export interface ProgressLog {
  _id: string
  project_id: string
  customer_id: string
  staff_id: string
  content: string
  stage_snapshot?: Stage
  attachments?: string[]
  created_at: string
}

// ===== API Types =====

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}

export interface PipelineStats {
  stage: Stage
  count: number
}
