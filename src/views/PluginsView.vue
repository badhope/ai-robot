<template>
  <div class="plugins-view">
    <header class="page-header">
      <h1>插件中心</h1>
      <button class="btn-refresh" @click="refreshPlugins">刷新</button>
    </header>

    <div class="plugins-tabs">
      <button 
        :class="{ active: activeTab === 'installed' }"
        @click="activeTab = 'installed'"
      >
        已安装
      </button>
      <button 
        :class="{ active: activeTab === 'market' }"
        @click="activeTab = 'market'"
      >
        插件市场
      </button>
    </div>

    <!-- 已安装插件 -->
    <div v-if="activeTab === 'installed'" class="plugins-grid">
      <div 
        v-for="plugin in installedPlugins" 
        :key="plugin.id"
        class="plugin-card"
        :class="{ disabled: !plugin.enabled }"
      >
        <div class="plugin-header">
          <div class="plugin-icon">{{ plugin.icon }}</div>
          <div class="plugin-info">
            <h3>{{ plugin.name }}</h3>
            <span class="plugin-version">v{{ plugin.version }}</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="plugin.enabled" @change="togglePlugin(plugin)" />
            <span class="slider"></span>
          </label>
        </div>
        <p class="plugin-desc">{{ plugin.description }}</p>
        <div class="plugin-footer">
          <span class="plugin-badge" :class="plugin.type">{{ plugin.type === 'pro' ? '专业版' : '免费' }}</span>
          <button class="btn-settings" @click="openSettings(plugin)">设置</button>
        </div>
      </div>
    </div>

    <!-- 插件市场 -->
    <div v-if="activeTab === 'market'" class="plugins-grid">
      <div 
        v-for="plugin in marketPlugins" 
        :key="plugin.id"
        class="plugin-card market"
      >
        <div class="plugin-header">
          <div class="plugin-icon">{{ plugin.icon }}</div>
          <div class="plugin-info">
            <h3>{{ plugin.name }}</h3>
            <span class="plugin-downloads">{{ plugin.downloads }} 次下载</span>
          </div>
        </div>
        <p class="plugin-desc">{{ plugin.description }}</p>
        <div class="plugin-footer">
          <span class="plugin-badge" :class="plugin.type">{{ plugin.type === 'pro' ? '💰 专业版' : '🆓 免费' }}</span>
          <button 
            class="btn-install" 
            :disabled="plugin.installed"
            @click="installPlugin(plugin)"
          >
            {{ plugin.installed ? '已安装' : '安装' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const activeTab = ref<'installed' | 'market'>('installed')

const installedPlugins = ref([
  { id: '1', name: '图片识别', icon: '🖼️', version: '1.0.0', description: '识别图片内容，支持多模态 AI', type: 'pro', enabled: false, settings: {} },
  { id: '2', name: '语音回复', icon: '🎤', version: '1.0.0', description: '将文字转换为语音回复', type: 'pro', enabled: false, settings: {} },
  { id: '3', name: '群数据统计', icon: '📊', version: '1.0.0', description: '统计群消息、活跃用户等数据', type: 'free', enabled: true, settings: {} },
  { id: '4', name: '天气查询', icon: '🌤️', version: '1.0.0', description: '查询天气预报信息', type: 'free', enabled: true, settings: {} },
])

const marketPlugins = ref([
  { id: '5', name: '自动总结', icon: '📝', description: '自动总结群聊内容', type: 'pro', downloads: 1234, installed: false },
  { id: '6', name: '群游戏', icon: '🎮', description: '群内小游戏功能', type: 'free', downloads: 5678, installed: false },
  { id: '7', name: '日程提醒', icon: '📅', description: '定时提醒功能', type: 'free', downloads: 2345, installed: false },
  { id: '8', name: '搜索助手', icon: '🔍', description: '联网搜索答案', type: 'pro', downloads: 3456, installed: false },
  { id: '9', name: '股票查询', icon: '📈', description: '查询股票行情', type: 'free', downloads: 1234, installed: false },
  { id: '10', name: '翻译助手', icon: '🌐', description: '多语言翻译', type: 'free', downloads: 4567, installed: false },
])

function togglePlugin(plugin: typeof installedPlugins.value[0]) {
  // 专业版插件检查
  if (plugin.type === 'pro' && plugin.enabled && !store.isPro) {
    plugin.enabled = false
    // 显示升级提示
    return
  }
  // 保存设置
}

function openSettings(plugin: typeof installedPlugins.value[0]) {
  // 打开插件设置
}

function refreshPlugins() {
  // 刷新插件列表
}

function installPlugin(plugin: typeof marketPlugins.value[0]) {
  if (plugin.type === 'pro' && !store.isPro) {
    // 显示升级提示
    return
  }
  plugin.installed = true
}
</script>

<style scoped>
.plugins-view {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 20px;
}

.btn-refresh {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--text-primary);
  cursor: pointer;
}

.plugins-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.plugins-tabs button {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 20px;
  color: var(--text-secondary);
  cursor: pointer;
}

.plugins-tabs button.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.plugins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.plugin-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.plugin-card:hover {
  border-color: var(--primary-color);
}

.plugin-card.disabled {
  opacity: 0.6;
}

.plugin-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.plugin-icon {
  font-size: 32px;
}

.plugin-info {
  flex: 1;
}

.plugin-info h3 {
  font-size: 15px;
  margin-bottom: 2px;
}

.plugin-version, .plugin-downloads {
  font-size: 12px;
  color: var(--text-muted);
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-hover);
  border-radius: 24px;
  transition: 0.2s;
}

.slider::before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}

.toggle-switch input:checked + .slider {
  background: var(--primary-color);
}

.toggle-switch input:checked + .slider::before {
  transform: translateX(20px);
}

.plugin-desc {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.plugin-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plugin-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.plugin-badge.free {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.plugin-badge.pro {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.btn-settings, .btn-install {
  background: var(--bg-hover);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
}

.btn-install {
  background: var(--primary-color);
  color: white;
}

.btn-install:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
