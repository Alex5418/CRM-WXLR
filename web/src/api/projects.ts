import type { Project, Stage, PipelineStats } from '@/types'
import { STAGE_ORDER } from '@/types'
import { API_MODE, apiGet, apiPost, apiPut } from './client'
import { mockProjects } from '@/mock/data'

let projects = [...mockProjects]

export async function getProjects(params?: {
  stage?: Stage
  biz_type?: string
  owner_id?: string
  customer_id?: string
}): Promise<Project[]> {
  if (API_MODE === 'rest') {
    return apiGet<Project[]>('/projects', params as Record<string, string>)
  }
  let result = [...projects]
  if (params?.stage) result = result.filter(p => p.stage === params.stage)
  if (params?.biz_type) result = result.filter(p => p.biz_type === params.biz_type)
  if (params?.owner_id) result = result.filter(p => p.owner_id === params.owner_id || p.co_owners?.includes(params.owner_id!))
  if (params?.customer_id) result = result.filter(p => p.customer_id === params.customer_id)
  return result
}

export async function getProject(id: string): Promise<Project | undefined> {
  if (API_MODE === 'rest') {
    return apiGet<Project>(`/projects/${id}`) || undefined
  }
  return projects.find(p => p._id === id)
}

export async function createProject(data: Omit<Project, '_id' | 'created_at' | 'updated_at'>): Promise<Project> {
  if (API_MODE === 'rest') {
    return apiPost<Project>('/projects', data)
  }
  const now = new Date().toISOString()
  const project: Project = {
    ...data,
    _id: `p${Date.now()}`,
    created_at: now,
    updated_at: now,
  }
  projects.unshift(project)
  return project
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  if (API_MODE === 'rest') {
    return apiPut<Project>(`/projects/${id}`, data)
  }
  const idx = projects.findIndex(p => p._id === id)
  if (idx === -1) throw new Error('Project not found')
  projects[idx] = { ...projects[idx], ...data, updated_at: new Date().toISOString() }
  return projects[idx]
}

export async function updateProjectStage(id: string, stage: Stage): Promise<Project> {
  return updateProject(id, { stage })
}

export async function getPipelineStats(): Promise<PipelineStats[]> {
  if (API_MODE === 'rest') {
    const allProjects = await apiGet<Project[]>('/projects')
    return STAGE_ORDER.map(stage => ({
      stage,
      count: allProjects.filter(p => p.stage === stage).length,
    }))
  }
  return STAGE_ORDER.map(stage => ({
    stage,
    count: projects.filter(p => p.stage === stage).length,
  }))
}
