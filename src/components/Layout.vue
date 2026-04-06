<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      width="240"
      theme="light"
      class="layout-sider"
    >
      <div class="logo">
        <h2 v-if="!collapsed">GoPay</h2>
        <h2 v-else>GP</h2>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        :items="menuItems"
        @click="handleMenuClick"
      />
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout>
      <!-- 顶部导航栏 -->
      <a-layout-header class="layout-header">
        <div class="header-left">
          <MenuUnfoldOutlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <MenuFoldOutlined
            v-else
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
        </div>
        <div class="header-right">
          <a-dropdown>
            <div class="user-info">
              <a-avatar :size="32">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="username">{{ userStore.userInfo?.username || 'Admin' }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SafetyOutlined,
  TeamOutlined,
  ShopOutlined,
  DoubleRightOutlined,
  SlidersOutlined,
  EuroOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  BellOutlined,
  MobileOutlined,
  ReconciliationOutlined,
  BugOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/store/user'
import { menuData } from '@/router/menu'

const router = useRouter()
const userStore = useUserStore()

const collapsed = ref(false)
const selectedKeys = ref<string[]>(['dashboard'])
const openKeys = ref<string[]>([])

// 图标映射
const iconMap: Record<string, any> = {
  SettingOutlined,
  SafetyOutlined,
  TeamOutlined,
  ShopOutlined,
  DoubleRightOutlined,
  SlidersOutlined,
  EuroOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  BellOutlined,
  MobileOutlined,
  ReconciliationOutlined,
  BugOutlined
}

// 转换菜单数据为 Ant Design 格式
const menuItems = computed(() => {
  return menuData.map(item => ({
    key: item.key,
    icon: item.icon ? () => h(iconMap[item.icon]) : undefined,
    label: item.label,
    children: item.children?.map(child => ({
      key: child.key,
      label: child.label
    }))
  }))
})

const handleMenuClick = ({ key }: { key: string }) => {
  // 查找对应的路径
  for (const menu of menuData) {
    if (menu.children) {
      const child = menu.children.find(c => c.key === key)
      if (child?.path) {
        router.push(child.path)
        return
      }
    }
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-sider {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.layout-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}

.layout-content {
  margin: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  overflow-y: auto;
}
</style>
