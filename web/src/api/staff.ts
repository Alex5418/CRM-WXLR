import type { Staff } from '@/types'
import { API_MODE, apiGet } from './client'
import { mockStaff } from '@/mock/data'

export async function getStaffList(): Promise<Staff[]> {
  if (API_MODE === 'rest') {
    return apiGet<Staff[]>('/staff')
  }
  return [...mockStaff]
}

export async function getStaff(id: string): Promise<Staff | undefined> {
  if (API_MODE === 'rest') {
    return apiGet<Staff>(`/staff/${id}`) || undefined
  }
  return mockStaff.find(s => s._id === id)
}

export function getStaffName(id: string): string {
  // Synchronous helper — always uses mock data (called in render)
  return mockStaff.find(s => s._id === id)?.name ?? '未知'
}
