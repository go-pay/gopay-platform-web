# API 对接设计方案

> 将前端 18 个页面的 Mock 数据替换为真实后端 API 调用，共 67 个接口。

## 文件结构

```
src/api/
├── request.ts          # 基础请求封装
├── auth.ts             # 登录/用户/密码/资料 (4)
├── dashboard.ts        # 仪表盘 (4)
├── merchant.ts         # 商户管理 (5)
├── merchantApp.ts      # 商户应用 (3)
├── incoming.ts         # 进件管理 + 图片上传 (7)
├── channel.ts          # 支付通道 (6)
├── order.ts            # 支付/退款/转账订单 (9)
├── transaction.ts      # 交易流水/回调 (6)
├── reconciliation.ts   # 对账单/差异 (8)
└── system.ts           # 用户/角色/日志 (15)
```

## request.ts 设计

```typescript
// 核心：post<T>(url, data?) → Promise<T>
// - 自动注入 Authorization: Bearer <token>
// - code === 0 → 返回 data 字段
// - code !== 0 → throw Error(msg)
// - 401 → 清 token → 跳登录
// - download(url, data?, filename?) → 文件下载
```

## 页面改造模式

1. 删除硬编码 Mock 数组
2. onMounted 中调用 API 加载数据
3. 增删改操作改为 API 调用 → 成功后刷新列表
4. 金额：API 返回分，展示时 /100 转元
5. 添加分页状态（page, pageSize, total）

## 通用约定

- 统一响应：`{ code: 0, msg: "success", data: {...} }`
- 分页请求：`{ page, pageSize, ...filters }`
- 分页响应：`{ list: [], total, page, pageSize }`
- 金额单位：接口传输用分(int64)，前端展示用元
- 时间格式：`YYYY-MM-DD HH:mm:ss`
- 认证：`Authorization: Bearer <jwt_token>`
- status 筛选传 -1 表示全部

## 对接顺序

1. P0: request.ts 基础层 → 登录 → 用户信息
2. P1: 商户列表 + 商户应用
3. P2: 通道管理
4. P3: 仪表盘 + 订单中心（支付/退款/转账）
5. P4: 进件管理 + 交易记录 + 对账管理 + 系统管理 + 个人中心
