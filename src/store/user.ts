import { defineStore } from 'pinia'

interface UserState {
  token: string
  userInfo: any
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    setUserInfo(userInfo: any) {
      this.userInfo = userInfo
    },

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
    },

    async login(username: string, password: string) {
      const res = await fetch('/gopay/v1/sso/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (data.code !== 0 && data.code !== 200) {
        throw new Error(data.msg || data.message || '登录失败')
      }
      this.setToken(data.data.token)
      this.setUserInfo(data.data.userInfo)
      return true
    },

    async fetchUserInfo() {
      if (!this.token) return
      const res = await fetch('/gopay/v1/user/getInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      })
      const data = await res.json()
      if (data.code !== 0 && data.code !== 200) {
        this.logout()
        return
      }
      this.setUserInfo(data.data)
    }
  }
})
