<template>
  <div class="advanced-settings">
    <h2>高级设置</h2>
    
    <div class="settings-section">
      <h3>存储设置</h3>
      
      <div class="form-group">
        <label>会话存储方式</label>
        <select v-model="sessionStorage">
          <option value="sqlite">SQLite（持久化）</option>
          <option value="memory">内存（开发用）</option>
        </select>
      </div>

      <div class="form-group" v-if="sessionStorage === 'sqlite'">
        <label>数据库路径</label>
        <div class="input-with-btn">
          <input type="text" v-model="dbPath" />
          <button class="btn-browse" @click="browseDbPath">浏览...</button>
        </div>
      </div>

      <div class="form-group">
        <label>最大消息数</label>
        <input type="number" v-model="maxMessages" />
        <p class="form-hint">每个会话保留的最大消息数量</p>
      </div>
    </div>

    <div class="settings-section">
      <h3>日志设置</h3>
      
      <div class="form-group">
        <label>日志级别</label>
        <select v-model="logLevel">
          <option value="debug">Debug（调试）</option>
          <option value="info">Info（信息）</option>
          <option value="warn">Warn（警告）</option>
          <option value="error">Error（错误）</option>
        </select>
      </div>

      <div class="form-group">
        <label>日志文件路径</label>
        <input type="text" v-model="logPath" />
      </div>
    </div>

    <div class="settings-section">
      <h3>应用设置</h3>
      
      <div class="toggle-group">
        <label class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">开机自启动</span>
            <span class="toggle-desc">系统启动时自动运行</span>
          </div>
          <input type="checkbox" v-model="autoStart" />
          <span class="toggle-switch"></span>
        </label>

        <label class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">最小化到托盘</span>
            <span class="toggle-desc">关闭窗口时最小化到系统托盘</span>
          </div>
          <input type="checkbox" v-model="minimizeToTray" />
          <span class="toggle-switch"></span>
        </label>

        <label class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">自动检查更新</span>
            <span class="toggle-desc">启动时检查新版本</span>
          </div>
          <input type="checkbox" v-model="autoUpdate" />
          <span class="toggle-switch"></span>
        </label>
      </div>
    </div>

    <div class="settings-section danger-zone">
      <h3>危险操作</h3>
      
      <div class="danger-item">
        <div class="danger-info">
          <span class="danger-title">清空所有会话</span>
          <span class="danger-desc">删除所有聊天记录，此操作不可恢复</span>
        </div>
        <button class="btn-danger" @click="clearSessions">清空会话</button>
      </div>

      <div class="danger-item">
        <div class="danger-info">
          <span class="danger-title">重置所有设置</span>
          <span class="danger-desc">恢复默认设置，保留会话记录</span>
        </div>
        <button class="btn-danger" @click="resetSettings">重置设置</button>
      </div>

      <div class="danger-item">
        <div class="danger-info">
          <span class="danger-title">清除所有数据</span>
          <span class="danger-desc">删除所有数据和设置，恢复初始状态</span>
        </div>
        <button class="btn-danger-outline" @click="clearAll">清除全部</button>
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

const sessionStorage = ref('sqlite')
const dbPath = ref('./data/sessions.db')
const maxMessages = ref(100)
const logLevel = ref('info')
const logPath = ref('./logs/app.log')
const autoStart = ref(false)
const minimizeToTray = ref(true)
const autoUpdate = ref(true)

async function browseDbPath() {
  const path = await window.electronAPI?.selectDirectory()
  if (path) {
    dbPath.value = path + '/sessions.db'
  }
}

async function clearSessions() {
  if (confirm('确定要清空所有会话记录吗？此操作不可恢复！')) {
    // TODO: 清空会话
  }
}

async function resetSettings() {
  if (confirm('确定要重置所有设置吗？')) {
    // TODO: 重置设置
  }
}

async function clearAll() {
  if (confirm('确定要清除所有数据吗？此操作将恢复到初始状态！')) {
    // TODO: 清除所有数据
  }
}

async function saveSettings() {
  await store.saveConfig({
    advanced: {
      sessionStorage: sessionStorage.value as 'sqlite' | 'memory',
      dbPath: dbPath.value,
      maxMessages: maxMessages.value,
      logLevel: logLevel.value as 'debug' | 'info' | 'warn' | 'error'
    },
    autoStart: autoStart.value,
    minimizeToTray: minimizeToTray.value
  })
}
</script>

<style scoped>
.advanced-settings {
  max-width: 600px;
}

.settings-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.settings-section.danger-zone {
  border-color: #ef4444;
}

.settings-section h3 {
  font-size: 15px;
  margin-bottom: 16px;
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

.form-group input,
.form-group select {
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

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn input {
  flex: 1;
}

.btn-browse {
  background: var(--bg-hover);
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  color: var(--text-primary);
  cursor: pointer;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  cursor: pointer;
}

.toggle-info {
  flex: 1;
}

.toggle-title {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
}

.toggle-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.toggle-item input {
  display: none;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: var(--bg-hover);
  border-radius: 12px;
  position: relative;
  transition: all 0.2s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s;
}

.toggle-item input:checked + .toggle-switch {
  background: var(--primary-color);
}

.toggle-item input:checked + .toggle-switch::after {
  transform: translateX(20px);
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(239, 68, 68, 0.05);
  border-radius: 8px;
  margin-bottom: 12px;
}

.danger-item:last-child {
  margin-bottom: 0;
}

.danger-info {
  flex: 1;
}

.danger-title {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
}

.danger-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.btn-danger {
  background: #ef4444;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
}

.btn-danger-outline {
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 6px;
  padding: 8px 16px;
  color: #ef4444;
  cursor: pointer;
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
