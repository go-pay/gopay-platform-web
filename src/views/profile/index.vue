<template>
  <div class="page">
    <v-card rounded="lg" flat class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">{{ avatarLetter }}</div>
        <div class="profile-info">
          <div class="profile-name">{{ userInfo.realName }}</div>
          <div class="profile-role">
            <span :class="['chip', userInfo.role === 'admin' ? 'chip-blue' : 'chip-light']">{{ roleLabel(userInfo.role) }}</span>
          </div>
        </div>
      </div>
    </v-card>

    <v-card rounded="lg" flat class="section-card">
      <div class="section-title">基本信息</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">用户名</span>
          <span class="info-value">{{ userInfo.username }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">姓名</span>
          <span class="info-value">{{ userInfo.realName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">手机号</span>
          <span class="info-value">{{ userInfo.phone }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">邮箱</span>
          <span class="info-value">{{ userInfo.email }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">角色</span>
          <span class="info-value">{{ roleLabel(userInfo.role) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">最后登录</span>
          <span class="info-value">{{ userInfo.lastLogin }}</span>
        </div>
      </div>
    </v-card>

    <v-card rounded="lg" flat class="section-card">
      <div class="section-title">修改密码</div>
      <div class="pwd-form">
        <div class="form-row">
          <label class="form-label">当前密码 <span class="required">*</span></label>
          <input v-model="pwdForm.oldPassword" type="password" class="form-input" placeholder="请输入当前密码" />
        </div>
        <div class="form-row">
          <label class="form-label">新密码 <span class="required">*</span></label>
          <input v-model="pwdForm.newPassword" type="password" class="form-input" placeholder="请输入新密码" />
        </div>
        <div class="form-row">
          <label class="form-label">确认密码 <span class="required">*</span></label>
          <input v-model="pwdForm.confirmPassword" type="password" class="form-input" placeholder="请再次输入新密码" />
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="handleChangePwd">确认修改</button>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const userInfo = reactive({
  username: 'admin',
  realName: '超级管理员',
  phone: '13800000001',
  email: 'admin@gopay.com',
  role: 'admin',
  lastLogin: '2026-04-07 09:30:00',
})

const avatarLetter = computed(() => (userInfo.realName || userInfo.username || 'A').charAt(0).toUpperCase())

const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

function roleLabel(r: string) { return { admin: '管理员', operator: '运营', finance: '财务', viewer: '只读' }[r] || r }

function handleChangePwd() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) return alert('请填写完整')
  if (pwdForm.newPassword !== pwdForm.confirmPassword) return alert('两次密码不一致')
  alert('密码修改成功')
  pwdForm.oldPassword = ''; pwdForm.newPassword = ''; pwdForm.confirmPassword = ''
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; max-width: 720px; }
.profile-card { padding: 32px; }
.profile-header { display: flex; align-items: center; gap: 20px; }
.profile-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #3B9EFF, #7BBFFF); color: #fff; font-size: 24px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.profile-info { display: flex; flex-direction: column; gap: 6px; }
.profile-name { font-size: 20px; font-weight: 600; color: #1E293B; }
.section-card { padding: 24px; }
.section-title { font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #F1F5F9; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 12px; color: #94A3B8; }
.info-value { font-size: 14px; color: #334155; }
.chip { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
.chip-blue { background: #EFF6FF; color: #3B82F6; }
.chip-light { background: #F8FAFC; color: #475569; border: 1px solid #E2E8F0; }
.pwd-form { display: flex; flex-direction: column; gap: 16px; max-width: 400px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; color: #475569; font-weight: 500; }
.required { color: #EF4444; }
.form-input { height: 38px; padding: 0 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #334155; outline: none; }
.form-input:focus { border-color: #3B9EFF; box-shadow: 0 0 0 2px rgba(59,158,255,0.1); }
.form-actions { padding-top: 4px; }
.btn { height: 34px; padding: 0 18px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; border: none; transition: all 0.15s; }
.btn-primary { background: linear-gradient(135deg, #3B9EFF, #7BBFFF); color: #fff; box-shadow: 0 1px 3px rgba(59,158,255,0.3); }
.btn-primary:hover { box-shadow: 0 2px 8px rgba(59,158,255,0.4); }
</style>
