import { post } from './request'

export interface ChannelItem {
  id: number
  name: string
  code: string
  type: 'alipay' | 'wechat'
  merchantId: number
  merchantName: string
  payMethods: string[]
  feeRate: number
  status: number
  remark: string
  ctime: string
  config?: Record<string, any>
}

interface PageResult<T> {
  list: T[]
  total: number
}

export function getChannelList(data: { page: number; pageSize: number; name?: string; code?: string; type?: string; status?: number }) {
  return post<PageResult<ChannelItem>>('/gopay/v1/payment/channel/list', data)
}

export function addChannel(data: { name: string; code: string; type: string; merchantId: number; payMethods: string[]; feeRate: number; remark?: string }) {
  return post<{ id: number }>('/gopay/v1/payment/channel/add', data)
}

export function updateChannel(data: { id: number; name: string; type: string; merchantId: number; payMethods: string[]; feeRate: number; remark?: string }) {
  return post('/gopay/v1/payment/channel/update', data)
}

export function toggleChannelStatus(id: number) {
  return post('/gopay/v1/payment/channel/toggleStatus', { id })
}

export function getChannelDetail(id: number) {
  return post<ChannelItem>('/gopay/v1/payment/channel/detail', { id })
}

export function saveChannelConfig(data: { channelId: number; [key: string]: any }) {
  return post('/gopay/v1/payment/channel/config', data)
}
