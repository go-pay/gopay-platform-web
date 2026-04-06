export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
}

export const menuData: MenuItem[] = [
  {
    key: 'system',
    label: '系统管理',
    icon: 'SettingOutlined',
    children: [
      { key: 'system-config', label: '系统配置', path: '/system/config' },
      { key: 'delay-queue', label: '延时队列', path: '/system/delay-queue' },
      { key: 'region', label: '行政区划', path: '/system/region' },
      { key: 'cache', label: '缓存管理', path: '/system/cache' },
      { key: 'agreement', label: '用户协议', path: '/system/agreement' },
      { key: 'audit-log', label: '审计日志', path: '/system/audit-log' },
      { key: 'login-log', label: '登录日志', path: '/system/login-log' },
      { key: 'operation-log', label: '操作日志', path: '/system/operation-log' },
      { key: 'file-storage', label: '文件存储', path: '/system/file-storage' },
      { key: 'file-manage', label: '文件管理', path: '/system/file-manage' }
    ]
  },
  {
    key: 'payment-config',
    label: '支付配置',
    icon: 'SafetyOutlined',
    children: [
      { key: 'platform-config', label: '平台配置', path: '/payment/platform-config' },
      { key: 'service-provider', label: '服务商管理', path: '/payment/service-provider' }
    ]
  },
  {
    key: 'agent',
    label: '代理商管理',
    icon: 'TeamOutlined',
    children: [
      { key: 'agent-info', label: '代理商信息', path: '/agent/info' },
      { key: 'agent-user', label: '代理商用户', path: '/agent/user' }
    ]
  },
  {
    key: 'merchant',
    label: '商户管理',
    icon: 'ShopOutlined',
    children: [
      { key: 'merchant-info', label: '商户信息', path: '/merchant/info' },
      { key: 'merchant-user', label: '商户用户', path: '/merchant/user' },
      { key: 'merchant-app', label: '商户应用', path: '/merchant/app' }
    ]
  },
  {
    key: 'entry',
    label: '进件管理',
    icon: 'DoubleRightOutlined',
    children: [
      { key: 'entry-apply', label: '进件申请', path: '/entry/apply' },
      { key: 'entry-merchant', label: '进件商户', path: '/entry/merchant' }
    ]
  },
  {
    key: 'allocation',
    label: '分账管理',
    icon: 'SlidersOutlined',
    children: [
      { key: 'allocation-receiver', label: '分账接收方', path: '/allocation/receiver' },
      { key: 'allocation-group', label: '分账组接收方绑定', path: '/allocation/group' }
    ]
  },
  {
    key: 'profit',
    label: '分润管理',
    icon: 'EuroOutlined',
    children: [
      { key: 'profit-record', label: '分润记录统计', path: '/profit/record' },
      { key: 'profit-settlement', label: '分润结算任务', path: '/profit/settlement' },
      { key: 'profit-withdraw', label: '提现申请管理', path: '/profit/withdraw' }
    ]
  },
  {
    key: 'order',
    label: '订单管理',
    icon: 'FileTextOutlined',
    children: [
      { key: 'order-payment', label: '支付订单', path: '/order/payment' },
      { key: 'order-refund', label: '退款订单', path: '/order/refund' },
      { key: 'order-transfer', label: '转账订单', path: '/order/transfer' },
      { key: 'order-allocation', label: '分账单', path: '/order/allocation' },
      { key: 'order-preauth', label: '预授权支付', path: '/order/preauth' }
    ]
  },
  {
    key: 'transaction',
    label: '交易记录',
    icon: 'UnorderedListOutlined',
    children: [
      { key: 'transaction-record', label: '交易记录', path: '/transaction/record' },
      { key: 'transaction-callback', label: '回调记录', path: '/transaction/callback' },
      { key: 'transaction-flow', label: '交易流水', path: '/transaction/flow' },
      { key: 'transaction-close', label: '关闭记录(支付)', path: '/transaction/close' },
      { key: 'transaction-sync', label: '同步记录', path: '/transaction/sync' }
    ]
  },
  {
    key: 'notification',
    label: '商户通知',
    icon: 'BellOutlined',
    children: [
      { key: 'notification-callback', label: '回调消息', path: '/notification/callback' }
    ]
  },
  {
    key: 'device',
    label: '设备管理',
    icon: 'MobileOutlined',
    children: [
      { key: 'device-qrcode-template', label: '码牌模板', path: '/device/qrcode-template' },
      { key: 'device-qrcode', label: '码牌管理', path: '/device/qrcode' },
      { key: 'device-terminal-report', label: '辅助终端报备', path: '/device/terminal-report' },
      { key: 'device-system-terminal', label: '系统终端列表', path: '/device/system-terminal' },
      { key: 'device-channel-terminal', label: '通道终端列表', path: '/device/channel-terminal' }
    ]
  },
  {
    key: 'reconciliation',
    label: '对账管理',
    icon: 'ReconciliationOutlined',
    children: [
      { key: 'reconciliation-bill', label: '对账单', path: '/reconciliation/bill' },
      { key: 'reconciliation-diff', label: '差异记录', path: '/reconciliation/diff' }
    ]
  },
  {
    key: 'debug',
    label: '开发调试',
    icon: 'BugOutlined',
    children: [
      { key: 'debug-transaction', label: '交易调试', path: '/debug/transaction' },
      { key: 'debug-auth', label: '认证调试', path: '/debug/auth' },
      { key: 'debug-sign', label: '签名调试', path: '/debug/sign' },
      { key: 'debug-test', label: '测试', path: '/debug/test' }
    ]
  }
]
