<template>
  <div class="qq-settings">
    <h2>QQ 设置</h2>
    
    <div class="settings-section">
      <h3>NapCatQQ 配置</h3>
      
      <div class="napcat-status" :class="napcatStatus">
        <div class="status-icon">{{ napcatStatus === 'connected' ? '✅' : napcatStatus === 'disconnected' ? '❌' : '⏳' }}</div>
        <div class="status-info">
          <h4>NapCatQQ {{ napcatStatus === 'connected' ? '已连接' : napcatStatus === 'disconnected' ? '未连接' : '检测中...' }}</h4>
          <p v-if="napcatStatus === 'connected'">QQ: {{ qqNickname }} | 群: {{ groupCount }}</p>
        </div>
      </div>

      <div class="form-group">
        <label>WebSocket 地址</label>
        <input type="text" v-model="wsUrl" placeholder="ws://localhost:3001" />
        <p class="form-hint">NapCatQQ 的 WebSocket 服务地址</p>
      </div>

      <div class="form-group">
        <label>HTTP 端口</label>
        <input type="number" v-model="httpPort" />
        <p class="form-hint">NapCatQQ 的 HTTP 服务端口</p>
      </div>

      <div class="form-actions">
        <button class="btn-test" @click="testConnection">测试连接</button>
        <button class="btn-launch" @click="launchNapcat">启动 NapCatQQ</button>
      </div>
    </div>

    <div class="settings-section">
      <h3>登录信息</h3>
      <div class="login-info" v-if="napcatStatus === 'connected'">
        <div class="info-item">
          <span class="label">QQ 号</span>
          <span class="value">{{ qqNumber }}</span>
        </div>
        <div class="info-item">
          <span class="label">昵称</span>
          <span class="value">{{ qqNickname }}</span>
        </div>
        <div class="info-item">
          <span class="label">群数量</span>
          <span class="value">{{ groupCount }}</span>
        </div>
        <div class="info-item">
          <span class="label">好友数量</span>
          <span class="value">{{ friendCount }}</span>
        </div>
      </div>
      <div class="login-prompt" v-else>
        <p>请先启动 NapCatQQ 并登录 QQ</p>
      </div>
    </div>

    <div class="settings-section">
      <h3>NapCatQQ 下载</h3>
      <p class="section-desc">如果你还没有安装 NapCatQQ，可以在这里下载</p>
      
      <div class="download-section">
        <a href="https://github.com/NapNeko/NapCatQQ/releases" target="_blank" class="download-link">
          <span>📥</span>
          <div>
            <strong>下载 NapCatQQ</strong>
            <p>GitHub Releases</p>
          </div>
        </a>
      </div>

      <div class="tutorial-links">
        <a href="#" @click.prevent="openTutorial">📖 NapCatQQ 使用教程</a>
        <a href="#" @click.prevent="openFaq">❓ 常见问题</a>
      </div>
    </div>

    <div class="form-actions-bottom">
      <button class="btn-save" @click="saveSettings">保存设置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../../stores/app'

const store = useAppStore()

const napcatStatus = ref<'checking' | 'connected' | 'disconnected'>('disconnected')
const wsUrl = ref('ws://localhost:3001')
const httpPort = ref(3001)
const qqNumber = ref('')
const qqNickname = ref('')
const groupCount = ref(0)
const friendCount = ref(0)

async function testConnection() {
  napcatStatus.value = 'checking'
  // TODO: 测试连接
  setTimeout(() => {
    napcatStatus.value = 'disconnected'
  }, 2000)
}

async function launchNapcat() {
  await window.electronAPI?.startNapcat()
}

function openTutorial() {
  window.electronAPI?.openExternal('https://github.com/badhope/ai-robot/wiki/napcat-tutorial')
}

function openFaq() {
  window.electronAPI?.openExternal('https://github.com/badhope/ai-robot/wiki/faq')
}

async function saveSettings() {
  await store.saveConfig({
    qq: {
      enabled: true,
      wsUrl: wsUrl.value,
      httpPort: httpPort.value
    }
  })
}
</script>

<style scoped>
.qq-settings {
  max-width: 600px;
}

.settings-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.settings-section h3 {
  font-size: 15px;
  margin-bottom: 16px;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 16px;
}

.napcat-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  margin-bottom: 16px;
}

.napcat-status.connected {
  border: 1px solid #22c55e;
}

.napcat-status.disconnected {
  border: 1px solid #ef4444;
}

.status-icon {
  font-size: 32px;
}

.status-info h4 {
  margin-bottom: 4px;
}

.status-info p {
  font-size: 13px;
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.form-group input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 14px;
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
}

.btn-test, .btn-launch {
  background: var(--bg-hover);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: var(--text-primary);
  cursor: pointer;
}

.btn-launch {
  background: var(--primary-color);
  color: white;
}

.login-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.info-item .label {
  color: var(--text-secondary);
}

.login-prompt {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
}

.download-section {
  margin-bottom: 16px;
}

.download-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
}

.download-link:hover {
  border-color: var(--primary-color);
}

.download-link span {
  font-size: 32px;
}

.download-link p {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.tutorial-links {
  display: flex;
  gap: 20px;
}

.tutorial-links a {
  font-size: 13px;
  color: var(--primary-color);
}

.form-actions-bottom {
  padding-top: 20px;
}

.btn-save {
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}
</style>
