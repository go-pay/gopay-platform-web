<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <aside :class="['sidebar', { collapsed: collapsed }]">
      <div class="sidebar-logo">
        <div class="logo-icon">G</div>
        <span v-if="!collapsed" class="logo-text">GoPay</span>
      </div>

      <v-divider />

      <nav class="sidebar-menu">
        <template v-for="item in menuData" :key="item.key">
          <!-- 无子菜单 -->
          <div
            v-if="!item.children"
            :class="['menu-item', { active: isActive(item) }]"
            :title="collapsed ? item.label : ''"
            @click="navigateTo(item.path!)"
          >
            <span class="mdi menu-icon" :class="item.icon"></span>
            <span v-if="!collapsed" class="menu-text">{{ item.label }}</span>
          </div>

          <!-- 有子菜单 -->
          <div v-else class="menu-group">
            <div
              :class="['menu-item', { active: isGroupActive(item) }]"
              :title="collapsed ? item.label : ''"
              @click="collapsed ? navigateToFirstChild(item) : toggleGroup(item.key)"
            >
              <span class="mdi menu-icon" :class="item.icon"></span>
              <span v-if="!collapsed" class="menu-text">{{ item.label }}</span>
              <span v-if="!collapsed" class="mdi menu-arrow" :class="expandedKeys.includes(item.key) ? 'mdi-chevron-down' : 'mdi-chevron-right'"></span>
            </div>
            <div v-if="!collapsed && expandedKeys.includes(item.key)" class="menu-children">
              <div
                v-for="child in item.children"
                :key="child.key"
                :class="['menu-item', 'menu-child', { active: isActive(child) }]"
                @click="navigateTo(child.path!)"
              >
                <span class="menu-text">{{ child.label }}</span>
              </div>
            </div>
          </div>
        </template>
      </nav>
    </aside>

    <!-- 主区域 -->
    <div class="main">
      <!-- 顶部栏 -->
      <header class="header">
        <div class="header-left">
          <v-btn icon variant="text" size="small" @click="collapsed = !collapsed">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          <v-breadcrumbs :items="breadcrumbs" class="px-0">
            <template #prepend>
              <v-icon size="small" class="mr-1">mdi-home</v-icon>
            </template>
          </v-breadcrumbs>
        </div>

        <div class="header-right">
          <button class="header-icon-btn" title="通知">
            <span class="mdi mdi-bell-outline" style="font-size: 20px; color: #64748B"></span>
            <span class="notification-badge">3</span>
          </button>

          <div class="header-divider"></div>

          <div class="user-dropdown" v-click-outside="() => showUserMenu = false">
            <button class="user-btn" @click="showUserMenu = !showUserMenu">
              <span class="user-avatar">{{ avatarLetter }}</span>
              <span class="user-name">{{ userStore.userInfo?.username || 'Admin' }}</span>
              <span class="mdi mdi-chevron-down" style="font-size: 16px; color: #94A3B8"></span>
            </button>
            <div v-if="showUserMenu" class="user-menu">
              <div class="user-menu-item" @click="showUserMenu = false; router.push('/profile')">
                <span class="mdi mdi-account-outline"></span>个人中心
              </div>
              <div class="user-menu-divider"></div>
              <div class="user-menu-item user-menu-item-danger" @click="handleLogout">
                <span class="mdi mdi-logout"></span>退出登录
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { menuData } from '@/router/menu'
import type { MenuItem } from '@/router/menu'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)
const showUserMenu = ref(false)
const expandedKeys = ref<string[]>([])

// 自定义 v-click-outside 指令
const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    (el as any)._clickOutside = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) binding.value()
    }
    document.addEventListener('click', (el as any)._clickOutside)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', (el as any)._clickOutside)
  },
}

function toggleGroup(key: string) {
  const idx = expandedKeys.value.indexOf(key)
  if (idx >= 0) expandedKeys.value.splice(idx, 1)
  else expandedKeys.value.push(key)
}

function isGroupActive(item: MenuItem): boolean {
  return !!item.children?.some(c => c.path === route.path)
}

function navigateToFirstChild(item: MenuItem) {
  if (item.children?.length) navigateTo(item.children[0].path!)
}

// 初始化展开当前路由所在的菜单组
for (const item of menuData) {
  if (item.children?.some(c => c.path === route.path)) {
    expandedKeys.value.push(item.key)
  }
}

const avatarLetter = computed(() => {
  const name = userStore.userInfo?.username || 'A'
  return name.charAt(0).toUpperCase()
})

const breadcrumbs = computed(() => {
  const items: Array<{ title: string; disabled: boolean }> = []
  for (const menu of menuData) {
    if (menu.path === route.path) {
      items.push({ title: menu.label, disabled: true })
      return items
    }
    if (menu.children) {
      const child = menu.children.find((c) => c.path === route.path)
      if (child) {
        items.push({ title: menu.label, disabled: false })
        items.push({ title: child.label, disabled: true })
        return items
      }
    }
  }
  return items
})

function isActive(item: MenuItem): boolean {
  return item.path === route.path
}

function navigateTo(path: string) {
  router.push(path)
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* === 侧边栏 === */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #EEF2F6;
  overflow-y: auto;
  transition: width 0.2s, min-width 0.2s;
}

.sidebar.collapsed {
  width: 72px;
  min-width: 72px;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  flex-shrink: 0;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
  letter-spacing: 1px;
}

.sidebar-menu {
  padding: 8px 12px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
  padding: 0 16px;
  height: 44px;
  border-radius: 10px;
  color: #7A8EA8;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 0;
}

.menu-item:hover {
  background: #F1F5FE;
  color: #3B9EFF;
}

.menu-item.active {
  background: linear-gradient(135deg, #E8F2FF 0%, #F0F7FF 100%);
  color: #3B9EFF;
  font-weight: 600;
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: linear-gradient(180deg, #3B9EFF 0%, #7BBFFF 100%);
  border-radius: 0 4px 4px 0;
}

.menu-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.menu-text {
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-arrow {
  font-size: 16px;
  color: #94A3B8;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.menu-children {
  overflow: hidden;
}

.menu-child {
  padding-left: 50px;
  gap: 0;
  height: 40px;
  font-size: 13px;
}

/* === 主区域 === */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* === 顶部栏 === */
.header {
  height: 64px;
  min-height: 64px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border: none;
  background: #F8FAFC;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.header-icon-btn:hover { background: #F1F5F9; }

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #EF4444;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.header-divider {
  width: 1px;
  height: 24px;
  background: #E2E8F0;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}
.user-btn:hover { background: #F8FAFC; }

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B9EFF 0%, #7BBFFF 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

/* === 用户下拉菜单 === */
.user-dropdown {
  position: relative;
}

.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  padding: 6px;
  z-index: 100;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #475569;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.user-menu-item:hover {
  background: #F8FAFC;
}

.user-menu-item .mdi {
  font-size: 18px;
  color: #94A3B8;
}

.user-menu-item-danger:hover {
  background: #FEF2F2;
  color: #EF4444;
}
.user-menu-item-danger:hover .mdi {
  color: #EF4444;
}

.user-menu-divider {
  height: 1px;
  background: #F1F5F9;
  margin: 4px 8px;
}

/* === 内容区 === */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #F5F5F9;
}
</style>
