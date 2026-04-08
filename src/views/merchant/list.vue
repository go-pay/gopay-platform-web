<template>
  <div class="page">
    <!-- 搜索栏 -->
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">商户名称</label>
            <input v-model="searchForm.name" type="text" class="field-input" placeholder="请输入商户名称" />
          </div>
          <div class="field-group">
            <label class="field-label">联系人</label>
            <input v-model="searchForm.contact" type="text" class="field-input" placeholder="请输入联系人" />
          </div>
          <div class="field-group">
            <label class="field-label">状态</label>
            <select v-model="searchForm.status" class="field-select">
              <option value="">全部</option>
              <option value="1">正常</option>
              <option value="0">禁用</option>
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
        <div class="table-title">商户列表</div>
        <button class="btn btn-primary" @click="showDialog = true; dialogMode = 'add'; resetForm()">
          <span class="mdi mdi-plus btn-icon"></span>新增商户
        </button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 180px">商户名称</th>
              <th style="width: 120px">联系人</th>
              <th style="width: 140px">联系电话</th>
              <th>邮箱</th>
              <th style="width: 90px">状态</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 120px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in merchants" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-medium">{{ item.name }}</td>
              <td>{{ item.contact }}</td>
              <td>{{ item.phone }}</td>
              <td class="text-grey">{{ item.email }}</td>
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
                <v-btn icon variant="text" size="x-small" title="查看应用" @click="$router.push(`/merchant/app?merchantId=${item.id}`)">
                  <v-icon size="18" color="#64748B">mdi-application-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="x-small" :title="item.status === 1 ? '禁用' : '启用'" @click="handleToggleStatus(item)">
                  <v-icon size="18" :color="item.status === 1 ? '#EF4444' : '#10B981'">
                    {{ item.status === 1 ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}
                  </v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>共 {{ merchants.length }} 条</span>
      </div>
    </v-card>

    <!-- 新增/编辑弹窗 -->
    <v-dialog v-model="showDialog" max-width="560" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">{{ dialogMode === 'add' ? '新增商户' : '编辑商户' }}</span>
          <v-btn icon variant="text" size="small" @click="showDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label class="form-label">商户名称 <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="form-input" placeholder="请输入商户名称" />
          </div>
          <div class="form-row">
            <label class="form-label">联系人 <span class="required">*</span></label>
            <input v-model="form.contact" type="text" class="form-input" placeholder="请输入联系人" />
          </div>
          <div class="form-row">
            <label class="form-label">联系电话</label>
            <input v-model="form.phone" type="text" class="form-input" placeholder="请输入联系电话" />
          </div>
          <div class="form-row">
            <label class="form-label">邮箱</label>
            <input v-model="form.email" type="text" class="form-input" placeholder="请输入邮箱" />
          </div>
          <div class="form-row">
            <label class="form-label">备注</label>
            <textarea v-model="form.remark" class="form-textarea" placeholder="请输入备注信息" rows="3"></textarea>
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
import { ref, reactive } from 'vue'

interface Merchant {
  id: number
  name: string
  contact: string
  phone: string
  email: string
  status: number
  remark: string
  ctime: string
}

const searchForm = reactive({ name: '', contact: '', status: '' })

const merchants = ref<Merchant[]>([
  { id: 1, name: '星辰科技有限公司', contact: '张三', phone: '13800138001', email: 'zhangsan@xingchen.com', status: 1, remark: '', ctime: '2026-03-15 10:30:00' },
  { id: 2, name: '云海数字传媒', contact: '李四', phone: '13800138002', email: 'lisi@yunhai.com', status: 1, remark: '', ctime: '2026-03-18 14:20:00' },
  { id: 3, name: '极光电子商务', contact: '王五', phone: '13800138003', email: 'wangwu@jiguang.com', status: 1, remark: '', ctime: '2026-03-22 09:15:00' },
  { id: 4, name: '鼎盛支付服务', contact: '赵六', phone: '13800138004', email: 'zhaoliu@dingsheng.com', status: 0, remark: '暂停合作', ctime: '2026-03-25 16:45:00' },
  { id: 5, name: '蓝鲸网络科技', contact: '孙七', phone: '13800138005', email: 'sunqi@lanjing.com', status: 1, remark: '', ctime: '2026-04-01 11:00:00' },
  { id: 6, name: '九州在线商贸', contact: '周八', phone: '13800138006', email: 'zhouba@jiuzhou.com', status: 1, remark: '', ctime: '2026-04-05 08:30:00' },
])

const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)

const form = reactive({ name: '', contact: '', phone: '', email: '', remark: '' })

function resetForm() {
  form.name = ''; form.contact = ''; form.phone = ''; form.email = ''; form.remark = ''
  editingId.value = null
}

function handleSearch() { /* Mock: 前端过滤 */ }
function handleReset() { searchForm.name = ''; searchForm.contact = ''; searchForm.status = '' }

function handleEdit(item: Merchant) {
  dialogMode.value = 'edit'
  editingId.value = item.id
  form.name = item.name; form.contact = item.contact; form.phone = item.phone; form.email = item.email; form.remark = item.remark
  showDialog.value = true
}

function handleSubmit() {
  if (!form.name || !form.contact) return
  if (dialogMode.value === 'add') {
    const maxId = Math.max(...merchants.value.map(m => m.id), 0)
    merchants.value.unshift({
      id: maxId + 1, name: form.name, contact: form.contact, phone: form.phone,
      email: form.email, status: 1, remark: form.remark,
      ctime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    })
  } else {
    const idx = merchants.value.findIndex(m => m.id === editingId.value)
    if (idx !== -1) {
      Object.assign(merchants.value[idx], { name: form.name, contact: form.contact, phone: form.phone, email: form.email, remark: form.remark })
    }
  }
  showDialog.value = false
}

function handleToggleStatus(item: Merchant) {
  item.status = item.status === 1 ? 0 : 1
}
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
.field-select { height: 34px; padding: 0 28px 0 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; color: #334155; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 8px center; appearance: none; cursor: pointer; min-width: 120px; }
.field-select:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }

/* 按钮 */
.btn { height: 34px; padding: 0 18px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; border: none; transition: all 0.15s; }
.btn-icon { margin-right: 4px; font-size: 16px; }
.btn-primary { background: linear-gradient(135deg, #3B9EFF, #7BBFFF); color: #fff; box-shadow: 0 1px 3px rgba(59,158,255,0.3); }
.btn-primary:hover { box-shadow: 0 2px 8px rgba(59,158,255,0.4); }
.btn-outlined { background: #fff; color: #64748B; border: 1px solid #E2E8F0; }
.btn-outlined:hover { border-color: #CBD5E1; background: #F8FAFC; }

/* 表格卡片 */
.table-card { overflow: hidden; }
.table-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; }
.table-title { font-size: 16px; font-weight: 600; color: #1E293B; }
.table-wrap { padding: 0 24px; overflow-x: auto; }
.table-footer { display: flex; align-items: center; justify-content: flex-end; padding: 12px 24px; color: #94A3B8; font-size: 13px; border-top: 1px solid #F1F5F9; }

/* 数据表格 */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { font-weight: 600; color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; background: #FAFBFC; padding: 12px 16px; text-align: left; border-bottom: 1px solid #F1F5F9; white-space: nowrap; }
.data-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; }
.data-table tbody tr:hover { background: #F8FAFC; }
.font-medium { font-weight: 500; }
.text-grey { color: #94A3B8; }

/* Chip */
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
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
.form-textarea { padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; resize: vertical; font-family: inherit; }
.form-textarea:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
</style>
