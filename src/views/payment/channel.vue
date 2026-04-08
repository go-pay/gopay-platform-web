<template>
  <div class="page">
    <!-- 搜索栏 -->
    <v-card rounded="lg" flat class="search-card">
      <div class="search-bar">
        <div class="search-fields">
          <div class="field-group">
            <label class="field-label">通道名称</label>
            <input v-model="searchForm.name" type="text" class="field-input" placeholder="请输入通道名称" />
          </div>
          <div class="field-group">
            <label class="field-label">通道编码</label>
            <input v-model="searchForm.code" type="text" class="field-input" placeholder="请输入通道编码" />
          </div>
          <div class="field-group">
            <label class="field-label">通道类型</label>
            <select v-model="searchForm.type" class="field-select">
              <option value="">全部</option>
              <option value="alipay">支付宝</option>
              <option value="wechat">微信支付</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">状态</label>
            <select v-model="searchForm.status" class="field-select">
              <option value="">全部</option>
              <option value="1">启用</option>
              <option value="0">停用</option>
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
        <div class="table-title">通道管理</div>
        <button class="btn btn-primary" @click="openDialog('add')">
          <span class="mdi mdi-plus btn-icon"></span>新增通道
        </button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 160px">通道名称</th>
              <th style="width: 120px">通道编码</th>
              <th style="width: 120px">通道类型</th>
              <th style="width: 120px">所属商户</th>
              <th style="width: 120px">支付方式</th>
              <th style="width: 80px">费率(%)</th>
              <th style="width: 80px">状态</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 140px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in channelList" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-medium">{{ item.name }}</td>
              <td><code class="code-text">{{ item.code }}</code></td>
              <td>
                <span :class="['chip', item.type === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ item.type === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </td>
              <td>{{ item.merchantName }}</td>
              <td>
                <div class="pay-methods">
                  <span v-for="m in item.payMethods" :key="m" class="chip chip-light">{{ payMethodLabel(m) }}</span>
                </div>
              </td>
              <td>{{ item.feeRate }}</td>
              <td>
                <span :class="['chip', item.status === 1 ? 'chip-green' : 'chip-grey']">
                  {{ item.status === 1 ? '启用' : '停用' }}
                </span>
              </td>
              <td class="text-grey">{{ item.ctime }}</td>
              <td>
                <v-btn icon variant="text" size="x-small" title="编辑" @click="openDialog('edit', item)">
                  <v-icon size="18" color="#64748B">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="x-small" title="参数配置" @click="openConfigDialog(item)">
                  <v-icon size="18" color="#3B9EFF">mdi-key-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="x-small" :title="item.status === 1 ? '停用' : '启用'" @click="handleToggleStatus(item)">
                  <v-icon size="18" :color="item.status === 1 ? '#EF4444' : '#10B981'">
                    {{ item.status === 1 ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}
                  </v-icon>
                </v-btn>
                <v-btn icon variant="text" size="x-small" title="查看详情" @click="openDetailDialog(item)">
                  <v-icon size="18" color="#64748B">mdi-eye-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">共 {{ channelList.length }} 条</div>
    </v-card>

    <!-- 新增/编辑弹窗 -->
    <v-dialog v-model="showDialog" max-width="600" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">{{ dialogMode === 'add' ? '新增通道' : '编辑通道' }}</span>
          <v-btn icon variant="text" size="small" @click="showDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label class="form-label">通道名称 <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="form-input" placeholder="请输入通道名称，如：支付宝当面付" />
          </div>
          <div class="form-row">
            <label class="form-label">通道编码 <span class="required">*</span></label>
            <input v-model="form.code" type="text" class="form-input" placeholder="请输入唯一编码，如：alipay_face" :disabled="dialogMode === 'edit'" />
          </div>
          <div class="form-row">
            <label class="form-label">通道类型 <span class="required">*</span></label>
            <select v-model="form.type" class="form-select">
              <option value="">请选择</option>
              <option value="alipay">支付宝</option>
              <option value="wechat">微信支付</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">所属商户 <span class="required">*</span></label>
            <select v-model="form.merchantId" class="form-select">
              <option value="">请选择商户</option>
              <option v-for="m in merchantOptions" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">支付方式 <span class="required">*</span></label>
            <div class="checkbox-group">
              <label v-for="pm in allPayMethods" :key="pm.value" class="checkbox-item">
                <input type="checkbox" :value="pm.value" v-model="form.payMethods" />
                <span>{{ pm.label }}</span>
              </label>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">费率(%) <span class="required">*</span></label>
            <input v-model="form.feeRate" type="number" step="0.01" min="0" max="100" class="form-input" placeholder="请输入费率，如：0.60" />
          </div>
          <div class="form-row">
            <label class="form-label">备注</label>
            <textarea v-model="form.remark" class="form-textarea" placeholder="请输入备注" rows="2"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleSubmit">确定</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- 参数配置弹窗 -->
    <v-dialog v-model="showConfigDialog" max-width="600" persistent>
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">通道参数配置</span>
          <v-btn icon variant="text" size="small" @click="showConfigDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body" v-if="configItem">
          <div class="config-info">
            <span class="config-info-label">通道：</span>{{ configItem.name }}
            <span :class="['chip', configItem.type === 'alipay' ? 'chip-blue' : 'chip-green']" style="margin-left: 8px;">
              {{ configItem.type === 'alipay' ? '支付宝' : '微信支付' }}
            </span>
          </div>
          <!-- 支付宝参数 -->
          <template v-if="configItem.type === 'alipay'">
            <div class="form-row">
              <label class="form-label">AppID <span class="required">*</span></label>
              <input v-model="configForm.appId" type="text" class="form-input" placeholder="支付宝应用 AppID" />
            </div>
            <div class="form-row">
              <label class="form-label">应用私钥 <span class="required">*</span></label>
              <textarea v-model="configForm.privateKey" class="form-textarea form-textarea-mono" placeholder="RSA2 应用私钥" rows="3"></textarea>
            </div>
            <div class="form-row">
              <label class="form-label">支付宝公钥 <span class="required">*</span></label>
              <textarea v-model="configForm.publicKey" class="form-textarea form-textarea-mono" placeholder="支付宝公钥" rows="3"></textarea>
            </div>
            <div class="form-row">
              <label class="form-label">回调通知 URL</label>
              <input v-model="configForm.notifyUrl" type="text" class="form-input" placeholder="https://example.com/alipay/notify" />
            </div>
            <div class="form-row">
              <label class="form-label">签名方式</label>
              <select v-model="configForm.signType" class="form-select">
                <option value="RSA2">RSA2 (推荐)</option>
                <option value="RSA">RSA</option>
              </select>
            </div>
            <div class="form-row">
              <label class="form-label">环境</label>
              <select v-model="configForm.sandbox" class="form-select">
                <option :value="false">生产环境</option>
                <option :value="true">沙箱环境</option>
              </select>
            </div>
          </template>
          <!-- 微信参数 -->
          <template v-else>
            <div class="form-row">
              <label class="form-label">AppID <span class="required">*</span></label>
              <input v-model="configForm.appId" type="text" class="form-input" placeholder="微信应用 AppID" />
            </div>
            <div class="form-row">
              <label class="form-label">商户号(MchID) <span class="required">*</span></label>
              <input v-model="configForm.mchId" type="text" class="form-input" placeholder="微信支付商户号" />
            </div>
            <div class="form-row">
              <label class="form-label">API 密钥(V3) <span class="required">*</span></label>
              <div class="input-password-wrap">
                <input v-model="configForm.apiKey" :type="showApiKey ? 'text' : 'password'" class="form-input" placeholder="APIv3 密钥" />
                <span class="input-password-toggle mdi" :class="showApiKey ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" @click="showApiKey = !showApiKey"></span>
              </div>
            </div>
            <div class="form-row">
              <label class="form-label">商户证书序列号</label>
              <input v-model="configForm.serialNo" type="text" class="form-input" placeholder="商户 API 证书序列号" />
            </div>
            <div class="form-row">
              <label class="form-label">商户私钥 <span class="required">*</span></label>
              <textarea v-model="configForm.privateKey" class="form-textarea form-textarea-mono" placeholder="apiclient_key.pem 内容" rows="3"></textarea>
            </div>
            <div class="form-row">
              <label class="form-label">回调通知 URL</label>
              <input v-model="configForm.notifyUrl" type="text" class="form-input" placeholder="https://example.com/wechat/notify" />
            </div>
          </template>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showConfigDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleSaveConfig">保存配置</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- 详情弹窗 -->
    <v-dialog v-model="showDetailDialog" max-width="560">
      <v-card rounded="lg">
        <div class="dialog-header">
          <span class="dialog-title">通道详情</span>
          <v-btn icon variant="text" size="small" @click="showDetailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body" v-if="detailItem">
          <div class="detail-section">
            <div class="detail-title">基本信息</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">通道名称</span><span>{{ detailItem.name }}</span></div>
              <div class="detail-item"><span class="detail-label">通道编码</span><span><code class="code-text">{{ detailItem.code }}</code></span></div>
              <div class="detail-item">
                <span class="detail-label">通道类型</span>
                <span :class="['chip', detailItem.type === 'alipay' ? 'chip-blue' : 'chip-green']">
                  {{ detailItem.type === 'alipay' ? '支付宝' : '微信支付' }}
                </span>
              </div>
              <div class="detail-item"><span class="detail-label">所属商户</span><span>{{ detailItem.merchantName }}</span></div>
              <div class="detail-item"><span class="detail-label">费率</span><span>{{ detailItem.feeRate }}%</span></div>
              <div class="detail-item">
                <span class="detail-label">状态</span>
                <span :class="['chip', detailItem.status === 1 ? 'chip-green' : 'chip-grey']">{{ detailItem.status === 1 ? '启用' : '停用' }}</span>
              </div>
              <div class="detail-item"><span class="detail-label">创建时间</span><span>{{ detailItem.ctime }}</span></div>
              <div class="detail-item"><span class="detail-label">备注</span><span>{{ detailItem.remark || '-' }}</span></div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-title">支付方式</div>
            <div class="pay-methods-detail">
              <span v-for="m in detailItem.payMethods" :key="m" class="chip chip-light">{{ payMethodLabel(m) }}</span>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-title">参数配置</div>
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">AppID</span><span><code class="code-text">{{ detailItem.config?.appId || '未配置' }}</code></span></div>
              <div class="detail-item" v-if="detailItem.type === 'wechat'"><span class="detail-label">商户号</span><span><code class="code-text">{{ detailItem.config?.mchId || '未配置' }}</code></span></div>
              <div class="detail-item"><span class="detail-label">回调 URL</span><span class="text-ellipsis">{{ detailItem.config?.notifyUrl || '未配置' }}</span></div>
              <div class="detail-item" v-if="detailItem.type === 'alipay'"><span class="detail-label">签名方式</span><span>{{ detailItem.config?.signType || 'RSA2' }}</span></div>
              <div class="detail-item" v-if="detailItem.type === 'alipay'"><span class="detail-label">环境</span><span>{{ detailItem.config?.sandbox ? '沙箱' : '生产' }}</span></div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outlined" @click="showDetailDialog = false">关闭</button>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface ChannelConfig {
  appId: string
  privateKey: string
  publicKey: string
  mchId: string
  apiKey: string
  serialNo: string
  notifyUrl: string
  signType: string
  sandbox: boolean
}

interface ChannelItem {
  id: number
  name: string
  code: string
  type: 'alipay' | 'wechat'
  merchantId: number
  merchantName: string
  payMethods: string[]
  feeRate: number
  status: number
  remark: string
  ctime: string
  config?: Partial<ChannelConfig>
}

const allPayMethods = [
  { value: 'qrcode', label: '扫码支付' },
  { value: 'page', label: '网页支付' },
  { value: 'wap', label: 'WAP支付' },
  { value: 'app', label: 'APP支付' },
  { value: 'jsapi', label: 'JSAPI支付' },
  { value: 'miniapp', label: '小程序支付' },
]

const merchantOptions = [
  { id: 1, name: '星辰科技有限公司' },
  { id: 2, name: '云海数字传媒' },
  { id: 3, name: '极光电子商务' },
  { id: 5, name: '蓝鲸网络科技' },
  { id: 6, name: '九州在线商贸' },
]

const searchForm = reactive({ name: '', code: '', type: '', status: '' })

const channelList = ref<ChannelItem[]>([
  {
    id: 1, name: '支付宝当面付', code: 'alipay_face', type: 'alipay', merchantId: 1, merchantName: '星辰科技有限公司',
    payMethods: ['qrcode', 'page'], feeRate: 0.6, status: 1, remark: '主力支付宝通道',
    ctime: '2026-03-16 10:00:00',
    config: { appId: '2026032200001234', privateKey: '******', publicKey: '******', notifyUrl: 'https://api.xingchen.com/alipay/notify', signType: 'RSA2', sandbox: false },
  },
  {
    id: 2, name: '支付宝手机网站', code: 'alipay_wap', type: 'alipay', merchantId: 1, merchantName: '星辰科技有限公司',
    payMethods: ['wap'], feeRate: 0.6, status: 1, remark: '',
    ctime: '2026-03-17 11:20:00',
    config: { appId: '2026032200001234', privateKey: '******', publicKey: '******', notifyUrl: 'https://api.xingchen.com/alipay/notify', signType: 'RSA2', sandbox: false },
  },
  {
    id: 3, name: '微信JSAPI支付', code: 'wechat_jsapi', type: 'wechat', merchantId: 2, merchantName: '云海数字传媒',
    payMethods: ['jsapi'], feeRate: 0.6, status: 1, remark: '公众号内支付',
    ctime: '2026-03-20 09:00:00',
    config: { appId: 'wx9876543210fedcba', mchId: '1600234567', privateKey: '******', apiKey: '******', notifyUrl: 'https://api.yunhai.com/wechat/notify' },
  },
  {
    id: 4, name: '微信Native支付', code: 'wechat_native', type: 'wechat', merchantId: 3, merchantName: '极光电子商务',
    payMethods: ['qrcode'], feeRate: 0.55, status: 1, remark: 'PC网站扫码支付',
    ctime: '2026-04-01 16:20:00',
    config: { appId: '2026040100005678', mchId: '1600345678', privateKey: '******', apiKey: '******', notifyUrl: 'https://api.jiguang.com/wechat/notify' },
  },
  {
    id: 5, name: '微信小程序支付', code: 'wechat_miniapp', type: 'wechat', merchantId: 5, merchantName: '蓝鲸网络科技',
    payMethods: ['miniapp', 'jsapi'], feeRate: 0.6, status: 0, remark: '待接入',
    ctime: '2026-04-03 11:45:00',
    config: {},
  },
  {
    id: 6, name: '支付宝小程序', code: 'alipay_miniapp', type: 'alipay', merchantId: 6, merchantName: '九州在线商贸',
    payMethods: ['miniapp'], feeRate: 0.55, status: 1, remark: '',
    ctime: '2026-04-05 14:00:00',
    config: { appId: '2026040500009012', privateKey: '******', publicKey: '******', notifyUrl: 'https://api.jiuzhou.com/alipay/notify', signType: 'RSA2', sandbox: false },
  },
])

// 新增/编辑
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)
const form = reactive({
  name: '', code: '', type: '', merchantId: '' as string | number,
  payMethods: [] as string[], feeRate: '' as string | number, remark: '',
})

function resetForm() {
  form.name = ''; form.code = ''; form.type = ''; form.merchantId = ''
  form.payMethods = []; form.feeRate = ''; form.remark = ''
  editingId.value = null
}

function openDialog(mode: 'add' | 'edit', item?: ChannelItem) {
  dialogMode.value = mode
  resetForm()
  if (mode === 'edit' && item) {
    editingId.value = item.id
    form.name = item.name; form.code = item.code; form.type = item.type
    form.merchantId = item.merchantId; form.payMethods = [...item.payMethods]
    form.feeRate = item.feeRate; form.remark = item.remark
  }
  showDialog.value = true
}

function handleSubmit() {
  if (!form.name || !form.code || !form.type || !form.merchantId || !form.payMethods.length || form.feeRate === '') return
  if (dialogMode.value === 'add') {
    const maxId = Math.max(...channelList.value.map(c => c.id), 0)
    const merchant = merchantOptions.find(m => m.id === Number(form.merchantId))
    channelList.value.unshift({
      id: maxId + 1, name: form.name, code: form.code, type: form.type as 'alipay' | 'wechat',
      merchantId: Number(form.merchantId), merchantName: merchant?.name || '',
      payMethods: [...form.payMethods], feeRate: Number(form.feeRate),
      status: 1, remark: form.remark,
      ctime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      config: {},
    })
  } else {
    const idx = channelList.value.findIndex(c => c.id === editingId.value)
    if (idx !== -1) {
      const merchant = merchantOptions.find(m => m.id === Number(form.merchantId))
      Object.assign(channelList.value[idx], {
        name: form.name, type: form.type, merchantId: Number(form.merchantId),
        merchantName: merchant?.name || '', payMethods: [...form.payMethods],
        feeRate: Number(form.feeRate), remark: form.remark,
      })
    }
  }
  showDialog.value = false
}

// 参数配置
const showConfigDialog = ref(false)
const configItem = ref<ChannelItem | null>(null)
const showApiKey = ref(false)
const configForm = reactive<ChannelConfig>({
  appId: '', privateKey: '', publicKey: '', mchId: '', apiKey: '',
  serialNo: '', notifyUrl: '', signType: 'RSA2', sandbox: false,
})

function openConfigDialog(item: ChannelItem) {
  configItem.value = item
  showApiKey.value = false
  const c = item.config || {}
  configForm.appId = c.appId || ''; configForm.privateKey = c.privateKey === '******' ? '' : (c.privateKey || '')
  configForm.publicKey = c.publicKey === '******' ? '' : (c.publicKey || '')
  configForm.mchId = c.mchId || ''; configForm.apiKey = c.apiKey === '******' ? '' : (c.apiKey || '')
  configForm.serialNo = c.serialNo || ''; configForm.notifyUrl = c.notifyUrl || ''
  configForm.signType = c.signType || 'RSA2'; configForm.sandbox = c.sandbox || false
  showConfigDialog.value = true
}

function handleSaveConfig() {
  if (!configItem.value) return
  const item = channelList.value.find(c => c.id === configItem.value!.id)
  if (item) {
    item.config = {
      appId: configForm.appId,
      privateKey: configForm.privateKey || '******',
      publicKey: configForm.publicKey || '******',
      mchId: configForm.mchId,
      apiKey: configForm.apiKey || '******',
      serialNo: configForm.serialNo,
      notifyUrl: configForm.notifyUrl,
      signType: configForm.signType,
      sandbox: configForm.sandbox,
    }
  }
  showConfigDialog.value = false
}

// 详情
const showDetailDialog = ref(false)
const detailItem = ref<ChannelItem | null>(null)

function openDetailDialog(item: ChannelItem) {
  detailItem.value = item
  showDetailDialog.value = true
}

// 其他
function handleSearch() { /* Mock */ }
function handleReset() { searchForm.name = ''; searchForm.code = ''; searchForm.type = ''; searchForm.status = '' }

function handleToggleStatus(item: ChannelItem) {
  item.status = item.status === 1 ? 0 : 1
}

function payMethodLabel(m: string) {
  return allPayMethods.find(p => p.value === m)?.label || m
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
.text-ellipsis { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.code-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; }
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-green { background: #ECFDF5; color: #10B981; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-grey { background: #F1F5F9; color: #94A3B8; }
.chip-light { background: #F8FAFC; color: #475569; border: 1px solid #E2E8F0; padding: 2px 10px; font-size: 11px; }
.pay-methods { display: flex; gap: 4px; flex-wrap: wrap; }
.pay-methods-detail { display: flex; gap: 6px; flex-wrap: wrap; }
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
.form-textarea-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }
.checkbox-group { display: flex; gap: 16px; flex-wrap: wrap; }
.checkbox-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; cursor: pointer; }
.checkbox-item input[type="checkbox"] { width: 16px; height: 16px; accent-color: #3B9EFF; cursor: pointer; }
.config-info { font-size: 14px; color: #334155; background: #F8FAFC; padding: 12px 16px; border-radius: 8px; display: flex; align-items: center; }
.config-info-label { color: #64748B; font-weight: 500; margin-right: 4px; }
.input-password-wrap { position: relative; }
.input-password-wrap .form-input { width: 100%; padding-right: 40px; }
.input-password-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #94A3B8; cursor: pointer; }
.input-password-toggle:hover { color: #64748B; }
.detail-section { display: flex; flex-direction: column; gap: 12px; }
.detail-title { font-size: 14px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #F1F5F9; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 12px; color: #94A3B8; }
.detail-item > span:last-child { font-size: 14px; color: #334155; }
</style>
