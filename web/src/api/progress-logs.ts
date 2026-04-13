import type { ProgressLog } from '@/types'
import { API_MODE, apiGet, apiPost } from './client'
import { mockProgressLogs } from '@/mock/data'

let logs = [...mockProgressLogs]

export async function getProjectLogs(projectId: string): Promise<ProgressLog[]> {
  if (API_MODE === 'rest') {
    return apiGet<ProgressLog[]>('/progress_logs', { project_id: projectId })
  }
  return logs
    .filter(l => l.project_id === projectId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getCustomerLogs(customerId: string): Promise<ProgressLog[]> {
  if (API_MODE === 'rest') {
    return apiGet<ProgressLog[]>('/progress_logs', { customer_id: customerId })
  }
  return logs
    .filter(l => l.customer_id === customerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function createLog(data: Omit<ProgressLog, '_id' | 'created_at'>): Promise<ProgressLog> {
  if (API_MODE === 'rest') {
    return apiPost<ProgressLog>('/progress_logs', data)
  }
  const log: ProgressLog = {
    ...data,
    _id: `l${Date.now()}`,
    created_at: new Date().toISOString(),
  }
  logs.unshift(log)
  return log
}

export async function getAllRecentLogs(limit = 10): Promise<ProgressLog[]> {
  if (API_MODE === 'rest') {
    const data = await apiGet<ProgressLog[]>('/progress_logs')
    return data.slice(0, limit)
  }
  return [...logs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}
