import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页', icon: 'House' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { title: '个人中心', icon: 'User' }
      },
      {
        path: 'password',
        name: 'Password',
        component: () => import('../views/Password.vue'),
        meta: { title: '修改密码', icon: 'Lock' }
      },
      {
        path: 'content',
        name: 'Content',
        redirect: '/content/videos',
        meta: { title: '内容管理', icon: 'Document' },
        children: [
          {
            path: 'videos',
            name: 'VideoResource',
            component: () => import('../views/content/VideoResource.vue'),
            meta: { title: '视频资源', icon: 'VideoCamera' }
          },
          {
            path: 'articles',
            name: 'ArticleResource',
            component: () => import('../views/content/ArticleResource.vue'),
            meta: { title: '文章资源', icon: 'Document' }
          },
          {
            path: 'cases',
            name: 'CaseResource',
            component: () => import('../views/content/CaseResource.vue'),
            meta: { title: '案例资源', icon: 'Briefcase' }
          }
        ]
      },
      {
        path: 'permission',
        name: 'Permission',
        redirect: '/permission/users',
        meta: { title: '权限管理', icon: 'Lock' },
        children: [
          {
            path: 'users',
            name: 'UserManage',
            component: () => import('../views/permission/UserManage.vue'),
            meta: { title: '用户管理', icon: 'User' }
          },
          {
            path: 'roles',
            name: 'RoleManage',
            component: () => import('../views/permission/RoleManage.vue'),
            meta: { title: '角色管理', icon: 'UserFilled' }
          },
          {
            path: 'menus',
            name: 'MenuManage',
            component: () => import('../views/permission/MenuManage.vue'),
            meta: { title: '菜单管理', icon: 'Menu' }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isLoginPage = to.path === '/login'
  
  if (!token && !isLoginPage) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (token && isLoginPage) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router
