# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

GoPay 支付网关管理平台前端项目，基于 Vue 3 + TypeScript + Vite + Vuetify 3 构建。

**设计风格**: Material Design 3 + 渐变点缀，Soft Blue (#3B9EFF → #7BBFFF) 主色调，白色侧边栏

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm run dev

# 构建（跳过 TS 类型检查，见下方说明）
npx vite build

# 预览生产构建
npm run preview
```

### 构建注意事项

- `npm run build`（即 `vue-tsc -b && vite build`）会因预存的 TS 模块声明问题报错（Cannot find module '@/store/user'、'@/router/menu' 等），这些并非新引入的错误
- **日常验证构建请直接使用 `npx vite build`**，它会跳过类型检查，能正常完成构建

## 架构要点

### 路由架构

- 使用 Vue Router 5 with Hash 模式
- 路由守卫在 `src/router/index.ts` 中实现，基于 localStorage 的 token 验证
- 主布局路由嵌套结构：`/` → Layout → 子路由（共 16 个子路由）
- 菜单配置与路由分离：`src/router/menu.ts` 定义菜单结构，通过 `key` 映射到路由 `path`

### 状态管理

- Pinia store 位于 `src/store/`
- `user.ts`: 用户认证状态，包含 token 和 userInfo，持久化到 localStorage
- 当前登录为 Mock 实现，直接生成 token 无需后端验证

### 布局系统 (Layout.vue)

- `src/components/Layout.vue` 是主布局组件
- **侧边栏**: 纯自定义 HTML + CSS 实现（`<nav>` + `<div>`），**不使用 Vuetify 的 v-list/v-list-item/v-list-group**
  - 折叠状态通过 `v-if="!collapsed"` 隐藏文字和箭头，只显示图标
  - `expandedKeys` 控制子菜单展开状态，初始化时自动展开当前路由所属分组
- **用户下拉菜单**: 自定义 absolute 定位的 `.user-menu`，**不使用 Vuetify 的 v-menu**
  - 使用自定义指令 `v-click-outside` 实现点击外部关闭
- 图标使用 MDI (@mdi/font)，菜单数据在 `src/router/menu.ts` 中定义

### 菜单结构

8 个主模块：
- 仪表盘
- 商户管理 (商户列表、商户应用)
- 进件管理 (进件申请、进件记录)
- 支付配置 (通道管理)
- 订单中心 (支付订单、退款订单、转账订单)
- 交易记录 (交易流水、回调记录)
- 对账管理 (对账单、差异记录)
- 系统管理 (用户管理、角色管理、操作日志)

另有独立路由：个人中心 (`/profile`)，通过右上角用户下拉菜单进入

## 当前实现状态

**全部页面已完成（Mock 数据）**:

| 模块 | 页面 | 文件路径 | 核心功能 |
|------|------|----------|----------|
| 登录 | 登录页 | `views/login/index.vue` | 默认账号 admin/admin |
| 仪表盘 | 仪表盘 | `views/dashboard/index.vue` | 数据卡片 + ECharts 图表 |
| 商户管理 | 商户列表 | `views/merchant/list.vue` | CRUD、状态切换、详情弹窗 |
| 商户管理 | 商户应用 | `views/merchant/app.vue` | 应用管理、密钥查看 |
| 进件管理 | 进件申请 | `views/incoming/apply.vue` | 申请表单、图片上传（营业执照+身份证） |
| 进件管理 | 进件记录 | `views/incoming/record.vue` | 审核状态、详情查看 |
| 支付配置 | 通道管理 | `views/payment/channel.vue` | CRUD、支付宝/微信参数配置弹窗 |
| 订单中心 | 支付订单 | `views/order/payment.vue` | 查询、关闭订单、发起退款 |
| 订单中心 | 退款订单 | `views/order/refund.vue` | 退款记录查看 |
| 订单中心 | 转账订单 | `views/order/transfer.vue` | 创建转账、记录查看 |
| 交易记录 | 交易流水 | `views/transaction/flow.vue` | 收支统计卡片、流水列表 |
| 交易记录 | 回调记录 | `views/transaction/callback.vue` | 上下游回调、手动重试 |
| 对账管理 | 对账单 | `views/reconciliation/bill.vue` | 生成对账、数据对比、下载 |
| 对账管理 | 差异记录 | `views/reconciliation/diff.vue` | 差异处理（解决/忽略） |
| 系统管理 | 用户管理 | `views/system/user.vue` | CRUD、重置密码、状态切换 |
| 系统管理 | 角色管理 | `views/system/role.vue` | CRUD、分组权限配置 |
| 系统管理 | 操作日志 | `views/system/log.vue` | 日志查询、详情（含请求参数） |
| 个人中心 | 个人中心 | `views/profile/index.vue` | 基本信息、修改密码 |

**待办**: 所有页面均使用 Mock 数据，后续需与后端 gopay-platform 逐模块对接真实 API

## 开发约定

### UI 组件使用规范（重要）

**Vuetify 仅用于以下场景**：
- `v-card`: 卡片容器（`rounded="lg" flat`）
- `v-dialog`: 模态弹窗
- `v-btn` + `v-icon`: 仅用于表格行内图标按钮（`icon variant="text" size="x-small"`）

**所有其他 UI 元素使用自定义 HTML + CSS**：
- 表单控件：原生 `<input>`、`<select>`、`<textarea>`、`<checkbox>`
- 按钮：自定义 `.btn .btn-primary / .btn-outlined`
- 表格：原生 `<table>` + `.data-table` 样式
- 状态标签：`.chip` + `.chip-green / .chip-blue / .chip-amber / .chip-red / .chip-grey / .chip-purple / .chip-teal`
- 侧边栏菜单：纯 CSS + 原生 HTML
- 下拉菜单：自定义定位 + `v-click-outside` 指令

**原因**: Vuetify 使用 CSS `@layer` 导致 utility classes（如 `pa-4`、`text-center`、`d-flex`）优先级低于 scoped 样式而失效。因此统一采用自定义 CSS 方案。

### 页面通用模式

每个列表页面遵循统一结构：
```
search-card (搜索条件区)
  └─ search-bar > search-fields + search-actions
table-card (数据表格区)
  └─ table-header (标题 + 操作按钮)
  └─ table-wrap > data-table
  └─ table-footer (数据统计)
v-dialog (详情/编辑弹窗)
  └─ dialog-header + dialog-body + dialog-footer
```

### 新增页面

1. 在 `src/views/` 对应模块目录下创建页面组件
2. 在 `src/router/index.ts` 的 Layout children 中添加路由配置（使用懒加载 `() => import(...)`）
3. 如需侧边栏菜单入口，在 `src/router/menu.ts` 的 `menuData` 中添加菜单项
4. 确保路由 `path` 与 `menu.ts` 中的 `path` 一致

### 新增菜单

1. 在 `src/router/menu.ts` 的 `menuData` 中添加菜单项
2. 图标使用 MDI 名称（如 `mdi-store`），无需额外导入

### Mock 数据

- 当前所有页面使用前端硬编码的 Mock 数据
- 登录功能跳过真实验证，直接生成 token
- 优先实现 UI 和交互，后续对接真实 API
- 图片上传使用 FileReader API 生成 dataURL 预览，无实际文件上传

### 路径别名

- `@` 映射到 `src/` 目录 (配置在 vite.config.ts)

## 技术栈版本

- Vue 3.5.32
- TypeScript 6.0.2
- Vite 8.0.4
- Vuetify 3.8.5
- Vue Router 5.0.4
- Pinia 3.0.4
- ECharts 6.0.0
- @mdi/font 7.4.47

## 关联后端项目

本项目的后端服务为 **gopay-platform**，位于 `/Users/my40138ml/workspace/jerry/go-pay/gopay-platform`。

- **技术栈**: Go 1.22 + Gin + GORM (MySQL) + Redis
- **开发端口**: 后端 localhost:2233，前端 localhost:3000
- **API 前缀**: `/gopay/v1/`，前端通过 Vite proxy 转发请求到后端
- **数据库**: MySQL `gopay`，DDL 在后端 `mysql_ddl.sql`，主要表：account、company、payment_cfg、app、payment_order
- **后端已实现**: 支付宝支付（QR码 + 页面支付）、健康检查
- **后端待实现**: SSO 登录、用户管理、订单管理、支付配置 CRUD、微信支付

### 前后端接口对齐要点

- 登录: `POST /gopay/v1/sso/login` — 前端 Mock 中，后端待实现
- 用户信息: `POST /gopay/v1/user/getInfo` — 前端 Mock 中，后端待实现
- 新增功能模块页面时，需确认后端是否有对应接口，无则先用 Mock 数据
- 接口联调时在 `vite.config.ts` 配置 proxy 将 `/gopay` 转发到 `http://localhost:2233`
