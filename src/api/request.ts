import { useUserStore } from '@/store/user'
import router from '@/router'

interface ApiResponse<T = any> {
  code: number
  msg?: string
  message?: string  // 兼容后端返回 message 字段
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

  // 处理登录过期（业务状态码 10403）
  if (json.code === 10403) {
    userStore.logout()
    router.push('/login')
    throw new Error(json.message || json.msg || '登录已过期，请重新登录')
  }

  if (json.code !== 0) {
    throw new Error(json.message || json.msg || '请求失败')
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

  // 处理登录过期（业务状态码 10403）
  if (json.code === 10403) {
    userStore.logout()
    router.push('/login')
    throw new Error(json.message || json.msg || '登录已过期，请重新登录')
  }

  if (json.code !== 0) {
    throw new Error(json.message || json.msg || '上传失败')
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

  // 检查是否返回 JSON 错误（登录过期等）
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    const json: ApiResponse = await res.json()
    if (json.code === 10403) {
      userStore.logout()
      router.push('/login')
      throw new Error(json.message || json.msg || '登录已过期，请重新登录')
    }
    if (json.code !== 0) {
      throw new Error(json.message || json.msg || '下载失败')
    }
  }

  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename || 'export.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}
