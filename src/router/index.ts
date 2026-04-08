import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/components/Layout.vue'

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
      { path: 'merchant/list', name: 'MerchantList', component: () => import('@/views/merchant/list.vue'), meta: { title: '商户列表' } },
      { path: 'merchant/app', name: 'MerchantApp', component: () => import('@/views/merchant/app.vue'), meta: { title: '商户应用' } },
      // 进件管理
      { path: 'incoming/apply', name: 'IncomingApply', component: () => import('@/views/incoming/apply.vue'), meta: { title: '进件申请' } },
      { path: 'incoming/record', name: 'IncomingRecord', component: () => import('@/views/incoming/record.vue'), meta: { title: '进件记录' } },
      // 支付配置
      { path: 'payment/channel', name: 'PaymentChannel', component: () => import('@/views/payment/channel.vue'), meta: { title: '通道管理' } },
      // 订单中心
      { path: 'order/payment', name: 'OrderPayment', component: () => import('@/views/order/payment.vue'), meta: { title: '支付订单' } },
      { path: 'order/refund', name: 'OrderRefund', component: () => import('@/views/order/refund.vue'), meta: { title: '退款订单' } },
      { path: 'order/transfer', name: 'OrderTransfer', component: () => import('@/views/order/transfer.vue'), meta: { title: '转账订单' } },
      // 交易记录
      { path: 'transaction/flow', name: 'TransactionFlow', component: () => import('@/views/transaction/flow.vue'), meta: { title: '交易流水' } },
      { path: 'transaction/callback', name: 'TransactionCallback', component: () => import('@/views/transaction/callback.vue'), meta: { title: '回调记录' } },
      // 对账管理
      { path: 'reconciliation/bill', name: 'ReconBill', component: () => import('@/views/reconciliation/bill.vue'), meta: { title: '对账单' } },
      { path: 'reconciliation/diff', name: 'ReconDiff', component: () => import('@/views/reconciliation/diff.vue'), meta: { title: '差异记录' } },
      // 系统管理
      { path: 'system/user', name: 'SystemUser', component: () => import('@/views/system/user.vue'), meta: { title: '用户管理' } },
      { path: 'system/role', name: 'SystemRole', component: () => import('@/views/system/role.vue'), meta: { title: '角色管理' } },
      { path: 'system/log', name: 'SystemLog', component: () => import('@/views/system/log.vue'), meta: { title: '操作日志' } },
      // 个人中心
      { path: 'profile', name: 'Profile', component: () => import('@/views/profile/index.vue'), meta: { title: '个人中心' } },
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
