import { post, upload } from './request'

export interface ApplyItem {
  id: number
  applyNo: string
  merchantId: number
  merchantName: string
  channelType: string
  merchantNo: string
  licenseNo: string
  legalPerson: string
  phone: string
  status: number
  remark: string
  ctime: string
}

export interface RecordItem extends ApplyItem {
  reviewer: string
  reviewRemark: string
  reviewTime: string
}

interface PageResult<T> { list: T[]; total: number }

export function getApplyList(data: { page: number; pageSize: number; merchantName?: string; status?: number; channelType?: string }) {
  return post<PageResult<ApplyItem>>('/gopay/v1/incoming/apply/list', data)
}

export function addApply(data: {
  merchantId: number; channelType: string; merchantNo?: string; licenseNo: string;
  licenseImg?: string; legalPerson: string; idCardFront?: string; idCardBack?: string;
  phone: string; remark?: string; submit: boolean
}) {
  return post('/gopay/v1/incoming/apply/add', data)
}

export function submitApply(id: number) {
  return post('/gopay/v1/incoming/apply/submit', { id })
}

export function reviewApply(data: { id: number; action: 'pass' | 'reject'; remark?: string }) {
  return post('/gopay/v1/incoming/apply/review', data)
}

export function getRecordList(data: { page: number; pageSize: number; merchantName?: string; channelType?: string; status?: number; reviewDate?: string }) {
  return post<PageResult<RecordItem>>('/gopay/v1/incoming/record/list', data)
}

export function getRecordDetail(id: number) {
  return post<RecordItem>('/gopay/v1/incoming/record/detail', { id })
}

export function uploadImage(file: File) {
  return upload('/gopay/v1/upload/image', file)
}
