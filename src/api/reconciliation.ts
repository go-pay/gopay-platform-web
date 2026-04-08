import { post, download } from './request'

export interface BillItem {
  id: number
  billDate: string
  channelType: string
  platformCount: number
  platformAmount: number
  channelCount: number
  channelAmount: number
  diffCount: number
  diffAmount: number
  status: number
  ctime: string
}

export interface DiffItem {
  id: number
  billDate: string
  orderNo: string
  channelType: string
  diffType: string
  platformAmount: number | null
  channelAmount: number | null
  diffAmount: number
  handleStatus: number
  handleRemark: string
  handler: string
}

interface PageResult<T> { list: T[]; total: number }

export function getBillList(data: { page: number; pageSize: number; date?: string; channelType?: string; status?: number }) {
  return post<PageResult<BillItem>>('/gopay/v1/recon/bill/list', data)
}

export function generateBill(data: { date: string; channelType: string }) {
  return post('/gopay/v1/recon/bill/generate', data)
}

export function reconcileBill(id: number) {
  return post('/gopay/v1/recon/bill/reconcile', { id })
}

export function getBillDetail(id: number) {
  return post<BillItem>('/gopay/v1/recon/bill/detail', { id })
}

export function getDiffList(data: { page: number; pageSize: number; billDate?: string; orderNo?: string; channelType?: string; diffType?: string; handleStatus?: number }) {
  return post<PageResult<DiffItem>>('/gopay/v1/recon/diff/list', data)
}

export function getDiffDetail(id: number) {
  return post<DiffItem>('/gopay/v1/recon/diff/detail', { id })
}

export function handleDiff(data: { id: number; action: 'resolve' | 'ignore'; remark?: string }) {
  return post('/gopay/v1/recon/diff/handle', data)
}

export function exportDiff(data: any, filename?: string) {
  return download('/gopay/v1/recon/diff/export', data, filename || 'diff-records.csv')
}
