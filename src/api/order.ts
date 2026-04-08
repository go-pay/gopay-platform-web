import { post, download } from './request'

// === 支付订单 ===
export interface PaymentOrder {
  id: number
  orderNo: string
  outTradeNo: string
  tradeNo: string
  merchantId: number
  merchantName: string
  amount: number
  channelType: string
  payMethod: string
  status: number
  subject: string
  clientIp: string
  notified: boolean
  remark: string
  ctime: string
  payTime: string
}

interface PageResult<T> { list: T[]; total: number }

export function getPaymentOrderList(data: { page: number; pageSize: number; orderNo?: string; merchantName?: string; status?: number; channelType?: string; date?: string }) {
  return post<PageResult<PaymentOrder>>('/gopay/v1/order/payment/list', data)
}

export function getPaymentOrderDetail(id: number) {
  return post<PaymentOrder>('/gopay/v1/order/payment/detail', { id })
}

export function closePaymentOrder(id: number) {
  return post('/gopay/v1/order/payment/close', { id })
}

export function refundPaymentOrder(data: { id: number; amount: number; reason: string }) {
  return post('/gopay/v1/order/payment/refund', data)
}

export function exportPaymentOrders(data: any, filename?: string) {
  return download('/gopay/v1/order/payment/export', data, filename || 'payment-orders.csv')
}

// === 退款订单 ===
export interface RefundOrder {
  id: number
  refundNo: string
  orderNo: string
  tradeRefundNo: string
  merchantName: string
  refundAmount: number
  orderAmount: number
  channelType: string
  status: number
  reason: string
  operator: string
  ctime: string
  finishTime: string
}

export function getRefundOrderList(data: { page: number; pageSize: number; refundNo?: string; orderNo?: string; status?: number; channelType?: string }) {
  return post<PageResult<RefundOrder>>('/gopay/v1/order/refund/list', data)
}

export function getRefundOrderDetail(id: number) {
  return post<RefundOrder>('/gopay/v1/order/refund/detail', { id })
}

// === 转账订单 ===
export interface TransferOrder {
  id: number
  transferNo: string
  tradeTransferNo: string
  merchantId: number
  merchantName: string
  amount: number
  channelType: string
  payeeType: string
  payeeAccount: string
  payeeName: string
  status: number
  remark: string
  ctime: string
  finishTime: string
}

export function getTransferOrderList(data: { page: number; pageSize: number; transferNo?: string; merchantName?: string; status?: number; channelType?: string }) {
  return post<PageResult<TransferOrder>>('/gopay/v1/order/transfer/list', data)
}

export function addTransferOrder(data: { merchantId: number; channelType: string; amount: number; payeeType: string; payeeAccount: string; payeeName: string; remark?: string }) {
  return post('/gopay/v1/order/transfer/add', data)
}

export function getTransferOrderDetail(id: number) {
  return post<TransferOrder>('/gopay/v1/order/transfer/detail', { id })
}
