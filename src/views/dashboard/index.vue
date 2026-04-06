<template>
  <div class="dashboard">
    <div class="welcome-section">
      <h1>欢迎使用 GoPay 支付平台运营端</h1>
      <a-button type="primary" size="large">查询系统</a-button>
    </div>

    <!-- 数据概览 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="8">
        <a-card class="stat-card">
          <a-statistic
            title="商户总数"
            :value="statsData.merchantTotal"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <ShopOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card">
          <a-statistic
            title="代理商总数"
            :value="statsData.agentTotal"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card">
          <a-statistic
            title="今日交易额"
            :value="statsData.todayAmount"
            prefix="¥"
            :precision="2"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <DollarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 订单统计 -->
    <a-row :gutter="16" class="order-stats-row">
      <a-col :span="12">
        <a-card title="支付订单统计" class="order-card">
          <div class="order-stats">
            <div class="stat-item">
              <span class="label">订单数量</span>
              <span class="value">{{ orderStats.payment.count }}</span>
            </div>
            <div class="stat-item">
              <span class="label">订单金额</span>
              <span class="value">¥{{ orderStats.payment.amount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">平均单笔</span>
              <span class="value">¥{{ orderStats.payment.avgAmount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">最大单笔</span>
              <span class="value">¥{{ orderStats.payment.maxAmount }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="退款订单统计" class="order-card">
          <div class="order-stats">
            <div class="stat-item">
              <span class="label">订单数量</span>
              <span class="value">{{ orderStats.refund.count }}</span>
            </div>
            <div class="stat-item">
              <span class="label">订单金额</span>
              <span class="value">¥{{ orderStats.refund.amount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">平均单笔</span>
              <span class="value">¥{{ orderStats.refund.avgAmount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">最大单笔</span>
              <span class="value">¥{{ orderStats.refund.maxAmount }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 通知公告和交易统计 -->
    <a-row :gutter="16" class="bottom-row">
      <a-col :span="12">
        <a-card title="通知公告" class="notice-card">
          <a-list
            :data-source="notices"
            :split="false"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a>{{ item.title }}</a>
                  </template>
                  <template #description>
                    {{ item.date }}
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          <div class="view-more">
            <a>查看更多</a>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="交易统计" class="chart-card">
          <div ref="chartRef" style="width: 100%; height: 300px;"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ShopOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'

const statsData = ref({
  merchantTotal: 29,
  agentTotal: 29,
  todayAmount: 1234.56
})

const orderStats = ref({
  payment: {
    count: 3,
    amount: '1.02',
    avgAmount: '0.34',
    maxAmount: '1.00'
  },
  refund: {
    count: 0,
    amount: '0.00',
    avgAmount: '0.00',
    maxAmount: '0.00'
  }
})

const notices = ref([
  { title: '公告功能现在尚未开发完成，请耐心等待！', date: '06-01' },
  { title: '公告功能现在尚未开发完成，请耐心等待！', date: '06-01' },
  { title: '公告功能现在尚未开发完成，请耐心等待！', date: '06-01' },
  { title: '公告功能现在尚未开发完成，请耐心等待！', date: '06-01' },
  { title: '公告功能现在尚未开发完成，请耐心等待！', date: '06-01' }
])

const chartRef = ref<HTMLElement>()

onMounted(() => {
  initChart()
})

const initChart = () => {
  if (!chartRef.value) return

  const chart = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['支付金额', '退款金额', '支付笔数', '退款笔数']
    },
    xAxis: {
      type: 'category',
      data: ['2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06', '2026-04-07']
    },
    yAxis: [
      {
        type: 'value',
        name: '金额（元）'
      },
      {
        type: 'value',
        name: '笔数'
      }
    ],
    series: [
      {
        name: '支付金额',
        type: 'line',
        data: [0.2, 0.5, 0.8, 1.0, 0.6, 0.9, 1.02],
        smooth: true
      },
      {
        name: '退款金额',
        type: 'line',
        data: [0, 0, 0, 0, 0, 0, 0],
        smooth: true
      },
      {
        name: '支付笔数',
        type: 'line',
        yAxisIndex: 1,
        data: [1, 1, 2, 2, 1, 2, 3],
        smooth: true
      },
      {
        name: '退款笔数',
        type: 'line',
        yAxisIndex: 1,
        data: [0, 0, 0, 0, 0, 0, 0],
        smooth: true
      }
    ]
  }

  chart.setOption(option)

  // 响应式
  window.addEventListener('resize', () => {
    chart.resize()
  })
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 8px;
  color: white;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-section h1 {
  color: white;
  margin: 0;
  font-size: 24px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.order-stats-row {
  margin-bottom: 24px;
}

.order-card {
  height: 100%;
}

.order-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item .label {
  font-size: 14px;
  color: #666;
}

.stat-item .value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.bottom-row {
  margin-bottom: 24px;
}

.notice-card,
.chart-card {
  height: 100%;
}

.view-more {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
