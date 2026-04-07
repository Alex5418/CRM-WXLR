import type { Staff } from '@/types'
import { mockStaff } from '@/mock/data'

export async function getStaffList(): Promise<Staff[]> {
  return [...mockStaff]
}

export async function getStaff(id: string): Promise<Staff | undefined> {
  return mockStaff.find(s => s._id === id)
}

export function getStaffName(id: string): string {
  return mockStaff.find(s => s._id === id)?.name ?? '未知'
}
