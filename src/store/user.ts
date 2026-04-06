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
      // Mock 登录
      const mockToken = 'mock-token-' + Date.now()
      this.setToken(mockToken)
      this.setUserInfo({ username, role: 'admin' })
      return true
    }
  }
})
