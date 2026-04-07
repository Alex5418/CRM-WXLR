import type { Customer } from '@/types'
import { mockCustomers } from '@/mock/data'

// In-memory store for mock mutations
let customers = [...mockCustomers]

export async function getCustomers(params?: {
  search?: string
  status?: string
}): Promise<Customer[]> {
  let result = [...customers]
  if (params?.search) {
    const q = params.search.toLowerCase()
    result = result.filter(
      c =>
        c.company_name.toLowerCase().includes(q) ||
        c.short_name?.toLowerCase().includes(q) ||
        c.contact_person?.toLowerCase().includes(q)
    )
  }
  if (params?.status) {
    result = result.filter(c => c.status === params.status)
  }
  return result
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  return customers.find(c => c._id === id)
}

export async function createCustomer(data: Omit<Customer, '_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
  const now = new Date().toISOString()
  const customer: Customer = {
    ...data,
    _id: `c${Date.now()}`,
    created_at: now,
    updated_at: now,
  }
  customers.unshift(customer)
  return customer
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  const idx = customers.findIndex(c => c._id === id)
  if (idx === -1) throw new Error('Customer not found')
  customers[idx] = { ...customers[idx], ...data, updated_at: new Date().toISOString() }
  return customers[idx]
}
