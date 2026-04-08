# API 对接实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将前端 18 个页面的 Mock 数据替换为真实后端 API 调用（67 个接口）

**Architecture:** 创建集中式 `src/api/` 目录，`request.ts` 封装 fetch + token + 错误处理，每模块一个 API 文件。各页面引入对应 API 函数，删除 Mock 数据，添加分页和加载状态。

**Tech Stack:** Vue 3, TypeScript, Fetch API, Vite Proxy (已配置)

**验证方式:** 后端服务已在 localhost:2233 运行，通过 `npm run dev` 启动前端，直接在浏览器中验证每个页面的 API 调用。

---

### Task 1: 创建 request.ts 基础请求层

**Files:**
- Create: `src/api/request.ts`

- [ ] **Step 1: 创建 `src/api/request.ts`**

```typescript
import { useUserStore } from '@/store/user'
import router from '@/router'

const BASE_URL = ''

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

export async function post<T = any>(url: string, data?: any): Promise<T> {
  const userStore = useUserStore()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (userStore.token) {
    headers['Authorization'] = `Bearer ${userStore.token}`
  }

  const res = await fetch(BASE_URL + url, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })

  if (res.status === 401) {
    userStore.logout()
    router.push('/login')
    throw new Error('登录已过期，请重新登录')
  }

  const json: ApiResponse<T> = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '请求失败')
  }
  return json.data
}

export async function upload(url: string, file: File): Promise<{ url: string }> {
  const userStore = useUserStore()
  const formData = new FormData()
  formData.append('file', file)

  const headers: Record<string, string> = {}
  if (userStore.token) {
    headers['Authorization'] = `Bearer ${userStore.token}`
  }

  const res = await fetch(BASE_URL + url, {
    method: 'POST',
    headers,
    body: formData,
  })

  const json: ApiResponse<{ url: string }> = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '上传失败')
  }
  return json.data
}

export async function download(url: string, data?: any, filename?: string): Promise<void> {
  const userStore = useUserStore()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (userStore.token) {
    headers['Authorization'] = `Bearer ${userStore.token}`
  }

  const res = await fetch(BASE_URL + url, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })

  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename || 'export.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}
```

- [ ] **Step 2: 验证**

启动 `npm run dev`，在浏览器控制台确认无导入错误。

- [ ] **Step 3: Commit**

```bash
git add src/api/request.ts
git commit -m "feat: add base request utility with auth and error handling"
```

---

### Task 2: 创建 auth.ts + 改造 store/user.ts + 登录页

**Files:**
- Create: `src/api/auth.ts`
- Modify: `src/store/user.ts`
- Modify: `src/views/login/index.vue` (极少改动，login 已用真实 API)

- [ ] **Step 1: 创建 `src/api/auth.ts`**

```typescript
import { post } from './request'

interface LoginResult {
  token: string
  userInfo: {
    id: number
    username: string
    realName: string
    phone: string
    email: string
    role: string
    lastLogin: string
  }
}

interface UserInfo {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  role: string
  lastLogin: string
}

export function loginApi(username: string, password: string) {
  return post<LoginResult>('/gopay/v1/sso/login', { username, password })
}

export function getUserInfoApi() {
  return post<UserInfo>('/gopay/v1/user/getInfo')
}

export function changePwdApi(data: { oldPassword: string; newPassword: string; confirmPassword: string }) {
  return post('/gopay/v1/user/changePwd', data)
}

export function updateProfileApi(data: { realName: string; phone: string; email: string }) {
  return post('/gopay/v1/user/profile', data)
}
```

- [ ] **Step 2: 改造 `src/store/user.ts`**

将 store 中的 raw fetch 替换为 `auth.ts` API 函数：

```typescript
import { defineStore } from 'pinia'
import { loginApi, getUserInfoApi } from '@/api/auth'

interface UserInfo {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  role: string
  lastLogin: string
}

interface UserState {
  token: string
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
    },

    async login(username: string, password: string) {
      const data = await loginApi(username, password)
      this.setToken(data.token)
      this.setUserInfo(data.userInfo)
      return true
    },

    async fetchUserInfo() {
      if (!this.token) return
      try {
        const data = await getUserInfoApi()
        this.setUserInfo(data)
      } catch {
        this.logout()
      }
    }
  }
})
```

注意：`store/user.ts` 被 `request.ts` 引用（获取 token），`store` 也引用 `api/auth.ts`。这不会产生循环依赖，因为 `request.ts` 只在函数调用时（非模块加载时）访问 store。

- [ ] **Step 3: 验证登录**

在浏览器测试 admin/admin 登录，确认能拿到真实 token 和 userInfo。

- [ ] **Step 4: Commit**

```bash
git add src/api/auth.ts src/store/user.ts
git commit -m "feat: integrate login and user info with real API"
```

---

### Task 3: 商户管理 - 商户列表

**Files:**
- Create: `src/api/merchant.ts`
- Modify: `src/views/merchant/list.vue`

- [ ] **Step 1: 创建 `src/api/merchant.ts`**

```typescript
import { post } from './request'

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

interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export function getMerchantList(data: { page: number; pageSize: number; name?: string; contact?: string; status?: number }) {
  return post<PageResult<Merchant>>('/gopay/v1/merchant/list', data)
}

export function addMerchant(data: { name: string; contact: string; phone?: string; email?: string; remark?: string }) {
  return post<{ id: number }>('/gopay/v1/merchant/add', data)
}

export function updateMerchant(data: { id: number; name: string; contact: string; phone?: string; email?: string; remark?: string }) {
  return post('/gopay/v1/merchant/update', data)
}

export function toggleMerchantStatus(id: number) {
  return post('/gopay/v1/merchant/toggleStatus', { id })
}

export function getMerchantOptions() {
  return post<{ id: number; name: string }[]>('/gopay/v1/merchant/options')
}
```

- [ ] **Step 2: 改造 `src/views/merchant/list.vue` script 部分**

替换整个 `<script setup>` 为：

```typescript
import { ref, reactive, onMounted } from 'vue'
import { getMerchantList, addMerchant, updateMerchant, toggleMerchantStatus } from '@/api/merchant'

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
const merchants = ref<Merchant[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await getMerchantList({
      page: page.value,
      pageSize: pageSize.value,
      name: searchForm.name || undefined,
      contact: searchForm.contact || undefined,
      status: searchForm.status === '' ? -1 : Number(searchForm.status),
    })
    merchants.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())

const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)
const form = reactive({ name: '', contact: '', phone: '', email: '', remark: '' })

function resetForm() {
  form.name = ''; form.contact = ''; form.phone = ''; form.email = ''; form.remark = ''
  editingId.value = null
}

function handleSearch() { page.value = 1; loadData() }
function handleReset() { searchForm.name = ''; searchForm.contact = ''; searchForm.status = ''; handleSearch() }

function handleEdit(item: Merchant) {
  dialogMode.value = 'edit'
  editingId.value = item.id
  form.name = item.name; form.contact = item.contact; form.phone = item.phone; form.email = item.email; form.remark = item.remark
  showDialog.value = true
}

async function handleSubmit() {
  if (!form.name || !form.contact) return
  if (dialogMode.value === 'add') {
    await addMerchant({ name: form.name, contact: form.contact, phone: form.phone, email: form.email, remark: form.remark })
  } else {
    await updateMerchant({ id: editingId.value!, name: form.name, contact: form.contact, phone: form.phone, email: form.email, remark: form.remark })
  }
  showDialog.value = false
  loadData()
}

async function handleToggleStatus(item: Merchant) {
  await toggleMerchantStatus(item.id)
  loadData()
}
```

同时更新模板中 table-footer：`共 {{ total }} 条`

- [ ] **Step 3: 验证**

浏览器访问商户列表页，确认能加载真实数据、新增、编辑、切换状态。

- [ ] **Step 4: Commit**

```bash
git add src/api/merchant.ts src/views/merchant/list.vue
git commit -m "feat: integrate merchant list page with real API"
```

---

### Task 4: 商户管理 - 商户应用

**Files:**
- Create: `src/api/merchantApp.ts`
- Modify: `src/views/merchant/app.vue`

- [ ] **Step 1: 创建 `src/api/merchantApp.ts`**

```typescript
import { post } from './request'

interface MerchantApp {
  id: number
  name: string
  appid: string
  merchantId: number
  merchantName: string
  platformType: number
  merchantType: number
  status: number
  notifyUrl: string
  returnUrl: string
  ctime: string
}

interface PageResult<T> {
  list: T[]
  total: number
}

export function getMerchantAppList(data: { page: number; pageSize: number; name?: string; appid?: string; platformType?: number; merchantId?: number }) {
  return post<PageResult<MerchantApp>>('/gopay/v1/merchant/app/list', data)
}

export function addMerchantApp(data: { name: string; appid: string; merchantId: number; platformType: number; merchantType?: number; notifyUrl?: string; returnUrl?: string }) {
  return post<{ id: number }>('/gopay/v1/merchant/app/add', data)
}

export function updateMerchantApp(data: { id: number; name: string; merchantId: number; platformType: number; merchantType?: number; notifyUrl?: string; returnUrl?: string }) {
  return post('/gopay/v1/merchant/app/update', data)
}
```

- [ ] **Step 2: 改造 `src/views/merchant/app.vue`**

与 Task 3 相同模式：删除 Mock 数据，导入 API 函数，`onMounted` 加载数据，操作改为 API 调用 + `loadData()`。商户下拉使用 `getMerchantOptions()`（来自 `merchant.ts`）。

- [ ] **Step 3: 验证并 Commit**

```bash
git add src/api/merchantApp.ts src/views/merchant/app.vue
git commit -m "feat: integrate merchant app page with real API"
```

---

### Task 5: 支付通道管理

**Files:**
- Create: `src/api/channel.ts`
- Modify: `src/views/payment/channel.vue`

- [ ] **Step 1: 创建 `src/api/channel.ts`**

```typescript
import { post } from './request'

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
  config?: Record<string, any>
}

interface PageResult<T> {
  list: T[]
  total: number
}

export function getChannelList(data: { page: number; pageSize: number; name?: string; code?: string; type?: string; status?: number }) {
  return post<PageResult<ChannelItem>>('/gopay/v1/payment/channel/list', data)
}

export function addChannel(data: { name: string; code: string; type: string; merchantId: number; payMethods: string[]; feeRate: number; remark?: string }) {
  return post<{ id: number }>('/gopay/v1/payment/channel/add', data)
}

export function updateChannel(data: { id: number; name: string; type: string; merchantId: number; payMethods: string[]; feeRate: number; remark?: string }) {
  return post('/gopay/v1/payment/channel/update', data)
}

export function toggleChannelStatus(id: number) {
  return post('/gopay/v1/payment/channel/toggleStatus', { id })
}

export function getChannelDetail(id: number) {
  return post<ChannelItem>('/gopay/v1/payment/channel/detail', { id })
}

export function saveChannelConfig(data: { channelId: number; [key: string]: any }) {
  return post('/gopay/v1/payment/channel/config', data)
}
```

- [ ] **Step 2: 改造 `src/views/payment/channel.vue`**

关键改动：
- 删除 `channelList` 和 `merchantOptions` 的 Mock 数据
- `onMounted` 中同时调用 `getChannelList()` 和 `getMerchantOptions()`
- `handleSubmit` 改为 `addChannel/updateChannel` API 调用
- `handleToggleStatus` 改为 `toggleChannelStatus` API 调用
- `handleSaveConfig` 改为 `saveChannelConfig` API 调用
- `openDetailDialog` 改为先调用 `getChannelDetail` 获取完整详情（含 config）

- [ ] **Step 3: 验证并 Commit**

```bash
git add src/api/channel.ts src/views/payment/channel.vue
git commit -m "feat: integrate payment channel page with real API"
```

---

### Task 6: 仪表盘

**Files:**
- Create: `src/api/dashboard.ts`
- Modify: `src/views/dashboard/index.vue`

- [ ] **Step 1: 创建 `src/api/dashboard.ts`**

```typescript
import { post } from './request'

interface DashboardStats {
  todayAmount: number
  todayCount: number
  todaySuccessRate: number
  pendingApply: number
  pendingRefund: number
}

interface RecentOrder {
  id: number
  orderNo: string
  merchantName: string
  amount: number
  channelType: string
  status: number
  ctime: string
}

interface ChannelDistribution {
  alipay: number
  wechat: number
}

interface TrendData {
  dates: string[]
  amounts: number[]
  counts: number[]
}

export function getDashboardStats() {
  return post<DashboardStats>('/gopay/v1/dashboard/stats')
}

export function getRecentOrders(data: { page: number; pageSize: number }) {
  return post<{ list: RecentOrder[]; total: number }>('/gopay/v1/dashboard/recentOrders', data)
}

export function getChannelDistribution() {
  return post<ChannelDistribution>('/gopay/v1/dashboard/channelDistribution')
}

export function getTrend() {
  return post<TrendData>('/gopay/v1/dashboard/trend')
}
```

- [ ] **Step 2: 改造 `src/views/dashboard/index.vue`**

关键改动：
- 删除 `statCards`, `quickEntries`, `recentOrders` 的 Mock 数据
- 将 `statCards` 和 `quickEntries` 改为 `ref` 响应式数据
- `onMounted` 中调用 4 个 dashboard API
- `getDashboardStats()` → 填充 statCards（金额 /100 转元，千分位格式化）和 quickEntries
- `getRecentOrders()` → 填充订单列表（金额 /100，channelType 映射，status 映射）
- `getChannelDistribution()` → 填充饼图数据（金额 /100）
- `getTrend()` → 填充趋势图数据（金额 /100 转万元，counts /100 转百）

- [ ] **Step 3: 验证并 Commit**

```bash
git add src/api/dashboard.ts src/views/dashboard/index.vue
git commit -m "feat: integrate dashboard page with real API"
```

---

### Task 7: 订单中心 - 支付/退款/转账

**Files:**
- Create: `src/api/order.ts`
- Modify: `src/views/order/payment.vue`
- Modify: `src/views/order/refund.vue`
- Modify: `src/views/order/transfer.vue`

- [ ] **Step 1: 创建 `src/api/order.ts`**

```typescript
import { post, download } from './request'

// === 支付订单 ===
interface PaymentOrder {
  id: number
  orderNo: string
  outTradeNo: string
  tradeNo: string
  merchantId: number
  merchantName: string
  amount: number
  channelType: string
  payMethod: string
  status: number
  subject: string
  clientIp: string
  notified: boolean
  remark: string
  ctime: string
  payTime: string
}

interface PageResult<T> { list: T[]; total: number }

export function getPaymentOrderList(data: { page: number; pageSize: number; orderNo?: string; merchantName?: string; status?: number; channelType?: string; date?: string }) {
  return post<PageResult<PaymentOrder>>('/gopay/v1/order/payment/list', data)
}

export function getPaymentOrderDetail(id: number) {
  return post<PaymentOrder>('/gopay/v1/order/payment/detail', { id })
}

export function closePaymentOrder(id: number) {
  return post('/gopay/v1/order/payment/close', { id })
}

export function refundPaymentOrder(data: { id: number; amount: number; reason: string }) {
  return post('/gopay/v1/order/payment/refund', data)
}

export function exportPaymentOrders(data: any, filename?: string) {
  return download('/gopay/v1/order/payment/export', data, filename || 'payment-orders.csv')
}

// === 退款订单 ===
interface RefundOrder {
  id: number
  refundNo: string
  orderNo: string
  tradeRefundNo: string
  merchantName: string
  refundAmount: number
  orderAmount: number
  channelType: string
  status: number
  reason: string
  operator: string
  ctime: string
  finishTime: string
}

export function getRefundOrderList(data: { page: number; pageSize: number; refundNo?: string; orderNo?: string; status?: number; channelType?: string }) {
  return post<PageResult<RefundOrder>>('/gopay/v1/order/refund/list', data)
}

export function getRefundOrderDetail(id: number) {
  return post<RefundOrder>('/gopay/v1/order/refund/detail', { id })
}

// === 转账订单 ===
interface TransferOrder {
  id: number
  transferNo: string
  tradeTransferNo: string
  merchantId: number
  merchantName: string
  amount: number
  channelType: string
  payeeType: string
  payeeAccount: string
  payeeName: string
  status: number
  remark: string
  ctime: string
  finishTime: string
}

export function getTransferOrderList(data: { page: number; pageSize: number; transferNo?: string; merchantName?: string; status?: number; channelType?: string }) {
  return post<PageResult<TransferOrder>>('/gopay/v1/order/transfer/list', data)
}

export function addTransferOrder(data: { merchantId: number; channelType: string; amount: number; payeeType: string; payeeAccount: string; payeeName: string; remark?: string }) {
  return post('/gopay/v1/order/transfer/add', data)
}

export function getTransferOrderDetail(id: number) {
  return post<TransferOrder>('/gopay/v1/order/transfer/detail', { id })
}
```

- [ ] **Step 2: 改造三个订单页面**

每个页面同一模式：删除 Mock 数据 → 导入 API → `onMounted` 加载 → 操作改为 API 调用。

特别注意：
- **金额处理**: API 返回分，模板展示时 `(item.amount / 100).toFixed(2)`，加千分位格式化
- **payment.vue**: `refundPaymentOrder` 需要传入金额（分），退款弹窗需要有金额和原因输入
- **transfer.vue**: `addTransferOrder` 金额需从元转分 `Math.round(amount * 100)`
- **payment.vue**: 导出功能使用 `exportPaymentOrders`

- [ ] **Step 3: 验证并 Commit**

```bash
git add src/api/order.ts src/views/order/payment.vue src/views/order/refund.vue src/views/order/transfer.vue
git commit -m "feat: integrate order pages (payment/refund/transfer) with real API"
```

---

### Task 8: 进件管理

**Files:**
- Create: `src/api/incoming.ts`
- Modify: `src/views/incoming/apply.vue`
- Modify: `src/views/incoming/record.vue`

- [ ] **Step 1: 创建 `src/api/incoming.ts`**

```typescript
import { post, upload } from './request'

interface ApplyItem {
  id: number
  applyNo: string
  merchantId: number
  merchantName: string
  channelType: string
  merchantNo: string
  licenseNo: string
  legalPerson: string
  phone: string
  status: number
  remark: string
  ctime: string
}

interface RecordItem extends ApplyItem {
  reviewer: string
  reviewRemark: string
  reviewTime: string
}

interface PageResult<T> { list: T[]; total: number }

export function getApplyList(data: { page: number; pageSize: number; merchantName?: string; status?: number; channelType?: string }) {
  return post<PageResult<ApplyItem>>('/gopay/v1/incoming/apply/list', data)
}

export function addApply(data: {
  merchantId: number; channelType: string; merchantNo?: string; licenseNo: string;
  licenseImg?: string; legalPerson: string; idCardFront?: string; idCardBack?: string;
  phone: string; remark?: string; submit: boolean
}) {
  return post('/gopay/v1/incoming/apply/add', data)
}

export function submitApply(id: number) {
  return post('/gopay/v1/incoming/apply/submit', { id })
}

export function reviewApply(data: { id: number; action: 'pass' | 'reject'; remark?: string }) {
  return post('/gopay/v1/incoming/apply/review', data)
}

export function getRecordList(data: { page: number; pageSize: number; merchantName?: string; channelType?: string; status?: number; reviewDate?: string }) {
  return post<PageResult<RecordItem>>('/gopay/v1/incoming/record/list', data)
}

export function getRecordDetail(id: number) {
  return post<RecordItem>('/gopay/v1/incoming/record/detail', { id })
}

export function uploadImage(file: File) {
  return upload('/gopay/v1/upload/image', file)
}
```

- [ ] **Step 2: 改造进件页面**

**apply.vue**: 删除 Mock → 导入 API → 图片上传改为 `uploadImage` 获取真实 URL → 新建/提交/审核改为 API 调用
**record.vue**: 删除 Mock → 导入 API → `onMounted` 加载 → 详情使用 `getRecordDetail`

- [ ] **Step 3: 验证并 Commit**

```bash
git add src/api/incoming.ts src/views/incoming/apply.vue src/views/incoming/record.vue
git commit -m "feat: integrate incoming management pages with real API"
```

---

### Task 9: 交易记录 - 流水/回调

**Files:**
- Create: `src/api/transaction.ts`
- Modify: `src/views/transaction/flow.vue`
- Modify: `src/views/transaction/callback.vue`

- [ ] **Step 1: 创建 `src/api/transaction.ts`**

```typescript
import { post } from './request'

interface FlowItem {
  id: number
  flowNo: string
  orderNo: string
  type: string
  merchantName: string
  amount: number
  channelType: string
  channelFlowNo: string
  direction: string
  status: number
  remark: string
  ctime: string
}

interface FlowStats {
  incomeTotal: number
  expenseTotal: number
  totalCount: number
}

interface CallbackItem {
  id: number
  orderNo: string
  type: string
  channelType: string
  direction: string
  notifyUrl: string
  status: number
  httpStatus: number
  retryCount: number
  maxRetry: number
  requestBody: string
  responseBody: string
  ctime: string
}

interface PageResult<T> { list: T[]; total: number }

export function getFlowList(data: { page: number; pageSize: number; flowNo?: string; orderNo?: string; type?: string; channelType?: string; date?: string }) {
  return post<PageResult<FlowItem>>('/gopay/v1/transaction/flow/list', data)
}

export function getFlowStats() {
  return post<FlowStats>('/gopay/v1/transaction/flow/stats')
}

export function getFlowDetail(id: number) {
  return post<FlowItem>('/gopay/v1/transaction/flow/detail', { id })
}

export function getCallbackList(data: { page: number; pageSize: number; orderNo?: string; type?: string; status?: number; channelType?: string }) {
  return post<PageResult<CallbackItem>>('/gopay/v1/transaction/callback/list', data)
}

export function getCallbackDetail(id: number) {
  return post<CallbackItem>('/gopay/v1/transaction/callback/detail', { id })
}

export function retryCallback(id: number) {
  return post('/gopay/v1/transaction/callback/retry', { id })
}
```

- [ ] **Step 2: 改造两个交易页面**

**flow.vue**: 删除 Mock → 导入 API → `onMounted` 同时调用 `getFlowList` + `getFlowStats` → 金额 /100 展示
**callback.vue**: 删除 Mock → 导入 API → 手动重试改为 `retryCallback` API 调用

- [ ] **Step 3: 验证并 Commit**

```bash
git add src/api/transaction.ts src/views/transaction/flow.vue src/views/transaction/callback.vue
git commit -m "feat: integrate transaction pages (flow/callback) with real API"
```

---

### Task 10: 对账管理

**Files:**
- Create: `src/api/reconciliation.ts`
- Modify: `src/views/reconciliation/bill.vue`
- Modify: `src/views/reconciliation/diff.vue`

- [ ] **Step 1: 创建 `src/api/reconciliation.ts`**

```typescript
import { post, download } from './request'

interface BillItem {
  id: number
  billDate: string
  channelType: string
  platformCount: number
  platformAmount: number
  channelCount: number
  channelAmount: number
  diffCount: number
  diffAmount: number
  status: number
  ctime: string
}

interface DiffItem {
  id: number
  billDate: string
  orderNo: string
  channelType: string
  diffType: string
  platformAmount: number | null
  channelAmount: number | null
  diffAmount: number
  handleStatus: number
  handleRemark: string
  handler: string
}

interface PageResult<T> { list: T[]; total: number }

export function getBillList(data: { page: number; pageSize: number; date?: string; channelType?: string; status?: number }) {
  return post<PageResult<BillItem>>('/gopay/v1/recon/bill/list', data)
}

export function generateBill(data: { date: string; channelType: string }) {
  return post('/gopay/v1/recon/bill/generate', data)
}

export function reconcileBill(id: number) {
  return post('/gopay/v1/recon/bill/reconcile', { id })
}

export function getBillDetail(id: number) {
  return post<BillItem>('/gopay/v1/recon/bill/detail', { id })
}

export function getDiffList(data: { page: number; pageSize: number; billDate?: string; orderNo?: string; channelType?: string; diffType?: string; handleStatus?: number }) {
  return post<PageResult<DiffItem>>('/gopay/v1/recon/diff/list', data)
}

export function getDiffDetail(id: number) {
  return post<DiffItem>('/gopay/v1/recon/diff/detail', { id })
}

export function handleDiff(data: { id: number; action: 'resolve' | 'ignore'; remark?: string }) {
  return post('/gopay/v1/recon/diff/handle', data)
}

export function exportDiff(data: any, filename?: string) {
  return download('/gopay/v1/recon/diff/export', data, filename || 'diff-records.csv')
}
```

- [ ] **Step 2: 改造对账页面**

**bill.vue**: 删除 Mock → 导入 API → 生成对账、执行对账改为 API 调用 → 金额 /100
**diff.vue**: 删除 Mock → 导入 API → 处理差异/忽略改为 `handleDiff` API → 导出改为 `exportDiff`

- [ ] **Step 3: 验证并 Commit**

```bash
git add src/api/reconciliation.ts src/views/reconciliation/bill.vue src/views/reconciliation/diff.vue
git commit -m "feat: integrate reconciliation pages (bill/diff) with real API"
```

---

### Task 11: 系统管理 - 用户/角色/日志

**Files:**
- Create: `src/api/system.ts`
- Modify: `src/views/system/user.vue`
- Modify: `src/views/system/role.vue`
- Modify: `src/views/system/log.vue`

- [ ] **Step 1: 创建 `src/api/system.ts`**

```typescript
import { post, download } from './request'

interface PageResult<T> { list: T[]; total: number }

// === 用户管理 ===
interface UserItem {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  role: string
  status: number
  ctime: string
  lastLogin: string
}

export function getUserList(data: { page: number; pageSize: number; username?: string; phone?: string; status?: number }) {
  return post<PageResult<UserItem>>('/gopay/v1/system/user/list', data)
}

export function addUser(data: { username: string; password: string; realName?: string; phone?: string; email?: string; role?: string }) {
  return post<{ id: number }>('/gopay/v1/system/user/add', data)
}

export function updateUser(data: { id: number; realName?: string; phone?: string; email?: string; role?: string }) {
  return post('/gopay/v1/system/user/update', data)
}

export function toggleUserStatus(id: number) {
  return post('/gopay/v1/system/user/toggleStatus', { id })
}

export function resetUserPwd(id: number) {
  return post('/gopay/v1/system/user/resetPwd', { id })
}

// === 角色管理 ===
interface RoleItem {
  id: number
  code: string
  name: string
  description: string
  userCount: number
  status: number
  builtIn: boolean
  perms: string[]
  ctime: string
}

export function getRoleList(data?: { page?: number; pageSize?: number }) {
  return post<PageResult<RoleItem>>('/gopay/v1/system/role/list', data || { page: 1, pageSize: 100 })
}

export function addRole(data: { code: string; name: string; description?: string }) {
  return post<{ id: number }>('/gopay/v1/system/role/add', data)
}

export function updateRole(data: { id: number; name: string; description?: string }) {
  return post('/gopay/v1/system/role/update', data)
}

export function toggleRoleStatus(id: number) {
  return post('/gopay/v1/system/role/toggleStatus', { id })
}

export function updateRolePerms(roleId: number, perms: string[]) {
  return post('/gopay/v1/system/role/perms/update', { roleId, perms })
}

export function getRolePerms(roleId: number) {
  return post<string[]>('/gopay/v1/system/role/perms/list', { roleId })
}

// === 操作日志 ===
interface LogItem {
  id: number
  operator: string
  module: string
  action: string
  description: string
  ip: string
  userAgent: string
  success: boolean
  duration: number
  requestData: string
  ctime: string
}

export function getLogList(data: { page: number; pageSize: number; operator?: string; module?: string; action?: string; date?: string }) {
  return post<PageResult<LogItem>>('/gopay/v1/system/log/list', data)
}

export function getLogDetail(id: number) {
  return post<LogItem>('/gopay/v1/system/log/detail', { id })
}

export function exportLogs(data: any, filename?: string) {
  return download('/gopay/v1/system/log/export', data, filename || 'operation-logs.csv')
}
```

- [ ] **Step 2: 改造三个系统管理页面**

**user.vue**: 删除 Mock → 导入 API → CRUD + 重置密码 + 切换状态 → API 调用
**role.vue**: 删除 Mock → 导入 API → CRUD + 权限配置弹窗使用 `getRolePerms/updateRolePerms`
**log.vue**: 删除 Mock → 导入 API → 列表 + 详情 + 导出 → API 调用

- [ ] **Step 3: 验证并 Commit**

```bash
git add src/api/system.ts src/views/system/user.vue src/views/system/role.vue src/views/system/log.vue
git commit -m "feat: integrate system management pages (user/role/log) with real API"
```

---

### Task 12: 个人中心

**Files:**
- Modify: `src/views/profile/index.vue`

- [ ] **Step 1: 改造 `src/views/profile/index.vue`**

关键改动：
- 导入 `useUserStore` 和 `changePwdApi, updateProfileApi` from `@/api/auth`
- 删除 Mock `userInfo` 对象，改为从 `userStore.userInfo` 获取（`onMounted` 中调用 `fetchUserInfo`）
- `handleChangePwd` 改为调用 `changePwdApi`
- 可选：添加编辑个人资料功能，调用 `updateProfileApi`

```typescript
import { reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { changePwdApi } from '@/api/auth'

const userStore = useUserStore()

onMounted(() => { userStore.fetchUserInfo() })

const userInfo = computed(() => userStore.userInfo || {
  username: '', realName: '', phone: '', email: '', role: '', lastLogin: ''
})

const avatarLetter = computed(() => (userInfo.value.realName || userInfo.value.username || 'A').charAt(0).toUpperCase())

const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

function roleLabel(r: string) { return { admin: '管理员', operator: '运营', finance: '财务', viewer: '只读' }[r] || r }

async function handleChangePwd() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) return alert('请填写完整')
  if (pwdForm.newPassword !== pwdForm.confirmPassword) return alert('两次密码不一致')
  try {
    await changePwdApi(pwdForm)
    alert('密码修改成功')
    pwdForm.oldPassword = ''; pwdForm.newPassword = ''; pwdForm.confirmPassword = ''
  } catch (e: any) {
    alert(e.message || '修改失败')
  }
}
```

- [ ] **Step 2: 验证并 Commit**

```bash
git add src/views/profile/index.vue
git commit -m "feat: integrate profile page with real API"
```

---

### Task 13: 更新项目文档

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/CHANGELOG.md`

- [ ] **Step 1: 更新 CLAUDE.md 项目进度**

将当前阶段更新为 "前后端联调完成"，更新所有模块状态为 "已对接"。

- [ ] **Step 2: 更新 CHANGELOG.md**

记录本次 API 对接的改动详情。

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md docs/CHANGELOG.md
git commit -m "docs: update project progress after API integration"
```
