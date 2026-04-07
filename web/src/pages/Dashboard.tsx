import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { STAGES, STAGE_COLORS, BIZ_TYPES, type PipelineStats, type ProgressLog, type Contract, type Stage } from '@/types'
import { getPipelineStats } from '@/api/projects'
import { getAllRecentLogs } from '@/api/progress-logs'
import { getExpiringContracts } from '@/api/contracts'
import { getStaffName } from '@/api/staff'
import { getCustomers } from '@/api/customers'
import { getProjects } from '@/api/projects'
import { relativeTime } from '@/lib/utils'
import { Plus, Users, FolderKanban, FileWarning, Clock } from 'lucide-react'

export default function Dashboard() {
  const [pipeline, setPipeline] = useState<PipelineStats[]>([])
  const [recentLogs, setRecentLogs] = useState<ProgressLog[]>([])
  const [expiringContracts, setExpiringContracts] = useState<Contract[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    getPipelineStats().then(setPipeline)
    getAllRecentLogs(8).then(setRecentLogs)
    getExpiringContracts(90).then(setExpiringContracts)
    getCustomers().then(c => setCustomerCount(c.length))
    getProjects().then(p => {
      setProjectCount(p.length)
      setTotalRevenue(p.reduce((sum, proj) => sum + (proj.est_revenue ?? 0), 0))
    })
  }, [])

  const maxCount = Math.max(...pipeline.map(p => p.count), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">首页看板</h1>
        <div className="flex gap-2">
          <Button size="sm" asChild>
            <Link to="/customers/new"><Plus className="h-4 w-4 mr-1" />新客户</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/projects/new"><Plus className="h-4 w-4 mr-1" />新项目</Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold">{customerCount}</p>
                <p className="text-xs text-muted-foreground">客户总数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600"><FolderKanban className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold">{projectCount}</p>
                <p className="text-xs text-muted-foreground">项目总数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600"><FileWarning className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold">{expiringContracts.length}</p>
                <p className="text-xs text-muted-foreground">即将到期合同</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <span className="text-base font-bold">¥</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRevenue}<span className="text-sm font-normal">万</span></p>
                <p className="text-xs text-muted-foreground">预估总销售额</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">项目 Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pipeline.map(p => (
                <Link
                  key={p.stage}
                  to={`/projects?stage=${p.stage}`}
                  className="flex items-center gap-3 group"
                >
                  <span className="w-16 text-xs text-muted-foreground shrink-0">{STAGES[p.stage]}</span>
                  <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md flex items-center px-2 text-xs font-medium text-white transition-all group-hover:opacity-80"
                      style={{
                        width: `${Math.max((p.count / maxCount) * 100, 8)}%`,
                        backgroundColor: STAGE_COLORS[p.stage as Stage],
                      }}
                    >
                      {p.count}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Biz type breakdown */}
            <div className="mt-6 flex gap-4 text-xs text-muted-foreground">
              {Object.entries(BIZ_TYPES).map(([key, label]) => (
                <Link key={key} to={`/projects?biz_type=${key}`} className="hover:text-foreground">
                  {label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />最近跟进
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.map(log => (
                <Link key={log._id} to={`/projects/${log.project_id}`} className="block group">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate group-hover:text-primary">{log.content}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{getStaffName(log.staff_id)}</span>
                        {log.stage_snapshot && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {STAGES[log.stage_snapshot]}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{relativeTime(log.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
