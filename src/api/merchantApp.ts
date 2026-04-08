import { post } from './request'

export interface MerchantApp {
  id: number
  name: string
  appid: string
  merchantId: number
  merchantName: string
  platformType: number
  merchantType: number
  status: number
  notifyUrl: string
  returnUrl: string
  ctime: string
}

interface PageResult<T> {
  list: T[]
  total: number
}

export function getMerchantAppList(data: { page: number; pageSize: number; name?: string; appid?: string; platformType?: number; merchantId?: number }) {
  return post<PageResult<MerchantApp>>('/gopay/v1/merchant/app/list', data)
}

export function addMerchantApp(data: { name: string; appid: string; merchantId: number; platformType: number; merchantType?: number; notifyUrl?: string; returnUrl?: string }) {
  return post<{ id: number }>('/gopay/v1/merchant/app/add', data)
}

export function updateMerchantApp(data: { id: number; name: string; merchantId: number; platformType: number; merchantType?: number; notifyUrl?: string; returnUrl?: string }) {
  return post('/gopay/v1/merchant/app/update', data)
}
