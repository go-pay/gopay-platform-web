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
            <label class="field-label">通道类型</label>
            <select v-model="searchForm.channelType" class="field-select">
              <option value="">全部</option>
              <option value="alipay">支付宝</option>
              <option value="wechat">微信支付</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">进件状态</label>
            <select v-model="searchForm.status" class="field-select">
              <option value="">全部</option>
              <option value="2">已通过</option>
              <option value="3">已驳回</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">审核时间</label>
            <input v-model="searchForm.reviewDate" type="date" class="field-input" />
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
        <div class="table-title">进件记录</div>
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
              <th style="width: 120px">审核人</th>
              <th>审核意见</th>
              <th style="width: 160px">申请时间</th>
              <th style="width: 160px">审核时间</th>
              <th style="width: 80px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in recordList" :key="item.id">
              <td class="font-medium">{{ item.applyNo }}</td>
              <td>{{ item.merchantName }}</td>
              <td>
                <span :class="['chip', item.channelType === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ item.channelType === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </td>
              <td><code class="code-text">{{ item.merchantNo || '-' }}</code></td>
              <td>
                <span :class="['chip', item.status === 2 ? 'chip-green' : 'chip-red']">
                  {{ item.status === 2 ? '已通过' : '已驳回' }}
                </span>
              </td>
              <td>{{ item.reviewer }}</td>
              <td class="text-grey text-ellipsis">{{ item.reviewRemark || '-' }}</td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td class="text-grey">{{ item.reviewTime }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="查看详情" @click="handleView(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">共 {{ recordList.length }} 条</div>
    </v-card>

    <!-- 详情弹窗 -->
    <v-dialog v-model="showDetail" max-width="560">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">进件详情</span>
          <v-btn icon variant="text" size="small" @click="showDetail = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body" v-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">基本信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">申请编号</span><span>{{ detailItem.applyNo }}</span></div>
              <div class="detail-item"><span class="detail-label">商户名称</span><span>{{ detailItem.merchantName }}</span></div>
              <div class="detail-item"><span class="detail-label">通道类型</span><span>{{ detailItem.channelType === 'alipay' ? '支付宝' : '微信支付' }}</span></div>
              <div class="detail-item"><span class="detail-label">商户号</span><span><code class="code-text">{{ detailItem.merchantNo || '-' }}</code></span></div>
              <div class="detail-item"><span class="detail-label">营业执照号</span><span>{{ detailItem.licenseNo }}</span></div>
              <div class="detail-item"><span class="detail-label">法人姓名</span><span>{{ detailItem.legalPerson }}</span></div>
              <div class="detail-item"><span class="detail-label">联系电话</span><span>{{ detailItem.phone }}</span></div>
              <div class="detail-item"><span class="detail-label">申请时间</span><span>{{ detailItem.ctime }}</span></div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-title">审核信息</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">审核结果</span>
                <span :class="['chip', detailItem.status === 2 ? 'chip-green' : 'chip-red']">
                  {{ detailItem.status === 2 ? '已通过' : '已驳回' }}
                </span>
              </div>
              <div class="detail-item"><span class="detail-label">审核人</span><span>{{ detailItem.reviewer }}</span></div>
              <div class="detail-item"><span class="detail-label">审核时间</span><span>{{ detailItem.reviewTime }}</span></div>
              <div class="detail-item"><span class="detail-label">审核意见</span><span>{{ detailItem.reviewRemark || '-' }}</span></div>
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

interface RecordItem {
  id: number
  applyNo: string
  merchantName: string
  channelType: 'alipay' | 'wechat'
  merchantNo: string
  licenseNo: string
  legalPerson: string
  phone: string
  status: number // 2-已通过 3-已驳回
  reviewer: string
  reviewRemark: string
  ctime: string
  reviewTime: string
}

const searchForm = reactive({ merchantName: '', channelType: '', status: '', reviewDate: '' })

const recordList = ref<RecordItem[]>([
  { id: 1, applyNo: 'INC20260401001', merchantName: '星辰科技有限公司', channelType: 'alipay', merchantNo: '2088441234567890', licenseNo: '91110108MA12345678', legalPerson: '张三', phone: '13800138001', status: 2, reviewer: '管理员', reviewRemark: '资料齐全，审核通过', ctime: '2026-04-01 10:00:00', reviewTime: '2026-04-01 14:30:00' },
  { id: 2, applyNo: 'INC20260402001', merchantName: '星辰科技有限公司', channelType: 'wechat', merchantNo: '1600123456', licenseNo: '91110108MA12345678', legalPerson: '张三', phone: '13800138001', status: 2, reviewer: '管理员', reviewRemark: '审核通过', ctime: '2026-04-02 14:30:00', reviewTime: '2026-04-02 16:00:00' },
  { id: 3, applyNo: 'INC20260320001', merchantName: '云海数字传媒', channelType: 'alipay', merchantNo: '2088557890123456', licenseNo: '91310115MA87654321', legalPerson: '李四', phone: '13800138002', status: 2, reviewer: '管理员', reviewRemark: '审核通过', ctime: '2026-03-20 09:15:00', reviewTime: '2026-03-20 11:00:00' },
  { id: 4, applyNo: 'INC20260404001', merchantName: '极光电子商务', channelType: 'wechat', merchantNo: '', licenseNo: '91440300MA11112222', legalPerson: '王五', phone: '13800138003', status: 3, reviewer: '管理员', reviewRemark: '资料不完整，请补充营业执照副本', ctime: '2026-04-04 16:00:00', reviewTime: '2026-04-04 17:30:00' },
  { id: 5, applyNo: 'INC20260325001', merchantName: '蓝鲸网络科技', channelType: 'alipay', merchantNo: '2088669012345678', licenseNo: '91330100MA33334444', legalPerson: '孙七', phone: '13800138005', status: 2, reviewer: '管理员', reviewRemark: '审核通过', ctime: '2026-03-25 11:30:00', reviewTime: '2026-03-25 15:00:00' },
  { id: 6, applyNo: 'INC20260328001', merchantName: '九州在线商贸', channelType: 'wechat', merchantNo: '', licenseNo: '91510100MA55556666', legalPerson: '周八', phone: '13800138006', status: 3, reviewer: '管理员', reviewRemark: '法人信息与营业执照不一致', ctime: '2026-03-28 08:45:00', reviewTime: '2026-03-28 10:20:00' },
])

const showDetail = ref(false)
const detailItem = ref<RecordItem | null>(null)

function handleSearch() { /* Mock */ }
function handleReset() {
  searchForm.merchantName = ''; searchForm.channelType = ''; searchForm.status = ''; searchForm.reviewDate = ''
}

function handleView(item: RecordItem) {
  detailItem.value = item
  showDetail.value = true
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
.chip-red { background: #FEF2F2; color: #EF4444; }
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
</style>
