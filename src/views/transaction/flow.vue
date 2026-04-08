<template>
  <div class="page">
    <!-- 搜索栏 -->
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">流水号</label>
            <input v-model="searchForm.flowNo" type="text" class="field-input" placeholder="请输入流水号" />
          </div>
          <div class="field-group">
            <label class="field-label">关联订单号</label>
            <input v-model="searchForm.orderNo" type="text" class="field-input" placeholder="请输入订单号" />
          </div>
          <div class="field-group">
            <label class="field-label">交易类型</label>
            <select v-model="searchForm.type" class="field-select">
              <option value="">全部</option>
              <option value="pay">支付</option>
              <option value="refund">退款</option>
              <option value="transfer">转账</option>
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
            <label class="field-label">交易时间</label>
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

    <!-- 统计卡片 -->
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-icon stat-icon-blue"><span class="mdi mdi-arrow-down-bold"></span></div>
        <div class="stat-info">
          <div class="stat-label">收入(支付)</div>
          <div class="stat-value stat-value-blue">¥{{ incomeTotal }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-red"><span class="mdi mdi-arrow-up-bold"></span></div>
        <div class="stat-info">
          <div class="stat-label">支出(退款+转账)</div>
          <div class="stat-value stat-value-red">¥{{ expenseTotal }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-green"><span class="mdi mdi-swap-horizontal"></span></div>
        <div class="stat-info">
          <div class="stat-label">总交易笔数</div>
          <div class="stat-value">{{ totalCount }}</div>
        </div>
      </div>
    </div>

    <!-- 表格区 -->
    <v-card rounded="lg" flat class="table-card">
      <div class="table-header">
        <div class="table-title">交易流水</div>
        <button class="btn btn-outlined" @click="handleExport">
          <span class="mdi mdi-download btn-icon"></span>导出
        </button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 160px">流水号</th>
              <th style="width: 160px">关联订单号</th>
              <th style="width: 80px">交易类型</th>
              <th style="width: 120px">商户名称</th>
              <th style="width: 110px">交易金额(元)</th>
              <th style="width: 120px">通道类型</th>
              <th style="width: 140px">通道流水号</th>
              <th style="width: 80px">方向</th>
              <th style="width: 95px">状态</th>
              <th style="width: 160px">交易时间</th>
              <th style="width: 80px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in flowList" :key="item.id">
              <td><code class="code-text">{{ item.flowNo }}</code></td>
              <td><code class="code-text">{{ item.orderNo }}</code></td>
              <td>
                <span :class="['chip', typeChipClass(item.type)]">{{ typeLabel(item.type) }}</span>
              </td>
              <td>{{ item.merchantName }}</td>
              <td :class="['font-medium', item.direction === 'in' ? 'text-income' : 'text-expense']">
                {{ item.direction === 'in' ? '+' : '-' }}{{ formatAmount(item.amount) }}
              </td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </td>
              <td><code class="code-text code-text-sm">{{ item.channelFlowNo || '-' }}</code></td>
              <td>
                <span :class="['chip', item.direction === 'in' ? 'chip-income' : 'chip-expense']">
                  {{ item.direction === 'in' ? '收入' : '支出' }}
                </span>
              </td>
              <td>
                <span :class="['chip', item.status === 1 ? 'chip-green' : 'chip-grey']">
                  {{ item.status === 1 ? '已完成' : '处理中' }}
                </span>
              </td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="查看详情" @click="openDetail(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">共 {{ total }} 条</div>
    </v-card>

    <!-- 详情弹窗 -->
    <v-dialog v-model="showDetail" max-width="560">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">流水详情</span>
          <v-btn icon variant="text" size="small" @click="showDetail = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body dialog-loading" v-if="detailLoading">
          <span class="mdi mdi-loading mdi-spin"></span> 加载中...
        </div>
        <div class="dialog-body" v-else-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">流水信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">流水号</span><code class="code-text">{{ detailItem.flowNo }}</code></div>
              <div class="detail-item"><span class="detail-label">关联订单号</span><code class="code-text">{{ detailItem.orderNo }}</code></div>
              <div class="detail-item">
                <span class="detail-label">交易类型</span>
                <span :class="['chip', typeChipClass(detailItem.type)]">{{ typeLabel(detailItem.type) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">资金方向</span>
                <span :class="['chip', detailItem.direction === 'in' ? 'chip-income' : 'chip-expense']">{{ detailItem.direction === 'in' ? '收入' : '支出' }}</span>
              </div>
              <div class="detail-item"><span class="detail-label">商户名称</span><span>{{ detailItem.merchantName }}</span></div>
              <div class="detail-item">
                <span class="detail-label">交易金额</span>
                <span :class="['amount-text', detailItem.direction === 'in' ? 'text-income' : 'text-expense']">
                  {{ detailItem.direction === 'in' ? '+' : '-' }}¥{{ formatAmount(detailItem.amount) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">通道类型</span>
                <span :class="['chip', detailItem.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ detailItem.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </div>
              <div class="detail-item"><span class="detail-label">通道流水号</span><code class="code-text">{{ detailItem.channelFlowNo || '-' }}</code></div>
              <div class="detail-item">
                <span class="detail-label">状态</span>
                <span :class="['chip', detailItem.status === 1 ? 'chip-green' : 'chip-grey']">{{ detailItem.status === 1 ? '已完成' : '处理中' }}</span>
              </div>
              <div class="detail-item"><span class="detail-label">交易时间</span><span>{{ detailItem.ctime }}</span></div>
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
import { ref, reactive, onMounted } from 'vue'
import { getFlowList, getFlowStats, getFlowDetail, type FlowItem } from '@/api/transaction'

const searchForm = reactive({ flowNo: '', orderNo: '', type: '', channelType: '', date: '' })

const flowList = ref<FlowItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const incomeTotal = ref('0.00')
const expenseTotal = ref('0.00')
const totalCount = ref(0)

const showDetail = ref(false)
const detailItem = ref<FlowItem | null>(null)
const detailLoading = ref(false)

function formatAmount(fen: number) {
  return (fen / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function typeLabel(t: string) { return ({ pay: '支付', refund: '退款', transfer: '转账' } as Record<string, string>)[t] || t }
function typeChipClass(t: string) { return ({ pay: 'chip-blue', refund: 'chip-red', transfer: 'chip-amber' } as Record<string, string>)[t] || 'chip-grey' }

async function fetchList() {
  const res = await getFlowList({
    page: page.value,
    pageSize: pageSize.value,
    flowNo: searchForm.flowNo || undefined,
    orderNo: searchForm.orderNo || undefined,
    type: searchForm.type,
    channelType: searchForm.channelType,
    date: searchForm.date || undefined,
  })
  flowList.value = res.list ?? []
  total.value = res.total ?? 0
}

async function fetchStats() {
  const res = await getFlowStats()
  incomeTotal.value = formatAmount(res.incomeTotal)
  expenseTotal.value = formatAmount(res.expenseTotal)
  totalCount.value = res.totalCount
}

async function handleSearch() {
  page.value = 1
  await fetchList()
}

async function handleReset() {
  searchForm.flowNo = ''
  searchForm.orderNo = ''
  searchForm.type = ''
  searchForm.channelType = ''
  searchForm.date = ''
  page.value = 1
  await fetchList()
}

function handleExport() { alert('导出功能开发中') }

async function openDetail(item: FlowItem) {
  showDetail.value = true
  detailLoading.value = true
  detailItem.value = null
  try {
    const res = await getFlowDetail(item.id)
    detailItem.value = res
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  fetchList()
  fetchStats()
})
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

/* 统计卡片 */
.stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.stat-icon-blue { background: #EFF6FF; color: #3B82F6; }
.stat-icon-red { background: #FEF2F2; color: #EF4444; }
.stat-icon-green { background: #ECFDF5; color: #10B981; }
.stat-info { display: flex; flex-direction: column; gap: 4px; }
.stat-label { font-size: 13px; color: #94A3B8; }
.stat-value { font-size: 20px; font-weight: 700; color: #1E293B; }
.stat-value-blue { color: #3B82F6; }
.stat-value-red { color: #EF4444; }

.table-card { overflow: hidden; }
.table-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; }
.table-title { font-size: 16px; font-weight: 600; color: #1E293B; }
.table-wrap { padding: 0 24px; overflow-x: auto; }
.table-footer { display: flex; align-items: center; justify-content: flex-end; padding: 12px 24px; color: #94A3B8; font-size: 13px; border-top: 1px solid #F1F5F9; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { font-weight: 600; color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; background: #FAFBFC; padding: 12px 16px; text-align: left; border-bottom: 1px solid #F1F5F9; white-space: nowrap; }
.data-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; white-space: nowrap; }
.data-table tbody tr:hover { background: #F8FAFC; }
.font-medium { font-weight: 500; }
.text-grey { color: #94A3B8; }
.text-income { color: #10B981; }
.text-expense { color: #EF4444; }
.code-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; }
.code-text-sm { font-size: 11px; }
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-amber { background: #FFFBEB; color: #F59E0B; }
.chip-red { background: #FEF2F2; color: #EF4444; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
.chip-income { background: #ECFDF5; color: #10B981; }
.chip-expense { background: #FEF2F2; color: #EF4444; }
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
.amount-text { font-weight: 600; font-size: 16px !important; }
.dialog-loading { display: flex; align-items: center; justify-content: center; gap: 8px; color: #94A3B8; font-size: 14px; min-height: 80px; }
</style>
