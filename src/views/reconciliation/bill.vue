<template>
  <div class="page">
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">对账日期</label>
            <input v-model="searchForm.date" type="date" class="field-input" />
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
            <label class="field-label">对账状态</label>
            <select v-model="searchForm.status" class="field-select">
              <option value="">全部</option>
              <option value="0">待对账</option>
              <option value="1">已对账</option>
              <option value="2">有差异</option>
            </select>
          </div>
        </div>
        <div class="search-actions">
          <button class="btn btn-primary" @click="handleSearch"><span class="mdi mdi-magnify btn-icon"></span>查询</button>
          <button class="btn btn-outlined" @click="handleReset">重置</button>
        </div>
      </div>
    </v-card>

    <v-card rounded="lg" flat class="table-card">
      <div class="table-header">
        <div class="table-title">对账单</div>
        <button class="btn btn-primary" @click="handleGenerate"><span class="mdi mdi-file-sync-outline btn-icon"></span>生成对账单</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 120px">对账日期</th>
              <th style="width: 100px">通道类型</th>
              <th style="width: 100px">平台笔数</th>
              <th style="width: 120px">平台金额(元)</th>
              <th style="width: 100px">通道笔数</th>
              <th style="width: 120px">通道金额(元)</th>
              <th style="width: 100px">差异笔数</th>
              <th style="width: 120px">差异金额(元)</th>
              <th style="width: 90px">状态</th>
              <th style="width: 160px">生成时间</th>
              <th style="width: 100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in billList" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-medium">{{ item.billDate }}</td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">{{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}</span>
              </td>
              <td>{{ item.platformCount }}</td>
              <td>{{ item.platformAmount.toFixed(2) }}</td>
              <td>{{ item.channelCount }}</td>
              <td>{{ item.channelAmount.toFixed(2) }}</td>
              <td :class="item.diffCount > 0 ? 'text-danger' : ''">{{ item.diffCount }}</td>
              <td :class="item.diffAmount !== 0 ? 'text-danger' : ''">{{ item.diffAmount.toFixed(2) }}</td>
              <td>
                <span :class="['chip', billStatusClass(item.status)]">{{ billStatusLabel(item.status) }}</span>
              </td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="查看详情" @click="openDetail(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.status === 0" icon variant="text" size="x-small" title="执行对账" @click="handleReconcile(item)">
                  <v-icon size="18" color="#3B9EFF">mdi-check-decagram-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="x-small" title="下载" @click="handleDownload(item)">
                  <v-icon size="18" color="#64748B">mdi-download-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">共 {{ billList.length }} 条</div>
    </v-card>

    <!-- 详情弹窗 -->
    <v-dialog v-model="showDetail" max-width="600">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">对账单详情</span>
          <v-btn icon variant="text" size="small" @click="showDetail = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="dialog-body" v-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">对账概况</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">对账日期</span><span>{{ detailItem.billDate }}</span></div>
              <div class="detail-item"><span class="detail-label">通道类型</span><span :class="['chip', detailItem.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">{{ detailItem.channelType === 'alipay' ? '支付宝' : '微信支付' }}</span></div>
              <div class="detail-item"><span class="detail-label">状态</span><span :class="['chip', billStatusClass(detailItem.status)]">{{ billStatusLabel(detailItem.status) }}</span></div>
              <div class="detail-item"><span class="detail-label">生成时间</span><span>{{ detailItem.ctime }}</span></div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-title">数据对比</div>
            <div class="compare-table">
              <div class="compare-header"><span></span><span>平台</span><span>通道</span><span>差异</span></div>
              <div class="compare-row"><span>交易笔数</span><span>{{ detailItem.platformCount }}</span><span>{{ detailItem.channelCount }}</span><span :class="detailItem.diffCount > 0 ? 'text-danger' : ''">{{ detailItem.diffCount }}</span></div>
              <div class="compare-row"><span>交易金额</span><span>¥{{ detailItem.platformAmount.toFixed(2) }}</span><span>¥{{ detailItem.channelAmount.toFixed(2) }}</span><span :class="detailItem.diffAmount !== 0 ? 'text-danger' : ''">¥{{ detailItem.diffAmount.toFixed(2) }}</span></div>
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
import { ref, reactive } from 'vue'

interface BillItem {
  id: number; billDate: string; channelType: 'alipay' | 'wechat'
  platformCount: number; platformAmount: number; channelCount: number; channelAmount: number
  diffCount: number; diffAmount: number; status: number; ctime: string
}

const searchForm = reactive({ date: '', channelType: '', status: '' })

const billList = ref<BillItem[]>([
  { id: 1, billDate: '2026-04-01', channelType: 'alipay', platformCount: 15, platformAmount: 8920.00, channelCount: 15, channelAmount: 8920.00, diffCount: 0, diffAmount: 0, status: 1, ctime: '2026-04-02 01:00:00' },
  { id: 2, billDate: '2026-04-01', channelType: 'wechat', platformCount: 22, platformAmount: 12350.50, channelCount: 22, channelAmount: 12350.50, diffCount: 0, diffAmount: 0, status: 1, ctime: '2026-04-02 01:00:00' },
  { id: 3, billDate: '2026-04-02', channelType: 'alipay', platformCount: 18, platformAmount: 9650.00, channelCount: 18, channelAmount: 9650.00, diffCount: 0, diffAmount: 0, status: 1, ctime: '2026-04-03 01:00:00' },
  { id: 4, billDate: '2026-04-02', channelType: 'wechat', platformCount: 30, platformAmount: 18200.80, channelCount: 29, channelAmount: 18151.80, diffCount: 1, diffAmount: 49.00, status: 2, ctime: '2026-04-03 01:00:00' },
  { id: 5, billDate: '2026-04-03', channelType: 'alipay', platformCount: 12, platformAmount: 6400.00, channelCount: 12, channelAmount: 6400.00, diffCount: 0, diffAmount: 0, status: 1, ctime: '2026-04-04 01:00:00' },
  { id: 6, billDate: '2026-04-03', channelType: 'wechat', platformCount: 25, platformAmount: 15800.00, channelCount: 25, channelAmount: 15800.00, diffCount: 0, diffAmount: 0, status: 1, ctime: '2026-04-04 01:00:00' },
  { id: 7, billDate: '2026-04-04', channelType: 'alipay', platformCount: 20, platformAmount: 11200.00, channelCount: 20, channelAmount: 11200.00, diffCount: 0, diffAmount: 0, status: 0, ctime: '2026-04-05 01:00:00' },
  { id: 8, billDate: '2026-04-04', channelType: 'wechat', platformCount: 28, platformAmount: 16500.00, channelCount: 28, channelAmount: 16500.00, diffCount: 0, diffAmount: 0, status: 0, ctime: '2026-04-05 01:00:00' },
])

const showDetail = ref(false)
const detailItem = ref<BillItem | null>(null)

function billStatusLabel(s: number) { return ['待对账', '已对账', '有差异'][s] || '未知' }
function billStatusClass(s: number) { return ['chip-grey', 'chip-green', 'chip-red'][s] || 'chip-grey' }
function handleSearch() {}
function handleReset() { searchForm.date = ''; searchForm.channelType = ''; searchForm.status = '' }
function handleGenerate() { alert('对账单生成任务已提交') }
function handleReconcile(item: BillItem) { item.status = 1 }
function handleDownload(_item: BillItem) { alert('下载功能开发中') }
function openDetail(item: BillItem) { detailItem.value = item; showDetail.value = true }
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
.data-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; }
.data-table tbody tr:hover { background: #F8FAFC; }
.font-medium { font-weight: 500; }
.text-grey { color: #94A3B8; }
.text-danger { color: #EF4444; font-weight: 500; }
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-red { background: #FEF2F2; color: #EF4444; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.dialog-title { font-size: 18px; font-weight: 600; color: #1E293B; }
.dialog-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 20px; }
.detail-section { display: flex; flex-direction: column; gap: 12px; }
.detail-title { font-size: 14px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #F1F5F9; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 12px; color: #94A3B8; }
.detail-item > span:last-child { font-size: 14px; color: #334155; }
.compare-table { display: flex; flex-direction: column; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
.compare-header, .compare-row { display: grid; grid-template-columns: 100px 1fr 1fr 1fr; }
.compare-header { background: #FAFBFC; font-size: 12px; font-weight: 600; color: #64748B; }
.compare-header span, .compare-row span { padding: 10px 16px; }
.compare-row { font-size: 13px; color: #334155; border-top: 1px solid #F1F5F9; }
.compare-row span:first-child { color: #64748B; font-weight: 500; }
</style>
