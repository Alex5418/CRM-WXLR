// API client abstraction — switch between mock and real backend here
// Set to 'mock' for local development, 'cloudbase' or 'rest' for production
const API_MODE: 'mock' | 'rest' = 'mock'

// For future REST backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export async function apiGet<T>(path: string, _params?: Record<string, string>): Promise<T> {
  if (API_MODE === 'mock') {
    // Mock mode: handled by individual api modules
    throw new Error(`Mock handler not found for GET ${path}`)
  }
  const url = new URL(`${BASE_URL}${path}`)
  if (_params) Object.entries(_params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  if (API_MODE === 'mock') {
    throw new Error(`Mock handler not found for POST ${path}`)
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  if (API_MODE === 'mock') {
    throw new Error(`Mock handler not found for PUT ${path}`)
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export { API_MODE }
