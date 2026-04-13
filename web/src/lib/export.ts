import * as XLSX from 'xlsx'
import type { Customer, Contract, LabelOrder } from '@/types'
import { CUSTOMER_STATUSES, LICENSE_TYPES } from '@/types'
import { getStaffName } from '@/api/staff'
import { formatDate } from '@/lib/utils'

function download(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename)
}

export function exportCustomers(customers: Customer[]) {
  const rows = customers.map(c => ({
    '公司名': c.company_name,
    '简称': c.short_name || '',
    '联系人': c.contact_person || '',
    '电话': c.contact_phone || '',
    '地区': c.region || '',
    '行业': c.industry || '',
    '产品类别': c.product_categories || '',
    '状态': CUSTOMER_STATUSES[c.status],
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, '客户列表')
  download(wb, `客户列表_${formatDate(new Date().toISOString())}.xlsx`)
}

export function exportContracts(
  contracts: Contract[],
  customerMap: Record<string, Customer>,
) {
  const rows = contracts.map(ct => ({
    '客户名': customerMap[ct.customer_id]?.short_name || customerMap[ct.customer_id]?.company_name || '未知',
    '授权类型': LICENSE_TYPES[ct.license_type],
    '授权品类': ct.licensed_categories.join(', '),
    '版税率(%)': ct.royalty_rate ?? '',
    '合同金额': ct.contract_value ?? '',
    '生效日期': ct.start_date ? formatDate(ct.start_date) : '',
    '到期日期': ct.expiry_date ? formatDate(ct.expiry_date) : '',
    '状态': ct.is_active ? '生效中' : '已失效',
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, '合同列表')
  download(wb, `合同列表_${formatDate(new Date().toISOString())}.xlsx`)
}

export function exportLabelOrders(
  orders: LabelOrder[],
  customerName: string,
) {
  const rows = orders.map(o => ({
    '客户': customerName,
    '日期': formatDate(o.order_date),
    '单价(元)': o.unit_price,
    '数量(个)': o.quantity,
    '金额(元)': o.total_amount,
    '经办人': getStaffName(o.staff_id),
    '备注': o.notes || '',
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, '防伪标购买记录')
  download(wb, `防伪标_${customerName}_${formatDate(new Date().toISOString())}.xlsx`)
}
