import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Customer, Project, ProgressLog, LabelOrder } from '@/types'
import { CUSTOMER_STATUSES, STAGES, BIZ_TYPES, STAGE_COLORS } from '@/types'
import { getCustomer } from '@/api/customers'
import { getProjects } from '@/api/projects'
import { getCustomerLogs } from '@/api/progress-logs'
import { getCustomerLabelOrders, createLabelOrder, updateLabelOrder, deleteLabelOrder } from '@/api/label-orders'
import { getStaffName } from '@/api/staff'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ArrowLeft, Edit, FolderKanban, ShieldCheck, Plus, Download, Pencil, Trash2 } from 'lucide-react'
import { exportLabelOrders } from '@/lib/export'
export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [logs, setLogs] = useState<ProgressLog[]>([])
  const [labelOrders, setLabelOrders] = useState<LabelOrder[]>([])
  const [showLabelForm, setShowLabelForm] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [labelForm, setLabelForm] = useState({ unit_price: '', quantity: '', order_date: '', notes: '' })

  const loadLabelOrders = () => {
    if (id) getCustomerLabelOrders(id).then(setLabelOrders)
  }

  useEffect(() => {
    if (!id) return
    getCustomer(id).then(c => setCustomer(c ?? null))
    getProjects({ customer_id: id }).then(setProjects)
    getCustomerLogs(id).then(setLogs)
    loadLabelOrders()
  }, [id])

  const resetLabelForm = () => {
    setLabelForm({ unit_price: '', quantity: '', order_date: '', notes: '' })
    setShowLabelForm(false)
    setEditingOrderId(null)
  }

  const handleSaveLabelOrder = async () => {
    if (!id || !labelForm.unit_price || !labelForm.quantity || !labelForm.order_date) return
    const data = {
      customer_id: id,
      unit_price: parseFloat(labelForm.unit_price),
      quantity: parseInt(labelForm.quantity),
      order_date: labelForm.order_date,
      staff_id: 's1',
      notes: labelForm.notes || undefined,
    }
    if (editingOrderId) {
      await updateLabelOrder(editingOrderId, data)
    } else {
      await createLabelOrder(data)
    }
    resetLabelForm()
    loadLabelOrders()
  }

  const handleEditLabelOrder = (order: LabelOrder) => {
    setEditingOrderId(order._id)
    setLabelForm({
      unit_price: String(order.unit_price),
      quantity: String(order.quantity),
      order_date: order.order_date,
      notes: order.notes || '',
    })
    setShowLabelForm(true)
  }

  const handleDeleteLabelOrder = async (orderId: string) => {
    if (!confirm('确定删除这条记录？')) return
    await deleteLabelOrder(orderId)
    loadLabelOrders()
  }

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
            <div>
              <p className="text-muted-foreground text-xs">产品类别</p>
              <p>{customer.product_categories || '-'}</p>
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

      {/* Label Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />防伪标购买记录 ({labelOrders.length})
            </CardTitle>
            <div className="flex gap-2">
              {labelOrders.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => exportLabelOrders(labelOrders, customer.short_name || customer.company_name)}>
                  <Download className="h-4 w-4 mr-1" />导出
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => { resetLabelForm(); setShowLabelForm(true) }}>
                <Plus className="h-4 w-4 mr-1" />新增订单
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showLabelForm && (
            <div className="mb-4 p-3 bg-muted rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">单价（元/个）</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.50"
                    value={labelForm.unit_price}
                    onChange={e => setLabelForm(f => ({ ...f, unit_price: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">数量（个）</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={labelForm.quantity}
                    onChange={e => setLabelForm(f => ({ ...f, quantity: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">订单日期</label>
                  <Input
                    type="date"
                    value={labelForm.order_date}
                    onChange={e => setLabelForm(f => ({ ...f, order_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">备注</label>
                  <Input
                    placeholder="可选"
                    value={labelForm.notes}
                    onChange={e => setLabelForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>
              {labelForm.unit_price && labelForm.quantity && (
                <p className="text-sm font-medium">
                  总金额: ¥{(parseFloat(labelForm.unit_price || '0') * parseInt(labelForm.quantity || '0')).toFixed(2)}
                </p>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveLabelOrder} disabled={!labelForm.unit_price || !labelForm.quantity || !labelForm.order_date}>
                  {editingOrderId ? '更新' : '保存'}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetLabelForm}>
                  取消
                </Button>
              </div>
            </div>
          )}
          {labelOrders.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_0.8fr_0.8fr_1fr_1fr_auto] gap-2 text-xs text-muted-foreground font-medium px-3 py-1">
                <span>日期</span>
                <span className="text-right">单价</span>
                <span className="text-right">数量</span>
                <span className="text-right">金额</span>
                <span>经办人</span>
                <span className="w-14"></span>
              </div>
              {labelOrders.map(o => (
                <div key={o._id} className="grid grid-cols-[1fr_0.8fr_0.8fr_1fr_1fr_auto] gap-2 text-sm px-3 py-2 rounded-lg hover:bg-muted transition-colors items-center">
                  <span>{formatDate(o.order_date)}</span>
                  <span className="text-right">¥{o.unit_price}</span>
                  <span className="text-right">{o.quantity.toLocaleString()}</span>
                  <span className="text-right font-medium">¥{o.total_amount.toLocaleString()}</span>
                  <div>
                    <span>{getStaffName(o.staff_id)}</span>
                    {o.notes && <p className="text-xs text-muted-foreground">{o.notes}</p>}
                  </div>
                  <div className="flex gap-1 w-14 justify-end">
                    <button
                      onClick={() => handleEditLabelOrder(o)}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="编辑"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLabelOrder(o._id)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 px-3 flex justify-between text-sm font-medium">
                <span>合计</span>
                <span>
                  {labelOrders.reduce((s, o) => s + o.quantity, 0).toLocaleString()} 个 / ¥{labelOrders.reduce((s, o) => s + o.total_amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">暂无购买记录</p>
          )}
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
