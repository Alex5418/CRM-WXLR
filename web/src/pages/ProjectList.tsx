import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import type { Project, Customer, Stage } from '@/types'
import { STAGES, STAGE_ORDER, STAGE_COLORS, BIZ_TYPES } from '@/types'
import { getProjects } from '@/api/projects'
import { getCustomers } from '@/api/customers'
import { getStaffName } from '@/api/staff'
import { getStaffList } from '@/api/staff'
import { Plus, LayoutGrid, List } from 'lucide-react'

type ViewMode = 'kanban' | 'list'

export default function ProjectList() {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [customerMap, setCustomerMap] = useState<Record<string, Customer>>({})
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || '')
  const [bizFilter, setBizFilter] = useState(searchParams.get('biz_type') || '')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [staffList, setStaffList] = useState<{ _id: string; name: string }[]>([])

  useEffect(() => {
    getCustomers().then(customers => {
      const map: Record<string, Customer> = {}
      customers.forEach(c => { map[c._id] = c })
      setCustomerMap(map)
    })
    getStaffList().then(setStaffList)
  }, [])

  useEffect(() => {
    getProjects({
      stage: (stageFilter || undefined) as Stage | undefined,
      biz_type: bizFilter || undefined,
      owner_id: ownerFilter || undefined,
    }).then(setProjects)
  }, [stageFilter, bizFilter, ownerFilter])

  const ProjectCard = ({ p }: { p: Project }) => (
    <Link to={`/projects/${p._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-3">
          <p className="text-sm font-medium truncate">
            {customerMap[p.customer_id]?.short_name || customerMap[p.customer_id]?.company_name || '未知客户'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.product_category}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="secondary" className="text-[10px]">{BIZ_TYPES[p.biz_type]}</Badge>
            <span className="text-xs text-muted-foreground">{getStaffName(p.owner_id)}</span>
          </div>
          {p.est_revenue != null && (
            <p className="text-xs text-muted-foreground mt-1">预估 ¥{p.est_revenue}万</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">项目管理</h1>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <button
              className={`p-2 ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button size="sm" asChild>
            <Link to="/projects/new"><Plus className="h-4 w-4 mr-1" />新项目</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="w-32">
          <option value="">全部阶段</option>
          {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select value={bizFilter} onChange={e => setBizFilter(e.target.value)} className="w-32">
          <option value="">全部类型</option>
          {Object.entries(BIZ_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="w-32">
          <option value="">全部负责人</option>
          {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </Select>
      </div>

      {/* Kanban view */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGE_ORDER.map(stage => {
            const stageProjects = projects.filter(p => p.stage === stage)
            return (
              <div key={stage} className="flex-shrink-0 w-64">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] }} />
                  <span className="text-sm font-medium">{STAGES[stage]}</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{stageProjects.length}</Badge>
                </div>
                <div className="space-y-2">
                  {stageProjects.map(p => <ProjectCard key={p._id} p={p} />)}
                  {stageProjects.length === 0 && (
                    <div className="border border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                      暂无项目
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view */
        <div className="space-y-2">
          {projects.map(p => (
            <Link key={p._id} to={`/projects/${p._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium truncate">
                          {customerMap[p.customer_id]?.short_name || '未知客户'}
                        </h3>
                        <span className="text-sm text-muted-foreground">- {p.product_category}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{BIZ_TYPES[p.biz_type]}</Badge>
                        <span className="text-xs text-muted-foreground">{getStaffName(p.owner_id)}</span>
                        {p.est_revenue != null && (
                          <span className="text-xs text-muted-foreground">¥{p.est_revenue}万</span>
                        )}
                      </div>
                    </div>
                    <Badge className="text-[10px] text-white shrink-0" style={{ backgroundColor: STAGE_COLORS[p.stage] }}>
                      {STAGES[p.stage]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
