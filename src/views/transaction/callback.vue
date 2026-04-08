<template>
  <div class="page">
    <!-- 搜索栏 -->
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">关联订单号</label>
            <input v-model="searchForm.orderNo" type="text" class="field-input" placeholder="请输入订单号" />
          </div>
          <div class="field-group">
            <label class="field-label">通知类型</label>
            <select v-model="searchForm.type" class="field-select">
              <option value="">全部</option>
              <option value="pay">支付通知</option>
              <option value="refund">退款通知</option>
              <option value="transfer">转账通知</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">通知状态</label>
            <select v-model="searchForm.status" class="field-select">
              <option value="">全部</option>
              <option value="1">成功</option>
              <option value="0">失败</option>
              <option value="2">待重试</option>
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
        <div class="table-title">回调记录</div>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 160px">关联订单号</th>
              <th style="width: 120px">通知类型</th>
              <th style="width: 120px">通道类型</th>
              <th style="width: 140px">通知方向</th>
              <th style="width: 240px">通知 URL</th>
              <th style="width: 80px">状态</th>
              <th style="width: 80px">重试次数</th>
              <th style="width: 100px">HTTP状态码</th>
              <th style="width: 160px">通知时间</th>
              <th style="width: 100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in callbackList" :key="item.id">
              <td>{{ item.id }}</td>
              <td><code class="code-text">{{ item.orderNo }}</code></td>
              <td>
                <span :class="['chip', notifyTypeClass(item.type)]">{{ notifyTypeLabel(item.type) }}</span>
              </td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </td>
              <td>
                <span :class="['chip', item.direction === 'upstream' ? 'chip-purple' : 'chip-teal']">
                  {{ item.direction === 'upstream' ? '上游→平台' : '平台→商户' }}
                </span>
              </td>
              <td class="text-grey text-ellipsis-wide">{{ item.notifyUrl }}</td>
              <td>
                <span :class="['chip', callbackStatusClass(item.status)]">{{ callbackStatusLabel(item.status) }}</span>
              </td>
              <td>{{ item.retryCount }}/{{ item.maxRetry }}</td>
              <td>
                <code :class="['code-text', item.httpStatus >= 200 && item.httpStatus < 300 ? 'http-ok' : 'http-err']">
                  {{ item.httpStatus || '-' }}
                </code>
              </td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="查看详情" @click="openDetail(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.status !== 1" icon variant="text" size="x-small" title="手动重试" @click="handleRetry(item)">
                  <v-icon size="18" color="#F59E0B">mdi-refresh</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">共 {{ callbackList.length }} 条</div>
    </v-card>

    <!-- 详情弹窗 -->
    <v-dialog v-model="showDetail" max-width="640">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">回调详情</span>
          <v-btn icon variant="text" size="small" @click="showDetail = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body" v-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">基本信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">关联订单号</span><code class="code-text">{{ detailItem.orderNo }}</code></div>
              <div class="detail-item">
                <span class="detail-label">通知类型</span>
                <span :class="['chip', notifyTypeClass(detailItem.type)]">{{ notifyTypeLabel(detailItem.type) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">通道类型</span>
                <span :class="['chip', detailItem.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ detailItem.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">通知状态</span>
                <span :class="['chip', callbackStatusClass(detailItem.status)]">{{ callbackStatusLabel(detailItem.status) }}</span>
              </div>
              <div class="detail-item"><span class="detail-label">通知方向</span><span>{{ detailItem.direction === 'upstream' ? '上游→平台' : '平台→商户' }}</span></div>
              <div class="detail-item"><span class="detail-label">HTTP 状态码</span><code class="code-text">{{ detailItem.httpStatus || '-' }}</code></div>
              <div class="detail-item"><span class="detail-label">重试次数</span><span>{{ detailItem.retryCount }} / {{ detailItem.maxRetry }}</span></div>
              <div class="detail-item"><span class="detail-label">通知时间</span><span>{{ detailItem.ctime }}</span></div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-title">通知 URL</div>
            <code class="code-block">{{ detailItem.notifyUrl }}</code>
          </div>
          <div class="detail-section">
            <div class="detail-title">请求内容</div>
            <pre class="code-block">{{ detailItem.requestBody }}</pre>
          </div>
          <div class="detail-section">
            <div class="detail-title">响应内容</div>
            <pre class="code-block">{{ detailItem.responseBody || '(无响应)' }}</pre>
          </div>
        </div>
        <div class="dialog-footer">
          <button v-if="detailItem && detailItem.status !== 1" class="btn btn-outlined" @click="handleRetry(detailItem!); showDetail = false">
            <span class="mdi mdi-refresh btn-icon"></span>重新发送
          </button>
          <button class="btn btn-outlined" @click="showDetail = false">关闭</button>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface CallbackItem {
  id: number
  orderNo: string
  type: 'pay' | 'refund' | 'transfer'
  channelType: 'alipay' | 'wechat'
  direction: 'upstream' | 'downstream'
  notifyUrl: string
  status: number // 0-失败 1-成功 2-待重试
  httpStatus: number
  retryCount: number
  maxRetry: number
  requestBody: string
  responseBody: string
  ctime: string
}

const searchForm = reactive({ orderNo: '', type: '', status: '', channelType: '' })

const callbackList = ref<CallbackItem[]>([
  { id: 1, orderNo: 'PAY20260401100001', type: 'pay', channelType: 'alipay', direction: 'upstream', notifyUrl: 'https://gopay.example.com/alipay/notify', status: 1, httpStatus: 200, retryCount: 0, maxRetry: 5, requestBody: '{"trade_no":"2026040122001401001234567","out_trade_no":"PAY20260401100001","trade_status":"TRADE_SUCCESS","total_amount":"299.00"}', responseBody: 'success', ctime: '2026-04-01 10:00:33' },
  { id: 2, orderNo: 'PAY20260401100001', type: 'pay', channelType: 'alipay', direction: 'downstream', notifyUrl: 'https://api.xingchen.com/notify', status: 1, httpStatus: 200, retryCount: 0, maxRetry: 5, requestBody: '{"order_no":"PAY20260401100001","out_trade_no":"M20260401001","status":"SUCCESS","amount":299.00}', responseBody: '{"code":0,"msg":"ok"}', ctime: '2026-04-01 10:00:35' },
  { id: 3, orderNo: 'PAY20260401100002', type: 'pay', channelType: 'wechat', direction: 'upstream', notifyUrl: 'https://gopay.example.com/wechat/notify', status: 1, httpStatus: 200, retryCount: 0, maxRetry: 5, requestBody: '{"transaction_id":"4200001234202604010012345","out_trade_no":"PAY20260401100002","trade_state":"SUCCESS","amount":{"total":5990}}', responseBody: '{"code":"SUCCESS"}', ctime: '2026-04-01 11:30:20' },
  { id: 4, orderNo: 'PAY20260401100002', type: 'pay', channelType: 'wechat', direction: 'downstream', notifyUrl: 'https://api.yunhai.com/notify', status: 1, httpStatus: 200, retryCount: 0, maxRetry: 5, requestBody: '{"order_no":"PAY20260401100002","out_trade_no":"M20260401002","status":"SUCCESS","amount":59.90}', responseBody: '{"code":0,"msg":"ok"}', ctime: '2026-04-01 11:30:22' },
  { id: 5, orderNo: 'REF20260402001', type: 'refund', channelType: 'alipay', direction: 'upstream', notifyUrl: 'https://gopay.example.com/alipay/refund-notify', status: 1, httpStatus: 200, retryCount: 0, maxRetry: 5, requestBody: '{"trade_no":"2026040122001401001234567","refund_fee":"299.00","gmt_refund":"2026-04-02 10:00:20"}', responseBody: 'success', ctime: '2026-04-02 10:00:23' },
  { id: 6, orderNo: 'REF20260402001', type: 'refund', channelType: 'alipay', direction: 'downstream', notifyUrl: 'https://api.xingchen.com/refund-notify', status: 0, httpStatus: 500, retryCount: 3, maxRetry: 5, requestBody: '{"refund_no":"REF20260402001","order_no":"PAY20260401100001","status":"SUCCESS","refund_amount":299.00}', responseBody: 'Internal Server Error', ctime: '2026-04-02 10:00:25' },
  { id: 7, orderNo: 'PAY20260403100001', type: 'pay', channelType: 'alipay', direction: 'downstream', notifyUrl: 'https://api.lanjing.com/pay/notify', status: 2, httpStatus: 0, retryCount: 1, maxRetry: 5, requestBody: '{"order_no":"PAY20260403100001","out_trade_no":"M20260403001","status":"SUCCESS","amount":520.00}', responseBody: '', ctime: '2026-04-03 08:45:20' },
  { id: 8, orderNo: 'TRF20260401001', type: 'transfer', channelType: 'alipay', direction: 'downstream', notifyUrl: 'https://api.xingchen.com/transfer-notify', status: 1, httpStatus: 200, retryCount: 0, maxRetry: 5, requestBody: '{"transfer_no":"TRF20260401001","status":"SUCCESS","amount":5000.00,"payee_account":"zhangsan@163.com"}', responseBody: '{"code":0,"msg":"ok"}', ctime: '2026-04-01 10:00:32' },
])

const showDetail = ref(false)
const detailItem = ref<CallbackItem | null>(null)

function notifyTypeLabel(t: string) { return { pay: '支付通知', refund: '退款通知', transfer: '转账通知' }[t] || t }
function notifyTypeClass(t: string) { return { pay: 'chip-blue', refund: 'chip-red', transfer: 'chip-amber' }[t] || 'chip-grey' }
function callbackStatusLabel(s: number) { return ['失败', '成功', '待重试'][s] || '未知' }
function callbackStatusClass(s: number) { return ['chip-red', 'chip-green', 'chip-amber'][s] || 'chip-grey' }

function handleSearch() { /* Mock */ }
function handleReset() { searchForm.orderNo = ''; searchForm.type = ''; searchForm.status = ''; searchForm.channelType = '' }
function openDetail(item: CallbackItem) { detailItem.value = item; showDetail.value = true }

function handleRetry(item: CallbackItem) {
  item.retryCount++
  item.status = 1
  item.httpStatus = 200
  item.responseBody = '{"code":0,"msg":"ok"}'
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
.btn-icon { margin-right: 4px; font-size: 16px; }
.btn-primary { background: linear-gradient(135deg, #3B9EFF, #7BBFFF); color: #fff; box-shadow: 0 1px 3px rgba(59,158,255,0.3); }
.btn-primary:hover { box-shadow: 0 2px 8px rgba(59,158,255,0.4); }
.btn-outlined { background: #fff; color: #64748B; border: 1px solid #E2E8F0; }
.btn-outlined:hover { border-color: #CBD5E1; background: #F8FAFC; }
.table-card { overflow: hidden; }
.table-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; }
.table-title { font-size: 16px; font-weight: 600; color: #1E293B; }
.table-wrap { padding: 0 24px; overflow-x: auto; }
.table-footer { display: flex; align-items: center; justify-content: flex-end; padding: 12px 24px; color: #94A3B8; font-size: 13px; border-top: 1px solid #F1F5F9; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { font-weight: 600; color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; background: #FAFBFC; padding: 12px 16px; text-align: left; border-bottom: 1px solid #F1F5F9; white-space: nowrap; }
.data-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; white-space: nowrap; }
.data-table tbody tr:hover { background: #F8FAFC; }
.text-grey { color: #94A3B8; }
.text-ellipsis-wide { max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.code-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; }
.http-ok { color: #10B981; }
.http-err { color: #EF4444; }
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-amber { background: #FFFBEB; color: #F59E0B; }
.chip-red { background: #FEF2F2; color: #EF4444; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
.chip-purple { background: #F5F3FF; color: #8B5CF6; }
.chip-teal { background: #F0FDFA; color: #14B8A6; }
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
.code-block { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #334155; background: #F8FAFC; padding: 12px 16px; border-radius: 8px; border: 1px solid #E2E8F0; white-space: pre-wrap; word-break: break-all; line-height: 1.6; margin: 0; }
</style>
