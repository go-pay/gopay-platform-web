<template>
  <div class="page">
    <!-- 搜索栏 -->
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">退款单号</label>
            <input v-model="searchForm.refundNo" type="text" class="field-input" placeholder="请输入退款单号" />
          </div>
          <div class="field-group">
            <label class="field-label">原支付单号</label>
            <input v-model="searchForm.orderNo" type="text" class="field-input" placeholder="请输入原支付单号" />
          </div>
          <div class="field-group">
            <label class="field-label">退款状态</label>
            <select v-model="searchForm.status" class="field-select">
              <option value="">全部</option>
              <option value="0">退款中</option>
              <option value="1">退款成功</option>
              <option value="2">退款失败</option>
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
        <div class="table-title">退款订单</div>
        <button class="btn btn-outlined" @click="handleExport">
          <span class="mdi mdi-download btn-icon"></span>导出
        </button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 160px">退款单号</th>
              <th style="width: 160px">原支付单号</th>
              <th style="width: 120px">商户名称</th>
              <th style="width: 100px">退款金额(元)</th>
              <th style="width: 100px">原订单金额</th>
              <th style="width: 100px">通道类型</th>
              <th style="width: 90px">状态</th>
              <th>退款原因</th>
              <th style="width: 160px">申请时间</th>
              <th style="width: 160px">完成时间</th>
              <th style="width: 80px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in refundList" :key="item.id">
              <td><code class="code-text">{{ item.refundNo }}</code></td>
              <td><code class="code-text">{{ item.orderNo }}</code></td>
              <td>{{ item.merchantName }}</td>
              <td class="font-medium refund-amount">-{{ item.refundAmount.toFixed(2) }}</td>
              <td class="text-grey">{{ item.orderAmount.toFixed(2) }}</td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </td>
              <td>
                <span :class="['chip', refundStatusClass(item.status)]">{{ refundStatusLabel(item.status) }}</span>
              </td>
              <td class="text-grey text-ellipsis">{{ item.reason }}</td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td class="text-grey">{{ item.finishTime || '-' }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="查看详情" @click="openDetail(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span class="table-summary">总退款: <strong>¥{{ totalRefund }}</strong></span>
        <span>共 {{ refundList.length }} 条</span>
      </div>
    </v-card>

    <!-- 详情弹窗 -->
    <v-dialog v-model="showDetail" max-width="560">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">退款详情</span>
          <v-btn icon variant="text" size="small" @click="showDetail = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body" v-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">退款信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">退款单号</span><code class="code-text">{{ detailItem.refundNo }}</code></div>
              <div class="detail-item"><span class="detail-label">原支付单号</span><code class="code-text">{{ detailItem.orderNo }}</code></div>
              <div class="detail-item"><span class="detail-label">商户名称</span><span>{{ detailItem.merchantName }}</span></div>
              <div class="detail-item"><span class="detail-label">退款金额</span><span class="refund-amount">¥{{ detailItem.refundAmount.toFixed(2) }}</span></div>
              <div class="detail-item"><span class="detail-label">原订单金额</span><span>¥{{ detailItem.orderAmount.toFixed(2) }}</span></div>
              <div class="detail-item">
                <span class="detail-label">退款状态</span>
                <span :class="['chip', refundStatusClass(detailItem.status)]">{{ refundStatusLabel(detailItem.status) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">通道类型</span>
                <span :class="['chip', detailItem.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ detailItem.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </div>
              <div class="detail-item"><span class="detail-label">通道退款号</span><code class="code-text">{{ detailItem.tradeRefundNo || '-' }}</code></div>
              <div class="detail-item"><span class="detail-label">退款原因</span><span>{{ detailItem.reason }}</span></div>
              <div class="detail-item"><span class="detail-label">申请时间</span><span>{{ detailItem.ctime }}</span></div>
              <div class="detail-item"><span class="detail-label">完成时间</span><span>{{ detailItem.finishTime || '-' }}</span></div>
              <div class="detail-item"><span class="detail-label">操作人</span><span>{{ detailItem.operator }}</span></div>
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

interface RefundOrder {
  id: number
  refundNo: string
  orderNo: string
  tradeRefundNo: string
  merchantName: string
  refundAmount: number
  orderAmount: number
  channelType: 'alipay' | 'wechat'
  status: number // 0-退款中 1-退款成功 2-退款失败
  reason: string
  operator: string
  ctime: string
  finishTime: string
}

const searchForm = reactive({ refundNo: '', orderNo: '', status: '', channelType: '' })

const refundList = ref<RefundOrder[]>([
  { id: 1, refundNo: 'REF20260402001', orderNo: 'PAY20260401100001', tradeRefundNo: '2026040200000001', merchantName: '星辰科技有限公司', refundAmount: 299.00, orderAmount: 299.00, channelType: 'alipay', status: 1, reason: '用户申请退款', operator: 'admin', ctime: '2026-04-02 10:00:00', finishTime: '2026-04-02 10:00:25' },
  { id: 2, refundNo: 'REF20260403001', orderNo: 'PAY20260401100002', tradeRefundNo: '4200009999202604030000001', merchantName: '云海数字传媒', refundAmount: 30.00, orderAmount: 59.90, channelType: 'wechat', status: 1, reason: '部分退款-服务未使用', operator: 'admin', ctime: '2026-04-03 14:30:00', finishTime: '2026-04-03 14:30:45' },
  { id: 3, refundNo: 'REF20260404001', orderNo: 'PAY20260403100001', tradeRefundNo: '', merchantName: '蓝鲸网络科技', refundAmount: 520.00, orderAmount: 520.00, channelType: 'alipay', status: 0, reason: '重复扣款', operator: 'admin', ctime: '2026-04-04 09:00:00', finishTime: '' },
  { id: 4, refundNo: 'REF20260405001', orderNo: 'PAY20260405100001', tradeRefundNo: '', merchantName: '云海数字传媒', refundAmount: 168.00, orderAmount: 168.00, channelType: 'wechat', status: 2, reason: '超过退款期限', operator: 'admin', ctime: '2026-04-05 16:00:00', finishTime: '2026-04-05 16:01:00' },
  { id: 5, refundNo: 'REF20260406001', orderNo: 'PAY20260406100001', tradeRefundNo: '2026040600000005', merchantName: '星辰科技有限公司', refundAmount: 88.00, orderAmount: 88.00, channelType: 'alipay', status: 1, reason: '用户取消订单', operator: 'admin', ctime: '2026-04-06 17:00:00', finishTime: '2026-04-06 17:00:30' },
])

const totalRefund = computed(() => refundList.value.filter(r => r.status === 1).reduce((s, r) => s + r.refundAmount, 0).toFixed(2))

const showDetail = ref(false)
const detailItem = ref<RefundOrder | null>(null)

function refundStatusLabel(s: number) { return ['退款中', '退款成功', '退款失败'][s] || '未知' }
function refundStatusClass(s: number) { return ['chip-amber', 'chip-green', 'chip-red'][s] || 'chip-grey' }

function handleSearch() { /* Mock */ }
function handleReset() { searchForm.refundNo = ''; searchForm.orderNo = ''; searchForm.status = ''; searchForm.channelType = '' }
function handleExport() { alert('导出功能开发中') }
function openDetail(item: RefundOrder) { detailItem.value = item; showDetail.value = true }
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
.table-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; color: #94A3B8; font-size: 13px; border-top: 1px solid #F1F5F9; }
.table-summary { color: #475569; }
.table-summary strong { color: #EF4444; font-size: 14px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { font-weight: 600; color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; background: #FAFBFC; padding: 12px 16px; text-align: left; border-bottom: 1px solid #F1F5F9; white-space: nowrap; }
.data-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; }
.data-table tbody tr:hover { background: #F8FAFC; }
.font-medium { font-weight: 500; }
.text-grey { color: #94A3B8; }
.text-ellipsis { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.code-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; }
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-amber { background: #FFFBEB; color: #F59E0B; }
.chip-red { background: #FEF2F2; color: #EF4444; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
.refund-amount { color: #EF4444; }
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
</style>
