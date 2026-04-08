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
              <th style="width: 100px">通道类型</th>
              <th style="width: 100px">支付方式</th>
              <th style="width: 90px">状态</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 160px">支付时间</th>
              <th style="width: 100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orderList" :key="item.id">
              <td><code class="code-text">{{ item.orderNo }}</code></td>
              <td><code class="code-text">{{ item.outTradeNo }}</code></td>
              <td>{{ item.merchantName }}</td>
              <td class="font-medium">{{ item.amount.toFixed(2) }}</td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </td>
              <td>{{ payMethodLabel(item.payMethod) }}</td>
              <td>
                <span :class="['chip', statusChipClass(item.status)]">{{ statusLabel(item.status) }}</span>
              </td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td class="text-grey">{{ item.payTime || '-' }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="查看详情" @click="openDetail(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.status === 0" icon variant="text" size="x-small" title="关闭订单" @click="handleClose(item)">
                  <v-icon size="18" color="#EF4444">mdi-close-circle-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.status === 1" icon variant="text" size="x-small" title="发起退款" @click="handleRefund(item)">
                  <v-icon size="18" color="#F59E0B">mdi-cash-refund</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span class="table-summary">总金额: <strong>¥{{ totalAmount }}</strong></span>
        <span>共 {{ orderList.length }} 条</span>
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
              <div class="detail-item"><span class="detail-label">订单金额</span><span class="amount-text">¥{{ detailItem.amount.toFixed(2) }}</span></div>
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
              <div class="detail-item"><span class="detail-label">创建时间</span><span>{{ detailItem.ctime }}</span></div>
              <div class="detail-item"><span class="detail-label">支付时间</span><span>{{ detailItem.payTime || '-' }}</span></div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface PaymentOrder {
  id: number
  orderNo: string
  outTradeNo: string
  tradeNo: string
  merchantId: number
  merchantName: string
  amount: number
  channelType: 'alipay' | 'wechat'
  payMethod: string
  status: number // 0-待支付 1-支付成功 2-支付失败 3-已关闭
  subject: string
  clientIp: string
  notified: boolean
  remark: string
  ctime: string
  payTime: string
}

const searchForm = reactive({ orderNo: '', merchantName: '', status: '', channelType: '', date: '' })

const orderList = ref<PaymentOrder[]>([
  { id: 1, orderNo: 'PAY20260401100001', outTradeNo: 'M20260401001', tradeNo: '2026040122001401001234567', merchantId: 1, merchantName: '星辰科技有限公司', amount: 299.00, channelType: 'alipay', payMethod: 'qrcode', status: 1, subject: '会员充值-月卡', clientIp: '192.168.1.100', notified: true, remark: '', ctime: '2026-04-01 10:00:12', payTime: '2026-04-01 10:00:35' },
  { id: 2, orderNo: 'PAY20260401100002', outTradeNo: 'M20260401002', tradeNo: '4200001234202604010012345', merchantId: 2, merchantName: '云海数字传媒', amount: 59.90, channelType: 'wechat', payMethod: 'jsapi', status: 1, subject: '广告投放服务费', clientIp: '10.0.0.55', notified: true, remark: '', ctime: '2026-04-01 11:30:05', payTime: '2026-04-01 11:30:22' },
  { id: 3, orderNo: 'PAY20260402100001', outTradeNo: 'M20260402001', tradeNo: '', merchantId: 3, merchantName: '极光电子商务', amount: 1280.00, channelType: 'alipay', payMethod: 'page', status: 0, subject: '年度服务费', clientIp: '172.16.0.33', notified: false, remark: '', ctime: '2026-04-02 09:15:30', payTime: '' },
  { id: 4, orderNo: 'PAY20260402100002', outTradeNo: 'M20260402002', tradeNo: '', merchantId: 1, merchantName: '星辰科技有限公司', amount: 49.00, channelType: 'wechat', payMethod: 'miniapp', status: 2, subject: '商品购买', clientIp: '192.168.1.101', notified: false, remark: '余额不足', ctime: '2026-04-02 14:20:00', payTime: '' },
  { id: 5, orderNo: 'PAY20260403100001', outTradeNo: 'M20260403001', tradeNo: '2026040322001401009876543', merchantId: 5, merchantName: '蓝鲸网络科技', amount: 520.00, channelType: 'alipay', payMethod: 'wap', status: 1, subject: 'API调用包', clientIp: '10.10.1.200', notified: true, remark: '', ctime: '2026-04-03 08:45:00', payTime: '2026-04-03 08:45:18' },
  { id: 6, orderNo: 'PAY20260404100001', outTradeNo: 'M20260404001', tradeNo: '', merchantId: 6, merchantName: '九州在线商贸', amount: 3999.00, channelType: 'wechat', payMethod: 'qrcode', status: 3, subject: '平台使用费', clientIp: '192.168.10.50', notified: false, remark: '超时未支付，自动关闭', ctime: '2026-04-04 16:00:00', payTime: '' },
  { id: 7, orderNo: 'PAY20260405100001', outTradeNo: 'M20260405001', tradeNo: '4200005678202604050098765', merchantId: 2, merchantName: '云海数字传媒', amount: 168.00, channelType: 'wechat', payMethod: 'jsapi', status: 1, subject: '内容订阅-季度', clientIp: '10.0.0.56', notified: true, remark: '', ctime: '2026-04-05 10:30:00', payTime: '2026-04-05 10:30:15' },
  { id: 8, orderNo: 'PAY20260406100001', outTradeNo: 'M20260406001', tradeNo: '2026040622001401005554321', merchantId: 1, merchantName: '星辰科技有限公司', amount: 88.00, channelType: 'alipay', payMethod: 'qrcode', status: 1, subject: '增值服务', clientIp: '192.168.1.102', notified: true, remark: '', ctime: '2026-04-06 15:20:00', payTime: '2026-04-06 15:20:30' },
])

const totalAmount = computed(() => orderList.value.filter(o => o.status === 1).reduce((s, o) => s + o.amount, 0).toFixed(2))

const showDetail = ref(false)
const detailItem = ref<PaymentOrder | null>(null)

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

function handleSearch() { /* Mock */ }
function handleReset() { searchForm.orderNo = ''; searchForm.merchantName = ''; searchForm.status = ''; searchForm.channelType = ''; searchForm.date = '' }
function handleExport() { alert('导出功能开发中') }

function openDetail(item: PaymentOrder) { detailItem.value = item; showDetail.value = true }

function handleClose(item: PaymentOrder) { item.status = 3; item.remark = '手动关闭' }

function handleRefund(item: PaymentOrder) { alert(`发起退款: ${item.orderNo}，金额 ¥${item.amount.toFixed(2)}`) }
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
.btn-icon { margin-right: 4px; font-size: 16px; }
.btn-primary { background: linear-gradient(135deg, #3B9EFF, #7BBFFF); color: #fff; box-shadow: 0 1px 3px rgba(59,158,255,0.3); }
.btn-primary:hover { box-shadow: 0 2px 8px rgba(59,158,255,0.4); }
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
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { font-weight: 600; color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; background: #FAFBFC; padding: 12px 16px; text-align: left; border-bottom: 1px solid #F1F5F9; white-space: nowrap; }
.data-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; }
.data-table tbody tr:hover { background: #F8FAFC; }
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
