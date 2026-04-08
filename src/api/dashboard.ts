import { post } from './request'

export interface DashboardStats {
  todayAmount: number
  todayCount: number
  todaySuccessRate: number
  pendingApply: number
  pendingRefund: number
}

export interface RecentOrder {
  id: number
  orderNo: string
  merchantName: string
  amount: number
  channelType: string
  status: number
  ctime: string
}

export interface ChannelDistribution {
  alipay: number
  wechat: number
}

export interface TrendData {
  dates: string[]
  amounts: number[]
  counts: number[]
}

export function getDashboardStats() {
  return post<DashboardStats>('/gopay/v1/dashboard/stats')
}

export function getRecentOrders(data: { page: number; pageSize: number }) {
  return post<{ list: RecentOrder[]; total: number }>('/gopay/v1/dashboard/recentOrders', data)
}

export function getChannelDistribution() {
  return post<ChannelDistribution>('/gopay/v1/dashboard/channelDistribution')
}

export function getTrend() {
  return post<TrendData>('/gopay/v1/dashboard/trend')
}
