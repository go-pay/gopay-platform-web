import { post } from './request'

export interface Merchant {
  id: number
  name: string
  contact: string
  phone: string
  email: string
  status: number
  remark: string
  ctime: string
}

interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export function getMerchantList(data: { page: number; pageSize: number; name?: string; contact?: string; status?: number }) {
  return post<PageResult<Merchant>>('/gopay/v1/merchant/list', data)
}

export function addMerchant(data: { name: string; contact: string; phone?: string; email?: string; remark?: string }) {
  return post<{ id: number }>('/gopay/v1/merchant/add', data)
}

export function updateMerchant(data: { id: number; name: string; contact: string; phone?: string; email?: string; remark?: string }) {
  return post('/gopay/v1/merchant/update', data)
}

export function toggleMerchantStatus(id: number) {
  return post('/gopay/v1/merchant/toggleStatus', { id })
}

export function getMerchantOptions() {
  return post<{ id: number; name: string }[]>('/gopay/v1/merchant/options')
}
