import type { LabelOrder } from '@/types'
import { API_MODE, apiGet, apiPost, apiPut, apiDelete } from './client'
import { mockLabelOrders } from '@/mock/data'

let orders = [...mockLabelOrders]

export async function getCustomerLabelOrders(customerId: string): Promise<LabelOrder[]> {
  if (API_MODE === 'rest') {
    return apiGet<LabelOrder[]>('/label_orders', { customer_id: customerId })
  }
  return orders
    .filter(o => o.customer_id === customerId)
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
}

export async function createLabelOrder(
  data: Omit<LabelOrder, '_id' | 'created_at' | 'total_amount'>
): Promise<LabelOrder> {
  if (API_MODE === 'rest') {
    return apiPost<LabelOrder>('/label_orders', data)
  }
  const order: LabelOrder = {
    ...data,
    _id: `lo${Date.now()}`,
    total_amount: data.unit_price * data.quantity,
    created_at: new Date().toISOString(),
  }
  orders.unshift(order)
  return order
}

export async function updateLabelOrder(
  id: string,
  data: Partial<Omit<LabelOrder, '_id' | 'created_at' | 'total_amount'>>
): Promise<LabelOrder> {
  if (API_MODE === 'rest') {
    return apiPut<LabelOrder>(`/label_orders/${id}`, data)
  }
  const idx = orders.findIndex(o => o._id === id)
  if (idx === -1) throw new Error('订单不存在')
  const updated = { ...orders[idx], ...data, total_amount: (data.unit_price ?? orders[idx].unit_price) * (data.quantity ?? orders[idx].quantity) }
  orders[idx] = updated
  return updated
}

export async function deleteLabelOrder(id: string): Promise<void> {
  if (API_MODE === 'rest') {
    return apiDelete(`/label_orders/${id}`)
  }
  orders = orders.filter(o => o._id !== id)
}
