import { useUserStore } from '@/store/user'
import router from '@/router'

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

export async function post<T = any>(url: string, data?: any): Promise<T> {
  const userStore = useUserStore()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (userStore.token) {
    headers['Authorization'] = `Bearer ${userStore.token}`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })

  if (res.status === 401) {
    userStore.logout()
    router.push('/login')
    throw new Error('登录已过期，请重新登录')
  }

  const json: ApiResponse<T> = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '请求失败')
  }
  return json.data
}

export async function upload(url: string, file: File): Promise<{ url: string }> {
  const userStore = useUserStore()
  const formData = new FormData()
  formData.append('file', file)

  const headers: Record<string, string> = {}
  if (userStore.token) {
    headers['Authorization'] = `Bearer ${userStore.token}`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })

  const json: ApiResponse<{ url: string }> = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '上传失败')
  }
  return json.data
}

export async function download(url: string, data?: any, filename?: string): Promise<void> {
  const userStore = useUserStore()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (userStore.token) {
    headers['Authorization'] = `Bearer ${userStore.token}`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })

  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename || 'export.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}
