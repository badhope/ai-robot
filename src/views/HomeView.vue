<template>
  <div class="home-view">
    <!-- 顶部状态栏 -->
    <header class="header">
      <div class="header-left">
        <h1>控制面板</h1>
        <span class="subtitle">AI Robot 智能群聊助手</span>
      </div>
      <div class="header-right">
        <div class="status-badge" :class="robotRunning ? 'running' : 'stopped'">
          <span class="status-dot"></span>
          {{ robotRunning ? '运行中' : '已停止' }}
        </div>
      </div>
    </header>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats?.todayMessages || 0 }}</div>
          <div class="stat-label">今日对话</div>
        </div>
        <div class="stat-trend up">+23</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ groupCount }}</div>
          <div class="stat-label">活跃群聊</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-value">{{ remainingQuota }}</div>
          <div class="stat-label">剩余次数</div>
        </div>
        <div class="stat-quota" v-if="!isPro">免费版</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-info">
          <div class="stat-value">{{ runningTime }}</div>
          <div class="stat-label">运行时长</div>
        </div>
      </div>
    </div>

    <!-- 主要操作区 -->
    <div class="main-section">
      <!-- 机器人控制 -->
      <div class="control-panel">
        <div class="panel-header">
          <h3>🤖 机器人控制</h3>
        </div>
        <div class="panel-content">
          <div class="control-row">
            <div class="control-info">
              <div class="provider-badge">
                {{ getProviderLabel(aiProvider) }}
              </div>
              <div class="model-name">{{ currentModel }}</div>
            </div>
            <div class="control-actions">
              <button class="btn-primary" @click="toggleRobot" v-if="!robotRunning">
                <PlayIcon />
                启动机器人
              </button>
              <button class="btn-danger" @click="toggleRobot" v-else>
                <StopIcon />
                停止机器人
              </button>
              <button class="btn-secondary" @click="restartRobot">
                <RefreshIcon />
                重启
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- QQ 状态 -->
      <div class="control-panel">
        <div class="panel-header">
          <h3>📱 QQ 状态</h3>
        </div>
        <div class="panel-content">
          <div class="control-row">
            <div class="control-info">
              <div class="status-indicator" :class="qqConnected ? 'connected' : 'disconnected'">
                {{ qqConnected ? '已连接' : '未连接' }}
              </div>
              <div class="qq-info" v-if="qqConnected">
                <span class="qq-name">{{ qqNickname }}</span>
                <span class="qq-groups">群: {{ groupCount }} | 好友: {{ friendCount }}</span>
              </div>
            </div>
            <div class="control-actions">
              <button class="btn-secondary" @click="launchNapcat" :disabled="qqConnected">
                <PhoneIcon />
                {{ qqConnected ? '已启动' : '启动 NapCatQQ' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近对话 -->
    <div class="recent-chats">
      <div class="section-header">
        <h3>💬 最近对话</h3>
        <router-link to="/chat" class="view-all">查看全部 →</router-link>
      </div>
      <div class="chat-list">
        <div class="chat-item" v-for="chat in recentChats" :key="chat.id">
          <div class="chat-time">{{ chat.time }}</div>
          <div class="chat-room">[{{ chat.roomName }}]</div>
          <div class="chat-user">{{ chat.userName }}:</div>
          <div class="chat-message">{{ chat.message }}</div>
        </div>
        <div class="empty-state" v-if="recentChats.length === 0">
          暂无对话记录，启动机器人开始使用
        </div>
      </div>
    </div>

    <!-- 快捷设置 -->
    <div class="quick-settings">
      <div class="section-header">
        <h3>🎛️ 快捷设置</h3>
      </div>
      <div class="settings-row">
        <div class="setting-item">
          <label>AI 平台</label>
          <select v-model="quickSettings.provider" @change="onQuickSettingChange">
            <option value="alibaba">阿里云通义</option>
            <option value="deepseek">DeepSeek</option>
            <option value="zhipu">智谱 AI</option>
            <option value="ollama">本地 Ollama</option>
          </select>
        </div>
        <div class="setting-item">
          <label>模型</label>
          <select v-model="quickSettings.model">
            <option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="setting-item">
          <label>温度</label>
          <input type="range" v-model="quickSettings.temperature" min="0" max="2" step="0.1" />
          <span class="range-value">{{ quickSettings.temperature }}</span>
        </div>
      </div>
      <div class="toggles-row">
        <label class="toggle">
          <input type="checkbox" v-model="quickSettings.privateReply" />
          <span class="toggle-label">私聊自动回复</span>
        </label>
        <label class="toggle">
          <input type="checkbox" v-model="quickSettings.groupReply" />
          <span class="toggle-label">群聊 @ 回复</span>
        </label>
        <label class="toggle" :class="{ disabled: !isPro }">
          <input type="checkbox" v-model="quickSettings.imageRecognition" :disabled="!isPro" />
          <span class="toggle-label">图片识别 {{ !isPro ? '(专业版)' : '' }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useAppStore } from '../stores/app'
import PlayIcon from '../components/icons/PlayIcon.vue'
import StopIcon from '../components/icons/StopIcon.vue'
import RefreshIcon from '../components/icons/RefreshIcon.vue'
import PhoneIcon from '../components/icons/PhoneIcon.vue'

const store = useAppStore()

const robotRunning = computed(() => store.robotRunning)
const isPro = computed(() => store.isPro)
const aiProvider = computed(() => store.aiProvider)
const stats = computed(() => store.stats)

const qqConnected = ref(false)
const qqNickname = ref('')
const groupCount = ref(0)
const friendCount = ref(0)
const runningTime = ref('0h 0m')
const remainingQuota = computed(() => isPro.value ? '∞' : 1000 - (stats.value?.todayMessages || 0))
const currentModel = computed(() => store.config?.ai?.providers?.[aiProvider.value as keyof typeof store.config.ai.providers]?.model || '')

const recentChats = ref<Array<{
  id: string
  time: string
  roomName: string
  userName: string
  message: string
}>>([])

const quickSettings = reactive({
  provider: aiProvider.value,
  model: currentModel.value,
  temperature: store.config?.ai?.temperature || 0.7,
  privateReply: true,
  groupReply: true,
  imageRecognition: false
})

const availableModels = computed(() => {
  const models: Record<string, string[]> = {
    alibaba: ['qwen-plus', 'qwen-turbo', 'qwen-max', 'qwen-long'],
    deepseek: ['deepseek-chat', 'deepseek-coder'],
    zhipu: ['glm-4', 'glm-4-flash', 'glm-3-turbo'],
    moonshot: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    google: ['gemini-pro', 'gemini-pro-vision'],
    ollama: ['qwen2.5:7b', 'qwen2.5:14b', 'llama3:8b', 'mistral:7b']
  }
  return models[quickSettings.provider] || []
})

const providerLabels: Record<string, string> = {
  alibaba: '阿里云通义',
  deepseek: 'DeepSeek',
  zhipu: '智谱 AI',
  moonshot: '月之暗面',
  openai: 'OpenAI',
  google: 'Google Gemini',
  ollama: '本地 Ollama'
}

function getProviderLabel(provider: string) {
  return providerLabels[provider] || provider
}

async function toggleRobot() {
  await store.toggleRobot()
}

async function restartRobot() {
  await store.toggleRobot()
  setTimeout(() => store.toggleRobot(), 1000)
}

async function launchNapcat() {
  await window.electronAPI?.startNapcat()
}

function onQuickSettingChange() {
  quickSettings.model = availableModels.value[0]
}

onMounted(async () => {
  window.electronAPI?.onRobotStatus((status) => {
    store.setRobotStatus(status.running)
  })
})
</script>

<style scoped>
.home-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.running {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge.stopped {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 2px;
}

.stat-trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.stat-trend.up {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-quota {
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  border-radius: 4px;
}

.main-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.control-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  font-size: 15px;
  font-weight: 600;
}

.panel-content {
  padding: 20px;
}

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.provider-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.model-name {
  color: var(--text-secondary);
  font-size: 13px;
}

.control-actions {
  display: flex;
  gap: 8px;
}

.btn-primary, .btn-secondary, .btn-danger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.status-indicator {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.status-indicator.connected {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-indicator.disconnected {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.qq-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qq-name {
  font-weight: 500;
}

.qq-groups {
  font-size: 12px;
  color: var(--text-secondary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 15px;
  font-weight: 600;
}

.view-all {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 13px;
}

.recent-chats {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 13px;
}

.chat-time {
  color: var(--text-muted);
  min-width: 50px;
}

.chat-room {
  color: var(--primary-color);
}

.chat-user {
  color: var(--text-secondary);
}

.chat-message {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
}

.quick-settings {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.settings-row {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-item label {
  font-size: 13px;
  color: var(--text-secondary);
}

.setting-item select, .setting-item input[type="range"] {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 13px;
}

.range-value {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 24px;
}

.toggles-row {
  display: flex;
  gap: 24px;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-label {
  font-size: 13px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .main-section {
    grid-template-columns: 1fr;
  }
}
</style>
