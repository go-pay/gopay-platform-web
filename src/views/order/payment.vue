<template>
  <div class="page">
    <!-- 搜索栏 -->
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">订单号</label>
            <input v-model="searchForm.orderNo" type="text" class="field-input" placeholder="请输入订单号" />
          </div>
          <div class="field-group">
            <label class="field-label">商户名称</label>
            <input v-model="searchForm.merchantName" type="text" class="field-input" placeholder="请输入商户名称" />
          </div>
          <div class="field-group">
            <label class="field-label">支付状态</label>
            <select v-model="searchForm.status" class="field-select">
              <option value="">全部</option>
              <option value="0">待支付</option>
              <option value="1">支付成功</option>
              <option value="2">支付失败</option>
              <option value="3">已关闭</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">通道类型</label>
            <select v-model="searchForm.channelType" class="field-select">
              <option value="">全部</option>
              <option value="alipay">支付宝</option>
              <option value="wechat">微信支付</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">创建时间</label>
            <input v-model="searchForm.date" type="date" class="field-input" />
          </div>
        </div>
        <div class="search-actions">
          <button class="btn btn-primary" @click="handleSearch">
            <span class="mdi mdi-magnify btn-icon"></span>查询
          </button>
          <button class="btn btn-outlined" @click="handleReset">重置</button>
        </div>
      </div>
    </v-card>

    <!-- 表格区 -->
    <v-card rounded="lg" flat class="table-card">
      <div class="table-header">
        <div class="table-title">支付订单</div>
        <div class="table-header-actions">
          <button class="btn btn-outlined" @click="handleExport">
            <span class="mdi mdi-download btn-icon"></span>导出
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 160px">订单号</th>
              <th style="width: 140px">商户订单号</th>
              <th style="width: 120px">商户名称</th>
              <th style="width: 100px">金额(元)</th>
              <th style="width: 120px">通道类型</th>
              <th style="width: 100px">支付方式</th>
              <th style="width: 115px">状态</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 160px">支付时间</th>
              <th style="width: 100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="loading-cell">加载中...</td>
            </tr>
            <tr v-else-if="orders.length === 0">
              <td colspan="10" class="empty-cell">暂无数据</td>
            </tr>
            <tr v-for="item in orders" :key="item.id">
              <td><code class="code-text">{{ item.orderNo }}</code></td>
              <td><code class="code-text">{{ item.outTradeNo }}</code></td>
              <td>{{ item.merchantName }}</td>
              <td class="font-medium">¥{{ formatAmount(item.amount) }}</td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </td>
              <td>{{ payMethodLabel(item.payMethod) }}</td>
              <td>
                <span :class="['chip', statusChipClass(item.status)]">{{ statusLabel(item.status) }}</span>
              </td>
              <td class="text-grey">{{ formatTimestamp(item.ctime) }}</td>
              <td class="text-grey">{{ formatTimestamp(item.payTime) }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="查看详情" @click="openDetail(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.status === 0" icon variant="text" size="x-small" title="关闭订单" @click="handleClose(item)">
                  <v-icon size="18" color="#EF4444">mdi-close-circle-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.status === 1" icon variant="text" size="x-small" title="发起退款" @click="openRefund(item)">
                  <v-icon size="18" color="#F59E0B">mdi-cash-refund</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span class="table-summary">共 <strong>{{ total }}</strong> 条记录</span>
        <div class="pagination">
          <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
          <span class="page-info">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
          <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
        </div>
      </div>
    </v-card>

    <!-- 详情弹窗 -->
    <v-dialog v-model="showDetail" max-width="600">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">订单详情</span>
          <v-btn icon variant="text" size="small" @click="showDetail = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body" v-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">订单信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">订单号</span><code class="code-text">{{ detailItem.orderNo }}</code></div>
              <div class="detail-item"><span class="detail-label">商户订单号</span><code class="code-text">{{ detailItem.outTradeNo }}</code></div>
              <div class="detail-item"><span class="detail-label">商户名称</span><span>{{ detailItem.merchantName }}</span></div>
              <div class="detail-item"><span class="detail-label">订单金额</span><span class="amount-text">¥{{ formatAmount(detailItem.amount) }}</span></div>
              <div class="detail-item">
                <span class="detail-label">支付状态</span>
                <span :class="['chip', statusChipClass(detailItem.status)]">{{ statusLabel(detailItem.status) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">通道类型</span>
                <span :class="['chip', detailItem.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ detailItem.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </div>
              <div class="detail-item"><span class="detail-label">支付方式</span><span>{{ payMethodLabel(detailItem.payMethod) }}</span></div>
              <div class="detail-item"><span class="detail-label">通道订单号</span><code class="code-text">{{ detailItem.tradeNo || '-' }}</code></div>
              <div class="detail-item"><span class="detail-label">创建时间</span><span>{{ formatTimestamp(detailItem.ctime) }}</span></div>
              <div class="detail-item"><span class="detail-label">支付时间</span><span>{{ formatTimestamp(detailItem.payTime) }}</span></div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-title">附加信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">商品描述</span><span>{{ detailItem.subject || '-' }}</span></div>
              <div class="detail-item"><span class="detail-label">回调通知</span><span>{{ detailItem.notified ? '已通知' : '未通知' }}</span></div>
              <div class="detail-item"><span class="detail-label">客户端IP</span><code class="code-text">{{ detailItem.clientIp || '-' }}</code></div>
              <div class="detail-item"><span class="detail-label">备注</span><span>{{ detailItem.remark || '-' }}</span></div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showDetail = false">关闭</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- 退款弹窗 -->
    <v-dialog v-model="showRefund" max-width="440">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">发起退款</span>
          <v-btn icon variant="text" size="small" @click="showRefund = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body" v-if="refundTarget">
          <div class="detail-section">
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">订单号</span><code class="code-text">{{ refundTarget.orderNo }}</code></div>
              <div class="detail-item"><span class="detail-label">订单金额</span><span class="amount-text">¥{{ formatAmount(refundTarget.amount) }}</span></div>
            </div>
          </div>
          <div class="field-group" style="margin-top: 4px;">
            <label class="field-label">退款金额（元）</label>
            <input v-model="refundForm.amountYuan" type="number" class="field-input" style="width: 100%;" placeholder="请输入退款金额" min="0.01" :max="refundTarget.amount / 100" step="0.01" />
          </div>
          <div class="field-group" style="margin-top: 12px;">
            <label class="field-label">退款原因</label>
            <input v-model="refundForm.reason" type="text" class="field-input" style="width: 100%;" placeholder="请输入退款原因" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showRefund = false">取消</button>
          <button class="btn btn-primary" :disabled="refundLoading" @click="confirmRefund">
            {{ refundLoading ? '提交中...' : '确认退款' }}
          </button>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { getPaymentOrderList, getPaymentOrderDetail, closePaymentOrder, refundPaymentOrder, exportPaymentOrders } from '@/api/order'
import type { PaymentOrder } from '@/api/order'
import { formatTimestamp } from '@/utils/format'

const searchForm = reactive({ orderNo: '', merchantName: '', status: '', channelType: '', date: '' })

const orders = ref<PaymentOrder[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

function formatAmount(fen: number): string {
  return (fen / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function loadData() {
  loading.value = true
  try {
    const params: Parameters<typeof getPaymentOrderList>[0] = {
      page: page.value,
      pageSize: pageSize.value,
    }
    if (searchForm.orderNo) params.orderNo = searchForm.orderNo
    if (searchForm.merchantName) params.merchantName = searchForm.merchantName
    if (searchForm.channelType) params.channelType = searchForm.channelType
    if (searchForm.date) params.date = searchForm.date
    params.status = searchForm.status === '' ? -1 : Number(searchForm.status)

    const res = await getPaymentOrderList(params)
    orders.value = res.list
    total.value = res.total
  } catch (e) {
    console.error('加载支付订单失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())

function changePage(p: number) {
  page.value = p
  loadData()
}

const showDetail = ref(false)
const detailItem = ref<PaymentOrder | null>(null)

async function openDetail(item: PaymentOrder) {
  try {
    const res = await getPaymentOrderDetail(item.id)
    detailItem.value = res
  } catch (e) {
    console.error('获取订单详情失败', e)
    detailItem.value = item
  }
  showDetail.value = true
}

// 退款弹窗
const showRefund = ref(false)
const refundTarget = ref<PaymentOrder | null>(null)
const refundLoading = ref(false)
const refundForm = reactive({ amountYuan: '', reason: '' })

function openRefund(item: PaymentOrder) {
  refundTarget.value = item
  refundForm.amountYuan = (item.amount / 100).toFixed(2)
  refundForm.reason = ''
  showRefund.value = true
}

async function confirmRefund() {
  if (!refundTarget.value) return
  const amountYuan = parseFloat(refundForm.amountYuan)
  if (!amountYuan || amountYuan <= 0) {
    alert('请输入有效的退款金额')
    return
  }
  const maxYuan = refundTarget.value.amount / 100
  if (amountYuan > maxYuan) {
    alert(`退款金额不能超过订单金额 ¥${formatAmount(refundTarget.value.amount)}`)
    return
  }
  refundLoading.value = true
  try {
    await refundPaymentOrder({
      id: refundTarget.value.id,
      amount: Math.round(amountYuan * 100),
      reason: refundForm.reason,
    })
    showRefund.value = false
    await loadData()
  } catch (e) {
    console.error('发起退款失败', e)
    alert('发起退款失败，请重试')
  } finally {
    refundLoading.value = false
  }
}

async function handleClose(item: PaymentOrder) {
  if (!confirm(`确认关闭订单 ${item.orderNo}？`)) return
  try {
    await closePaymentOrder(item.id)
    await loadData()
  } catch (e) {
    console.error('关闭订单失败', e)
    alert('关闭订单失败，请重试')
  }
}

async function handleExport() {
  const params: Record<string, unknown> = {}
  if (searchForm.orderNo) params.orderNo = searchForm.orderNo
  if (searchForm.merchantName) params.merchantName = searchForm.merchantName
  if (searchForm.channelType) params.channelType = searchForm.channelType
  if (searchForm.date) params.date = searchForm.date
  params.status = searchForm.status === '' ? -1 : Number(searchForm.status)
  try {
    await exportPaymentOrders(params)
  } catch (e) {
    console.error('导出失败', e)
    alert('导出失败，请重试')
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.orderNo = ''
  searchForm.merchantName = ''
  searchForm.status = ''
  searchForm.channelType = ''
  searchForm.date = ''
  page.value = 1
  loadData()
}

function statusLabel(s: number) {
  return ['待支付', '支付成功', '支付失败', '已关闭'][s] || '未知'
}

function statusChipClass(s: number) {
  return ['chip-amber', 'chip-green', 'chip-red', 'chip-grey'][s] || 'chip-grey'
}

function payMethodLabel(m: string) {
  const map: Record<string, string> = { qrcode: '扫码支付', page: '网页支付', wap: 'WAP支付', app: 'APP支付', jsapi: 'JSAPI', miniapp: '小程序' }
  return map[m] || m
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.search-card { padding: 20px 24px; }
.search-bar { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.search-fields { display: flex; gap: 16px; flex-wrap: wrap; }
.search-actions { display: flex; gap: 8px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; color: #64748B; font-weight: 500; }
.field-input { height: 34px; padding: 0 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; color: #334155; outline: none; width: 180px; background: #fff; }
.field-input:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.field-select { height: 34px; padding: 0 28px 0 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; color: #334155; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 8px center; appearance: none; cursor: pointer; min-width: 130px; }
.field-select:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.btn { height: 34px; padding: 0 18px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; border: none; transition: all 0.15s; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-icon { margin-right: 4px; font-size: 16px; }
.btn-primary { background: linear-gradient(135deg, #3B9EFF, #7BBFFF); color: #fff; box-shadow: 0 1px 3px rgba(59,158,255,0.3); }
.btn-primary:hover:not(:disabled) { box-shadow: 0 2px 8px rgba(59,158,255,0.4); }
.btn-outlined { background: #fff; color: #64748B; border: 1px solid #E2E8F0; }
.btn-outlined:hover { border-color: #CBD5E1; background: #F8FAFC; }
.table-card { overflow: hidden; }
.table-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; }
.table-header-actions { display: flex; gap: 8px; }
.table-title { font-size: 16px; font-weight: 600; color: #1E293B; }
.table-wrap { padding: 0 24px; overflow-x: auto; }
.table-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; color: #94A3B8; font-size: 13px; border-top: 1px solid #F1F5F9; }
.table-summary { color: #475569; }
.table-summary strong { color: #1E293B; font-size: 14px; }
.pagination { display: flex; align-items: center; gap: 10px; }
.page-btn { height: 30px; padding: 0 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; background: #fff; color: #64748B; border: 1px solid #E2E8F0; transition: all 0.15s; }
.page-btn:hover:not(:disabled) { border-color: #CBD5E1; background: #F8FAFC; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #64748B; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { font-weight: 600; color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; background: #FAFBFC; padding: 12px 16px; text-align: left; border-bottom: 1px solid #F1F5F9; white-space: nowrap; }
.data-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; white-space: nowrap; }
.data-table tbody tr:hover { background: #F8FAFC; }
.loading-cell, .empty-cell { text-align: center; color: #94A3B8; padding: 40px 0 !important; }
.font-medium { font-weight: 500; }
.text-grey { color: #94A3B8; }
.code-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; }
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-amber { background: #FFFBEB; color: #F59E0B; }
.chip-red { background: #FEF2F2; color: #EF4444; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.dialog-title { font-size: 18px; font-weight: 600; color: #1E293B; }
.dialog-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; max-height: 65vh; overflow-y: auto; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 20px; }
.detail-section { display: flex; flex-direction: column; gap: 12px; }
.detail-title { font-size: 14px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #F1F5F9; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 12px; color: #94A3B8; }
.detail-item > span:last-child, .detail-item > code { font-size: 14px; color: #334155; }
.amount-text { font-weight: 600; color: #1E293B; font-size: 16px !important; }
</style>
