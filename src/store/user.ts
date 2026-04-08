import { defineStore } from 'pinia'
import { loginApi, getUserInfoApi } from '@/api/auth'
import type { UserInfo } from '@/api/auth'

interface UserState {
  token: string
  userInfo: UserInfo | null
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

    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
    },

    async login(username: string, password: string) {
      const data = await loginApi(username, password)
      this.setToken(data.token)
      this.setUserInfo(data.userInfo)
      return true
    },

    async fetchUserInfo() {
      if (!this.token) return
      try {
        const data = await getUserInfoApi()
        this.setUserInfo(data)
      } catch {
        this.logout()
      }
    }
  }
})
