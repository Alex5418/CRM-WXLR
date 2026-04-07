import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Customer, Project, ProgressLog } from '@/types'
import { CUSTOMER_STATUSES, STAGES, BIZ_TYPES, STAGE_COLORS } from '@/types'
import { getCustomer } from '@/api/customers'
import { getProjects } from '@/api/projects'
import { getCustomerLogs } from '@/api/progress-logs'
import { getStaffName } from '@/api/staff'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, Edit, FolderKanban } from 'lucide-react'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [logs, setLogs] = useState<ProgressLog[]>([])

  useEffect(() => {
    if (!id) return
    getCustomer(id).then(c => setCustomer(c ?? null))
    getProjects({ customer_id: id }).then(setProjects)
    getCustomerLogs(id).then(setLogs)
  }, [id])

  if (!customer) return <p className="text-center py-8 text-muted-foreground">加载中...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/customers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{customer.short_name || customer.company_name}</h1>
          {customer.short_name && (
            <p className="text-sm text-muted-foreground truncate">{customer.company_name}</p>
          )}
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/customers/${id}/edit`}><Edit className="h-4 w-4 mr-1" />编辑</Link>
        </Button>
      </div>

      {/* Basic info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">状态</p>
              <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                {CUSTOMER_STATUSES[customer.status]}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">联系人</p>
              <p>{customer.contact_person || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">地区</p>
              <p>{customer.region || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">行业</p>
              <p>{customer.industry || '-'}</p>
            </div>
            {customer.contact_phone && (
              <div>
                <p className="text-muted-foreground text-xs">电话</p>
                <p>{customer.contact_phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />关联项目 ({projects.length})
            </CardTitle>
            <Button size="sm" variant="outline" asChild>
              <Link to={`/projects/new?customer_id=${id}`}>+ 新项目</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {projects.map(p => (
              <Link key={p._id} to={`/projects/${p._id}`} className="block">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="text-sm font-medium">{p.product_category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{BIZ_TYPES[p.biz_type]}</Badge>
                      <span className="text-xs text-muted-foreground">{getStaffName(p.owner_id)}</span>
                    </div>
                  </div>
                  <Badge
                    className="text-[10px] text-white"
                    style={{ backgroundColor: STAGE_COLORS[p.stage] }}
                  >
                    {STAGES[p.stage]}
                  </Badge>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">暂无关联项目</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">跟进记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(0, 5).map(log => (
                <div key={log._id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="w-px flex-1 bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm">{log.content}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{getStaffName(log.staff_id)}</span>
                      <span>{formatDateTime(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
