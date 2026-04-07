import type { ProgressLog } from '@/types'
import { mockProgressLogs } from '@/mock/data'

let logs = [...mockProgressLogs]

export async function getProjectLogs(projectId: string): Promise<ProgressLog[]> {
  return logs
    .filter(l => l.project_id === projectId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getCustomerLogs(customerId: string): Promise<ProgressLog[]> {
  return logs
    .filter(l => l.customer_id === customerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function createLog(data: Omit<ProgressLog, '_id' | 'created_at'>): Promise<ProgressLog> {
  const log: ProgressLog = {
    ...data,
    _id: `l${Date.now()}`,
    created_at: new Date().toISOString(),
  }
  logs.unshift(log)
  return log
}

export async function getAllRecentLogs(limit = 10): Promise<ProgressLog[]> {
  return [...logs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}
