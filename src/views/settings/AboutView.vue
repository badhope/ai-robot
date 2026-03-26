<template>
  <div class="about-view">
    <div class="about-header">
      <StarLogo :size="80" />
      <h1>AI Robot</h1>
      <p class="version">v2.0.0</p>
      <p class="tagline">智能群聊助手，探索无限可能</p>
    </div>

    <div class="about-sections">
      <div class="about-section">
        <h3>关于软件</h3>
        <p>AI Robot 是一款智能 QQ 群聊助手，支持多平台 AI API，让你轻松拥有一个智能群聊机器人。</p>
      </div>

      <div class="about-section">
        <h3>当前版本</h3>
        <div class="version-info">
          <div class="info-row">
            <span>版本号</span>
            <span>2.0.0</span>
          </div>
          <div class="info-row">
            <span>发布日期</span>
            <span>2024-03-26</span>
          </div>
          <div class="info-row">
            <span>Electron</span>
            <span>v35.0.0</span>
          </div>
          <div class="info-row">
            <span>Node.js</span>
            <span>v22.0.0</span>
          </div>
        </div>
        <button class="btn-check-update" @click="checkUpdate">检查更新</button>
      </div>

      <div class="about-section">
        <h3>许可证</h3>
        <div class="license-info" :class="licenseType">
          <div class="license-icon">{{ licenseType === 'pro' ? '👑' : '🆓' }}</div>
          <div class="license-detail">
            <h4>{{ licenseType === 'pro' ? '专业版' : '免费版' }}</h4>
            <p v-if="licenseType === 'pro'">有效期至：{{ licenseExpiry }}</p>
            <p v-else>升级专业版解锁更多功能</p>
          </div>
        </div>
        <button class="btn-upgrade" v-if="licenseType !== 'pro'" @click="goUpgrade">升级专业版</button>
      </div>

      <div class="about-section">
        <h3>相关链接</h3>
        <div class="links-grid">
          <a href="#" class="link-item" @click.prevent="openExternal('https://github.com/badhope/ai-robot')">
            <span class="link-icon">📦</span>
            <span>GitHub</span>
          </a>
          <a href="#" class="link-item" @click.prevent="openExternal('https://ai-robot.dev')">
            <span class="link-icon">🌐</span>
            <span>官方网站</span>
          </a>
          <a href="#" class="link-item" @click.prevent="openExternal('https://github.com/badhope/ai-robot/wiki')">
            <span class="link-icon">📖</span>
            <span>使用文档</span>
          </a>
          <a href="#" class="link-item" @click.prevent="openExternal('https://github.com/badhope/ai-robot/issues')">
            <span class="link-icon">🐛</span>
            <span>问题反馈</span>
          </a>
        </div>
      </div>

      <div class="about-section">
        <h3>开源协议</h3>
        <p class="license-text">
          本软件部分代码基于开源协议发布。
          <br />
          查看完整的 <a href="#" @click.prevent="openLicense">许可协议</a>。
        </p>
      </div>
    </div>

    <footer class="about-footer">
      <p>© 2024 AI Robot Team. All rights reserved.</p>
      <p>Made with ❤️ in China</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/app'
import StarLogo from '../../components/icons/StarLogo.vue'

const router = useRouter()
const store = useAppStore()

const licenseType = computed(() => store.license?.type || 'free')
const licenseExpiry = computed(() => store.license?.expiresAt || '')

function openExternal(url: string) {
  window.electronAPI?.openExternal(url)
}

function checkUpdate() {
  // TODO: 检查更新
}

function goUpgrade() {
  router.push('/')
  // 触发升级弹窗
}

function openLicense() {
  window.electronAPI?.openExternal('https://github.com/badhope/ai-robot/blob/main/LICENSE')
}
</script>

<style scoped>
.about-view {
  max-width: 600px;
}

.about-header {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  border-radius: 16px;
  margin-bottom: 24px;
}

.about-header h1 {
  font-size: 28px;
  margin-top: 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.version {
  color: var(--text-muted);
  margin: 8px 0;
}

.tagline {
  color: var(--text-secondary);
}

.about-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.about-section h3 {
  font-size: 15px;
  margin-bottom: 12px;
}

.about-section p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.version-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span:first-child {
  color: var(--text-secondary);
}

.btn-check-update {
  background: var(--bg-hover);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: var(--text-primary);
  cursor: pointer;
  width: 100%;
}

.license-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  margin-bottom: 12px;
}

.license-info.pro {
  background: rgba(245, 158, 11, 0.1);
}

.license-icon {
  font-size: 32px;
}

.license-detail h4 {
  margin-bottom: 4px;
}

.license-detail p {
  font-size: 12px;
}

.btn-upgrade {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  border: none;
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s;
}

.link-item:hover {
  background: var(--bg-hover);
}

.link-icon {
  font-size: 20px;
}

.license-text {
  font-size: 13px;
}

.license-text a {
  color: var(--primary-color);
}

.about-footer {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
