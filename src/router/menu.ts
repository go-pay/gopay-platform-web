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
