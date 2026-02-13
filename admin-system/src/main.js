import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const initUserInfo = async () => {
  const token = localStorage.getItem('token')
  if (!token) return false
  
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('user', JSON.stringify(data.data.user || {}))
      localStorage.setItem('menus', JSON.stringify(data.data.menus || []))
      return true
    }
  } catch (e) {
    console.error('Failed to fetch user info:', e)
  }
  return false
}

initUserInfo().then(() => {
  const app = createApp(App)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.use(ElementPlus)
  app.use(router)
  app.mount('#app')
})
