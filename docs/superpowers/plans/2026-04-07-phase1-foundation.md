# Phase 1: 基础设施改造 — Vuetify 3 + 新布局 + 核心页面

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目从 Ant Design Vue 迁移到 Vuetify 3（Material Design），重建布局系统、登录页和仪表盘，建立后续模块开发的基础。

**Architecture:** 替换组件库依赖，重写 main.ts 入口配置 Vuetify，重建 Layout 组件（白色侧边栏 + 顶部栏），重写菜单数据结构适配新的 8 模块菜单，改造登录页和仪表盘页面为 Vuetify + 渐变风格。

**Tech Stack:** Vue 3.5, TypeScript, Vite 8, Vuetify 3, @mdi/font, ECharts 6, Pinia 3, Vue Router 5

**PRD 参考:** `prd/PRD.md` — 功能需求, `prd/UI_DESIGN.md` — UI 设计规范, `prd/preview.html` — 视觉参考原型

---

## File Structure

### 新建文件
- `src/plugins/vuetify.ts` — Vuetify 插件配置（主题、颜色、图标）
- `src/styles/global.css` — 全局样式（替换 style.css）

### 修改文件
- `package.json` — 替换依赖
- `src/main.ts` — 替换 Antd 为 Vuetify
- `src/App.vue` — 适配 Vuetify
- `src/components/Layout.vue` — 完全重写为白色侧边栏 + 顶部栏
- `src/router/menu.ts` — 重写为 8 模块菜单数据
- `src/router/index.ts` — 添加所有模块路由
- `src/views/login/index.vue` — 重写为 Vuetify + 渐变风格
- `src/views/dashboard/index.vue` — 重写为 Vuetify + 渐变数据卡片 + ECharts

### 删除文件
- `src/style.css` — 被 `src/styles/global.css` 替代
- `src/components/HelloWorld.vue` — 未使用

---

## Task 1: 替换依赖 — Ant Design Vue → Vuetify 3

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 卸载 Ant Design Vue**

```bash
npm uninstall ant-design-vue
```

- [ ] **Step 2: 安装 Vuetify 3 及相关依赖**

```bash
npm install vuetify @mdi/font
npm install -D vite-plugin-vuetify
```

- [ ] **Step 3: 验证 package.json 依赖正确**

```bash
cat package.json | grep -E "vuetify|mdi|ant-design"
```

Expected: 看到 vuetify 和 @mdi/font，不再看到 ant-design-vue

- [ ] **Step 4: 确认安装成功**

```bash
npm ls vuetify @mdi/font vite-plugin-vuetify
```

Expected: 三个包都已安装，无 missing 报错

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: 替换 ant-design-vue 为 vuetify 3"
```

---

## Task 2: 配置 Vuetify 插件和全局样式

**Files:**
- Create: `src/plugins/vuetify.ts`
- Create: `src/styles/global.css`
- Modify: `src/main.ts`
- Modify: `src/App.vue`
- Modify: `vite.config.ts`
- Delete: `src/style.css`
- Delete: `src/components/HelloWorld.vue`

- [ ] **Step 1: 创建 Vuetify 插件配置文件**

创建 `src/plugins/vuetify.ts`:

```typescript
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3B9EFF',
          'primary-lighten-1': '#7BBFFF',
          secondary: '#64748B',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
          background: '#F5F5F9',
          surface: '#FFFFFF',
        },
      },
    },
  },
  defaults: {
    VTextField: { variant: 'outlined', density: 'compact' },
    VSelect: { variant: 'outlined', density: 'compact' },
    VTextarea: { variant: 'outlined', density: 'compact' },
    VBtn: { rounded: 'lg' },
    VCard: { rounded: 'lg' },
    VChip: { size: 'small' },
  },
})
```

- [ ] **Step 2: 创建全局样式文件**

创建 `src/styles/global.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #F5F5F9;
  color: #1E293B;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100vh;
}

/* Gradient utilities */
.bg-gradient-primary {
  background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%) !important;
}

.bg-gradient-success {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%) !important;
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%) !important;
}

.btn-gradient-primary {
  background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(59, 158, 255, 0.3);
  transition: all 0.2s;
}

.btn-gradient-primary:hover {
  box-shadow: 0 4px 12px rgba(59, 158, 255, 0.4);
  transform: translateY(-1px);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
```

- [ ] **Step 3: 更新 main.ts — 替换 Antd 为 Vuetify**

将 `src/main.ts` 内容替换为:

```typescript
import { createApp } from 'vue'
import vuetify from './plugins/vuetify'
import './styles/global.css'
import App from './App.vue'
import router from './router'
import pinia from './store'

const app = createApp(App)

app.use(vuetify)
app.use(router)
app.use(pinia)

app.mount('#app')
```

- [ ] **Step 4: 更新 App.vue**

将 `src/App.vue` 内容替换为:

```vue
<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
</script>
```

- [ ] **Step 5: 更新 vite.config.ts — 添加 Vuetify 插件**

将 `vite.config.ts` 内容替换为:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
```

- [ ] **Step 6: 删除旧文件**

```bash
rm src/style.css src/components/HelloWorld.vue
```

- [ ] **Step 7: 验证项目能启动（暂时会有 Layout 报错是正常的）**

```bash
npm run dev
```

Expected: Vite 启动成功，编译无 fatal 错误

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: 配置 Vuetify 3 插件、主题和全局样式"
```

---

## Task 3: 重写菜单数据 — 8 模块新结构

**Files:**
- Modify: `src/router/menu.ts`

- [ ] **Step 1: 重写 menu.ts 为 8 模块菜单**

将 `src/router/menu.ts` 内容替换为:

```typescript
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
}

export const menuData: MenuItem[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    icon: 'mdi-view-dashboard',
    path: '/dashboard',
  },
  {
    key: 'merchant',
    label: '商户管理',
    icon: 'mdi-store',
    children: [
      { key: 'merchant-list', label: '商户列表', path: '/merchant/list' },
      { key: 'merchant-app', label: '商户应用', path: '/merchant/app' },
    ],
  },
  {
    key: 'incoming',
    label: '进件管理',
    icon: 'mdi-file-document-check',
    children: [
      { key: 'incoming-apply', label: '进件申请', path: '/incoming/apply' },
      { key: 'incoming-record', label: '进件记录', path: '/incoming/record' },
    ],
  },
  {
    key: 'payment',
    label: '支付配置',
    icon: 'mdi-cog',
    children: [
      { key: 'payment-channel', label: '通道管理', path: '/payment/channel' },
    ],
  },
  {
    key: 'order',
    label: '订单中心',
    icon: 'mdi-receipt-text',
    children: [
      { key: 'order-payment', label: '支付订单', path: '/order/payment' },
      { key: 'order-refund', label: '退款订单', path: '/order/refund' },
      { key: 'order-transfer', label: '转账订单', path: '/order/transfer' },
    ],
  },
  {
    key: 'transaction',
    label: '交易记录',
    icon: 'mdi-format-list-bulleted',
    children: [
      { key: 'transaction-flow', label: '交易流水', path: '/transaction/flow' },
      { key: 'transaction-callback', label: '回调记录', path: '/transaction/callback' },
    ],
  },
  {
    key: 'reconciliation',
    label: '对账管理',
    icon: 'mdi-scale-balance',
    children: [
      { key: 'reconciliation-bill', label: '对账单', path: '/reconciliation/bill' },
      { key: 'reconciliation-diff', label: '差异记录', path: '/reconciliation/diff' },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'mdi-shield-lock',
    children: [
      { key: 'system-user', label: '用户管理', path: '/system/user' },
      { key: 'system-role', label: '角色管理', path: '/system/role' },
      { key: 'system-log', label: '操作日志', path: '/system/log' },
    ],
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/router/menu.ts
git commit -m "feat: 重写菜单数据为 8 模块新结构"
```

---

## Task 4: 重写 Layout 组件 — 白色侧边栏 + 顶部栏

**Files:**
- Modify: `src/components/Layout.vue`

- [ ] **Step 1: 完全重写 Layout.vue**

将 `src/components/Layout.vue` 内容替换为:

```vue
<template>
  <v-layout class="layout-root">
    <!-- 侧边栏 -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      :width="260"
      class="sidebar"
      color="white"
    >
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">G</div>
        <span v-if="!rail" class="logo-text">GoPay</span>
      </div>

      <v-divider />

      <!-- 菜单 -->
      <v-list density="compact" nav class="sidebar-menu">
        <template v-for="item in menuData" :key="item.key">
          <!-- 无子菜单项（仪表盘） -->
          <v-list-item
            v-if="!item.children"
            :prepend-icon="item.icon"
            :title="item.label"
            :value="item.key"
            :active="isActive(item)"
            rounded="lg"
            class="menu-item"
            @click="navigateTo(item.path!)"
          />

          <!-- 有子菜单项 -->
          <v-list-group v-else :value="item.key">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="item.icon"
                :title="item.label"
                rounded="lg"
                class="menu-item"
              />
            </template>
            <v-list-item
              v-for="child in item.children"
              :key="child.key"
              :title="child.label"
              :value="child.key"
              :active="isActive(child)"
              rounded="lg"
              class="menu-item menu-child"
              @click="navigateTo(child.path!)"
            />
          </v-list-group>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- 主内容区 -->
    <v-main class="main-content">
      <!-- 顶部栏 -->
      <v-app-bar flat color="white" class="topbar" density="comfortable">
        <v-btn icon @click="rail = !rail">
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <v-breadcrumbs :items="breadcrumbs" class="px-0">
          <template #prepend>
            <v-icon size="small" class="mr-1">mdi-home</v-icon>
          </template>
        </v-breadcrumbs>

        <v-spacer />

        <v-btn icon class="mr-2">
          <v-badge color="error" content="3" :offset-x="-2" :offset-y="-2">
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>

        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text" class="text-none user-btn">
              <v-avatar size="32" class="bg-gradient-primary mr-2">
                <span class="text-white font-weight-bold text-body-2">
                  {{ avatarLetter }}
                </span>
              </v-avatar>
              <span class="text-body-2 font-weight-medium">
                {{ userStore.userInfo?.username || 'Admin' }}
              </span>
              <v-icon size="small" class="ml-1">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-account" title="个人中心" />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-logout"
              title="退出登录"
              @click="handleLogout"
            />
          </v-list>
        </v-menu>
      </v-app-bar>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { menuData } from '@/router/menu'
import type { MenuItem } from '@/router/menu'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const drawer = ref(true)
const rail = ref(false)

const avatarLetter = computed(() => {
  const name = userStore.userInfo?.username || 'A'
  return name.charAt(0).toUpperCase()
})

const breadcrumbs = computed(() => {
  const items: Array<{ title: string; disabled: boolean }> = []
  for (const menu of menuData) {
    if (menu.path === route.path) {
      items.push({ title: menu.label, disabled: true })
      return items
    }
    if (menu.children) {
      const child = menu.children.find((c) => c.path === route.path)
      if (child) {
        items.push({ title: menu.label, disabled: false })
        items.push({ title: child.label, disabled: true })
        return items
      }
    }
  }
  return items
})

function isActive(item: MenuItem): boolean {
  return item.path === route.path
}

function navigateTo(path: string) {
  router.push(path)
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-root {
  height: 100vh;
}

.sidebar {
  border-right: 1px solid #EEF2F6 !important;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
  letter-spacing: 1px;
}

.sidebar-menu {
  padding: 8px !important;
}

.menu-item {
  margin-bottom: 2px;
  color: #64748B;
}

.menu-item:hover {
  background: #F1F5FE !important;
  color: #3B9EFF !important;
}

.menu-item.v-list-item--active {
  background: linear-gradient(135deg, #E8F2FF 0%, #F0F7FF 100%) !important;
  color: #3B9EFF !important;
}

.menu-child {
  padding-left: 28px !important;
  font-size: 13px;
}

.topbar {
  border-bottom: 1px solid #EEF2F6 !important;
}

.user-btn {
  text-transform: none;
  letter-spacing: 0;
}

.main-content {
  background: #F5F5F9;
}

.page-content {
  padding: 24px;
  min-height: calc(100vh - 64px);
}
</style>
```

- [ ] **Step 2: 验证布局渲染正确**

```bash
npm run dev
```

打开 http://localhost:3000，检查:
- 白色侧边栏可见，Logo 区域正常
- 8 个菜单模块全部显示
- 顶部栏有汉堡按钮、面包屑、通知铃铛、用户头像
- 点击汉堡按钮可以收缩/展开侧边栏
- 内容区背景为浅灰色

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout.vue
git commit -m "feat: 重写 Layout 为 Vuetify 白色侧边栏 + 顶部栏"
```

---

## Task 5: 添加所有模块路由

**Files:**
- Modify: `src/router/index.ts`

- [ ] **Step 1: 重写路由配置，添加所有模块路由**

将 `src/router/index.ts` 内容替换为:

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/components/Layout.vue'

// 占位页面组件，后续各模块实现时替换
const Placeholder = {
  template: `
    <v-card variant="outlined" class="pa-8 text-center">
      <v-icon size="48" color="grey-lighten-1" class="mb-4">mdi-hammer-wrench</v-icon>
      <div class="text-h6 text-grey-darken-1">页面建设中</div>
      <div class="text-body-2 text-grey mt-2">该功能模块正在开发中，敬请期待</div>
    </v-card>
  `,
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘' },
      },
      // 商户管理
      { path: 'merchant/list', name: 'MerchantList', component: Placeholder, meta: { title: '商户列表' } },
      { path: 'merchant/app', name: 'MerchantApp', component: Placeholder, meta: { title: '商户应用' } },
      // 进件管理
      { path: 'incoming/apply', name: 'IncomingApply', component: Placeholder, meta: { title: '进件申请' } },
      { path: 'incoming/record', name: 'IncomingRecord', component: Placeholder, meta: { title: '进件记录' } },
      // 支付配置
      { path: 'payment/channel', name: 'PaymentChannel', component: Placeholder, meta: { title: '通道管理' } },
      // 订单中心
      { path: 'order/payment', name: 'OrderPayment', component: Placeholder, meta: { title: '支付订单' } },
      { path: 'order/refund', name: 'OrderRefund', component: Placeholder, meta: { title: '退款订单' } },
      { path: 'order/transfer', name: 'OrderTransfer', component: Placeholder, meta: { title: '转账订单' } },
      // 交易记录
      { path: 'transaction/flow', name: 'TransactionFlow', component: Placeholder, meta: { title: '交易流水' } },
      { path: 'transaction/callback', name: 'TransactionCallback', component: Placeholder, meta: { title: '回调记录' } },
      // 对账管理
      { path: 'reconciliation/bill', name: 'ReconBill', component: Placeholder, meta: { title: '对账单' } },
      { path: 'reconciliation/diff', name: 'ReconDiff', component: Placeholder, meta: { title: '差异记录' } },
      // 系统管理
      { path: 'system/user', name: 'SystemUser', component: Placeholder, meta: { title: '用户管理' } },
      { path: 'system/role', name: 'SystemRole', component: Placeholder, meta: { title: '角色管理' } },
      { path: 'system/log', name: 'SystemLog', component: Placeholder, meta: { title: '操作日志' } },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.path === '/login') return true
  return token ? true : '/login'
})

export default router
```

- [ ] **Step 2: 验证路由和菜单联动**

```bash
npm run dev
```

打开 http://localhost:3000，检查:
- 点击侧边栏各菜单项，URL 正确变化
- 非仪表盘页面显示「页面建设中」占位
- 面包屑随页面变化更新

- [ ] **Step 3: Commit**

```bash
git add src/router/index.ts
git commit -m "feat: 添加所有模块路由，未实现页面使用占位组件"
```

---

## Task 6: 重写登录页 — Vuetify + 渐变风格

**Files:**
- Modify: `src/views/login/index.vue`

- [ ] **Step 1: 重写登录页**

将 `src/views/login/index.vue` 内容替换为:

```vue
<template>
  <div class="login-container">
    <v-card class="login-card" elevation="12" rounded="xl">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="logo-icon mx-auto mb-4">G</div>
        <h1 class="text-h5 font-weight-bold" style="color: #1E293B">GoPay</h1>
        <p class="text-body-2 mt-1" style="color: #64748B">支付网关管理平台</p>
      </div>

      <!-- 登录表单 -->
      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="form.username"
          prepend-inner-icon="mdi-account"
          label="账号"
          placeholder="请输入账号"
          :rules="[rules.required]"
          class="mb-1"
        />

        <v-text-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          label="密码"
          placeholder="请输入密码"
          :rules="[rules.required]"
          class="mb-1"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-checkbox
          v-model="form.remember"
          label="记住我"
          density="compact"
          color="primary"
          class="mb-4"
        />

        <v-btn
          type="submit"
          block
          size="large"
          :loading="loading"
          class="btn-gradient-primary text-none"
          style="font-size: 16px; letter-spacing: 0"
        >
          登 录
        </v-btn>
      </v-form>
    </v-card>

    <!-- 底部版权 -->
    <div class="copyright">
      &copy; 2026 GoPay. All rights reserved.
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  username: 'admin',
  password: 'admin',
  remember: true,
})

const rules = {
  required: (v: string) => !!v || '此项为必填',
}

async function handleLogin() {
  if (!form.username || !form.password) return
  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    router.push('/dashboard')
  } catch {
    // TODO: 对接后端后使用 snackbar 提示错误
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%);
}

.login-card {
  width: 420px;
  padding: 48px 40px 40px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.copyright {
  margin-top: 32px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}
</style>
```

- [ ] **Step 2: 验证登录页**

打开 http://localhost:3000/#/login，检查:
- 渐变蓝色全屏背景
- 白色卡片居中，Logo + 表单
- 密码切换可见/隐藏正常
- 点击登录跳转到仪表盘

- [ ] **Step 3: Commit**

```bash
git add src/views/login/index.vue
git commit -m "feat: 重写登录页为 Vuetify + 渐变风格"
```

---

## Task 7: 重写仪表盘页面 — 渐变卡片 + ECharts

**Files:**
- Modify: `src/views/dashboard/index.vue`

- [ ] **Step 1: 重写仪表盘页面**

将 `src/views/dashboard/index.vue` 内容替换为:

```vue
<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <v-card class="welcome-banner mb-6" rounded="lg" flat>
      <div class="d-flex align-center justify-space-between pa-8">
        <div>
          <h1 class="text-h5 font-weight-bold text-white mb-2">
            欢迎使用 GoPay 支付网关管理平台
          </h1>
          <p class="text-body-2" style="color: rgba(255,255,255,0.85)">
            智能支付，高效管理
          </p>
          <p class="text-caption mt-1" style="color: rgba(255,255,255,0.65)">
            {{ today }}
          </p>
        </div>
        <v-icon size="80" style="opacity: 0.15" color="white">mdi-finance</v-icon>
      </div>
    </v-card>

    <!-- 数据卡片 -->
    <v-row class="mb-6">
      <v-col v-for="card in statCards" :key="card.label" cols="4">
        <v-card :class="['stat-card', card.gradient]" rounded="lg" flat>
          <div class="d-flex align-center justify-space-between pa-6">
            <div>
              <div class="text-h5 font-weight-bold text-white">{{ card.value }}</div>
              <div class="text-body-2 mt-1" style="color: rgba(255,255,255,0.85)">
                {{ card.label }}
              </div>
            </div>
            <v-icon size="48" style="opacity: 0.3" color="white">{{ card.icon }}</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 快捷入口 -->
    <v-row class="mb-6">
      <v-col v-for="entry in quickEntries" :key="entry.label" cols="6">
        <v-card
          variant="outlined"
          rounded="lg"
          class="quick-entry pa-5"
          @click="$router.push(entry.path)"
        >
          <div class="d-flex align-center ga-4">
            <v-avatar :color="entry.bgColor" size="48" rounded="lg">
              <v-icon :color="entry.iconColor">{{ entry.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption" style="color: #64748B">{{ entry.label }}</div>
              <div class="text-h5 font-weight-bold">{{ entry.value }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 图表区 -->
    <v-row>
      <v-col cols="6">
        <v-card rounded="lg" class="pa-6" flat>
          <div class="text-subtitle-1 font-weight-bold mb-5">通道交易分布</div>
          <div ref="donutChartRef" style="width: 100%; height: 320px"></div>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card rounded="lg" class="pa-6" flat>
          <div class="text-subtitle-1 font-weight-bold mb-5">近 7 日交易趋势</div>
          <div ref="areaChartRef" style="width: 100%; height: 320px"></div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const today = dayjs().format('YYYY-MM-DD dddd')

const statCards = [
  {
    label: '今日交易额',
    value: '¥ 128,456.00',
    icon: 'mdi-cash-multiple',
    gradient: 'bg-gradient-primary',
  },
  {
    label: '今日交易笔数',
    value: '1,234',
    icon: 'mdi-receipt-text-outline',
    gradient: 'bg-gradient-success',
  },
  {
    label: '今日成功率',
    value: '98.6%',
    icon: 'mdi-check-circle-outline',
    gradient: 'bg-gradient-warning',
  },
]

const quickEntries = [
  {
    label: '待审核进件',
    value: 3,
    icon: 'mdi-file-clock',
    bgColor: '#FFF7ED',
    iconColor: '#F59E0B',
    path: '/incoming/apply',
  },
  {
    label: '待处理退款',
    value: 5,
    icon: 'mdi-cash-refund',
    bgColor: '#FEF2F2',
    iconColor: '#EF4444',
    path: '/order/refund',
  },
]

const donutChartRef = ref<HTMLElement>()
const areaChartRef = ref<HTMLElement>()
let donutChart: echarts.ECharts | null = null
let areaChart: echarts.ECharts | null = null

function initDonutChart() {
  if (!donutChartRef.value) return
  donutChart = echarts.init(donutChartRef.value)
  donutChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { bottom: 0, itemGap: 24 },
    color: ['#3B9EFF', '#10B981'],
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
        label: {
          show: true,
          position: 'center',
          formatter: '¥128K\n总交易额',
          fontSize: 16,
          fontWeight: 'bold',
          lineHeight: 24,
          color: '#1E293B',
        },
        emphasis: {
          label: { show: true, fontSize: 18, fontWeight: 'bold' },
        },
        data: [
          { value: 83496, name: '支付宝' },
          { value: 44960, name: '微信支付' },
        ],
      },
    ],
  })
}

function initAreaChart() {
  if (!areaChartRef.value) return
  areaChart = echarts.init(areaChartRef.value)
  const dates = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(6 - i, 'day').format('MM-DD')
  )
  areaChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, itemGap: 24 },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#F1F5F9' } } },
    color: ['#3B9EFF', '#10B981'],
    series: [
      {
        name: '交易额(万)',
        type: 'line',
        smooth: true,
        data: [8.2, 9.5, 11.3, 10.8, 12.5, 13.1, 12.8],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59,158,255,0.25)' },
            { offset: 1, color: 'rgba(59,158,255,0.02)' },
          ]),
        },
      },
      {
        name: '交易笔数(百)',
        type: 'line',
        smooth: true,
        data: [6.8, 7.2, 9.1, 8.5, 10.3, 11.2, 12.3],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16,185,129,0.2)' },
            { offset: 1, color: 'rgba(16,185,129,0.02)' },
          ]),
        },
      },
    ],
  })
}

function handleResize() {
  donutChart?.resize()
  areaChart?.resize()
}

onMounted(() => {
  initDonutChart()
  initAreaChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  donutChart?.dispose()
  areaChart?.dispose()
})
</script>

<style scoped>
.welcome-banner {
  background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%);
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
}

.quick-entry {
  cursor: pointer;
  transition: all 0.2s;
  border-color: transparent !important;
}

.quick-entry:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
  border-color: #3B9EFF !important;
}
</style>
```

- [ ] **Step 2: 验证仪表盘页面**

打开 http://localhost:3000/#/dashboard，检查:
- 渐变欢迎横幅正常
- 3 个渐变数据卡片（蓝/绿/琥珀）正常
- 快捷入口卡片可点击
- 环形图和面积折线图正确渲染
- 整体风格与 preview.html 原型一致

- [ ] **Step 3: Commit**

```bash
git add src/views/dashboard/index.vue
git commit -m "feat: 重写仪表盘为 Vuetify + 渐变数据卡片 + ECharts"
```

---

## Task 8: 最终验证和清理

**Files:**
- Modify: `CLAUDE.md` (更新技术栈信息)

- [ ] **Step 1: 完整功能验证**

```bash
npm run dev
```

验证清单:
- 登录页: 渐变背景、表单正常、登录成功跳转
- 仪表盘: 欢迎横幅、数据卡片、图表渲染
- 侧边栏: 8 个模块菜单、展开/折叠、选中高亮
- 顶部栏: 汉堡按钮、面包屑、通知徽章、用户下拉
- 路由: 所有菜单项点击跳转正确，未实现页面显示占位
- 退出登录: 清除 token，跳转登录页

- [ ] **Step 2: 类型检查**

```bash
npx vue-tsc --noEmit
```

Expected: 无 TypeScript 错误

- [ ] **Step 3: 更新 CLAUDE.md 技术栈信息**

在 CLAUDE.md 中更新技术栈版本段落，将 `Ant Design Vue 4.2.6` 替换为 `Vuetify 3.x`，并添加 `@mdi/font`。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: Phase 1 完成 — Vuetify 迁移和核心页面改造"
```

---

## Summary

完成 Phase 1 后的项目状态:
- **组件库**: Vuetify 3 + Material Design Icons（替代 Ant Design Vue）
- **布局**: 白色侧边栏 + 白色顶部栏 + 浅灰内容区
- **已完成页面**: 登录页（渐变风格）+ 仪表盘（渐变卡片 + ECharts）
- **路由**: 17 个页面路由全部注册，未实现的使用占位组件
- **菜单**: 8 个模块、17 个子菜单项

后续 Phase 2+ 将逐模块实现各功能页面（系统管理 → 支付配置 → 商户管理 → ...）
