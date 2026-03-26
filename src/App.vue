<template>
  <div class="app-container" :class="themeClass">
    <!-- 欢迎引导 -->
    <WelcomeWizard v-if="showWelcome" @complete="onWelcomeComplete" />
    
    <!-- 主界面 -->
    <div v-else class="main-layout">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="logo">
          <StarLogo :size="40" />
          <span class="logo-text">AI Robot</span>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" active-class="active">
            <HomeIcon />
            <span>首页</span>
          </router-link>
          <router-link to="/chat" class="nav-item" active-class="active">
            <ChatIcon />
            <span>对话</span>
          </router-link>
          <router-link to="/plugins" class="nav-item" active-class="active">
            <PluginIcon />
            <span>插件</span>
          </router-link>
          <router-link to="/settings" class="nav-item" active-class="active">
            <SettingsIcon />
            <span>设置</span>
          </router-link>
        </nav>
        
        <div class="sidebar-footer">
          <button class="upgrade-btn" @click="showUpgrade = true" v-if="!isPro">
            <CrownIcon />
            <span>升级专业版</span>
          </button>
          <div class="version">v2.0.0</div>
        </div>
      </aside>
      
      <!-- 主内容区 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- 升级弹窗 -->
    <UpgradeModal v-if="showUpgrade" @close="showUpgrade = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from './stores/app'
import WelcomeWizard from './components/WelcomeWizard.vue'
import UpgradeModal from './components/UpgradeModal.vue'
import StarLogo from './components/icons/StarLogo.vue'
import HomeIcon from './components/icons/HomeIcon.vue'
import ChatIcon from './components/icons/ChatIcon.vue'
import PluginIcon from './components/icons/PluginIcon.vue'
import SettingsIcon from './components/icons/SettingsIcon.vue'
import CrownIcon from './components/icons/CrownIcon.vue'

const router = useRouter()
const store = useAppStore()

const showWelcome = ref(false)
const showUpgrade = ref(false)

const themeClass = computed(() => `theme-${store.theme}`)
const isPro = computed(() => store.license?.type === 'pro')

onMounted(async () => {
  await store.loadConfig()
  showWelcome.value = store.isFirstRun
  
  // 监听 Electron 事件
  window.electronAPI?.onShowWelcome(() => {
    showWelcome.value = true
  })
  
  window.electronAPI?.onNavigate((route) => {
    router.push(route)
  })
})

const onWelcomeComplete = async () => {
  showWelcome.value = false
  store.setFirstRunComplete()
}
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.main-layout {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 220px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.upgrade-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.upgrade-btn:hover {
  transform: scale(1.02);
}

.version {
  text-align: center;
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.main-content {
  flex: 1;
  overflow: auto;
  background: var(--bg-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
