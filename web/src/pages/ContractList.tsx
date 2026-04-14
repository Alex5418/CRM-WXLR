import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Contract, Customer } from '@/types'
import { LICENSE_TYPES } from '@/types'
import { getContracts, updateContract } from '@/api/contracts'
import { getCustomers } from '@/api/customers'
import { formatDate } from '@/lib/utils'
import { FileText, AlertTriangle, Download, Upload, Eye, Trash2, Loader2, Paperclip } from 'lucide-react'
import { exportContracts } from '@/lib/export'
import { useAuth } from '@/context/auth'
import { canViewContract } from '@/lib/permission'
import { uploadFile, getFileURL, deleteFile } from '@/lib/cloudbase'

export default function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [customerMap, setCustomerMap] = useState<Record<string, Customer>>({})
  const { currentUser } = useAuth()
  const user = currentUser!
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetId = useRef<string>('')

  useEffect(() => {
    getContracts().then(setContracts)
    getCustomers().then(cs => {
      const map: Record<string, Customer> = {}
      cs.forEach(c => { map[c._id] = c })
      setCustomerMap(map)
    })
  }, [])

  const reload = () => getContracts().then(setContracts)

  const isExpiringSoon = (date?: string) => {
    if (!date) return false
    const diff = new Date(date).getTime() - new Date().getTime()
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000
  }

  const handleUploadClick = (contractId: string) => {
    uploadTargetId.current = contractId
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // reset so same file can be re-selected

    if (file.type !== 'application/pdf') {
      alert('只支持PDF文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB')
      return
    }

    const contractId = uploadTargetId.current
    const contract = contracts.find(c => c._id === contractId)
    if (!contract) return

    setUploadingId(contractId)
    try {
      const cloudPath = `contracts/${contractId}/${Date.now()}-${file.name}`
      const fileID = await uploadFile(file, cloudPath)
      const newFileUrls = [...(contract.file_urls || []), fileID]
      await updateContract(contractId, { file_urls: newFileUrls })
      await reload()
    } catch (err) {
      console.error('上传失败完整错误:', err)
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      alert('上传失败: ' + msg)
    } finally {
      setUploadingId(null)
    }
  }

  const handleView = async (fileID: string) => {
    try {
      const url = await getFileURL(fileID)
      window.open(url, '_blank')
    } catch {
      alert('获取文件链接失败')
    }
  }

  const handleDelete = async (contract: Contract, fileID: string) => {
    if (!confirm('确定删除这个文件？')) return

    try {
      await deleteFile(fileID)
      const newFileUrls = (contract.file_urls || []).filter(f => f !== fileID)
      await updateContract(contract._id, { file_urls: newFileUrls })
      await reload()
    } catch (err) {
      alert('删除失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  // Extract display name from fileID: "contracts/xxx/1234567890-合同.pdf" → "合同.pdf"
  const getFileName = (fileID: string) => {
    const parts = fileID.split('/')
    const last = parts[parts.length - 1]
    // Remove the timestamp prefix
    const dashIdx = last.indexOf('-')
    return dashIdx > 0 ? last.substring(dashIdx + 1) : last
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">合同管理</h1>
        <Button size="sm" variant="outline" onClick={() => exportContracts(contracts.filter(ct => canViewContract(user, ct)), customerMap)}>
          <Download className="h-4 w-4 mr-1" />导出
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="grid gap-3">
        {contracts.filter(ct => canViewContract(user, ct)).map(ct => {
          const customer = customerMap[ct.customer_id]
          const expiring = isExpiringSoon(ct.expiry_date)
          const files = ct.file_urls || []
          const isUploading = uploadingId === ct._id

          return (
            <Card key={ct._id} className={`${expiring ? 'border-amber-300' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <Link to={`/projects/${ct.project_id}`} className="min-w-0 flex-1">
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
                  </Link>
                  <div className="text-right shrink-0 ml-4 text-xs text-muted-foreground">
                    {ct.start_date && <p>生效: {formatDate(ct.start_date)}</p>}
                    {ct.expiry_date && <p className={expiring ? 'text-amber-600 font-medium' : ''}>到期: {formatDate(ct.expiry_date)}</p>}
                  </div>
                </div>

                {/* File attachments */}
                <div className="mt-3 pt-3 border-t flex items-center gap-2 flex-wrap">
                  {files.map(fileID => (
                    <div key={fileID} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs">
                      <Paperclip className="h-3 w-3 text-muted-foreground" />
                      <span className="max-w-[120px] truncate">{getFileName(fileID)}</span>
                      <button
                        onClick={() => handleView(fileID)}
                        className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-blue-600 transition-colors"
                        title="查看"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(ct, fileID)}
                        className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="删除"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleUploadClick(ct._id)}
                    disabled={isUploading}
                    className="flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {isUploading
                      ? <><Loader2 className="h-3 w-3 animate-spin" />上传中...</>
                      : <><Upload className="h-3 w-3" />上传PDF</>
                    }
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {contracts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">暂无合同数据</p>
        )}
      </div>
    </div>
  )
}
