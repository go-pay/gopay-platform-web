<template>
  <div class="login-container">
    <v-card class="login-card" elevation="12" rounded="xl">
      <div class="card-header">
        <div class="logo-icon mx-auto mb-4">G</div>
        <h1 class="text-h5 font-weight-bold text-white">GoPay</h1>
        <p class="text-body-2 mt-1" style="color: rgba(255,255,255,0.8)">支付网关管理平台</p>
      </div>

      <div class="card-body">
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="form.username"
            prepend-inner-icon="mdi-account"
            label="账号"
            placeholder="请输入账号"
            :rules="[rules.required]"
            class="mb-1"
          />

          <v-text-field
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="密码"
            placeholder="请输入密码"
            :rules="[rules.required]"
            class="mb-1"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-checkbox
            v-model="form.remember"
            label="记住我"
            density="compact"
            color="primary"
            class="mb-4"
          />

          <v-btn
            type="submit"
            block
            size="large"
            :loading="loading"
            class="btn-gradient-primary text-none"
            style="font-size: 16px; letter-spacing: 0"
          >
            登 录
          </v-btn>
        </v-form>
      </div>
    </v-card>

    <div class="copyright">
      &copy; 2026 GoPay. All rights reserved.
    </div>
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

const form = reactive({
  username: 'admin',
  password: 'admin',
  remember: true,
})

const rules = {
  required: (v: string) => !!v || '此项为必填',
}

async function handleLogin() {
  if (!form.username || !form.password) return
  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    router.push('/dashboard')
  } catch {
    // TODO: snackbar error
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
}

.card-body {
  padding: 32px 40px 40px;
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
}

.copyright {
  margin-top: 32px;
  color: #94A3B8;
  font-size: 13px;
}
</style>
