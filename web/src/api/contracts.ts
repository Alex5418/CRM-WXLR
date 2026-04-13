import type { Contract } from '@/types'
import { API_MODE, apiGet, apiPost } from './client'
import { mockContracts } from '@/mock/data'

let contracts = [...mockContracts]

export async function getContracts(): Promise<Contract[]> {
  if (API_MODE === 'rest') {
    const data = await apiGet<Contract[]>('/contracts')
    return data.sort((a, b) => {
      if (!a.expiry_date) return 1
      if (!b.expiry_date) return -1
      return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    })
  }
  return [...contracts].sort((a, b) => {
    if (!a.expiry_date) return 1
    if (!b.expiry_date) return -1
    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
  })
}

export async function getExpiringContracts(days = 90): Promise<Contract[]> {
  const all = await getContracts()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)
  return all.filter(c => {
    if (!c.expiry_date || !c.is_active) return false
    return new Date(c.expiry_date) <= cutoff
  })
}

export async function getProjectContracts(projectId: string): Promise<Contract[]> {
  if (API_MODE === 'rest') {
    return apiGet<Contract[]>('/contracts', { project_id: projectId })
  }
  return contracts.filter(c => c.project_id === projectId)
}

export async function createContract(data: Omit<Contract, '_id' | 'created_at'>): Promise<Contract> {
  if (API_MODE === 'rest') {
    return apiPost<Contract>('/contracts', data)
  }
  const contract: Contract = {
    ...data,
    _id: `ct${Date.now()}`,
    created_at: new Date().toISOString(),
  }
  contracts.unshift(contract)
  return contract
}
