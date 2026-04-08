import { post } from './request'

interface LoginResult {
  token: string
  userInfo: UserInfo
}

export interface UserInfo {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  role: string
  lastLogin: string
}

export function loginApi(username: string, password: string) {
  return post<LoginResult>('/gopay/v1/sso/login', { username, password })
}

export function getUserInfoApi() {
  return post<UserInfo>('/gopay/v1/user/getInfo')
}

export function changePwdApi(data: { oldPassword: string; newPassword: string; confirmPassword: string }) {
  return post('/gopay/v1/user/changePwd', data)
}

export function updateProfileApi(data: { realName: string; phone: string; email: string }) {
  return post('/gopay/v1/user/profile', data)
}
