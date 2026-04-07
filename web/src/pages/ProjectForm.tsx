import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import type { BizType, Stage } from '@/types'
import { BIZ_TYPES, STAGES } from '@/types'
import { getProject, createProject, updateProject } from '@/api/projects'
import { getCustomers } from '@/api/customers'
import { getStaffList } from '@/api/staff'
import { ArrowLeft } from 'lucide-react'

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [customers, setCustomers] = useState<{ _id: string; label: string }[]>([])
  const [staffList, setStaffList] = useState<{ _id: string; name: string }[]>([])

  const [form, setForm] = useState({
    customer_id: searchParams.get('customer_id') || '',
    biz_type: 'fama' as BizType,
    product_category: '',
    stage: 'lead' as Stage,
    owner_id: '',
    est_revenue: '',
    priority: '' as string,
    notes: '',
  })

  useEffect(() => {
    getCustomers().then(cs =>
      setCustomers(cs.map(c => ({ _id: c._id, label: c.short_name || c.company_name })))
    )
    getStaffList().then(setStaffList)
  }, [])

  useEffect(() => {
    if (id) {
      getProject(id).then(p => {
        if (p) setForm({
          customer_id: p.customer_id,
          biz_type: p.biz_type,
          product_category: p.product_category,
          stage: p.stage,
          owner_id: p.owner_id,
          est_revenue: p.est_revenue?.toString() || '',
          priority: p.priority || '',
          notes: p.notes || '',
        })
      })
    }
  }, [id])

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      customer_id: form.customer_id,
      biz_type: form.biz_type,
      product_category: form.product_category,
      stage: form.stage,
      owner_id: form.owner_id,
      est_revenue: form.est_revenue ? Number(form.est_revenue) : undefined,
      priority: (form.priority || undefined) as 'high' | 'medium' | 'low' | undefined,
      notes: form.notes || undefined,
    }
    if (isEdit) {
      await updateProject(id!, data)
      navigate(`/projects/${id}`)
    } else {
      const p = await createProject(data)
      navigate(`/projects/${p._id}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEdit ? '编辑项目' : '新建项目'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">项目信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">关联客户 *</label>
                <Select value={form.customer_id} onChange={e => set('customer_id', e.target.value)} required>
                  <option value="">请选择客户</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.label}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">合作模式 *</label>
                <Select value={form.biz_type} onChange={e => set('biz_type', e.target.value)} required>
                  {Object.entries(BIZ_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">产品类目 *</label>
                <Input value={form.product_category} onChange={e => set('product_category', e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium">项目阶段</label>
                <Select value={form.stage} onChange={e => set('stage', e.target.value)}>
                  {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">负责人 *</label>
                <Select value={form.owner_id} onChange={e => set('owner_id', e.target.value)} required>
                  <option value="">请选择</option>
                  {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">预估销售额（万元）</label>
                <Input type="number" value={form.est_revenue} onChange={e => set('est_revenue', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">优先级</label>
                <Select value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="">未设置</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">备注</label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{isEdit ? '保存' : '创建'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>取消</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
