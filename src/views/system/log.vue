<template>
  <div class="page">
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">操作人</label>
            <input v-model="searchForm.operator" type="text" class="field-input" placeholder="请输入操作人" />
          </div>
          <div class="field-group">
            <label class="field-label">操作模块</label>
            <select v-model="searchForm.module" class="field-select">
              <option value="">全部</option>
              <option value="auth">登录认证</option>
              <option value="merchant">商户管理</option>
              <option value="incoming">进件管理</option>
              <option value="payment">支付配置</option>
              <option value="order">订单中心</option>
              <option value="system">系统管理</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">操作类型</label>
            <select v-model="searchForm.action" class="field-select">
              <option value="">全部</option>
              <option value="login">登录</option>
              <option value="create">新增</option>
              <option value="update">修改</option>
              <option value="delete">删除</option>
              <option value="export">导出</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">操作时间</label>
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
        <div class="table-title">操作日志</div>
        <button class="btn btn-outlined" @click="handleExport"><span class="mdi mdi-download btn-icon"></span>导出</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 100px">操作人</th>
              <th style="width: 100px">操作模块</th>
              <th style="width: 80px">操作类型</th>
              <th>操作描述</th>
              <th style="width: 120px">IP 地址</th>
              <th style="width: 80px">结果</th>
              <th style="width: 160px">操作时间</th>
              <th style="width: 80px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in logList" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-medium">{{ item.operator }}</td>
              <td>{{ moduleLabel(item.module) }}</td>
              <td>
                <span :class="['chip', actionClass(item.action)]">{{ actionLabel(item.action) }}</span>
              </td>
              <td class="text-ellipsis">{{ item.description }}</td>
              <td><code class="code-text">{{ item.ip }}</code></td>
              <td>
                <span :class="['chip', item.success ? 'chip-green' : 'chip-red']">{{ item.success ? '成功' : '失败' }}</span>
              </td>
              <td class="text-grey">{{ formatTimestamp(item.ctime) }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="详情" @click="openDetail(item)">
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
          <span class="dialog-title">日志详情</span>
          <v-btn icon variant="text" size="small" @click="showDetail = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="dialog-body" v-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">操作信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">操作人</span><span>{{ detailItem.operator }}</span></div>
              <div class="detail-item"><span class="detail-label">操作模块</span><span>{{ moduleLabel(detailItem.module) }}</span></div>
              <div class="detail-item"><span class="detail-label">操作类型</span><span :class="['chip', actionClass(detailItem.action)]">{{ actionLabel(detailItem.action) }}</span></div>
              <div class="detail-item"><span class="detail-label">操作结果</span><span :class="['chip', detailItem.success ? 'chip-green' : 'chip-red']">{{ detailItem.success ? '成功' : '失败' }}</span></div>
              <div class="detail-item"><span class="detail-label">IP 地址</span><code class="code-text">{{ detailItem.ip }}</code></div>
              <div class="detail-item"><span class="detail-label">User-Agent</span><span class="text-small">{{ detailItem.userAgent }}</span></div>
              <div class="detail-item"><span class="detail-label">操作时间</span><span>{{ formatTimestamp(detailItem.ctime) }}</span></div>
              <div class="detail-item"><span class="detail-label">耗时</span><span>{{ detailItem.duration }}ms</span></div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-title">操作描述</div>
            <div class="detail-desc">{{ detailItem.description }}</div>
          </div>
          <div v-if="detailItem.requestData" class="detail-section">
            <div class="detail-title">请求参数</div>
            <pre class="code-block">{{ detailItem.requestData }}</pre>
          </div>
        </div>
        <div class="dialog-footer"><button class="btn btn-outlined" @click="showDetail = false">关闭</button></div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getLogList, getLogDetail, exportLogs, type LogItem } from '@/api/system'
import { formatTimestamp } from '@/utils/format'

const searchForm = reactive({ operator: '', module: '', action: '', date: '' })

const logList = ref<LogItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)

const showDetail = ref(false)
const detailItem = ref<LogItem | null>(null)
const detailLoading = ref(false)

function moduleLabel(m: string) { return ({ auth: '登录认证', merchant: '商户管理', incoming: '进件管理', payment: '支付配置', order: '订单中心', system: '系统管理' } as Record<string, string>)[m] || m }
function actionLabel(a: string) { return ({ login: '登录', create: '新增', update: '修改', delete: '删除', export: '导出' } as Record<string, string>)[a] || a }
function actionClass(a: string) { return ({ login: 'chip-blue', create: 'chip-green', update: 'chip-amber', delete: 'chip-red', export: 'chip-purple' } as Record<string, string>)[a] || 'chip-grey' }

async function loadData() {
  loading.value = true
  try {
    const params: { page: number; pageSize: number; operator?: string; module?: string; action?: string; date?: string } = {
      page: page.value,
      pageSize: pageSize.value,
    }
    if (searchForm.operator) params.operator = searchForm.operator
    if (searchForm.module) params.module = searchForm.module
    if (searchForm.action) params.action = searchForm.action
    if (searchForm.date) params.date = searchForm.date
    const res = await getLogList(params)
    logList.value = res.list
    total.value = res.total
  } catch (e) {
    console.error('加载日志列表失败', e)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.operator = ''
  searchForm.module = ''
  searchForm.action = ''
  searchForm.date = ''
  page.value = 1
  loadData()
}

async function handleExport() {
  try {
    const params: Record<string, any> = {}
    if (searchForm.operator) params.operator = searchForm.operator
    if (searchForm.module) params.module = searchForm.module
    if (searchForm.action) params.action = searchForm.action
    if (searchForm.date) params.date = searchForm.date
    await exportLogs(params, 'operation-logs.csv')
  } catch (e) {
    console.error('导出失败', e)
  }
}

async function openDetail(item: LogItem) {
  showDetail.value = true
  detailItem.value = item
  detailLoading.value = true
  try {
    const full = await getLogDetail(item.id)
    detailItem.value = full
  } catch (e) {
    console.error('加载日志详情失败', e)
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => { loadData() })
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
.text-ellipsis { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.code-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; }
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-amber { background: #FFFBEB; color: #F59E0B; }
.chip-red { background: #FEF2F2; color: #EF4444; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
.chip-purple { background: #F5F3FF; color: #8B5CF6; }
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
.text-small { font-size: 12px !important; word-break: break-all; }
.detail-desc { font-size: 14px; color: #334155; line-height: 1.6; }
.code-block { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #334155; background: #F8FAFC; padding: 12px 16px; border-radius: 8px; border: 1px solid #E2E8F0; white-space: pre-wrap; word-break: break-all; line-height: 1.6; margin: 0; }
</style>
