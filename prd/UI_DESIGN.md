# GoPay 支付网关管理平台 - UI 设计规范

## 1. 全局设计规范

### 1.1 设计基调

- **设计语言**：Material Design 3 + 渐变点缀
- **组件库**：Vuetify 3（替换 Ant Design Vue）
- **整体风格**：现代、简洁、有质感，通过渐变和阴影层次营造高级感
- **图标库**：Material Design Icons（@mdi/font）

### 1.2 色彩体系

```
主色渐变（品牌色，用于按钮、横幅、数据卡片、强调元素）：
  - 渐变起点：#3B9EFF（Soft Blue）
  - 渐变终点：#7BBFFF（Light Blue）
  - CSS：linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%)

功能色：
  - 成功：#10B981（Emerald）
  - 警告：#F59E0B（Amber）
  - 错误：#EF4444（Red）
  - 信息：#3B82F6（Blue）

中性色：
  - 页面背景：#F5F5F9（淡灰紫，比纯灰更有质感）
  - 卡片背景：#FFFFFF
  - 侧边栏背景：#FFFFFF（白色，右侧 1px #EEF2F6 边框）
  - 侧边栏文字：#64748B（默认）/ #3B9EFF（选中）/ #1E293B（展开的父菜单）
  - 正文文字：#1E293B
  - 次要文字：#64748B
  - 边框/分割线：#E2E8F0
```

### 1.3 阴影与圆角

```
卡片阴影：0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)
卡片悬停：0 10px 15px rgba(0, 0, 0, 0.08)
圆角：
  - 卡片/弹窗：12px
  - 按钮：8px
  - 输入框：8px
  - 标签(Chip)：16px（全圆角）
```

### 1.4 渐变应用场景

| 场景 | 渐变方式 | 说明 |
|------|---------|------|
| 侧边栏 | 不使用渐变 | 白色背景，选中项淡蓝底色 #E8F2FF → #F0F7FF |
| 登录页背景 | 斜向渐变 `135deg` | #3B9EFF → #7BBFFF，全屏 |
| 仪表盘数据卡片 | 各卡片独立渐变 | 每个卡片不同渐变色，白色文字 |
| 主操作按钮 | 水平渐变 | #3B9EFF → #7BBFFF |
| 页面顶部横幅 | 斜向渐变 | 仪表盘欢迎区域 |

### 1.5 布局结构

```
┌──────────┬──────────────────────────────────────────┐
│          │  顶部栏 (64px, 白色, elevation-1)          │
│  侧边栏   ├──────────────────────────────────────────┤
│  (260px)  │                                          │
│  渐变深色  │  内容区 (背景 #F5F5F9)                    │
│  白色文字  │  padding: 24px                           │
│          │                                          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

- 侧边栏宽度：260px（收起时 72px）
- 顶部栏高度：64px，白色背景，`elevation-1`
- 内容区最小高度：`calc(100vh - 64px)`

### 1.6 通用页面模式

#### 模式 A：列表页（CRUD 主页面）

```
┌─────────────────────────────────────────────┐
│ 页面标题                         v-breadcrumbs │
├─────────────────────────────────────────────┤
│ v-card (搜索区，elevation-0，outlined)        │
│ [v-text-field] [v-select] [v-btn 查询] [重置] │
├─────────────────────────────────────────────┤
│ v-card (表格区)                               │
│ 操作栏：[v-btn 新增(渐变)] [v-btn 导出]  共X条  │
│ ─────────────────────────────────────────── │
│ v-data-table                                 │
│ 列1 │ 列2 │ 列3 │ ... │ 操作                  │
│ ─── │ ─── │ ─── │ ─── │ [图标按钮]             │
│                                              │
│ v-pagination (居右)                           │
└─────────────────────────────────────────────┘
```

- 搜索区：`v-card` variant="outlined"，内部使用 `v-row` + `v-col` 网格
- 搜索输入框：`v-text-field` variant="outlined" density="compact"
- 下拉框：`v-select` variant="outlined" density="compact"
- 表格：`v-data-table`，斑马纹 hover 效果
- 操作列：使用 `v-btn` icon variant="text"，Tooltip 提示
- 新增按钮：渐变背景的 `v-btn`
- 分页：`v-pagination` 圆形样式

#### 模式 B：详情页

```
┌─────────────────────────────────────────────┐
│ [← 返回] 页面标题           状态 v-chip       │
├─────────────────────────────────────────────┤
│ v-card：基本信息                              │
│ v-row + v-col 网格布局展示字段                  │
│ 标签(灰色小字) / 值(黑色正文)                   │
├─────────────────────────────────────────────┤
│ v-tabs (underline 风格，主色)                  │
│ [Tab1] [Tab2]                                │
│ v-window                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ 子内容/子表格                             │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

#### 模式 C：表单（弹窗/抽屉）

- 简单表单：`v-dialog` 宽度 600px，圆角 12px
- 复杂表单：`v-navigation-drawer` temporary 右侧滑出，宽度 720px
- 表单组件：`v-text-field` / `v-select` / `v-textarea`，统一 variant="outlined"
- 按钮区：右对齐，[取消(text)] + [确定(渐变)]

### 1.7 侧边栏菜单结构

```
┌──────────────────┐
│   GoPay Logo     │  (白色文字 + 图标，渐变背景上)
│                  │
│ ● 仪表盘          │  mdi-view-dashboard
│                  │
│ ▸ 商户管理        │  mdi-store
│   ├ 商户列表      │
│   └ 商户应用      │
│                  │
│ ▸ 进件管理        │  mdi-file-document-check
│   ├ 进件申请      │
│   └ 进件记录      │
│                  │
│ ▸ 支付配置        │  mdi-cog
│   └ 通道管理      │
│                  │
│ ▸ 订单中心        │  mdi-receipt-text
│   ├ 支付订单      │
│   ├ 退款订单      │
│   └ 转账订单      │
│                  │
│ ▸ 交易记录        │  mdi-format-list-bulleted
│   ├ 交易流水      │
│   └ 回调记录      │
│                  │
│ ▸ 对账管理        │  mdi-scale-balance
│   ├ 对账单        │
│   └ 差异记录      │
│                  │
│ ▸ 系统管理        │  mdi-shield-lock
│   ├ 用户管理      │
│   ├ 角色管理      │
│   └ 操作日志      │
└──────────────────┘

菜单项样式：
- 默认：#64748B 文字，透明背景，圆角 8px
- Hover：#F1F5FE 背景，#3B9EFF 文字
- 选中：#E8F2FF → #F0F7FF 渐变背景 + 左侧 3px #3B9EFF 竖条 + #3B9EFF 文字
- Logo 图标：小块蓝色渐变 #3B9EFF → #7BBFFF，白色字母
```

---

## 2. 各模块 UI 设计

---

### 2.1 仪表盘 `/dashboard`

**页面类型**：独立仪表盘页面

```
┌─────────────────────────────────────────────────────┐
│  欢迎横幅 (渐变背景 135deg #6366F1 → #8B5CF6)         │
│  "欢迎使用 GoPay 支付网关管理平台"                      │
│  副标题 + 日期                      圆角 12px          │
├───────────────┬───────────────┬──────────────────────┤
│               │               │                      │
│  今日交易额     │  今日交易笔数   │  今日成功率           │
│  ¥ 12,345.00  │  89 笔        │  98.2%              │
│               │               │                      │
│  渐变卡片       │  渐变卡片       │  渐变卡片            │
│  #3B9EFF→     │  #10B981→     │  #F59E0B→           │
│  #7BBFFF      │  #34D399      │  #FBBF24            │
│  白色文字+图标   │  白色文字+图标   │  白色文字+图标       │
├───────────────┴───────────────┴──────────────────────┤
│                                                      │
│  快捷入口 (v-row)                                     │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │ mdi-file-clock    │  │ mdi-cash-refund  │          │
│  │ 待审核进件  3      │  │ 待处理退款  5     │          │
│  │ v-card hover 跳转  │  │ v-card hover 跳转 │          │
│  └──────────────────┘  └──────────────────┘          │
│                                                      │
├─────────────────────────┬────────────────────────────┤
│  v-card                 │  v-card                     │
│  通道交易分布             │  近7日交易趋势               │
│                         │                             │
│  ECharts 环形图          │  ECharts 面积折线图           │
│  (不用饼图，环形更现代)    │  (带渐变填充 + 平滑曲线)     │
│                         │                             │
│  支付宝 ██████ 65%      │    ╱╲                       │
│  微  信 ████   35%      │  ╱  ╲── 交易额              │
│                         │  (面积填充半透明渐变)          │
│  height: 320px          │  height: 320px              │
└─────────────────────────┴────────────────────────────┘
```

**组件细节**：
- 数据卡片：`v-card` + 渐变背景 + `v-icon`(48px) + 数值 + 标签，各卡片颜色不同
- 快捷入口：`v-card` variant="outlined"，hover 时 `elevation-4`，可点击
- 环形图：ECharts doughnut，中心显示总金额
- 面积折线图：ECharts areaStyle 使用主色渐变填充，smooth 曲线

---

### 2.2 商户管理

#### 2.2.1 商户列表 `/merchant/list`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 商户名称 | `v-text-field` | 模糊搜索，prepend-inner-icon="mdi-magnify" |
| 状态 | `v-select` | 全部/启用/停用 |

**表格列**（`v-data-table`）：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 商户ID | id | 80px | - |
| 商户名称 | name | 200px | 字体加粗 |
| 联系人 | contact | 120px | - |
| 联系方式 | phone | 140px | - |
| 状态 | status | 100px | `v-chip` size="small" 绿=启用 红=停用 |
| 应用数量 | appCount | 100px | `v-chip` variant="tonal" 可点击跳转 |
| 创建时间 | createdAt | 160px | YYYY-MM-DD HH:mm |
| 操作 | - | 140px | `v-btn` icon: mdi-eye / mdi-pencil / mdi-power |

**新增/编辑商户弹窗**（`v-dialog` 600px）：
| 字段 | 组件 | 必填 |
|------|------|------|
| 商户名称 | `v-text-field` | 是 |
| 联系人 | `v-text-field` | 是 |
| 联系方式 | `v-text-field` | 是 |
| 备注 | `v-textarea` rows="3" | 否 |

#### 2.2.2 商户应用 `/merchant/app`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 所属商户 | `v-select` | 下拉选择商户 |
| 应用名称 | `v-text-field` | 模糊搜索 |
| 状态 | `v-select` | 全部/启用/停用 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| AppID | appId | 200px | `v-chip` variant="tonal" 可复制 + mdi-content-copy 图标 |
| 应用名称 | name | 160px | - |
| 所属商户 | merchantName | 160px | - |
| 支付通道 | channels | 140px | `v-chip` 组合：蓝色=支付宝 绿色=微信 |
| 状态 | status | 100px | `v-chip` |
| 创建时间 | createdAt | 160px | - |
| 操作 | - | 140px | mdi-cog / mdi-key / mdi-power |

**新增应用抽屉**（`v-navigation-drawer` temporary 右侧 720px）：
| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 所属商户 | `v-select` | 是 | - |
| 应用名称 | `v-text-field` | 是 | - |
| 回调地址 | `v-text-field` | 否 | URL 格式校验 |
| 异步通知地址 | `v-text-field` | 否 | URL 格式校验 |
| 绑定支付通道 | `v-checkbox` 组 | 是 | 支付宝 / 微信 |

**查看密钥弹窗**（`v-dialog` 500px）：
- AppID 和 AppSecret 使用 `v-text-field` readonly
- AppSecret 默认 type="password"，点击 mdi-eye 切换显示
- `v-btn` mdi-content-copy 复制
- `v-btn` color="error" 重置密钥（二次确认 `v-dialog`）

---

### 2.3 进件管理

#### 2.3.1 进件申请 `/incoming/apply`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 商户名称 | `v-select` | 下拉选择 |
| 申请通道 | `v-select` | 支付宝/微信 |
| 状态 | `v-select` | 待提交/待审核/审核中/已通过/已驳回 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 进件编号 | id | 100px | - |
| 商户名称 | merchantName | 160px | - |
| 申请通道 | channel | 120px | `v-chip`：蓝色(#3B82F6)=支付宝 绿色(#10B981)=微信 |
| 状态 | status | 120px | `v-chip` 颜色见下方 |
| 提交时间 | submitTime | 160px | - |
| 更新时间 | updateTime | 160px | - |
| 操作 | - | 160px | mdi-eye / mdi-send / mdi-sync |

**状态 Chip 颜色**：
| 状态 | 颜色 | variant |
|------|------|---------|
| 待提交 | grey | tonal |
| 待审核 | info (#3B82F6) | tonal |
| 审核中 | warning (#F59E0B) | tonal |
| 已通过 | success (#10B981) | flat |
| 已驳回 | error (#EF4444) | flat |

**新建进件抽屉**（`v-navigation-drawer` 720px）：

使用 `v-stepper` 分步表单（Material Design 经典分步器）：

```
  ①  基本信息  ─────  ②  资质材料  ─────  ③  确认提交
  ●━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━○
```

**步骤 1 - 基本信息**：
| 字段 | 组件 | 必填 |
|------|------|------|
| 选择商户 | `v-select` | 是 |
| 申请通道 | `v-radio-group` + `v-radio` | 是 |
| 商户类别 | `v-select` | 是 |
| 行业类目 | 两级联动 `v-select` | 是 |

**步骤 2 - 资质材料**：
| 字段 | 组件 | 必填 |
|------|------|------|
| 营业执照 | `v-file-input` + 图片预览 | 是 |
| 法人姓名 | `v-text-field` | 是 |
| 法人身份证号 | `v-text-field` | 是 |
| 法人身份证正面 | `v-file-input` + 图片预览 | 是 |
| 法人身份证反面 | `v-file-input` + 图片预览 | 是 |
| 结算银行账户 | `v-text-field` | 是 |
| 开户行 | `v-text-field` | 是 |

**步骤 3 - 确认提交**：
- 使用 `v-row` + `v-col` 网格展示已填信息，标签灰色 + 值黑色
- 图片缩略图预览
- [v-btn 保存草稿 variant="outlined"] + [v-btn 提交进件 渐变背景]

**进件详情页** `/incoming/apply/:id`（模式 B）：
- 顶部：`v-btn` icon 返回 + 进件编号 + `v-chip` 状态 + [v-btn 同步状态]
- 基本信息：`v-card` 内 `v-row`/`v-col` 网格展示
- 资质材料：`v-card` 内图片 `v-img` 网格预览，可点击放大
- 审核信息：`v-alert` 展示通道返回意见
- 操作时间线：`v-timeline` 纵向，圆形节点 + 时间 + 描述

#### 2.3.2 进件记录 `/incoming/record`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 商户名称 | `v-select` | - |
| 操作类型 | `v-select` | 创建/提交/审核通过/审核驳回/同步 |
| 时间范围 | 两个 `v-text-field` type="date" | 起止日期 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 记录ID | id | 80px | - |
| 进件编号 | applyId | 100px | 可点击跳转，`color="primary"` 链接样式 |
| 商户名称 | merchantName | 160px | - |
| 操作类型 | type | 120px | `v-chip` variant="tonal" |
| 操作结果 | result | 100px | `v-chip` 成功=success 失败=error |
| 通道反馈 | feedback | 200px | 超长 truncate，hover `v-tooltip` 显示全部 |
| 操作时间 | createdAt | 160px | - |

---

### 2.4 支付配置

#### 2.4.1 通道管理 `/payment/channel`

**页面类型**：卡片布局

```
┌─────────────────────────────────────────────────────┐
│  通道管理                                            │
├──────────────────────────┬──────────────────────────┤
│  v-card (elevation-2)    │  v-card (elevation-2)    │
│  ┌──────────────────┐    │  ┌──────────────────┐    │
│  │  🔵 支付宝        │    │  │  🟢 微信支付       │    │
│  │  Alipay           │    │  │  WeChat Pay       │    │
│  │                   │    │  │                   │    │
│  │  状态: v-chip ●已启用│   │  │  状态: v-chip ○未配置│   │
│  │  AppID: 2021***88 │    │  │  商户号: --        │    │
│  │                   │    │  │                   │    │
│  │  v-card-actions   │    │  │  v-card-actions   │    │
│  │  [配置] [测试] [停用]│   │  │  [配置]            │    │
│  └──────────────────┘    │  └──────────────────┘    │
│  v-col cols="6"          │  v-col cols="6"          │
└──────────────────────────┴──────────────────────────┘
```

**通道卡片**（`v-card`）：
- 顶部：通道 Logo 图标 + 名称（`v-card-title`）
- 中部：状态 `v-chip` + 关键配置脱敏摘要
- 底部：`v-card-actions` 按钮组
- Hover 效果：`elevation` 从 2 提升到 8

**支付宝配置抽屉**（`v-navigation-drawer` temporary 720px）：
| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| AppID | `v-text-field` | 是 | - |
| 应用私钥 | `v-textarea` rows="4" | 是 | - |
| 应用公钥证书 | `v-file-input` accept=".crt,.pem" | 是 | 上传证书文件 |
| 支付宝公钥证书 | `v-file-input` | 是 | - |
| 支付宝根证书 | `v-file-input` | 是 | - |

**微信支付配置抽屉**（`v-navigation-drawer` temporary 720px）：
| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| AppID | `v-text-field` | 是 | - |
| 商户号 (MchID) | `v-text-field` | 是 | - |
| API V3 密钥 | `v-text-field` type="password" | 是 | append-inner-icon 切换可见 |
| 商户证书序列号 | `v-text-field` | 是 | - |
| 商户私钥 | `v-textarea` rows="4" | 是 | - |

**连通性测试**：`v-dialog` 400px
- 测试中：`v-progress-circular` 加载动画
- 成功：`v-alert` type="success"
- 失败：`v-alert` type="error" + 错误详情

---

### 2.5 订单中心

#### 2.5.1 支付订单 `/order/payment`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 订单号 | `v-text-field` prepend-inner-icon="mdi-magnify" | 精确搜索 |
| 商户名称 | `v-select` | 下拉选择 |
| 支付通道 | `v-select` | 支付宝/微信 |
| 订单状态 | `v-select` | 待支付/已支付/已关闭 |
| 创建时间 | 两个 `v-text-field` type="date" | 起止日期 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 订单号 | orderNo | 200px | monospace 字体，mdi-content-copy 复制 |
| 商户名称 | merchantName | 140px | - |
| 应用名称 | appName | 120px | - |
| 金额(元) | amount | 100px | 右对齐，加粗，保留2位小数 |
| 支付通道 | channel | 120px | `v-chip` variant="tonal" |
| 状态 | status | 100px | `v-chip` warning=待支付 success=已支付 default=已关闭 |
| 通道交易号 | transactionId | 200px | monospace |
| 创建时间 | createdAt | 160px | - |
| 操作 | - | 120px | mdi-eye / mdi-close-circle / mdi-sync |

**订单详情页** `/order/payment/:id`（模式 B）：

```
┌─────────────────────────────────────────────────────┐
│  [← mdi-arrow-left] 支付订单详情                      │
│  订单号: 20260407xxxx         v-chip(已支付/success)   │
│                                 [同步状态] [关单]      │
├─────────────────────────────────────────────────────┤
│  v-card：订单信息                                     │
│  ┌─────────┬─────────┬─────────┐                    │
│  │ 商户名称  │ 应用名称  │ 支付通道  │  v-row 3列网格    │
│  │ xx      │ xx      │ 支付宝   │                    │
│  ├─────────┼─────────┼─────────┤                    │
│  │ 订单金额  │ 通道交易号│ 创建时间  │                    │
│  │ ¥1.00   │ xx      │ xx      │                    │
│  ├─────────┼─────────┼─────────┤                    │
│  │ 支付时间  │ 备注     │         │                    │
│  │ xx      │ xx      │         │                    │
│  └─────────┴─────────┴─────────┘                    │
├─────────────────────────────────────────────────────┤
│  v-card：通道返回信息                                  │
│  v-expansion-panels (可折叠)                          │
│  原始 JSON（v-code 等宽字体展示）                       │
├─────────────────────────────────────────────────────┤
│  v-card：操作时间线                                    │
│  v-timeline (density="compact")                      │
│  ● 创建订单   2026-04-07 10:00:00    (dot=primary)   │
│  ● 发起支付   2026-04-07 10:00:05    (dot=info)      │
│  ● 支付成功   2026-04-07 10:00:30    (dot=success)   │
└─────────────────────────────────────────────────────┘
```

#### 2.5.2 退款订单 `/order/refund`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 退款单号 | `v-text-field` | 精确搜索 |
| 关联支付单号 | `v-text-field` | 精确搜索 |
| 状态 | `v-select` | 处理中/已退款/退款失败 |
| 时间范围 | 两个 `v-text-field` type="date" | 起止日期 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 退款单号 | refundNo | 200px | monospace |
| 关联支付单号 | orderNo | 200px | 可点击跳转，`color="primary"` |
| 退款金额(元) | amount | 100px | 右对齐，红色 |
| 支付通道 | channel | 120px | `v-chip` |
| 状态 | status | 100px | `v-chip` info=处理中 success=已退款 error=失败 |
| 退款原因 | reason | 160px | - |
| 创建时间 | createdAt | 160px | - |
| 操作 | - | 80px | mdi-eye / mdi-sync |

**发起退款弹窗**（`v-dialog` 600px）：
- 入口：从支付订单详情页发起
| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 支付订单号 | `v-text-field` readonly | - | 自动填充 |
| 订单金额 | 文本展示 | - | 只读 |
| 退款金额 | `v-text-field` type="number" | 是 | 校验不超过订单金额 |
| 退款原因 | `v-textarea` rows="3" | 是 | - |

#### 2.5.3 转账订单 `/order/transfer`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 转账单号 | `v-text-field` | 精确搜索 |
| 支付通道 | `v-select` | 支付宝/微信 |
| 状态 | `v-select` | 处理中/已到账/转账失败 |
| 时间范围 | 两个 `v-text-field` type="date" | 起止日期 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 转账单号 | transferNo | 200px | monospace |
| 收款方 | payee | 160px | - |
| 金额(元) | amount | 100px | 右对齐 |
| 支付通道 | channel | 120px | `v-chip` |
| 状态 | status | 100px | `v-chip` |
| 创建时间 | createdAt | 160px | - |
| 操作 | - | 80px | mdi-eye / mdi-sync |

**发起转账弹窗**（`v-dialog` 600px）：
| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 支付通道 | `v-radio-group` | 是 | 支付宝/微信 |
| 收款方账号 | `v-text-field` | 是 | - |
| 收款方姓名 | `v-text-field` | 是 | - |
| 转账金额 | `v-text-field` type="number" | 是 | - |
| 转账说明 | `v-textarea` rows="2" | 否 | - |

---

### 2.6 交易记录

#### 2.6.1 交易流水 `/transaction/flow`

**页面类型**：模式 A（列表页，只读）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 流水号 | `v-text-field` | 精确搜索 |
| 关联订单号 | `v-text-field` | 精确搜索 |
| 交易类型 | `v-select` | 支付/退款/转账/关单 |
| 支付通道 | `v-select` | 支付宝/微信 |
| 时间范围 | 两个 `v-text-field` type="date" | 起止日期 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 流水号 | flowNo | 200px | monospace |
| 关联订单号 | orderNo | 200px | 可点击跳转 |
| 交易类型 | type | 100px | `v-chip` variant="tonal"：primary=支付 warning=退款 secondary=转账 default=关单 |
| 金额(元) | amount | 100px | 退款/转账显示为负数红色 |
| 支付通道 | channel | 120px | - |
| 状态 | status | 80px | `v-chip` success=成功 error=失败 |
| 交易时间 | createdAt | 160px | - |
| 操作 | - | 60px | mdi-eye |

**流水详情弹窗**（`v-dialog` 700px）：
- 基本信息：`v-row`/`v-col` 网格
- 请求/响应 JSON：`v-sheet` color="grey-lighten-4" rounded + `<pre>` 等宽字体

#### 2.6.2 回调记录 `/transaction/callback`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 关联订单号 | `v-text-field` | 精确搜索 |
| 支付通道 | `v-select` | 支付宝/微信 |
| 处理结果 | `v-select` | 成功/失败 |
| 时间范围 | 两个 `v-text-field` type="date" | 起止日期 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 记录ID | id | 80px | - |
| 关联订单号 | orderNo | 200px | 可点击跳转 |
| 支付通道 | channel | 120px | `v-chip` |
| 回调类型 | type | 120px | 支付通知/退款通知 |
| 处理结果 | result | 100px | `v-chip` success=成功 error=失败 |
| 回调时间 | createdAt | 160px | - |
| 操作 | - | 100px | mdi-eye / mdi-refresh |

**回调详情弹窗**（`v-dialog` 700px）：
- 两栏对比布局：
  - 左侧 `v-sheet`：通道推送内容 JSON
  - 右侧 `v-sheet`：本地处理响应 JSON
- 底部：`v-alert` 展示处理结果和错误信息

---

### 2.7 对账管理

#### 2.7.1 对账单 `/reconciliation/bill`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 对账日期 | `v-text-field` type="date" | 选择日期 |
| 支付通道 | `v-select` | 支付宝/微信 |
| 对账状态 | `v-select` | 待对账/已对账/有差异 |

**操作栏**：[v-btn 触发对账 渐变] 按钮

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 对账日期 | date | 120px | YYYY-MM-DD |
| 支付通道 | channel | 120px | `v-chip` |
| 订单总数 | totalCount | 100px | - |
| 匹配笔数 | matchCount | 100px | - |
| 差异笔数 | diffCount | 100px | 非0时红色加粗 |
| 对账金额 | totalAmount | 120px | - |
| 状态 | status | 120px | `v-chip` default=待对账 success=已对账 error=有差异 |
| 对账时间 | reconTime | 160px | - |
| 操作 | - | 60px | mdi-eye |

**触发对账弹窗**（`v-dialog` 400px）：
| 字段 | 组件 | 必填 |
|------|------|------|
| 对账日期 | `v-text-field` type="date" | 是 |
| 支付通道 | `v-select` | 是 |

#### 2.7.2 差异记录 `/reconciliation/diff`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 订单号 | `v-text-field` | 精确搜索 |
| 差异类型 | `v-select` | 金额不符/状态不符/单边账 |
| 处理状态 | `v-select` | 待处理/已处理 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 订单号 | orderNo | 200px | - |
| 差异类型 | diffType | 120px | `v-chip` warning=金额不符 error=状态不符 secondary=单边账 |
| 本地金额 | localAmount | 100px | - |
| 通道金额 | channelAmount | 100px | - |
| 本地状态 | localStatus | 100px | - |
| 通道状态 | channelStatus | 100px | - |
| 处理状态 | handleStatus | 100px | `v-chip` default=待处理 success=已处理 |
| 操作 | - | 100px | mdi-check-circle / mdi-eye |

**处理差异弹窗**（`v-dialog` 500px）：
| 字段 | 组件 | 必填 |
|------|------|------|
| 处理方式 | `v-radio-group` | 是 |
| 处理备注 | `v-textarea` rows="3" | 是 |

---

### 2.8 系统管理

#### 2.8.1 用户管理 `/system/user`

**页面类型**：模式 A（列表页）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 用户名 | `v-text-field` | 模糊搜索 |
| 角色 | `v-select` | 管理员/运营 |
| 状态 | `v-select` | 启用/停用 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 用户ID | id | 80px | - |
| 用户名 | username | 120px | - |
| 姓名 | realName | 120px | - |
| 角色 | role | 120px | `v-chip` variant="tonal" primary=管理员 success=运营 |
| 状态 | status | 100px | `v-chip` |
| 最后登录 | lastLoginAt | 160px | - |
| 创建时间 | createdAt | 160px | - |
| 操作 | - | 140px | mdi-pencil / mdi-lock-reset / mdi-power |

**新增/编辑用户弹窗**（`v-dialog` 600px）：
| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 用户名 | `v-text-field` | 是 | 编辑时 readonly |
| 姓名 | `v-text-field` | 是 | - |
| 密码 | `v-text-field` type="password" | 新增必填 | 编辑时不显示 |
| 角色 | `v-select` | 是 | 管理员/运营 |

**重置密码弹窗**（`v-dialog` 400px）：
| 字段 | 组件 | 必填 |
|------|------|------|
| 新密码 | `v-text-field` type="password" | 是 |
| 确认密码 | `v-text-field` type="password" | 是 |

#### 2.8.2 角色管理 `/system/role`

**页面类型**：模式 A（列表页，仅展示预设角色，不可增删）

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 角色ID | id | 80px | - |
| 角色名称 | name | 120px | - |
| 角色标识 | code | 120px | `v-chip` variant="outlined" admin / operator |
| 权限说明 | description | 300px | - |
| 用户数量 | userCount | 100px | - |

**权限说明**：
- **管理员 (admin)**：所有菜单的查看和操作权限
- **运营 (operator)**：所有菜单的查看权限，隐藏新增/编辑/删除/操作按钮

#### 2.8.3 操作日志 `/system/log`

**页面类型**：模式 A（列表页，只读）

**搜索区字段**：
| 字段 | 组件 | 说明 |
|------|------|------|
| 操作人 | `v-select` | 下拉选择用户 |
| 操作类型 | `v-select` | 新增/编辑/删除/登录/配置变更 |
| 时间范围 | 两个 `v-text-field` type="date" | 起止日期 |

**表格列**：
| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 日志ID | id | 80px | - |
| 操作人 | operator | 100px | - |
| 操作类型 | type | 120px | `v-chip` variant="tonal" |
| 操作对象 | target | 160px | - |
| 操作描述 | description | 200px | - |
| 操作结果 | result | 100px | `v-chip` success=成功 error=失败 |
| 操作时间 | createdAt | 160px | - |
| 操作 | - | 60px | mdi-eye |

**日志详情弹窗**（`v-dialog` 700px）：
- 操作基本信息：`v-row`/`v-col` 网格展示
- 数据变更对比（仅编辑类操作）：两栏布局
  - 左侧 `v-sheet` color="red-lighten-5"：变更前 JSON
  - 右侧 `v-sheet` color="green-lighten-5"：变更后 JSON

---

## 3. 登录页改造

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│           全屏渐变背景 135deg                          │
│           #3B9EFF → #7BBFFF                          │
│                                                      │
│           ┌───────────────────────┐                  │
│           │  v-card (elevation-12) │                  │
│           │  圆角 16px             │                  │
│           │  width: 420px         │                  │
│           │                       │                  │
│           │  GoPay Logo (大号)     │                  │
│           │  "支付网关管理平台"      │                  │
│           │                       │                  │
│           │  v-text-field 账号     │                  │
│           │  prepend-inner-icon   │                  │
│           │  mdi-account          │                  │
│           │                       │                  │
│           │  v-text-field 密码     │                  │
│           │  prepend-inner-icon   │                  │
│           │  mdi-lock             │                  │
│           │  append-inner-icon    │                  │
│           │  mdi-eye 切换可见      │                  │
│           │                       │                  │
│           │  v-checkbox 记住我     │                  │
│           │                       │                  │
│           │  v-btn 登录 (渐变背景)  │                  │
│           │  block size="large"   │                  │
│           │  rounded="lg"         │                  │
│           │                       │                  │
│           └───────────────────────┘                  │
│                                                      │
│           底部版权信息 (白色半透明文字)                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 4. 路由结构

```typescript
// src/router/index.ts
{
  path: '/',
  component: Layout,
  children: [
    { path: 'dashboard',             name: 'Dashboard',           component: () => import('@/views/dashboard/index.vue') },

    // 商户管理
    { path: 'merchant/list',         name: 'MerchantList',        component: () => import('@/views/merchant/list.vue') },
    { path: 'merchant/app',          name: 'MerchantApp',         component: () => import('@/views/merchant/app.vue') },

    // 进件管理
    { path: 'incoming/apply',        name: 'IncomingApply',       component: () => import('@/views/incoming/apply.vue') },
    { path: 'incoming/apply/:id',    name: 'IncomingApplyDetail', component: () => import('@/views/incoming/detail.vue') },
    { path: 'incoming/record',       name: 'IncomingRecord',      component: () => import('@/views/incoming/record.vue') },

    // 支付配置
    { path: 'payment/channel',       name: 'PaymentChannel',      component: () => import('@/views/payment/channel.vue') },

    // 订单中心
    { path: 'order/payment',         name: 'OrderPayment',        component: () => import('@/views/order/payment.vue') },
    { path: 'order/payment/:id',     name: 'OrderPaymentDetail',  component: () => import('@/views/order/detail.vue') },
    { path: 'order/refund',          name: 'OrderRefund',         component: () => import('@/views/order/refund.vue') },
    { path: 'order/transfer',        name: 'OrderTransfer',       component: () => import('@/views/order/transfer.vue') },

    // 交易记录
    { path: 'transaction/flow',      name: 'TransactionFlow',     component: () => import('@/views/transaction/flow.vue') },
    { path: 'transaction/callback',  name: 'TransactionCallback', component: () => import('@/views/transaction/callback.vue') },

    // 对账管理
    { path: 'reconciliation/bill',   name: 'ReconBill',           component: () => import('@/views/reconciliation/bill.vue') },
    { path: 'reconciliation/diff',   name: 'ReconDiff',           component: () => import('@/views/reconciliation/diff.vue') },

    // 系统管理
    { path: 'system/user',           name: 'SystemUser',          component: () => import('@/views/system/user.vue') },
    { path: 'system/role',           name: 'SystemRole',          component: () => import('@/views/system/role.vue') },
    { path: 'system/log',            name: 'SystemLog',           component: () => import('@/views/system/log.vue') },
  ]
}
```

---

## 5. 页面文件清单

```
src/views/
├── dashboard/
│   └── index.vue              # 仪表盘（改造）
├── merchant/
│   ├── list.vue               # 商户列表
│   └── app.vue                # 商户应用
├── incoming/
│   ├── apply.vue              # 进件申请列表
│   ├── detail.vue             # 进件详情
│   └── record.vue             # 进件记录
├── payment/
│   └── channel.vue            # 通道管理
├── order/
│   ├── payment.vue            # 支付订单列表
│   ├── detail.vue             # 支付订单详情
│   ├── refund.vue             # 退款订单
│   └── transfer.vue           # 转账订单
├── transaction/
│   ├── flow.vue               # 交易流水
│   └── callback.vue           # 回调记录
├── reconciliation/
│   ├── bill.vue               # 对账单
│   └── diff.vue               # 差异记录
├── system/
│   ├── user.vue               # 用户管理
│   ├── role.vue               # 角色管理
│   └── log.vue                # 操作日志
└── login/
    └── index.vue              # 登录页（改造）
```

共 **17 个页面文件**（含 2 个现有页面改造 + 15 个新建）。

---

## 6. 技术栈变更

### 移除
- `ant-design-vue`
- `@ant-design/icons-vue`

### 新增
- `vuetify` (^3.x) — Material Design 组件库
- `@mdi/font` — Material Design 图标
- `@vuetify/labs` — 实验性组件（如需要）

### 保留
- `vue` 3.5.x
- `vue-router` 5.x
- `pinia` 3.x
- `echarts` 6.x
- `axios`
- `dayjs`
