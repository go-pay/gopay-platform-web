<template>
  <div class="page">
    <!-- 搜索栏 -->
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">转账单号</label>
            <input v-model="searchForm.transferNo" type="text" class="field-input" placeholder="请输入转账单号" />
          </div>
          <div class="field-group">
            <label class="field-label">商户名称</label>
            <input v-model="searchForm.merchantName" type="text" class="field-input" placeholder="请输入商户名称" />
          </div>
          <div class="field-group">
            <label class="field-label">转账状态</label>
            <select v-model="searchForm.status" class="field-select">
              <option value="">全部</option>
              <option value="0">处理中</option>
              <option value="1">转账成功</option>
              <option value="2">转账失败</option>
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
        <div class="table-title">转账订单</div>
        <div class="table-header-actions">
          <button class="btn btn-primary" @click="openCreateDialog">
            <span class="mdi mdi-plus btn-icon"></span>发起转账
          </button>
          <button class="btn btn-outlined" @click="handleExport">
            <span class="mdi mdi-download btn-icon"></span>导出
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 160px">转账单号</th>
              <th style="width: 120px">商户名称</th>
              <th style="width: 100px">转账金额(元)</th>
              <th style="width: 120px">通道类型</th>
              <th style="width: 100px">收款方式</th>
              <th style="width: 160px">收款账号</th>
              <th style="width: 120px">收款人</th>
              <th style="width: 115px">状态</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 160px">完成时间</th>
              <th style="width: 80px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in transferList" :key="item.id">
              <td><code class="code-text">{{ item.transferNo }}</code></td>
              <td>{{ item.merchantName }}</td>
              <td class="font-medium">{{ item.amount.toFixed(2) }}</td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </td>
              <td>{{ payeeTypeLabel(item.payeeType) }}</td>
              <td><code class="code-text">{{ item.payeeAccount }}</code></td>
              <td>{{ item.payeeName }}</td>
              <td>
                <span :class="['chip', transferStatusClass(item.status)]">{{ transferStatusLabel(item.status) }}</span>
              </td>
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
        <span class="table-summary">总转账: <strong>¥{{ totalTransfer }}</strong></span>
        <span>共 {{ transferList.length }} 条</span>
      </div>
    </v-card>

    <!-- 发起转账弹窗 -->
    <v-dialog v-model="showCreateDialog" max-width="560" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">发起转账</span>
          <v-btn icon variant="text" size="small" @click="showCreateDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label class="form-label">商户 <span class="required">*</span></label>
            <select v-model="form.merchantId" class="form-select">
              <option value="">请选择商户</option>
              <option v-for="m in merchantOptions" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">通道类型 <span class="required">*</span></label>
            <select v-model="form.channelType" class="form-select">
              <option value="">请选择</option>
              <option value="alipay">支付宝</option>
              <option value="wechat">微信支付</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">转账金额(元) <span class="required">*</span></label>
            <input v-model="form.amount" type="number" step="0.01" min="0.01" class="form-input" placeholder="请输入转账金额" />
          </div>
          <div class="form-row">
            <label class="form-label">收款方式 <span class="required">*</span></label>
            <select v-model="form.payeeType" class="form-select">
              <option value="">请选择</option>
              <option value="account">账户</option>
              <option value="openid">OpenID</option>
              <option value="phone">手机号</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">收款账号 <span class="required">*</span></label>
            <input v-model="form.payeeAccount" type="text" class="form-input" placeholder="请输入收款账号" />
          </div>
          <div class="form-row">
            <label class="form-label">收款人姓名 <span class="required">*</span></label>
            <input v-model="form.payeeName" type="text" class="form-input" placeholder="请输入收款人姓名" />
          </div>
          <div class="form-row">
            <label class="form-label">转账说明</label>
            <textarea v-model="form.remark" class="form-textarea" placeholder="请输入转账说明" rows="2"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showCreateDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleSubmitTransfer">确认转账</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- 详情弹窗 -->
    <v-dialog v-model="showDetail" max-width="560">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">转账详情</span>
          <v-btn icon variant="text" size="small" @click="showDetail = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body" v-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">转账信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">转账单号</span><code class="code-text">{{ detailItem.transferNo }}</code></div>
              <div class="detail-item"><span class="detail-label">商户名称</span><span>{{ detailItem.merchantName }}</span></div>
              <div class="detail-item"><span class="detail-label">转账金额</span><span class="amount-text">¥{{ detailItem.amount.toFixed(2) }}</span></div>
              <div class="detail-item">
                <span class="detail-label">通道类型</span>
                <span :class="['chip', detailItem.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ detailItem.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">转账状态</span>
                <span :class="['chip', transferStatusClass(detailItem.status)]">{{ transferStatusLabel(detailItem.status) }}</span>
              </div>
              <div class="detail-item"><span class="detail-label">通道单号</span><code class="code-text">{{ detailItem.tradeTransferNo || '-' }}</code></div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-title">收款方信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">收款方式</span><span>{{ payeeTypeLabel(detailItem.payeeType) }}</span></div>
              <div class="detail-item"><span class="detail-label">收款账号</span><code class="code-text">{{ detailItem.payeeAccount }}</code></div>
              <div class="detail-item"><span class="detail-label">收款人</span><span>{{ detailItem.payeeName }}</span></div>
              <div class="detail-item"><span class="detail-label">转账说明</span><span>{{ detailItem.remark || '-' }}</span></div>
              <div class="detail-item"><span class="detail-label">创建时间</span><span>{{ detailItem.ctime }}</span></div>
              <div class="detail-item"><span class="detail-label">完成时间</span><span>{{ detailItem.finishTime || '-' }}</span></div>
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

interface TransferOrder {
  id: number
  transferNo: string
  tradeTransferNo: string
  merchantId: number
  merchantName: string
  amount: number
  channelType: 'alipay' | 'wechat'
  payeeType: string
  payeeAccount: string
  payeeName: string
  status: number // 0-处理中 1-成功 2-失败
  remark: string
  ctime: string
  finishTime: string
}

const merchantOptions = [
  { id: 1, name: '星辰科技有限公司' },
  { id: 2, name: '云海数字传媒' },
  { id: 3, name: '极光电子商务' },
  { id: 5, name: '蓝鲸网络科技' },
  { id: 6, name: '九州在线商贸' },
]

const searchForm = reactive({ transferNo: '', merchantName: '', status: '', channelType: '' })

const transferList = ref<TransferOrder[]>([
  { id: 1, transferNo: 'TRF20260401001', tradeTransferNo: '20260401110070001001', merchantId: 1, merchantName: '星辰科技有限公司', amount: 5000.00, channelType: 'alipay', payeeType: 'account', payeeAccount: 'zhangsan@163.com', payeeName: '张三', status: 1, remark: '佣金结算', ctime: '2026-04-01 10:00:00', finishTime: '2026-04-01 10:00:30' },
  { id: 2, transferNo: 'TRF20260402001', tradeTransferNo: '1342000001202604020000001', merchantId: 2, merchantName: '云海数字传媒', amount: 2000.00, channelType: 'wechat', payeeType: 'openid', payeeAccount: 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o', payeeName: '李四', status: 1, remark: '创作者收益提现', ctime: '2026-04-02 14:00:00', finishTime: '2026-04-02 14:00:45' },
  { id: 3, transferNo: 'TRF20260403001', tradeTransferNo: '', merchantId: 3, merchantName: '极光电子商务', amount: 8500.00, channelType: 'alipay', payeeType: 'account', payeeAccount: 'wangwu@corp.com', payeeName: '王五', status: 0, remark: '供应商货款', ctime: '2026-04-03 09:30:00', finishTime: '' },
  { id: 4, transferNo: 'TRF20260404001', tradeTransferNo: '', merchantId: 5, merchantName: '蓝鲸网络科技', amount: 1200.00, channelType: 'wechat', payeeType: 'openid', payeeAccount: 'oUpF8uGGG_M2pxb1Q9zNjWeS6o', payeeName: '孙七', status: 2, remark: '服务费结算', ctime: '2026-04-04 16:00:00', finishTime: '2026-04-04 16:01:00' },
  { id: 5, transferNo: 'TRF20260405001', tradeTransferNo: '20260405110070001005', merchantId: 1, merchantName: '星辰科技有限公司', amount: 3600.00, channelType: 'alipay', payeeType: 'phone', payeeAccount: '13800138010', payeeName: '赵六', status: 1, remark: '推广奖励', ctime: '2026-04-05 11:00:00', finishTime: '2026-04-05 11:00:25' },
  { id: 6, transferNo: 'TRF20260406001', tradeTransferNo: '1342000001202604060000002', merchantId: 6, merchantName: '九州在线商贸', amount: 15000.00, channelType: 'wechat', payeeType: 'openid', payeeAccount: 'oUpF8uHHH_M2pxb1Q9zNjWeS6o', payeeName: '周八', status: 1, remark: '月度分成', ctime: '2026-04-06 08:45:00', finishTime: '2026-04-06 08:45:40' },
])

const totalTransfer = computed(() => transferList.value.filter(t => t.status === 1).reduce((s, t) => s + t.amount, 0).toFixed(2))

// 发起转账
const showCreateDialog = ref(false)
const form = reactive({ merchantId: '' as string | number, channelType: '', amount: '' as string | number, payeeType: '', payeeAccount: '', payeeName: '', remark: '' })

function openCreateDialog() {
  form.merchantId = ''; form.channelType = ''; form.amount = ''; form.payeeType = ''
  form.payeeAccount = ''; form.payeeName = ''; form.remark = ''
  showCreateDialog.value = true
}

function handleSubmitTransfer() {
  if (!form.merchantId || !form.channelType || !form.amount || !form.payeeType || !form.payeeAccount || !form.payeeName) return
  const merchant = merchantOptions.find(m => m.id === Number(form.merchantId))
  const maxId = Math.max(...transferList.value.map(t => t.id), 0)
  transferList.value.unshift({
    id: maxId + 1,
    transferNo: `TRF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(maxId + 1).padStart(3, '0')}`,
    tradeTransferNo: '', merchantId: Number(form.merchantId), merchantName: merchant?.name || '',
    amount: Number(form.amount), channelType: form.channelType as 'alipay' | 'wechat',
    payeeType: form.payeeType, payeeAccount: form.payeeAccount, payeeName: form.payeeName,
    status: 0, remark: form.remark,
    ctime: new Date().toISOString().replace('T', ' ').slice(0, 19), finishTime: '',
  })
  showCreateDialog.value = false
}

// 详情
const showDetail = ref(false)
const detailItem = ref<TransferOrder | null>(null)

function transferStatusLabel(s: number) { return ['处理中', '转账成功', '转账失败'][s] || '未知' }
function transferStatusClass(s: number) { return ['chip-amber', 'chip-green', 'chip-red'][s] || 'chip-grey' }
function payeeTypeLabel(t: string) {
  const map: Record<string, string> = { account: '账户', openid: 'OpenID', phone: '手机号' }
  return map[t] || t
}

function handleSearch() { /* Mock */ }
function handleReset() { searchForm.transferNo = ''; searchForm.merchantName = ''; searchForm.status = ''; searchForm.channelType = '' }
function handleExport() { alert('导出功能开发中') }
function openDetail(item: TransferOrder) { detailItem.value = item; showDetail.value = true }
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
.data-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; white-space: nowrap; }
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
.dialog-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; max-height: 65vh; overflow-y: auto; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 20px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; color: #475569; font-weight: 500; }
.required { color: #EF4444; }
.form-input { height: 38px; padding: 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; }
.form-input:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.form-select { height: 38px; padding: 0 28px 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 10px center; appearance: none; cursor: pointer; }
.form-select:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.form-textarea { padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; resize: vertical; font-family: inherit; }
.form-textarea:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.detail-section { display: flex; flex-direction: column; gap: 12px; }
.detail-title { font-size: 14px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #F1F5F9; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 12px; color: #94A3B8; }
.detail-item > span:last-child, .detail-item > code { font-size: 14px; color: #334155; }
.amount-text { font-weight: 600; color: #1E293B; font-size: 16px !important; }
</style>
