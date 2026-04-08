<template>
  <div class="page">
    <!-- 搜索栏 -->
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">应用名称</label>
            <input v-model="searchForm.name" type="text" class="field-input" placeholder="请输入应用名称" />
          </div>
          <div class="field-group">
            <label class="field-label">AppID</label>
            <input v-model="searchForm.appid" type="text" class="field-input" placeholder="请输入AppID" />
          </div>
          <div class="field-group">
            <label class="field-label">平台类型</label>
            <select v-model="searchForm.platformType" class="field-select">
              <option value="">全部</option>
              <option v-for="pt in platformTypes" :key="pt.value" :value="pt.value">{{ pt.label }}</option>
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
        <div class="table-title">商户应用</div>
        <button class="btn btn-primary" @click="showDialog = true; dialogMode = 'add'; resetForm()">
          <span class="mdi mdi-plus btn-icon"></span>新增应用
        </button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 160px">应用名称</th>
              <th style="width: 140px">AppID</th>
              <th style="width: 120px">所属商户</th>
              <th style="width: 150px">平台类型</th>
              <th style="width: 100px">商户类型</th>
              <th style="width: 80px">状态</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in apps" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-medium">{{ item.name }}</td>
              <td><code class="code-text">{{ item.appid }}</code></td>
              <td>{{ item.merchantName }}</td>
              <td>
                <span :class="['chip', getPlatformChipClass(item.platformType)]">
                  {{ getPlatformLabel(item.platformType) }}
                </span>
              </td>
              <td>{{ item.merchantType === 0 ? '商户' : '服务商' }}</td>
              <td>
                <span :class="['chip', item.status === 1 ? 'chip-green' : 'chip-grey']">
                  {{ item.status === 1 ? '正常' : '禁用' }}
                </span>
              </td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="编辑" @click="handleEdit(item)">
                  <v-icon size="18" color="#64748B">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="x-small" title="配置" @click="handleConfig(item)">
                  <v-icon size="18" color="#64748B">mdi-cog-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>共 {{ total }} 条</span>
      </div>
    </v-card>

    <!-- 新增/编辑弹窗 -->
    <v-dialog v-model="showDialog" max-width="560" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">{{ dialogMode === 'add' ? '新增应用' : '编辑应用' }}</span>
          <v-btn icon variant="text" size="small" @click="showDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label class="form-label">应用名称 <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="form-input" placeholder="请输入应用名称" />
          </div>
          <div class="form-row">
            <label class="form-label">AppID <span class="required">*</span></label>
            <input v-model="form.appid" type="text" class="form-input" placeholder="请输入AppID" />
          </div>
          <div class="form-row">
            <label class="form-label">所属商户 <span class="required">*</span></label>
            <select v-model="form.merchantId" class="form-select">
              <option value="">请选择商户</option>
              <option v-for="m in merchantOptions" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">平台类型 <span class="required">*</span></label>
            <select v-model="form.platformType" class="form-select">
              <option value="">请选择平台</option>
              <option v-for="pt in platformTypes" :key="pt.value" :value="pt.value">{{ pt.label }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">商户类型</label>
            <select v-model="form.merchantType" class="form-select">
              <option :value="0">商户</option>
              <option :value="1">服务商</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">回调通知 URL</label>
            <input v-model="form.notifyUrl" type="text" class="form-input" placeholder="https://example.com/notify" />
          </div>
          <div class="form-row">
            <label class="form-label">支付 Return URL</label>
            <input v-model="form.returnUrl" type="text" class="form-input" placeholder="https://example.com/return" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleSubmit">确定</button>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMerchantAppList, addMerchantApp, updateMerchantApp, type MerchantApp } from '@/api/merchantApp'
import { getMerchantOptions } from '@/api/merchant'

const route = useRoute()

const platformTypes = [
  { value: 0, label: '微信移动应用' },
  { value: 1, label: '微信网站应用' },
  { value: 2, label: '微信公众号' },
  { value: 3, label: '微信小程序' },
  { value: 5, label: '支付宝网页/移动' },
  { value: 6, label: '支付宝小程序' },
  { value: 7, label: '支付宝生活号' },
]

const merchantOptions = ref<{ id: number; name: string }[]>([])

// 从 URL query 参数获取默认 merchantId 筛选
const defaultMerchantId = route.query.merchantId ? Number(route.query.merchantId) : undefined

const searchForm = reactive({
  name: '',
  appid: '',
  platformType: '' as string | number,
  merchantId: defaultMerchantId as number | undefined,
})

const apps = ref<MerchantApp[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await getMerchantAppList({
      page: page.value,
      pageSize: pageSize.value,
      name: searchForm.name || undefined,
      appid: searchForm.appid || undefined,
      platformType: searchForm.platformType !== '' ? Number(searchForm.platformType) : -1,
      merchantId: searchForm.merchantId || 0,
    })
    apps.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)

const form = reactive({
  name: '', appid: '', merchantId: '' as string | number, platformType: '' as string | number,
  merchantType: 0, notifyUrl: '', returnUrl: '',
})

function resetForm() {
  form.name = ''; form.appid = ''; form.merchantId = ''; form.platformType = ''
  form.merchantType = 0; form.notifyUrl = ''; form.returnUrl = ''
  editingId.value = null
}

async function handleSearch() {
  page.value = 1
  await loadData()
}

function handleReset() {
  searchForm.name = ''
  searchForm.appid = ''
  searchForm.platformType = ''
  searchForm.merchantId = undefined
  page.value = 1
  loadData()
}

function handleEdit(item: MerchantApp) {
  dialogMode.value = 'edit'
  editingId.value = item.id
  form.name = item.name; form.appid = item.appid; form.merchantId = item.merchantId
  form.platformType = item.platformType; form.merchantType = item.merchantType
  form.notifyUrl = item.notifyUrl; form.returnUrl = item.returnUrl
  showDialog.value = true
}

function handleConfig(item: MerchantApp) {
  alert(`配置应用: ${item.name} (${item.appid})`)
}

async function handleSubmit() {
  if (!form.name || !form.appid || !form.merchantId || form.platformType === '') return
  if (dialogMode.value === 'add') {
    await addMerchantApp({
      name: form.name,
      appid: form.appid,
      merchantId: Number(form.merchantId),
      platformType: Number(form.platformType),
      merchantType: form.merchantType,
      notifyUrl: form.notifyUrl || undefined,
      returnUrl: form.returnUrl || undefined,
    })
  } else {
    await updateMerchantApp({
      id: editingId.value!,
      name: form.name,
      merchantId: Number(form.merchantId),
      platformType: Number(form.platformType),
      merchantType: form.merchantType,
      notifyUrl: form.notifyUrl || undefined,
      returnUrl: form.returnUrl || undefined,
    })
  }
  showDialog.value = false
  await loadData()
}

function getPlatformLabel(type: number): string {
  return platformTypes.find(p => p.value === type)?.label || '未知'
}

function getPlatformChipClass(type: number): string {
  if (type <= 4) return 'chip-green'  // 微信系
  return 'chip-blue'  // 支付宝系
}

onMounted(() => {
  loadData()
  getMerchantOptions().then(res => { merchantOptions.value = res })
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }

/* 搜索栏 */
.search-card { padding: 20px 24px; }
.search-bar { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.search-fields { display: flex; gap: 16px; flex-wrap: wrap; }
.search-actions { display: flex; gap: 8px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; color: #64748B; font-weight: 500; }
.field-input { height: 34px; padding: 0 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; color: #334155; outline: none; width: 180px; background: #fff; }
.field-input:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.field-select { height: 34px; padding: 0 28px 0 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; color: #334155; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 8px center; appearance: none; cursor: pointer; min-width: 140px; }
.field-select:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }

/* 按钮 */
.btn { height: 34px; padding: 0 18px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; border: none; transition: all 0.15s; }
.btn-icon { margin-right: 4px; font-size: 16px; }
.btn-primary { background: linear-gradient(135deg, #3B9EFF, #7BBFFF); color: #fff; box-shadow: 0 1px 3px rgba(59,158,255,0.3); }
.btn-primary:hover { box-shadow: 0 2px 8px rgba(59,158,255,0.4); }
.btn-outlined { background: #fff; color: #64748B; border: 1px solid #E2E8F0; }
.btn-outlined:hover { border-color: #CBD5E1; background: #F8FAFC; }

/* 表格 */
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
.code-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; }

/* Chip */
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }

/* 弹窗 */
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.dialog-title { font-size: 18px; font-weight: 600; color: #1E293B; }
.dialog-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 20px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; color: #475569; font-weight: 500; }
.required { color: #EF4444; }
.form-input { height: 38px; padding: 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; }
.form-input:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.form-select { height: 38px; padding: 0 28px 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 10px center; appearance: none; cursor: pointer; }
.form-select:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
</style>
