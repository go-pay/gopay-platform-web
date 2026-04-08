<template>
  <div class="page">
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">订单号</label>
            <input v-model="searchForm.orderNo" type="text" class="field-input" placeholder="请输入订单号" />
          </div>
          <div class="field-group">
            <label class="field-label">差异类型</label>
            <select v-model="searchForm.diffType" class="field-select">
              <option value="">全部</option>
              <option value="platform_only">平台多单</option>
              <option value="channel_only">通道多单</option>
              <option value="amount_mismatch">金额不一致</option>
              <option value="status_mismatch">状态不一致</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">处理状态</label>
            <select v-model="searchForm.handleStatus" class="field-select">
              <option value="">全部</option>
              <option value="0">待处理</option>
              <option value="1">已处理</option>
              <option value="2">已忽略</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">对账日期</label>
            <input v-model="searchForm.date" type="date" class="field-input" />
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
        <div class="table-title">差异记录</div>
        <button class="btn btn-outlined" @click="handleExport"><span class="mdi mdi-download btn-icon"></span>导出</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 120px">对账日期</th>
              <th style="width: 160px">订单号</th>
              <th style="width: 120px">通道类型</th>
              <th style="width: 140px">差异类型</th>
              <th style="width: 110px">平台金额(元)</th>
              <th style="width: 110px">通道金额(元)</th>
              <th style="width: 110px">差异金额(元)</th>
              <th style="width: 95px">处理状态</th>
              <th>处理备注</th>
              <th style="width: 100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in diffList" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-medium">{{ item.billDate }}</td>
              <td><code class="code-text">{{ item.orderNo }}</code></td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">{{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}</span>
              </td>
              <td>
                <span :class="['chip', diffTypeClass(item.diffType)]">{{ diffTypeLabel(item.diffType) }}</span>
              </td>
              <td>{{ item.platformAmount !== null ? item.platformAmount.toFixed(2) : '-' }}</td>
              <td>{{ item.channelAmount !== null ? item.channelAmount.toFixed(2) : '-' }}</td>
              <td class="text-danger">{{ item.diffAmount.toFixed(2) }}</td>
              <td>
                <span :class="['chip', handleStatusClass(item.handleStatus)]">{{ handleStatusLabel(item.handleStatus) }}</span>
              </td>
              <td class="text-grey text-ellipsis">{{ item.handleRemark || '-' }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="查看" @click="openDetail(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.handleStatus === 0" icon variant="text" size="x-small" title="处理" @click="openHandleDialog(item)">
                  <v-icon size="18" color="#3B9EFF">mdi-check-circle-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">共 {{ diffList.length }} 条</div>
    </v-card>

    <!-- 详情弹窗 -->
    <v-dialog v-model="showDetail" max-width="560">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">差异详情</span>
          <v-btn icon variant="text" size="small" @click="showDetail = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="dialog-body" v-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">差异信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">对账日期</span><span>{{ detailItem.billDate }}</span></div>
              <div class="detail-item"><span class="detail-label">订单号</span><code class="code-text">{{ detailItem.orderNo }}</code></div>
              <div class="detail-item"><span class="detail-label">通道类型</span><span :class="['chip', detailItem.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">{{ detailItem.channelType === 'alipay' ? '支付宝' : '微信支付' }}</span></div>
              <div class="detail-item"><span class="detail-label">差异类型</span><span :class="['chip', diffTypeClass(detailItem.diffType)]">{{ diffTypeLabel(detailItem.diffType) }}</span></div>
              <div class="detail-item"><span class="detail-label">平台金额</span><span>{{ detailItem.platformAmount !== null ? '¥' + detailItem.platformAmount.toFixed(2) : '-' }}</span></div>
              <div class="detail-item"><span class="detail-label">通道金额</span><span>{{ detailItem.channelAmount !== null ? '¥' + detailItem.channelAmount.toFixed(2) : '-' }}</span></div>
              <div class="detail-item"><span class="detail-label">差异金额</span><span class="text-danger">¥{{ detailItem.diffAmount.toFixed(2) }}</span></div>
              <div class="detail-item"><span class="detail-label">处理状态</span><span :class="['chip', handleStatusClass(detailItem.handleStatus)]">{{ handleStatusLabel(detailItem.handleStatus) }}</span></div>
              <div class="detail-item"><span class="detail-label">处理人</span><span>{{ detailItem.handler || '-' }}</span></div>
              <div class="detail-item"><span class="detail-label">处理备注</span><span>{{ detailItem.handleRemark || '-' }}</span></div>
            </div>
          </div>
        </div>
        <div class="dialog-footer"><button class="btn btn-outlined" @click="showDetail = false">关闭</button></div>
      </v-card>
    </v-dialog>

    <!-- 处理弹窗 -->
    <v-dialog v-model="showHandleDialog" max-width="480" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">处理差异</span>
          <v-btn icon variant="text" size="small" @click="showHandleDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="dialog-body">
          <div class="handle-info" v-if="handleItem">
            <div><span class="handle-label">订单号：</span>{{ handleItem.orderNo }}</div>
            <div><span class="handle-label">差异类型：</span>{{ diffTypeLabel(handleItem.diffType) }}</div>
            <div><span class="handle-label">差异金额：</span><span class="text-danger">¥{{ handleItem.diffAmount.toFixed(2) }}</span></div>
          </div>
          <div class="form-row">
            <label class="form-label">处理方式 <span class="required">*</span></label>
            <select v-model="handleForm.action" class="form-select">
              <option value="">请选择</option>
              <option value="resolve">标记已处理</option>
              <option value="ignore">忽略</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">处理备注</label>
            <textarea v-model="handleForm.remark" class="form-textarea" placeholder="请输入处理说明" rows="3"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showHandleDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleConfirm">确认</button>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface DiffItem {
  id: number; billDate: string; orderNo: string; channelType: 'alipay' | 'wechat'
  diffType: string; platformAmount: number | null; channelAmount: number | null; diffAmount: number
  handleStatus: number; handleRemark: string; handler: string
}

const searchForm = reactive({ orderNo: '', diffType: '', handleStatus: '', date: '' })

const diffList = ref<DiffItem[]>([
  { id: 1, billDate: '2026-04-02', orderNo: 'PAY20260402100002', channelType: 'wechat', diffType: 'platform_only', platformAmount: 49.00, channelAmount: null, diffAmount: 49.00, handleStatus: 1, handleRemark: '用户支付失败，通道未记录，已确认', handler: 'admin' },
  { id: 2, billDate: '2026-04-03', orderNo: 'PAY20260403100005', channelType: 'alipay', diffType: 'amount_mismatch', platformAmount: 199.00, channelAmount: 189.00, diffAmount: 10.00, handleStatus: 0, handleRemark: '', handler: '' },
  { id: 3, billDate: '2026-04-03', orderNo: 'PAY20260403100008', channelType: 'wechat', diffType: 'channel_only', platformAmount: null, channelAmount: 88.00, diffAmount: 88.00, handleStatus: 0, handleRemark: '', handler: '' },
  { id: 4, billDate: '2026-04-04', orderNo: 'PAY20260404100003', channelType: 'alipay', diffType: 'status_mismatch', platformAmount: 350.00, channelAmount: 350.00, diffAmount: 0, handleStatus: 2, handleRemark: '通道延迟到账，状态已同步', handler: 'admin' },
  { id: 5, billDate: '2026-04-04', orderNo: 'PAY20260404100010', channelType: 'wechat', diffType: 'amount_mismatch', platformAmount: 520.00, channelAmount: 500.00, diffAmount: 20.00, handleStatus: 0, handleRemark: '', handler: '' },
])

const showDetail = ref(false)
const detailItem = ref<DiffItem | null>(null)
const showHandleDialog = ref(false)
const handleItem = ref<DiffItem | null>(null)
const handleForm = reactive({ action: '', remark: '' })

function diffTypeLabel(t: string) { return { platform_only: '平台多单', channel_only: '通道多单', amount_mismatch: '金额不一致', status_mismatch: '状态不一致' }[t] || t }
function diffTypeClass(t: string) { return { platform_only: 'chip-amber', channel_only: 'chip-purple', amount_mismatch: 'chip-red', status_mismatch: 'chip-teal' }[t] || 'chip-grey' }
function handleStatusLabel(s: number) { return ['待处理', '已处理', '已忽略'][s] || '未知' }
function handleStatusClass(s: number) { return ['chip-amber', 'chip-green', 'chip-grey'][s] || 'chip-grey' }

function handleSearch() {}
function handleReset() { searchForm.orderNo = ''; searchForm.diffType = ''; searchForm.handleStatus = ''; searchForm.date = '' }
function handleExport() { alert('导出功能开发中') }
function openDetail(item: DiffItem) { detailItem.value = item; showDetail.value = true }
function openHandleDialog(item: DiffItem) { handleItem.value = item; handleForm.action = ''; handleForm.remark = ''; showHandleDialog.value = true }
function handleConfirm() {
  if (!handleForm.action || !handleItem.value) return
  const item = diffList.value.find(d => d.id === handleItem.value!.id)
  if (item) { item.handleStatus = handleForm.action === 'resolve' ? 1 : 2; item.handleRemark = handleForm.remark; item.handler = 'admin' }
  showHandleDialog.value = false
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
.font-medium { font-weight: 500; }
.text-grey { color: #94A3B8; }
.text-danger { color: #EF4444; font-weight: 500; }
.text-ellipsis { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.code-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; }
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
.dialog-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 20px; }
.detail-section { display: flex; flex-direction: column; gap: 12px; }
.detail-title { font-size: 14px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #F1F5F9; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 12px; color: #94A3B8; }
.detail-item > span:last-child, .detail-item > code { font-size: 14px; color: #334155; }
.handle-info { background: #F8FAFC; border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: #334155; }
.handle-label { color: #64748B; font-weight: 500; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; color: #475569; font-weight: 500; }
.required { color: #EF4444; }
.form-select { height: 38px; padding: 0 28px 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 10px center; appearance: none; cursor: pointer; }
.form-select:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.form-textarea { padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; resize: vertical; font-family: inherit; }
.form-textarea:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
</style>
