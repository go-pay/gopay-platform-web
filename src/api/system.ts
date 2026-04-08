import { post, download } from './request'

interface PageResult<T> { list: T[]; total: number }

// === 用户管理 ===
export interface UserItem {
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
export interface RoleItem {
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
export interface LogItem {
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
