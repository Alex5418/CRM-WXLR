import type { LabelOrder } from '@/types'
import { API_MODE, apiGet, apiPost } from './client'
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
