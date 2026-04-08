<template>
  <div class="page">
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">用户名</label>
            <input v-model="searchForm.username" type="text" class="field-input" placeholder="请输入用户名" />
          </div>
          <div class="field-group">
            <label class="field-label">手机号</label>
            <input v-model="searchForm.phone" type="text" class="field-input" placeholder="请输入手机号" />
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
          <button class="btn btn-primary" @click="handleSearch"><span class="mdi mdi-magnify btn-icon"></span>查询</button>
          <button class="btn btn-outlined" @click="handleReset">重置</button>
        </div>
      </div>
    </v-card>

    <v-card rounded="lg" flat class="table-card">
      <div class="table-header">
        <div class="table-title">用户管理</div>
        <button class="btn btn-primary" @click="openDialog('add')"><span class="mdi mdi-plus btn-icon"></span>新增用户</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 120px">用户名</th>
              <th style="width: 120px">姓名</th>
              <th style="width: 140px">手机号</th>
              <th style="width: 180px">邮箱</th>
              <th style="width: 100px">角色</th>
              <th style="width: 80px">状态</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 160px">最后登录</th>
              <th style="width: 120px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in userList" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-medium">{{ item.username }}</td>
              <td>{{ item.realName }}</td>
              <td>{{ item.phone }}</td>
              <td class="text-grey">{{ item.email }}</td>
              <td><span :class="['chip', item.role === 'admin' ? 'chip-blue' : 'chip-light']">{{ roleLabel(item.role) }}</span></td>
              <td><span :class="['chip', item.status === 1 ? 'chip-green' : 'chip-grey']">{{ item.status === 1 ? '正常' : '禁用' }}</span></td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td class="text-grey">{{ item.lastLogin || '-' }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="编辑" @click="openDialog('edit', item)">
                  <v-icon size="18" color="#64748B">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="x-small" title="重置密码" @click="handleResetPwd(item)">
                  <v-icon size="18" color="#F59E0B">mdi-lock-reset</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="x-small" :title="item.status === 1 ? '禁用' : '启用'" @click="handleToggle(item)">
                  <v-icon size="18" :color="item.status === 1 ? '#EF4444' : '#10B981'">{{ item.status === 1 ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">共 {{ total }} 条</div>
    </v-card>

    <!-- 新增/编辑弹窗 -->
    <v-dialog v-model="showDialog" max-width="520" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">{{ dialogMode === 'add' ? '新增用户' : '编辑用户' }}</span>
          <v-btn icon variant="text" size="small" @click="showDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label class="form-label">用户名 <span class="required">*</span></label>
            <input v-model="form.username" type="text" class="form-input" placeholder="请输入用户名" :disabled="dialogMode === 'edit'" />
          </div>
          <div v-if="dialogMode === 'add'" class="form-row">
            <label class="form-label">密码 <span class="required">*</span></label>
            <input v-model="form.password" type="password" class="form-input" placeholder="请输入密码" />
          </div>
          <div class="form-row">
            <label class="form-label">姓名 <span class="required">*</span></label>
            <input v-model="form.realName" type="text" class="form-input" placeholder="请输入姓名" />
          </div>
          <div class="form-row">
            <label class="form-label">手机号</label>
            <input v-model="form.phone" type="text" class="form-input" placeholder="请输入手机号" />
          </div>
          <div class="form-row">
            <label class="form-label">邮箱</label>
            <input v-model="form.email" type="text" class="form-input" placeholder="请输入邮箱" />
          </div>
          <div class="form-row">
            <label class="form-label">角色 <span class="required">*</span></label>
            <select v-model="form.role" class="form-select">
              <option value="">请选择角色</option>
              <option value="admin">管理员</option>
              <option value="operator">运营</option>
              <option value="finance">财务</option>
              <option value="viewer">只读</option>
            </select>
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
import { getUserList, addUser, updateUser, toggleUserStatus, resetUserPwd, type UserItem } from '@/api/system'

const searchForm = reactive({ username: '', phone: '', status: '' })

const userList = ref<UserItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)

const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)
const form = reactive({ username: '', password: '', realName: '', phone: '', email: '', role: '' })

function roleLabel(r: string) { return ({ admin: '管理员', operator: '运营', finance: '财务', viewer: '只读' } as Record<string, string>)[r] || r }

async function loadData() {
  loading.value = true
  try {
    const statusParam = searchForm.status === '' ? -1 : Number(searchForm.status)
    const res = await getUserList({
      page: page.value,
      pageSize: pageSize.value,
      username: searchForm.username || undefined,
      phone: searchForm.phone || undefined,
      status: statusParam,
    })
    userList.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.username = ''; searchForm.phone = ''; searchForm.status = ''
  handleSearch()
}

function openDialog(mode: 'add' | 'edit', item?: UserItem) {
  dialogMode.value = mode; editingId.value = null
  form.username = ''; form.password = ''; form.realName = ''; form.phone = ''; form.email = ''; form.role = ''
  if (mode === 'edit' && item) {
    editingId.value = item.id; form.username = item.username; form.realName = item.realName
    form.phone = item.phone; form.email = item.email; form.role = item.role
  }
  showDialog.value = true
}

async function handleSubmit() {
  if (!form.username || !form.role) return
  if (dialogMode.value === 'add') {
    if (!form.password) return
    await addUser({
      username: form.username,
      password: form.password,
      realName: form.realName || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      role: form.role || undefined,
    })
  } else {
    if (editingId.value === null) return
    await updateUser({
      id: editingId.value,
      realName: form.realName || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      role: form.role || undefined,
    })
  }
  showDialog.value = false
  loadData()
}

async function handleResetPwd(item: UserItem) {
  if (!confirm(`确定要重置用户 ${item.username} 的密码为默认密码吗？`)) return
  await resetUserPwd(item.id)
  alert(`用户 ${item.username} 的密码已重置为默认密码`)
}

async function handleToggle(item: UserItem) {
  await toggleUserStatus(item.id)
  loadData()
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
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
.chip-light { background: #F8FAFC; color: #475569; border: 1px solid #E2E8F0; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.dialog-title { font-size: 18px; font-weight: 600; color: #1E293B; }
.dialog-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 20px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; color: #475569; font-weight: 500; }
.required { color: #EF4444; }
.form-input { height: 38px; padding: 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; }
.form-input:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.form-input:disabled { background: #F1F5F9; color: #94A3B8; cursor: not-allowed; }
.form-select { height: 38px; padding: 0 28px 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 10px center; appearance: none; cursor: pointer; }
.form-select:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
</style>
