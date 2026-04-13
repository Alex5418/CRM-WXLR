import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CUSTOMER_STATUSES, CUSTOMER_SOURCES, type CustomerStatus } from '@/types'
import { getCustomer, createCustomer, updateCustomer } from '@/api/customers'
import { ArrowLeft } from 'lucide-react'

export default function CustomerForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    company_name: '',
    short_name: '',
    contact_person: '',
    contact_phone: '',
    contact_wechat: '',
    region: '',
    industry: '',
    product_categories: '',
    source: '',
    status: 'active' as CustomerStatus,
  })

  useEffect(() => {
    if (id) {
      getCustomer(id).then(c => {
        if (c) setForm({
          company_name: c.company_name,
          short_name: c.short_name || '',
          contact_person: c.contact_person || '',
          contact_phone: c.contact_phone || '',
          contact_wechat: c.contact_wechat || '',
          region: c.region || '',
          industry: c.industry || '',
          product_categories: c.product_categories || '',
          source: c.source || '',
          status: c.status,
        })
      })
    }
  }, [id])

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit) {
      await updateCustomer(id!, form)
      navigate(`/customers/${id}`)
    } else {
      const c = await createCustomer({ ...form, created_by: 's1' })
      navigate(`/customers/${c._id}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEdit ? '编辑客户' : '新建客户'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">公司名称 *</label>
                <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium">简称</label>
                <Input value={form.short_name} onChange={e => set('short_name', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">联系人</label>
                <Input value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">联系电话</label>
                <Input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">微信号</label>
                <Input value={form.contact_wechat} onChange={e => set('contact_wechat', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">地区</label>
                <Input value={form.region} onChange={e => set('region', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">行业</label>
                <Input value={form.industry} onChange={e => set('industry', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">产品类别</label>
                <Input value={form.product_categories} onChange={e => set('product_categories', e.target.value)} placeholder='例如：毛绒玩具、家具家居等' />
              </div>
              <div>
                <label className="text-sm font-medium">客户来源</label>
                <Select value={form.source} onChange={e => set('source', e.target.value)}>
                  <option value="">请选择</option>
                  {Object.entries(CUSTOMER_SOURCES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">状态</label>
                <Select value={form.status} onChange={e => set('status', e.target.value)}>
                  {Object.entries(CUSTOMER_STATUSES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </div>
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
