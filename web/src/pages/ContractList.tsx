import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Contract, Customer } from '@/types'
import { LICENSE_TYPES } from '@/types'
import { getContracts } from '@/api/contracts'
import { getCustomers } from '@/api/customers'
import { formatDate } from '@/lib/utils'
import { FileText, AlertTriangle, Download } from 'lucide-react'
import { exportContracts } from '@/lib/export'
import {useAuth} from '@/context/auth'
import { canViewContract } from '@/lib/permission'

export default function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [customerMap, setCustomerMap] = useState<Record<string, Customer>>({})
  const { currentUser } = useAuth()

  useEffect(() => {
    getContracts().then(setContracts)
    getCustomers().then(cs => {
      const map: Record<string, Customer> = {}
      cs.forEach(c => { map[c._id] = c })
      setCustomerMap(map)
    })
  }, [])

  const isExpiringSoon = (date?: string) => {
    if (!date) return false
    const diff = new Date(date).getTime() - new Date().getTime()
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">合同管理</h1>
        <Button size="sm" variant="outline" onClick={() => exportContracts(contracts.filter(ct => canViewContract(currentUser, ct)), customerMap)}>
          <Download className="h-4 w-4 mr-1" />导出
        </Button>
      </div>
      <div className="grid gap-3">
        {contracts.filter(ct => canViewContract(currentUser, ct)).map(ct => {
          const customer = customerMap[ct.customer_id]
          const expiring = isExpiringSoon(ct.expiry_date)
          return (
            <Link key={ct._id} to={`/projects/${ct.project_id}`}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${expiring ? 'border-amber-300' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <h3 className="text-sm font-medium truncate">
                          {customer?.short_name || customer?.company_name || '未知客户'}
                        </h3>
                        <Badge variant={ct.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {ct.is_active ? '生效中' : '已失效'}
                        </Badge>
                        {expiring && (
                          <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />即将到期
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>{LICENSE_TYPES[ct.license_type]}</span>
                        <span>{ct.licensed_categories.join(', ')}</span>
                        {ct.royalty_rate != null && <span>版税 {ct.royalty_rate}%</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4 text-xs text-muted-foreground">
                      {ct.start_date && <p>生效: {formatDate(ct.start_date)}</p>}
                      {ct.expiry_date && <p className={expiring ? 'text-amber-600 font-medium' : ''}>到期: {formatDate(ct.expiry_date)}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {contracts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">暂无合同数据</p>
        )}
      </div>
    </div>
  )
}
