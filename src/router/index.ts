import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue')
    },
    {
      path: '/plugins',
      name: 'plugins',
      component: () => import('../views/PluginsView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    },
    {
      path: '/settings/ai',
      name: 'settings-ai',
      component: () => import('../views/settings/AISettings.vue')
    },
    {
      path: '/settings/qq',
      name: 'settings-qq',
      component: () => import('../views/settings/QQSettings.vue')
    },
    {
      path: '/settings/bot',
      name: 'settings-bot',
      component: () => import('../views/settings/BotSettings.vue')
    },
    {
      path: '/settings/advanced',
      name: 'settings-advanced',
      component: () => import('../views/settings/AdvancedSettings.vue')
    },
    {
      path: '/settings/about',
      name: 'settings-about',
      component: () => import('../views/settings/AboutView.vue')
    }
  ]
})

export default router
