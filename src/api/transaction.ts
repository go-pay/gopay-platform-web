import { post } from './request'

export interface FlowItem {
  id: number
  flowNo: string
  orderNo: string
  type: string
  merchantName: string
  amount: number
  channelType: string
  channelFlowNo: string
  direction: string
  status: number
  remark: string
  ctime: string
}

export interface FlowStats {
  incomeTotal: number
  expenseTotal: number
  totalCount: number
}

export interface CallbackItem {
  id: number
  orderNo: string
  type: string
  channelType: string
  direction: string
  notifyUrl: string
  status: number
  httpStatus: number
  retryCount: number
  maxRetry: number
  requestBody: string
  responseBody: string
  ctime: string
}

interface PageResult<T> { list: T[]; total: number }

export function getFlowList(data: { page: number; pageSize: number; flowNo?: string; orderNo?: string; type?: string; channelType?: string; date?: string }) {
  return post<PageResult<FlowItem>>('/gopay/v1/transaction/flow/list', data)
}

export function getFlowStats() {
  return post<FlowStats>('/gopay/v1/transaction/flow/stats')
}

export function getFlowDetail(id: number) {
  return post<FlowItem>('/gopay/v1/transaction/flow/detail', { id })
}

export function getCallbackList(data: { page: number; pageSize: number; orderNo?: string; type?: string; status?: number; channelType?: string }) {
  return post<PageResult<CallbackItem>>('/gopay/v1/transaction/callback/list', data)
}

export function getCallbackDetail(id: number) {
  return post<CallbackItem>('/gopay/v1/transaction/callback/detail', { id })
}

export function retryCallback(id: number) {
  return post('/gopay/v1/transaction/callback/retry', { id })
}
