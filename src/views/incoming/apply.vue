<template>
  <div class="page">
    <!-- 搜索栏 -->
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">商户名称</label>
            <input v-model="searchForm.merchantName" type="text" class="field-input" placeholder="请输入商户名称" />
          </div>
          <div class="field-group">
            <label class="field-label">进件状态</label>
            <select v-model="searchForm.status" class="field-select">
              <option value="">全部</option>
              <option value="0">待提交</option>
              <option value="1">审核中</option>
              <option value="2">已通过</option>
              <option value="3">已驳回</option>
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
        <div class="table-title">进件申请</div>
        <button class="btn btn-primary" @click="showDialog = true; resetForm()">
          <span class="mdi mdi-plus btn-icon"></span>新建进件
        </button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 80px">申请编号</th>
              <th style="width: 160px">商户名称</th>
              <th style="width: 120px">通道类型</th>
              <th style="width: 140px">商户号</th>
              <th style="width: 100px">进件状态</th>
              <th>备注</th>
              <th style="width: 160px">申请时间</th>
              <th style="width: 120px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in applyList" :key="item.id">
              <td class="font-medium">{{ item.applyNo }}</td>
              <td>{{ item.merchantName }}</td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </td>
              <td><code class="code-text">{{ item.merchantNo || '-' }}</code></td>
              <td>
                <span :class="['chip', statusChipClass(item.status)]">{{ statusLabel(item.status) }}</span>
              </td>
              <td class="text-grey text-ellipsis">{{ item.remark || '-' }}</td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="查看" @click="handleView(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.status === 0" icon variant="text" size="x-small" title="提交审核" @click="handleSubmitReview(item)">
                  <v-icon size="18" color="#3B9EFF">mdi-send-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.status === 1" icon variant="text" size="x-small" title="审核" @click="handleReview(item)">
                  <v-icon size="18" color="#F59E0B">mdi-check-decagram-outline</v-icon>
                </v-btn>
                <v-btn v-if="item.status === 0" icon variant="text" size="x-small" title="编辑" @click="handleEdit(item)">
                  <v-icon size="18" color="#64748B">mdi-pencil-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">共 {{ applyList.length }} 条</div>
    </v-card>

    <!-- 新建进件弹窗 -->
    <v-dialog v-model="showDialog" max-width="600" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">新建进件申请</span>
          <v-btn icon variant="text" size="small" @click="showDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label class="form-label">商户名称 <span class="required">*</span></label>
            <select v-model="form.merchantId" class="form-select">
              <option value="">请选择商户</option>
              <option v-for="m in merchantOptions" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">通道类型 <span class="required">*</span></label>
            <select v-model="form.channelType" class="form-select">
              <option value="">请选择通道</option>
              <option value="alipay">支付宝</option>
              <option value="wechat">微信支付</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">商户号</label>
            <input v-model="form.merchantNo" type="text" class="form-input" placeholder="请输入通道方分配的商户号" />
          </div>
          <div class="form-row">
            <label class="form-label">营业执照号 <span class="required">*</span></label>
            <input v-model="form.licenseNo" type="text" class="form-input" placeholder="请输入统一社会信用代码" />
          </div>
          <div class="form-row">
            <label class="form-label">营业执照照片 <span class="required">*</span></label>
            <div class="upload-area">
              <div v-if="form.licensePhoto" class="upload-preview">
                <img :src="form.licensePhoto" alt="营业执照" />
                <div class="upload-preview-mask" @click="form.licensePhoto = ''">
                  <span class="mdi mdi-delete-outline"></span>
                </div>
              </div>
              <label v-else class="upload-trigger" @dragover.prevent @drop.prevent="e => handleDrop(e, 'licensePhoto')">
                <input type="file" accept="image/*" class="upload-input" @change="e => handleFileChange(e, 'licensePhoto')" />
                <span class="mdi mdi-camera-outline upload-icon"></span>
                <span class="upload-text">上传营业执照</span>
                <span class="upload-hint">支持 JPG/PNG，不超过 5MB</span>
              </label>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">法人姓名</label>
            <input v-model="form.legalPerson" type="text" class="form-input" placeholder="请输入法人姓名" />
          </div>
          <div class="form-row">
            <label class="form-label">法人身份证照片 <span class="required">*</span></label>
            <div class="upload-group">
              <div class="upload-area">
                <div v-if="form.idCardFront" class="upload-preview">
                  <img :src="form.idCardFront" alt="身份证正面" />
                  <div class="upload-preview-mask" @click="form.idCardFront = ''">
                    <span class="mdi mdi-delete-outline"></span>
                  </div>
                </div>
                <label v-else class="upload-trigger" @dragover.prevent @drop.prevent="e => handleDrop(e, 'idCardFront')">
                  <input type="file" accept="image/*" class="upload-input" @change="e => handleFileChange(e, 'idCardFront')" />
                  <span class="mdi mdi-card-account-details-outline upload-icon"></span>
                  <span class="upload-text">人像面</span>
                  <span class="upload-hint">身份证正面</span>
                </label>
              </div>
              <div class="upload-area">
                <div v-if="form.idCardBack" class="upload-preview">
                  <img :src="form.idCardBack" alt="身份证反面" />
                  <div class="upload-preview-mask" @click="form.idCardBack = ''">
                    <span class="mdi mdi-delete-outline"></span>
                  </div>
                </div>
                <label v-else class="upload-trigger" @dragover.prevent @drop.prevent="e => handleDrop(e, 'idCardBack')">
                  <input type="file" accept="image/*" class="upload-input" @change="e => handleFileChange(e, 'idCardBack')" />
                  <span class="mdi mdi-card-account-details-outline upload-icon"></span>
                  <span class="upload-text">国徽面</span>
                  <span class="upload-hint">身份证反面</span>
                </label>
              </div>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">联系电话</label>
            <input v-model="form.phone" type="text" class="form-input" placeholder="请输入联系电话" />
          </div>
          <div class="form-row">
            <label class="form-label">备注</label>
            <textarea v-model="form.remark" class="form-textarea" placeholder="请输入备注" rows="3"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showDialog = false">取消</button>
          <button class="btn btn-outlined" @click="handleSaveDraft">保存草稿</button>
          <button class="btn btn-primary" @click="handleSubmitApply">提交审核</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- 审核弹窗 -->
    <v-dialog v-model="showReviewDialog" max-width="480" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">进件审核</span>
          <v-btn icon variant="text" size="small" @click="showReviewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body">
          <div class="review-info">
            <div class="review-row"><span class="review-label">商户：</span>{{ reviewItem?.merchantName }}</div>
            <div class="review-row"><span class="review-label">通道：</span>{{ reviewItem?.channelType === 'alipay' ? '支付宝' : '微信支付' }}</div>
            <div class="review-row"><span class="review-label">申请编号：</span>{{ reviewItem?.applyNo }}</div>
          </div>
          <div class="form-row">
            <label class="form-label">审核结果 <span class="required">*</span></label>
            <select v-model="reviewResult" class="form-select">
              <option value="">请选择</option>
              <option value="pass">通过</option>
              <option value="reject">驳回</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">审核意见</label>
            <textarea v-model="reviewRemark" class="form-textarea" placeholder="请输入审核意见" rows="3"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showReviewDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleConfirmReview">确认</button>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface ApplyItem {
  id: number
  applyNo: string
  merchantId: number
  merchantName: string
  channelType: 'alipay' | 'wechat'
  merchantNo: string
  licenseNo: string
  legalPerson: string
  phone: string
  status: number // 0-待提交 1-审核中 2-已通过 3-已驳回
  remark: string
  ctime: string
}

const merchantOptions = [
  { id: 1, name: '星辰科技有限公司' },
  { id: 2, name: '云海数字传媒' },
  { id: 3, name: '极光电子商务' },
  { id: 5, name: '蓝鲸网络科技' },
  { id: 6, name: '九州在线商贸' },
]

const searchForm = reactive({ merchantName: '', status: '', channelType: '' })

const applyList = ref<ApplyItem[]>([
  { id: 1, applyNo: 'INC20260401001', merchantId: 1, merchantName: '星辰科技有限公司', channelType: 'alipay', merchantNo: '2088441234567890', licenseNo: '91110108MA12345678', legalPerson: '张三', phone: '13800138001', status: 2, remark: '审核通过', ctime: '2026-04-01 10:00:00' },
  { id: 2, applyNo: 'INC20260402001', merchantId: 1, merchantName: '星辰科技有限公司', channelType: 'wechat', merchantNo: '1600123456', licenseNo: '91110108MA12345678', legalPerson: '张三', phone: '13800138001', status: 2, remark: '', ctime: '2026-04-02 14:30:00' },
  { id: 3, applyNo: 'INC20260403001', merchantId: 2, merchantName: '云海数字传媒', channelType: 'alipay', merchantNo: '', licenseNo: '91310115MA87654321', legalPerson: '李四', phone: '13800138002', status: 1, remark: '', ctime: '2026-04-03 09:15:00' },
  { id: 4, applyNo: 'INC20260404001', merchantId: 3, merchantName: '极光电子商务', channelType: 'wechat', merchantNo: '', licenseNo: '91440300MA11112222', legalPerson: '王五', phone: '13800138003', status: 3, remark: '资料不完整，请补充营业执照副本', ctime: '2026-04-04 16:00:00' },
  { id: 5, applyNo: 'INC20260405001', merchantId: 5, merchantName: '蓝鲸网络科技', channelType: 'alipay', merchantNo: '', licenseNo: '91330100MA33334444', legalPerson: '孙七', phone: '13800138005', status: 0, remark: '', ctime: '2026-04-05 11:30:00' },
  { id: 6, applyNo: 'INC20260406001', merchantId: 6, merchantName: '九州在线商贸', channelType: 'wechat', merchantNo: '', licenseNo: '91510100MA55556666', legalPerson: '周八', phone: '13800138006', status: 0, remark: '', ctime: '2026-04-06 08:45:00' },
])

const showDialog = ref(false)
const form = reactive({
  merchantId: '' as string | number, channelType: '', merchantNo: '', licenseNo: '',
  licensePhoto: '', idCardFront: '', idCardBack: '',
  legalPerson: '', phone: '', remark: '',
})

function resetForm() {
  form.merchantId = ''; form.channelType = ''; form.merchantNo = ''; form.licenseNo = ''
  form.licensePhoto = ''; form.idCardFront = ''; form.idCardBack = ''
  form.legalPerson = ''; form.phone = ''; form.remark = ''
}

type PhotoField = 'licensePhoto' | 'idCardFront' | 'idCardBack'

function readFileAsDataURL(file: File, field: PhotoField) {
  if (!file.type.startsWith('image/')) return
  if (file.size > 5 * 1024 * 1024) { alert('文件大小不能超过 5MB'); return }
  const reader = new FileReader()
  reader.onload = (e) => { form[field] = e.target?.result as string }
  reader.readAsDataURL(file)
}

function handleFileChange(e: Event, field: PhotoField) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) readFileAsDataURL(file, field)
}

function handleDrop(e: DragEvent, field: PhotoField) {
  const file = e.dataTransfer?.files?.[0]
  if (file) readFileAsDataURL(file, field)
}

const showReviewDialog = ref(false)
const reviewItem = ref<ApplyItem | null>(null)
const reviewResult = ref('')
const reviewRemark = ref('')

function statusLabel(s: number) {
  return ['待提交', '审核中', '已通过', '已驳回'][s] || '未知'
}

function statusChipClass(s: number) {
  return ['chip-grey', 'chip-amber', 'chip-green', 'chip-red'][s] || 'chip-grey'
}

function handleSearch() { /* Mock */ }
function handleReset() { searchForm.merchantName = ''; searchForm.status = ''; searchForm.channelType = '' }

function handleView(item: ApplyItem) {
  alert(`查看进件详情: ${item.applyNo}\n商户: ${item.merchantName}\n通道: ${item.channelType === 'alipay' ? '支付宝' : '微信支付'}\n状态: ${statusLabel(item.status)}`)
}

function handleEdit(_item: ApplyItem) { /* TODO */ }

function handleSubmitReview(item: ApplyItem) {
  item.status = 1
}

function handleReview(item: ApplyItem) {
  reviewItem.value = item
  reviewResult.value = ''
  reviewRemark.value = ''
  showReviewDialog.value = true
}

function handleConfirmReview() {
  if (!reviewResult.value || !reviewItem.value) return
  const item = applyList.value.find(a => a.id === reviewItem.value!.id)
  if (item) {
    item.status = reviewResult.value === 'pass' ? 2 : 3
    item.remark = reviewRemark.value || (reviewResult.value === 'pass' ? '审核通过' : '审核驳回')
  }
  showReviewDialog.value = false
}

function handleSaveDraft() {
  if (!form.merchantId || !form.channelType) return
  const merchant = merchantOptions.find(m => m.id === Number(form.merchantId))
  const maxId = Math.max(...applyList.value.map(a => a.id), 0)
  applyList.value.unshift({
    id: maxId + 1, applyNo: `INC${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(maxId + 1).padStart(3, '0')}`,
    merchantId: Number(form.merchantId), merchantName: merchant?.name || '',
    channelType: form.channelType as 'alipay' | 'wechat', merchantNo: form.merchantNo,
    licenseNo: form.licenseNo, legalPerson: form.legalPerson, phone: form.phone,
    status: 0, remark: form.remark,
    ctime: new Date().toISOString().replace('T', ' ').slice(0, 19),
  })
  showDialog.value = false
}

function handleSubmitApply() {
  if (!form.merchantId || !form.channelType || !form.licenseNo) return
  const merchant = merchantOptions.find(m => m.id === Number(form.merchantId))
  const maxId = Math.max(...applyList.value.map(a => a.id), 0)
  applyList.value.unshift({
    id: maxId + 1, applyNo: `INC${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(maxId + 1).padStart(3, '0')}`,
    merchantId: Number(form.merchantId), merchantName: merchant?.name || '',
    channelType: form.channelType as 'alipay' | 'wechat', merchantNo: form.merchantNo,
    licenseNo: form.licenseNo, legalPerson: form.legalPerson, phone: form.phone,
    status: 1, remark: form.remark,
    ctime: new Date().toISOString().replace('T', ' ').slice(0, 19),
  })
  showDialog.value = false
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
.data-table td { font-size: 13px; padding: 14px 16px; border-bottom: 1px solid #F8FAFC; color: #334155; vertical-align: middle; }
.data-table tbody tr:hover { background: #F8FAFC; }
.font-medium { font-weight: 500; }
.text-grey { color: #94A3B8; }
.text-ellipsis { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.code-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; }
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-amber { background: #FFFBEB; color: #F59E0B; }
.chip-red { background: #FEF2F2; color: #EF4444; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
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
.form-textarea { padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; resize: vertical; font-family: inherit; }
.form-textarea:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.review-info { background: #F8FAFC; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.review-row { font-size: 14px; color: #334155; }
.review-label { color: #64748B; font-weight: 500; }
.upload-group { display: flex; gap: 12px; }
.upload-area { flex: 1; }
.upload-trigger { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 140px; border: 2px dashed #E2E8F0; border-radius: 10px; background: #FAFBFC; cursor: pointer; transition: all 0.2s; }
.upload-trigger:hover { border-color: #3B9EFF; background: #F0F7FF; }
.upload-input { display: none; }
.upload-icon { font-size: 32px; color: #94A3B8; }
.upload-trigger:hover .upload-icon { color: #3B9EFF; }
.upload-text { font-size: 13px; color: #475569; font-weight: 500; }
.upload-hint { font-size: 11px; color: #94A3B8; }
.upload-preview { position: relative; width: 100%; height: 140px; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; }
.upload-preview img { width: 100%; height: 100%; object-fit: cover; }
.upload-preview-mask { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; cursor: pointer; }
.upload-preview:hover .upload-preview-mask { opacity: 1; }
.upload-preview-mask span { font-size: 28px; color: #fff; }
</style>
