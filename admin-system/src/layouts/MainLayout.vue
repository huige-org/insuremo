<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <el-icon v-if="isCollapse" :size="24"><Monitor /></el-icon>
        <h2 v-else>Insure Admin</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :collapse="isCollapse"
        :collapse-transition="true"
        :unique-opened="true"
      >
        <SidebarItem
          v-for="route in menuRoutes"
          :key="route.path"
          :item="route"
        />
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <breadcrumb />
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="30" :src="userStore.state.user?.avatar_url || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <span class="username">{{ userStore.state.user?.nickname || userStore.state.user?.email || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Expand, ArrowDown, Monitor } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import SidebarItem from './components/SidebarItem.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const buildMenuRoute = (menu, parentPath = '') => {
  let fullPath = ''
  if (menu.path) {
    fullPath = menu.path.startsWith('/') ? menu.path : (parentPath ? parentPath + '/' + menu.path : '/' + menu.path)
  } else if (parentPath) {
    fullPath = parentPath
  }
  
  const routeConfig = {
    path: fullPath,
    name: menu.name,
    meta: {
      title: menu.name,
      icon: menu.icon
    }
  }

  if (menu.children && menu.children.length > 0) {
    routeConfig.children = menu.children.map(child => buildMenuRoute(child, fullPath))
  }

  return routeConfig
}

const menuRoutes = computed(() => {
  const menus = userStore.state.menus
  if (!menus || menus.length === 0) {
    return getDefaultRoutes()
  }
  return menus.map(menu => buildMenuRoute(menu))
})

function getDefaultRoutes() {
  return [
    {
      path: '/dashboard',
      meta: { title: '首页', icon: 'House' }
    },
    {
      path: '/content',
      meta: { title: '内容管理', icon: 'Document' },
      children: [
        { path: '/content/video', meta: { title: '视频资源', icon: 'VideoCamera' } },
        { path: '/content/article', meta: { title: '文章资源', icon: 'Document' } },
        { path: '/content/case', meta: { title: '案例资源', icon: 'Briefcase' } }
      ]
    },
    {
      path: '/permission',
      meta: { title: '权限管理', icon: 'Lock' },
      children: [
        { path: '/permission/users', meta: { title: '用户管理', icon: 'User' } },
        { path: '/permission/roles', meta: { title: '角色管理', icon: 'UserFilled' } },
        { path: '/permission/menus', meta: { title: '菜单管理', icon: 'Menu' } }
      ]
    }
  ]
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'password':
      router.push('/password')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
      })
      break
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3649;
  color: #fff;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  white-space: nowrap;
}

.el-menu-vertical {
  border-right: none;
}

/* 折叠状态样式 */
:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-menu--collapse) .el-menu-item,
:deep(.el-menu--collapse) .el-sub-menu__title {
  padding: 0 !important;
}

:deep(.el-menu--collapse) .el-sub-menu__title {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.el-menu--collapse) .el-menu-item .el-icon,
:deep(.el-menu--collapse) .el-sub-menu__title .el-icon {
  margin: 0 !important;
}

:deep(.el-menu--collapse) .el-sub-menu__icon-arrow {
  display: none !important;
}

:deep(.el-menu--collapse) .el-sub-menu__title span {
  display: none !important;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  font-size: 14px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
