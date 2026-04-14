import { apiPost } from '@/api/client'

export async function uploadFile(file: File, cloudPath: string): Promise<string> {
  // 1. Get presigned upload URL from cloud function
  const { uploadURL, fileID } = await apiPost<{ uploadURL: string; fileID: string }>(
    '/files/presign', { cloudPath }
  )

  // 2. Upload file directly to COS via presigned URL
  const res = await fetch(uploadURL, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  })
  if (!res.ok) throw new Error(`上传失败: ${res.status}`)

  return fileID
}

export async function getFileURL(fileID: string): Promise<string> {
  const res = await apiPost<{ fileList: { fileID: string; tempFileURL: string }[] }>(
    '/files/url', { fileList: [fileID] }
  )
  return res.fileList[0].tempFileURL
}

export async function deleteFile(fileID: string): Promise<void> {
  await apiPost('/files/delete', { fileList: [fileID] })
}
