import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Project, Customer, ProgressLog, Contract } from '@/types'
import { STAGES, STAGE_ORDER, STAGE_COLORS, BIZ_TYPES, LICENSE_TYPES } from '@/types'
import { getProject, updateProjectStage } from '@/api/projects'
import { getCustomer } from '@/api/customers'
import { getProjectLogs, createLog } from '@/api/progress-logs'
import { getProjectContracts } from '@/api/contracts'
import { getStaffName } from '@/api/staff'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ArrowLeft, Edit, Plus, FileText } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [logs, setLogs] = useState<ProgressLog[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [newLog, setNewLog] = useState('')
  const [showLogForm, setShowLogForm] = useState(false)

  const load = async () => {
    if (!id) return
    const p = await getProject(id)
    if (!p) return
    setProject(p)
    getCustomer(p.customer_id).then(c => setCustomer(c ?? null))
    getProjectLogs(id).then(setLogs)
    getProjectContracts(id).then(setContracts)
  }

  useEffect(() => { load() }, [id])

  const handleStageChange = async (stage: typeof STAGE_ORDER[number]) => {
    if (!id || !project) return
    const updated = await updateProjectStage(id, stage)
    setProject(updated)
    await createLog({
      project_id: id,
      customer_id: project.customer_id,
      staff_id: 's1',
      content: `项目阶段变更: ${STAGES[project.stage]} → ${STAGES[stage]}`,
      stage_snapshot: stage,
    })
    getProjectLogs(id).then(setLogs)
  }

  const handleAddLog = async () => {
    if (!newLog.trim() || !id || !project) return
    await createLog({
      project_id: id,
      customer_id: project.customer_id,
      staff_id: 's1',
      content: newLog.trim(),
      stage_snapshot: project.stage,
    })
    setNewLog('')
    setShowLogForm(false)
    getProjectLogs(id).then(setLogs)
  }

  if (!project) return <p className="text-center py-8 text-muted-foreground">加载中...</p>

  const currentStageIdx = STAGE_ORDER.indexOf(project.stage)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/projects"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{project.product_category}</h1>
          <Link to={`/customers/${project.customer_id}`} className="text-sm text-muted-foreground hover:text-primary">
            {customer?.short_name || customer?.company_name || '加载中...'}
          </Link>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/projects/${id}/edit`}><Edit className="h-4 w-4 mr-1" />编辑</Link>
        </Button>
      </div>

      {/* Stage pipeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {STAGE_ORDER.map((stage, idx) => (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                className={`flex-1 min-w-0 py-2 px-1 text-center text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  idx <= currentStageIdx
                    ? 'text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                style={idx <= currentStageIdx ? { backgroundColor: STAGE_COLORS[project.stage] } : undefined}
              >
                <span className="hidden sm:inline">{STAGES[stage]}</span>
                <span className="sm:hidden">{STAGES[stage].slice(0, 2)}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">合作模式</p>
                  <Badge variant="secondary">{BIZ_TYPES[project.biz_type]}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">负责人</p>
                  <p>{getStaffName(project.owner_id)}</p>
                  {project.co_owners && project.co_owners.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      协作: {project.co_owners.map(getStaffName).join(', ')}
                    </p>
                  )}
                </div>
                {project.est_revenue != null && (
                  <div>
                    <p className="text-muted-foreground text-xs">预估销售额</p>
                    <p className="font-medium">¥{project.est_revenue}万</p>
                  </div>
                )}
                {project.priority && (
                  <div>
                    <p className="text-muted-foreground text-xs">优先级</p>
                    <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'}>
                      {project.priority === 'high' ? '高' : project.priority === 'medium' ? '中' : '低'}
                    </Badge>
                  </div>
                )}
                {project.notes && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">备注</p>
                    <p>{project.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">跟进记录</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowLogForm(!showLogForm)}>
                  <Plus className="h-4 w-4 mr-1" />添加记录
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showLogForm && (
                <div className="mb-4 space-y-2 p-3 bg-muted rounded-lg">
                  <Textarea
                    value={newLog}
                    onChange={e => setNewLog(e.target.value)}
                    placeholder="记录跟进内容..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddLog} disabled={!newLog.trim()}>保存</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowLogForm(false); setNewLog('') }}>取消</Button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {logs.map((log, idx) => (
                  <div key={log._id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      {idx < logs.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-sm">{log.content}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>{getStaffName(log.staff_id)}</span>
                        {log.stage_snapshot && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{STAGES[log.stage_snapshot]}</Badge>
                        )}
                        <span>{formatDateTime(log.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">暂无跟进记录</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts sidebar */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />合同信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contracts.length > 0 ? contracts.map(ct => (
                <div key={ct._id} className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={ct.is_active ? 'default' : 'secondary'}>
                      {ct.is_active ? '生效中' : '已失效'}
                    </Badge>
                    <span>{LICENSE_TYPES[ct.license_type]}</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>授权类目: {ct.licensed_categories.join(', ')}</p>
                    {ct.sign_date && <p>签约日期: {formatDate(ct.sign_date)}</p>}
                    {ct.expiry_date && <p>到期日期: {formatDate(ct.expiry_date)}</p>}
                    {ct.royalty_rate != null && <p>版税费率: {ct.royalty_rate}%</p>}
                    {ct.contract_value != null && <p>合同金额: ¥{ct.contract_value}万</p>}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">暂无合同</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
