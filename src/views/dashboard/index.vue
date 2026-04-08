<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <v-card class="welcome-banner" rounded="lg" flat>
      <div class="banner-inner">
        <div>
          <h1 class="banner-title">欢迎使用 GoPay 支付网关管理平台</h1>
          <p class="banner-sub">智能支付，高效管理</p>
          <p class="banner-date">{{ today }}</p>
        </div>
        <v-icon size="80" style="opacity: 0.15" color="white">mdi-finance</v-icon>
      </div>
    </v-card>

    <!-- 数据卡片 -->
    <div class="grid-3">
      <v-card v-for="card in statCards" :key="card.label" :class="['stat-card', card.gradient]" rounded="lg" flat>
        <div class="card-inner">
          <div>
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
          <v-icon size="48" style="opacity: 0.3" color="white">{{ card.icon }}</v-icon>
        </div>
      </v-card>
    </div>

    <!-- 快捷入口 -->
    <div class="grid-2">
      <v-card
        v-for="entry in quickEntries"
        :key="entry.label"
        rounded="lg"
        class="quick-entry"
        flat
        @click="$router.push(entry.path)"
      >
        <div class="entry-inner">
          <v-avatar :color="entry.bgColor" size="48" rounded="lg">
            <v-icon :color="entry.iconColor">{{ entry.icon }}</v-icon>
          </v-avatar>
          <div>
            <div class="entry-label">{{ entry.label }}</div>
            <div class="entry-value">{{ entry.value }}</div>
          </div>
        </div>
      </v-card>
    </div>

    <!-- 图表区 -->
    <div class="grid-2">
      <v-card rounded="lg" class="chart-card" flat>
        <div class="chart-header">
          <div class="chart-title">通道交易分布</div>
          <a class="view-detail-link" @click="$router.push('/transaction/flow')">查看详情 →</a>
        </div>
        <div ref="donutChartRef" style="width: 100%; height: 320px"></div>
      </v-card>
      <v-card rounded="lg" class="chart-card" flat>
        <div class="chart-header">
          <div class="chart-title">近 7 日交易趋势</div>
          <a class="view-detail-link" @click="$router.push('/transaction/flow')">查看详情 →</a>
        </div>
        <div ref="areaChartRef" style="width: 100%; height: 320px"></div>
      </v-card>
    </div>

    <!-- 最近支付订单 -->
    <v-card rounded="lg" flat class="order-card">
      <div class="order-header">
        <div class="chart-title">最近支付订单</div>
        <a class="view-detail-link" @click="$router.push('/order/payment')">查看全部 →</a>
      </div>

      <div class="order-toolbar">
        <div class="toolbar-input-wrap">
          <span class="mdi mdi-magnify toolbar-input-icon"></span>
          <input v-model="orderSearch" type="text" class="toolbar-input" placeholder="搜索订单号..." />
        </div>
        <select v-model="channelFilter" class="toolbar-select">
          <option v-for="opt in channelOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <select v-model="statusFilter" class="toolbar-select">
          <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <button class="toolbar-btn toolbar-btn-primary" @click="() => {}">
          <span class="mdi mdi-magnify" style="margin-right: 4px; font-size: 14px"></span>
          查询
        </button>
        <button class="toolbar-btn toolbar-btn-outlined" @click="orderSearch = ''; channelFilter = '全部通道'; statusFilter = '全部状态'">
          重置
        </button>
      </div>

      <div class="order-table-wrap">
        <table class="order-table">
          <thead>
            <tr>
              <th class="col-order-id">订单号</th>
              <th class="col-merchant">商户名称</th>
              <th class="col-amount">金额</th>
              <th class="col-channel">支付通道</th>
              <th class="col-status">状态</th>
              <th class="col-time">创建时间</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td class="col-order-id"><span class="order-id">{{ order.id }}</span></td>
              <td class="col-merchant">{{ order.merchant }}</td>
              <td class="col-amount">{{ order.amount }}</td>
              <td class="col-channel">
                <span :class="['chip', order.channel === '支付宝' ? 'chip-blue' : 'chip-green']">
                  <v-icon size="14" style="margin-right: 4px">{{ order.channel === '支付宝' ? 'mdi-alpha-a-circle' : 'mdi-wechat' }}</v-icon>
                  {{ order.channel }}
                </span>
              </td>
              <td class="col-status">
                <span :class="['chip', `chip-${order.chipClass}`]">{{ order.status }}</span>
              </td>
              <td class="col-time">{{ order.time }}</td>
              <td class="col-action">
                <v-btn icon variant="text" size="x-small" title="详情">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
                <v-btn v-if="order.status !== '已关闭'" icon variant="text" size="x-small" title="同步">
                  <v-icon size="18" color="#64748B">mdi-sync</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="order-footer">共 1,234 条</div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const today = dayjs().format('YYYY-MM-DD dddd')

const statCards = [
  { label: '今日交易额', value: '¥ 128,456.00', icon: 'mdi-cash-multiple', gradient: 'bg-gradient-primary' },
  { label: '今日交易笔数', value: '1,234', icon: 'mdi-receipt-text-outline', gradient: 'bg-gradient-success' },
  { label: '今日成功率', value: '98.6%', icon: 'mdi-check-circle-outline', gradient: 'bg-gradient-warning' },
]

const quickEntries = [
  { label: '待审核进件', value: 3, icon: 'mdi-file-clock', bgColor: '#FFF7ED', iconColor: '#F59E0B', path: '/incoming/apply' },
  { label: '待处理退款', value: 5, icon: 'mdi-cash-refund', bgColor: '#FEF2F2', iconColor: '#EF4444', path: '/order/refund' },
]

const orderSearch = ref('')
const channelFilter = ref('全部通道')
const statusFilter = ref('全部状态')
const channelOptions = ['全部通道', '支付宝', '微信支付']
const statusOptions = ['全部状态', '已支付', '待支付', '已关闭']

const recentOrders = [
  { id: 'PAY20260407001234', merchant: '星辰科技有限公司', amount: '¥ 2,580.00', channel: '支付宝', status: '已支付', chipClass: 'green', time: '2026-04-07 14:23:15' },
  { id: 'PAY20260407001233', merchant: '云海数字传媒', amount: '¥ 199.00', channel: '微信', status: '已支付', chipClass: 'green', time: '2026-04-07 14:20:08' },
  { id: 'PAY20260407001232', merchant: '极光电子商务', amount: '¥ 15,800.00', channel: '支付宝', status: '待支付', chipClass: 'amber', time: '2026-04-07 14:18:30' },
  { id: 'PAY20260407001231', merchant: '星辰科技有限公司', amount: '¥ 450.50', channel: '微信', status: '已关闭', chipClass: 'grey', time: '2026-04-07 14:10:22' },
  { id: 'PAY20260407001230', merchant: '鼎盛支付服务', amount: '¥ 8,900.00', channel: '支付宝', status: '已支付', chipClass: 'green', time: '2026-04-07 14:05:11' },
]

const donutChartRef = ref<HTMLElement>()
const areaChartRef = ref<HTMLElement>()
let donutChart: echarts.ECharts | null = null
let areaChart: echarts.ECharts | null = null

function initDonutChart() {
  if (!donutChartRef.value) return
  donutChart = echarts.init(donutChartRef.value)
  donutChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { bottom: 0, itemGap: 24 },
    color: ['#3B9EFF', '#10B981'],
    series: [{
      type: 'pie', radius: ['50%', '75%'], center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
      label: { show: true, position: 'center', formatter: '¥128K\n总交易额', fontSize: 16, fontWeight: 'bold', lineHeight: 24, color: '#1E293B' },
      emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
      data: [{ value: 83496, name: '支付宝' }, { value: 44960, name: '微信支付' }],
    }],
  })
}

function initAreaChart() {
  if (!areaChartRef.value) return
  areaChart = echarts.init(areaChartRef.value)
  const dates = Array.from({ length: 7 }, (_, i) => dayjs().subtract(6 - i, 'day').format('MM-DD'))
  areaChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, itemGap: 24 },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#F1F5F9' } } },
    color: ['#3B9EFF', '#10B981'],
    series: [
      { name: '交易额(万)', type: 'line', smooth: true, data: [8.2, 9.5, 11.3, 10.8, 12.5, 13.1, 12.8],
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,158,255,0.25)' }, { offset: 1, color: 'rgba(59,158,255,0.02)' }]) } },
      { name: '交易笔数(百)', type: 'line', smooth: true, data: [6.8, 7.2, 9.1, 8.5, 10.3, 11.2, 12.3],
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16,185,129,0.2)' }, { offset: 1, color: 'rgba(16,185,129,0.02)' }]) } },
    ],
  })
}

function handleResize() { donutChart?.resize(); areaChart?.resize() }

onMounted(() => { initDonutChart(); initAreaChart(); window.addEventListener('resize', handleResize) })
onUnmounted(() => { window.removeEventListener('resize', handleResize); donutChart?.dispose(); areaChart?.dispose() })
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

/* 欢迎横幅 */
.welcome-banner { background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%); }
.banner-inner { display: flex; align-items: center; justify-content: space-between; padding: 32px 40px; }
.banner-title { font-size: 22px; font-weight: 600; color: #fff; margin-bottom: 8px; }
.banner-sub { font-size: 14px; color: rgba(255,255,255,0.85); }
.banner-date { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 4px; }

/* 数据卡片 */
.card-inner { display: flex; align-items: center; justify-content: space-between; padding: 24px; }
.stat-value { font-size: 28px; font-weight: 700; color: #fff; }
.stat-label { font-size: 13px; color: rgba(255,255,255,0.85); margin-top: 4px; }
.stat-card { transition: transform 0.2s, box-shadow 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important; }

/* 快捷入口 */
.quick-entry { cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.quick-entry:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; }
.entry-inner { display: flex; align-items: center; gap: 16px; padding: 20px 24px; }
.entry-label { font-size: 13px; color: #64748B; }
.entry-value { font-size: 24px; font-weight: 700; color: #1E293B; }

/* 图表区 */
.chart-card { padding: 24px; }
.chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.chart-title { font-size: 16px; font-weight: 600; }
.view-detail-link { color: #3B9EFF; font-size: 13px; cursor: pointer; text-decoration: none; font-weight: 500; }
.view-detail-link:hover { opacity: 0.8; }

/* 订单卡片 */
.order-card { overflow: hidden; }
.order-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 0; }
.order-toolbar { display: flex; align-items: center; gap: 10px; padding: 16px 24px 12px; flex-wrap: wrap; }
.toolbar-input-wrap { position: relative; display: inline-flex; align-items: center; }
.toolbar-input-icon { position: absolute; left: 10px; font-size: 16px; color: #94A3B8; pointer-events: none; }
.toolbar-input { height: 32px; padding: 0 12px 0 32px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; color: #334155; outline: none; width: 180px; background: #fff; }
.toolbar-input:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.toolbar-input::placeholder { color: #94A3B8; }
.toolbar-select { height: 32px; padding: 0 28px 0 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; color: #334155; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 8px center; appearance: none; cursor: pointer; min-width: 120px; }
.toolbar-select:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.toolbar-btn { height: 32px; padding: 0 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; border: none; transition: all 0.15s; }
.toolbar-btn-primary { background: linear-gradient(135deg, #3B9EFF, #7BBFFF); color: #fff; box-shadow: 0 1px 3px rgba(59,158,255,0.3); }
.toolbar-btn-primary:hover { box-shadow: 0 2px 8px rgba(59,158,255,0.4); }
.toolbar-btn-outlined { background: #fff; color: #64748B; border: 1px solid #E2E8F0; }
.toolbar-btn-outlined:hover { border-color: #CBD5E1; background: #F8FAFC; }
.order-footer { text-align: right; padding: 12px 24px; color: #94A3B8; font-size: 13px; border-top: 1px solid #F1F5F9; }
.order-table-wrap { padding: 0 24px; overflow-x: auto; }
.order-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.order-table th { font-weight: 600; color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; background: #FAFBFC; padding: 12px 16px; text-align: left; border-bottom: 1px solid #F1F5F9; white-space: nowrap; }
.order-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; }
.order-table tbody tr:hover { background: #F8FAFC; }
.col-order-id { width: 200px; }
.col-merchant { width: 160px; }
.col-amount { width: 120px; text-align: right !important; font-weight: 600; }
.col-channel { width: 110px; }
.col-status { width: 90px; }
.col-time { width: 170px; color: #64748B; }
.col-action { width: 90px; }
.order-id { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; white-space: nowrap; }

/* 自定义 Chip 样式 */
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; white-space: nowrap; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-amber { background: #FFFBEB; color: #F59E0B; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
</style>
