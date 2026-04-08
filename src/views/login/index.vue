<template>
  <div class="login-container">
    <v-card class="login-card" elevation="12" rounded="xl">
      <div class="card-header">
        <div class="logo-icon">G</div>
        <h1 class="header-title">GoPay</h1>
        <p class="header-subtitle">支付网关管理平台</p>
      </div>

      <div class="card-body">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">账号</label>
            <div class="input-wrap">
              <span class="mdi mdi-account input-icon"></span>
              <input v-model="form.username" type="text" class="form-input" placeholder="请输入账号" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <div class="input-wrap">
              <span class="mdi mdi-lock input-icon"></span>
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-input" placeholder="请输入密码" />
              <span class="mdi input-icon-right" :class="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click="showPassword = !showPassword"></span>
            </div>
          </div>

          <div v-if="errorMsg" class="error-msg">
            <span class="mdi mdi-alert-circle error-icon"></span>
            {{ errorMsg }}
          </div>

          <label class="remember-wrap">
            <input v-model="form.remember" type="checkbox" class="remember-checkbox" />
            <span class="remember-text">记住我</span>
          </label>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="mdi mdi-loading mdi-spin btn-loading-icon"></span>
            登 录
          </button>
        </form>
      </div>
    </v-card>

    <div class="copyright">&copy; 2026 GoPay. All rights reserved.</div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const showPassword = ref(false)
const errorMsg = ref('')

const form = reactive({
  username: 'admin',
  password: 'admin',
  remember: true,
})

async function handleLogin() {
  if (!form.username || !form.password) return
  errorMsg.value = ''
  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    router.push('/dashboard')
  } catch (e: any) {
    errorMsg.value = e?.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F5F7FA;
}

.login-card {
  width: 420px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%);
  padding: 40px 40px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.header-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.card-body {
  padding: 32px 40px 40px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  color: #94A3B8;
  pointer-events: none;
}

.input-icon-right {
  position: absolute;
  right: 14px;
  font-size: 18px;
  color: #94A3B8;
  cursor: pointer;
  transition: color 0.15s;
}

.input-icon-right:hover {
  color: #64748B;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 44px 0 42px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 15px;
  color: #334155;
  outline: none;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus {
  border-color: #3B9EFF;
  box-shadow: 0 0 0 3px rgba(59, 158, 255, 0.1);
}

.form-input::placeholder {
  color: #CBD5E1;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #DC2626;
  font-size: 13px;
  line-height: 1.4;
}

.error-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.remember-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  cursor: pointer;
}

.remember-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #3B9EFF;
  cursor: pointer;
}

.remember-text {
  font-size: 13px;
  color: #64748B;
}

.login-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #3B9EFF, #7BBFFF);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 2px;
}

.login-btn:hover {
  box-shadow: 0 4px 16px rgba(59, 158, 255, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading-icon {
  font-size: 18px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.mdi-spin {
  animation: spin 1s linear infinite;
}

.copyright {
  margin-top: 32px;
  color: #94A3B8;
  font-size: 13px;
}
</style>
