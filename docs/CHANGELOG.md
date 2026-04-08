# 开发日志

## 2026-04-08

### 前端开发完成，进入等待后端联调阶段

**里程碑**: 前端全部 18 个页面 UI 及交互逻辑开发完成（均使用 Mock 数据）。

**已完成模块**：
- 登录页（默认 admin/admin）
- 仪表盘（数据卡片 + ECharts 图表）
- 商户管理（商户列表 CRUD、商户应用管理）
- 进件管理（进件申请表单、进件记录审核）
- 支付配置（通道管理 CRUD、支付宝/微信参数配置）
- 订单中心（支付订单、退款订单、转账订单）
- 交易记录（交易流水统计、回调记录与重试）
- 对账管理（对账单生成与下载、差异记录处理）
- 系统管理（用户管理、角色管理、操作日志）
- 个人中心（基本信息、修改密码）

**当前状态**: 等待后端 gopay-platform 各模块 API 开发完成后进行接口联调。

**联调优先级建议**:
1. 登录/SSO (`POST /gopay/v1/sso/login`)
2. 商户管理
3. 支付配置
4. 订单中心
5. 其他模块

---

### 表格列宽优化 (Commit: 9963579)

**问题描述**：
所有页面的表格中，状态/类型列（使用 chip 样式）的文案因为列宽不足而换行显示，影响美观。

**解决方案**：

1. **列宽调整规则**（考虑 chip padding 24px + 余量）：
   - 2字状态（启用/停用/正常/禁用）→ **80px**
   - 3字状态（已通过/已驳回/待对账/已对账/有差异）→ **95px**
   - 4字通道/状态（支付宝/微信支付/待支付/支付成功/支付失败/已关闭/退款中/退款成功/退款失败/处理中/转账成功/转账失败）→ **115-120px**
   - 4字通知类型（支付通知/退款通知/转账通知）→ **120px**
   - 6字方向（上游→平台/平台→商户）→ **140px**
   - 8字平台类型（支付宝网页/移动）→ **150px**

2. **CSS 样式修改**：
   给所有页面的 `.data-table td` 添加 `white-space: nowrap;` 样式，防止单元格内容换行。

**修改的文件（14个）**：

| 文件路径 | 调整的列 | 新宽度 |
|---------|---------|--------|
| `src/views/merchant/app.vue` | 平台类型 | 150px |
| `src/views/merchant/list.vue` | 状态 | 80px |
| `src/views/incoming/record.vue` | 通道类型 | 120px |
| `src/views/incoming/record.vue` | 进件状态 | 95px |
| `src/views/payment/channel.vue` | 通道类型 | 120px |
| `src/views/payment/channel.vue` | 状态 | 80px |
| `src/views/order/payment.vue` | 通道类型 | 120px |
| `src/views/order/payment.vue` | 状态 | 115px |
| `src/views/order/refund.vue` | 通道类型 | 120px |
| `src/views/order/refund.vue` | 状态 | 115px |
| `src/views/order/transfer.vue` | 通道类型 | 120px |
| `src/views/order/transfer.vue` | 状态 | 115px |
| `src/views/transaction/flow.vue` | 通道类型 | 120px |
| `src/views/transaction/flow.vue` | 状态 | 95px |
| `src/views/transaction/callback.vue` | 通知类型 | 120px |
| `src/views/transaction/callback.vue` | 通道类型 | 120px |
| `src/views/transaction/callback.vue` | 通知方向 | 140px |
| `src/views/transaction/callback.vue` | 状态 | 80px |
| `src/views/reconciliation/bill.vue` | 通道类型 | 120px |
| `src/views/reconciliation/bill.vue` | 状态 | 95px |
| `src/views/reconciliation/diff.vue` | 通道类型 | 120px |
| `src/views/reconciliation/diff.vue` | 差异类型 | 140px |
| `src/views/reconciliation/diff.vue` | 处理状态 | 95px |
| `src/views/system/user.vue` | 状态 | 80px |
| `src/views/system/role.vue` | 状态 | 80px |
| `src/views/system/log.vue` | 结果 | 80px |

**关键代码示例**：

```vue
<!-- 表格列宽调整 -->
<th style="width: 120px">通道类型</th>
<th style="width: 80px">状态</th>

<!-- CSS 样式修改 -->
<style scoped>
.data-table td { 
  font-size: 13px; 
  padding: 14px 16px; 
  border-bottom: 1px solid #F8FAFC; 
  color: #334155; 
  vertical-align: middle; 
  white-space: nowrap;  /* 新增：防止换行 */
}
</style>
```

**效果**：
- 所有 chip 文案都能在一行显示
- 表格内容超长时可以左右滑动
- 视觉效果更加整洁美观

---

## 历史记录

### 2026-04-07 - 初始化项目
- 完成登录页面、主布局和仪表盘功能
- 完成所有18个页面的UI实现和Mock数据
- 技术栈：Vue 3.5 + TypeScript + Vite 8 + Vuetify 4
- 设计风格：Material Design 3 + Soft Blue 主色调
