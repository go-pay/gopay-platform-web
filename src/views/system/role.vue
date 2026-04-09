<template>
  <div class="page">
    <v-card rounded="lg" flat class="table-card">
      <div class="table-header">
        <div class="table-title">角色管理</div>
        <button class="btn btn-primary" @click="openDialog('add')"><span class="mdi mdi-plus btn-icon"></span>新增角色</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 120px">角色编码</th>
              <th style="width: 140px">角色名称</th>
              <th>权限说明</th>
              <th style="width: 80px">用户数</th>
              <th style="width: 80px">状态</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 140px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in roleList" :key="item.id">
              <td>{{ item.id }}</td>
              <td><code class="code-text">{{ item.code }}</code></td>
              <td class="font-medium">{{ item.name }}</td>
              <td class="text-grey">{{ item.description }}</td>
              <td>{{ item.userCount }}</td>
              <td><span :class="['chip', item.status === 1 ? 'chip-green' : 'chip-grey']">{{ item.status === 1 ? '启用' : '停用' }}</span></td>
              <td class="text-grey">{{ formatTimestamp(item.ctime) }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="编辑" @click="openDialog('edit', item)">
                  <v-icon size="18" color="#64748B">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="x-small" title="权限配置" @click="openPermDialog(item)">
                  <v-icon size="18" color="#3B9EFF">mdi-shield-key-outline</v-icon>
                </v-btn>
                <v-btn v-if="!item.builtIn" icon variant="text" size="x-small" :title="item.status === 1 ? '停用' : '启用'" @click="handleToggle(item)">
                  <v-icon size="18" :color="item.status === 1 ? '#EF4444' : '#10B981'">{{ item.status === 1 ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">共 {{ roleList.length }} 条</div>
    </v-card>

    <!-- 新增/编辑弹窗 -->
    <v-dialog v-model="showDialog" max-width="480" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">{{ dialogMode === 'add' ? '新增角色' : '编辑角色' }}</span>
          <v-btn icon variant="text" size="small" @click="showDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label class="form-label">角色编码 <span class="required">*</span></label>
            <input v-model="form.code" type="text" class="form-input" placeholder="如: operator" :disabled="dialogMode === 'edit'" />
          </div>
          <div class="form-row">
            <label class="form-label">角色名称 <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="form-input" placeholder="如: 运营人员" />
          </div>
          <div class="form-row">
            <label class="form-label">权限说明</label>
            <textarea v-model="form.description" class="form-textarea" placeholder="请描述该角色的权限范围" rows="3"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showDialog = false" :disabled="submitting">取消</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="submitting">{{ submitting ? '保存中...' : '确定' }}</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- 权限配置弹窗 -->
    <v-dialog v-model="showPermDialog" max-width="520" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">权限配置 - {{ permItem?.name }}</span>
          <v-btn icon variant="text" size="small" @click="showPermDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="dialog-body">
          <div v-if="permLoading" class="perm-loading">加载中...</div>
          <div v-else v-for="group in permGroups" :key="group.key" class="perm-group">
            <label class="perm-group-label">
              <input type="checkbox" :checked="isGroupChecked(group)" @change="toggleGroup(group)" />
              <span>{{ group.label }}</span>
            </label>
            <div class="perm-items">
              <label v-for="p in group.items" :key="p.value" class="perm-item">
                <input type="checkbox" :value="p.value" v-model="permForm" />
                <span>{{ p.label }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showPermDialog = false" :disabled="permSaving">取消</button>
          <button class="btn btn-primary" @click="handleSavePerm" :disabled="permSaving || permLoading">{{ permSaving ? '保存中...' : '保存' }}</button>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getRoleList, addRole, updateRole, toggleRoleStatus, updateRolePerms, getRolePerms, type RoleItem } from '@/api/system'
import { formatTimestamp } from '@/utils/format'

interface PermGroup { key: string; label: string; items: { value: string; label: string }[] }

const permGroups: PermGroup[] = [
  { key: 'merchant', label: '商户管理', items: [{ value: 'merchant:list', label: '商户列表' }, { value: 'merchant:app', label: '商户应用' }, { value: 'merchant:edit', label: '编辑商户' }] },
  { key: 'incoming', label: '进件管理', items: [{ value: 'incoming:apply', label: '进件申请' }, { value: 'incoming:record', label: '进件记录' }, { value: 'incoming:review', label: '审核' }] },
  { key: 'payment', label: '支付配置', items: [{ value: 'payment:channel', label: '通道管理' }, { value: 'payment:config', label: '参数配置' }] },
  { key: 'order', label: '订单中心', items: [{ value: 'order:payment', label: '支付订单' }, { value: 'order:refund', label: '退款订单' }, { value: 'order:transfer', label: '转账订单' }] },
  { key: 'transaction', label: '交易记录', items: [{ value: 'transaction:flow', label: '交易流水' }, { value: 'transaction:callback', label: '回调记录' }] },
  { key: 'recon', label: '对账管理', items: [{ value: 'recon:bill', label: '对账单' }, { value: 'recon:diff', label: '差异处理' }] },
  { key: 'system', label: '系统管理', items: [{ value: 'system:user', label: '用户管理' }, { value: 'system:role', label: '角色管理' }, { value: 'system:log', label: '操作日志' }] },
]

const roleList = ref<RoleItem[]>([])

async function loadData() {
  try {
    const res = await getRoleList({ page: 1, pageSize: 100 })
    roleList.value = res.list
  } catch (e: any) {
    alert(e.message || '加载角色列表失败')
  }
}

onMounted(loadData)

const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)
const submitting = ref(false)
const form = reactive({ code: '', name: '', description: '' })

const showPermDialog = ref(false)
const permItem = ref<RoleItem | null>(null)
const permForm = ref<string[]>([])
const permLoading = ref(false)
const permSaving = ref(false)

function openDialog(mode: 'add' | 'edit', item?: RoleItem) {
  dialogMode.value = mode; editingId.value = null
  form.code = ''; form.name = ''; form.description = ''
  if (mode === 'edit' && item) { editingId.value = item.id; form.code = item.code; form.name = item.name; form.description = item.description }
  showDialog.value = true
}

async function handleSubmit() {
  if (!form.code || !form.name) return
  submitting.value = true
  try {
    if (dialogMode.value === 'add') {
      await addRole({ code: form.code, name: form.name, description: form.description || undefined })
    } else {
      await updateRole({ id: editingId.value!, name: form.name, description: form.description || undefined })
    }
    showDialog.value = false
    await loadData()
  } catch (e: any) {
    alert(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

async function openPermDialog(item: RoleItem) {
  permItem.value = item
  permForm.value = []
  showPermDialog.value = true
  permLoading.value = true
  try {
    permForm.value = await getRolePerms(item.id)
  } catch (e: any) {
    alert(e.message || '获取权限失败')
  } finally {
    permLoading.value = false
  }
}

async function handleSavePerm() {
  if (!permItem.value) return
  permSaving.value = true
  try {
    await updateRolePerms(permItem.value.id, permForm.value)
    showPermDialog.value = false
    await loadData()
  } catch (e: any) {
    alert(e.message || '保存权限失败')
  } finally {
    permSaving.value = false
  }
}

async function handleToggle(item: RoleItem) {
  if (item.builtIn) { alert('内置角色不可停用'); return }
  try {
    await toggleRoleStatus(item.id)
    await loadData()
  } catch (e: any) {
    alert(e.message || '操作失败')
  }
}

function isGroupChecked(group: PermGroup) { return group.items.every(i => permForm.value.includes(i.value)) }
function toggleGroup(group: PermGroup) {
  const all = isGroupChecked(group)
  if (all) { permForm.value = permForm.value.filter(p => !group.items.some(i => i.value === p)) }
  else { group.items.forEach(i => { if (!permForm.value.includes(i.value)) permForm.value.push(i.value) }) }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
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
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
.chip-light { background: #F8FAFC; color: #475569; border: 1px solid #E2E8F0; }
.btn { height: 34px; padding: 0 18px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; border: none; transition: all 0.15s; }
.btn-icon { margin-right: 4px; font-size: 16px; }
.btn-primary { background: linear-gradient(135deg, #3B9EFF, #7BBFFF); color: #fff; box-shadow: 0 1px 3px rgba(59,158,255,0.3); }
.btn-primary:hover { box-shadow: 0 2px 8px rgba(59,158,255,0.4); }
.btn-outlined { background: #fff; color: #64748B; border: 1px solid #E2E8F0; }
.btn-outlined:hover { border-color: #CBD5E1; background: #F8FAFC; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.dialog-title { font-size: 18px; font-weight: 600; color: #1E293B; }
.dialog-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; max-height: 65vh; overflow-y: auto; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 20px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; color: #475569; font-weight: 500; }
.required { color: #EF4444; }
.form-input { height: 38px; padding: 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; }
.form-input:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.form-input:disabled { background: #F1F5F9; color: #94A3B8; cursor: not-allowed; }
.form-select { height: 38px; padding: 0 28px 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 10px center; appearance: none; cursor: pointer; }
.form-select:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.form-textarea { padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; resize: vertical; font-family: inherit; }
.form-textarea:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.perm-group { display: flex; flex-direction: column; gap: 8px; }
.perm-group-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #1E293B; cursor: pointer; padding: 8px 0; border-bottom: 1px solid #F1F5F9; }
.perm-group-label input { width: 16px; height: 16px; accent-color: #3B9EFF; cursor: pointer; }
.perm-items { display: flex; gap: 16px; flex-wrap: wrap; padding-left: 24px; }
.perm-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; cursor: pointer; }
.perm-item input { width: 15px; height: 15px; accent-color: #3B9EFF; cursor: pointer; }
.perm-loading { font-size: 13px; color: #94A3B8; text-align: center; padding: 24px 0; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
