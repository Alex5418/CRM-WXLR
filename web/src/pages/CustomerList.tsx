import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import type { Customer } from '@/types'
import { CUSTOMER_STATUSES } from '@/types'
import { getCustomers } from '@/api/customers'
import { getProjects } from '@/api/projects'
import { Plus, Search } from 'lucide-react'

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    getCustomers({ search, status: statusFilter || undefined }).then(setCustomers)
  }, [search, statusFilter])

  useEffect(() => {
    getProjects().then(projects => {
      const counts: Record<string, number> = {}
      projects.forEach(p => { counts[p.customer_id] = (counts[p.customer_id] || 0) + 1 })
      setProjectCounts(counts)
    })
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">客户管理</h1>
        <Button size="sm" asChild>
          <Link to="/customers/new"><Plus className="h-4 w-4 mr-1" />新建客户</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索公司名、联系人..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full sm:w-40">
          <option value="">全部状态</option>
          {Object.entries(CUSTOMER_STATUSES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </div>

      <div className="grid gap-3">
        {customers.map(c => (
          <Link key={c._id} to={`/customers/${c._id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{c.short_name || c.company_name}</h3>
                      <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                        {CUSTOMER_STATUSES[c.status]}
                      </Badge>
                    </div>
                    {c.short_name && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.company_name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {c.contact_person && <span>{c.contact_person}</span>}
                      {c.region && <span>{c.region}</span>}
                      {c.industry && <span>{c.industry}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-medium">{projectCounts[c._id] || 0}</p>
                    <p className="text-xs text-muted-foreground">项目</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {customers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">暂无客户数据</p>
        )}
      </div>
    </div>
  )
}
