# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

GoPay 支付平台运营管理系统前端项目，基于 Vue 3 + TypeScript + Vite 构建。

**参考设计**: https://admin.plus.daxpay.cn

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm run dev

# 类型检查和构建
npm run build

# 预览生产构建
npm run preview
```

## 架构要点

### 路由架构

- 使用 Vue Router 5 with Hash 模式
- 路由守卫在 `src/router/index.ts` 中实现，基于 localStorage 的 token 验证
- 主布局路由嵌套结构：`/` → Layout → 子路由
- 菜单配置与路由分离：`src/router/menu.ts` 定义菜单结构，通过 `key` 映射到路由 `path`

### 状态管理

- Pinia store 位于 `src/store/`
- `user.ts`: 用户认证状态，包含 token 和 userInfo，持久化到 localStorage
- 当前登录为 Mock 实现，直接生成 token 无需后端验证

### 布局系统

- `src/components/Layout.vue` 是主布局组件
- 侧边栏菜单从 `src/router/menu.ts` 的 `menuData` 动态生成
- 图标使用 Ant Design Vue 的图标组件，通过 `iconMap` 映射字符串到组件
- 菜单点击通过 `handleMenuClick` 查找对应的 `path` 并导航

### 菜单结构

13个主模块已配置完整菜单树：
- 系统管理 (10个子项)
- 支付配置 (2个子项)
- 代理商管理 (2个子项)
- 商户管理 (3个子项)
- 进件管理 (2个子项)
- 分账管理 (2个子项)
- 分润管理 (3个子项)
- 订单管理 (5个子项)
- 交易记录 (5个子项)
- 商户通知 (1个子项)
- 设备管理 (5个子项)
- 对账管理 (2个子项)
- 开发调试 (4个子项)

### 当前实现状态

**已完成**:
- 登录页面 (默认账号 admin/admin)
- 主布局 (侧边栏 + 顶部导航)
- 仪表盘页面 (数据卡片 + ECharts 图表)

**待实现**: 所有功能模块的详细页面 (参考 PROJECT_PROGRESS.md)

## 开发约定

### 新增页面

1. 在 `src/views/` 对应模块目录下创建页面组件
2. 在 `src/router/index.ts` 的 Layout children 中添加路由配置
3. 确保路由 `path` 与 `menu.ts` 中的 `path` 一致

### 新增菜单

1. 在 `src/router/menu.ts` 的 `menuData` 中添加菜单项
2. 如果使用新图标，在 `Layout.vue` 的 `iconMap` 中添加映射
3. 从 `@ant-design/icons-vue` 导入对应图标组件

### Mock 数据

- 当前所有接口调用使用 Mock 数据
- 登录功能跳过真实验证，直接生成 token
- 优先实现 UI 和交互，后续对接真实 API

### 路径别名

- `@` 映射到 `src/` 目录 (配置在 vite.config.ts)

## 技术栈版本

- Vue 3.5.32
- TypeScript 6.0.2
- Vite 8.0.4
- Ant Design Vue 4.2.6
- Vue Router 5.0.4
- Pinia 3.0.4
- ECharts 6.0.0
