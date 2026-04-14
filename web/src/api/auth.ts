import type { Staff } from '@/types'
import { API_MODE, apiPost } from './client'
import { mockStaff } from '@/mock/data'

export async function login(staffId: string, pin: string): Promise<Staff> {
  if (API_MODE === 'rest') {
    return apiPost<Staff>('/auth/login', { staff_id: staffId, pin })
  }
  // Mock mode: accept any PIN
  const user = mockStaff.find(s => s._id === staffId)
  if (!user) throw new Error('员工不存在')
  return user
}
