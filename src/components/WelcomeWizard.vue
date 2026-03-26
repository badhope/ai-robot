<template>
  <div class="welcome-wizard">
    <!-- 步骤指示器 -->
    <div class="steps-indicator">
      <div 
        v-for="(step, index) in steps" 
        :key="index" 
        class="step"
        :class="{ active: currentStep === index, completed: currentStep > index }"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-label">{{ step.label }}</div>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤 1: 选择模式 -->
      <div v-if="currentStep === 0" class="step-panel">
        <h2>选择使用模式</h2>
        <p class="step-desc">根据你的需求选择合适的模式</p>
        
        <div class="mode-cards">
          <div 
            class="mode-card" 
            :class="{ selected: selectedMode === 'simple' }"
            @click="selectedMode = 'simple'"
          >
            <div class="mode-icon">🟢</div>
            <h3>简单模式</h3>
            <p>适合新手用户</p>
            <ul>
              <li>一键启动</li>
              <li>自动推荐设置</li>
              <li>最简配置</li>
            </ul>
          </div>
          
          <div 
            class="mode-card" 
            :class="{ selected: selectedMode === 'expert' }"
            @click="selectedMode = 'expert'"
          >
            <div class="mode-icon">🔧</div>
            <h3>专业模式</h3>
            <p>适合高级用户</p>
            <ul>
              <li>完整控制</li>
              <li>多平台 API</li>
              <li>高级配置</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 步骤 2: 选择 AI 平台 -->
      <div v-if="currentStep === 1" class="step-panel">
        <h2>选择 AI 平台</h2>
        <p class="step-desc">选择你想使用的 AI 服务（可多选）</p>
        
        <div class="provider-grid">
          <div 
            v-for="provider in providers" 
            :key="provider.id"
            class="provider-card"
            :class="{ selected: selectedProviders.includes(provider.id) }"
            @click="toggleProvider(provider.id)"
          >
            <div class="provider-flag">{{ provider.flag }}</div>
            <h3>{{ provider.name }}</h3>
            <p>{{ provider.desc }}</p>
            <div class="provider-badge" v-if="provider.badge">{{ provider.badge }}</div>
          </div>
        </div>
      </div>

      <!-- 步骤 3: 配置 API Key -->
      <div v-if="currentStep === 2" class="step-panel">
        <h2>配置 API Key</h2>
        <p class="step-desc">填写所选平台的 API Key</p>
        
        <div class="api-config-list">
          <div 
            v-for="providerId in selectedProviders" 
            :key="providerId"
            class="api-config-item"
          >
            <div class="api-header">
              <h4>{{ getProviderInfo(providerId).name }}</h4>
              <a href="#" @click.prevent="openTutorial(providerId)" class="tutorial-link">
                如何获取？ →
              </a>
            </div>
            
            <div class="api-input-group">
              <input 
                :type="showApiKey[providerId] ? 'text' : 'password'"
                v-model="apiKeys[providerId]"
                :placeholder="'请输入 API Key'"
                class="api-input"
              />
              <button class="toggle-visibility" @click="toggleApiKeyVisibility(providerId)">
                {{ showApiKey[providerId] ? '🙈' : '👁️' }}
              </button>
            </div>
            
            <div class="api-actions">
              <button class="btn-test" @click="testConnection(providerId)">
                测试连接
              </button>
              <span class="test-result" :class="testResults[providerId]">
                {{ testResults[providerId] === 'success' ? '✓ 连接成功' : 
                   testResults[providerId] === 'failed' ? '✗ 连接失败' : '' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="tutorial-section" v-if="currentTutorialProvider">
          <div class="tutorial-header">
            <h4>📖 {{ getProviderInfo(currentTutorialProvider).name }} API Key 获取教程</h4>
            <button class="close-btn" @click="currentTutorialProvider = null">×</button>
          </div>
          <div class="tutorial-content">
            <ol>
              <li v-for="(step, index) in getProviderTutorial(currentTutorialProvider)" :key="index">
                {{ step }}
              </li>
            </ol>
            <a href="#" @click.prevent="openExternal(getProviderInfo(currentTutorialProvider).url)" class="external-link">
              打开官网 →
            </a>
          </div>
        </div>
      </div>

      <!-- 步骤 4: 准备 NapCatQQ -->
      <div v-if="currentStep === 3" class="step-panel">
        <h2>准备 QQ 机器人</h2>
        <p class="step-desc">配置 QQ 连接</p>
        
        <div class="napcat-section">
          <div class="napcat-status" :class="napcatStatus">
            <div class="status-icon">
              {{ napcatStatus === 'ready' ? '✅' : napcatStatus === 'downloading' ? '⏳' : '📦' }}
            </div>
            <div class="status-info">
              <h4>NapCatQQ</h4>
              <p>
                {{ napcatStatus === 'ready' ? '已准备就绪' : 
                   napcatStatus === 'downloading' ? '正在下载...' : '点击下载 NapCatQQ' }}
              </p>
            </div>
          </div>
          
          <div class="napcat-actions">
            <button 
              class="btn-download" 
              @click="downloadNapcat"
              :disabled="napcatStatus === 'downloading' || napcatStatus === 'ready'"
            >
              {{ napcatStatus === 'ready' ? '已下载' : 
                 napcatStatus === 'downloading' ? '下载中...' : '下载 NapCatQQ' }}
            </button>
            
            <button 
              class="btn-launch"
              @click="launchNapcat"
              :disabled="napcatStatus !== 'ready'"
            >
              启动 NapCatQQ
            </button>
          </div>
          
          <div class="napcat-progress" v-if="napcatStatus === 'downloading'">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: downloadProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ downloadProgress }}%</span>
          </div>
        </div>
        
        <div class="qq-login-section" v-if="napcatStatus === 'ready'">
          <h4>登录 QQ</h4>
          <p>启动 NapCatQQ 后，用手机 QQ 扫码登录</p>
          <div class="qr-placeholder">
            <div class="qr-status" :class="qqLoginStatus">
              {{ qqLoginStatus === 'waiting' ? '等待扫码...' : 
                 qqLoginStatus === 'scanned' ? '请在手机确认登录' :
                 qqLoginStatus === 'logged' ? '✓ 登录成功' : '请启动 NapCatQQ' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 5: 完成 -->
      <div v-if="currentStep === 4" class="step-panel">
        <div class="complete-icon">🎉</div>
        <h2>配置完成！</h2>
        <p class="step-desc">一切准备就绪，开始使用 AI Robot 吧</p>
        
        <div class="summary">
          <h4>配置摘要</h4>
          <div class="summary-item">
            <span class="label">模式:</span>
            <span class="value">{{ selectedMode === 'simple' ? '简单模式' : '专业模式' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">AI 平台:</span>
            <span class="value">{{ selectedProviders.map(p => getProviderInfo(p).name).join(', ') }}</span>
          </div>
          <div class="summary-item">
            <span class="label">QQ 状态:</span>
            <span class="value">{{ qqLoginStatus === 'logged' ? '已连接' : '待连接' }}</span>
          </div>
        </div>
        
        <div class="next-steps">
          <h4>接下来</h4>
          <ol>
            <li>点击「完成」进入主界面</li>
            <li>点击「启动机器人」开始运行</li>
            <li>在 QQ 群发送 <code>@机器人 你好</code> 测试</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- 导航按钮 -->
    <div class="wizard-nav">
      <button 
        class="btn-back" 
        @click="prevStep"
        v-if="currentStep > 0"
      >
        ← 上一步
      </button>
      <div class="nav-spacer"></div>
      <button 
        class="btn-next" 
        @click="nextStep"
        :disabled="!canProceed"
      >
        {{ currentStep === steps.length - 1 ? '完成' : '下一步 →' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '../stores/app'

const emit = defineEmits<{
  complete: []
}>()

const store = useAppStore()

const steps = [
  { label: '选择模式' },
  { label: '选择平台' },
  { label: '配置 API' },
  { label: '准备 QQ' },
  { label: '完成' }
]

const currentStep = ref(0)
const selectedMode = ref<'simple' | 'expert'>('simple')
const selectedProviders = ref<string[]>(['alibaba'])
const apiKeys = reactive<Record<string, string>>({})
const showApiKey = reactive<Record<string, boolean>>({})
const testResults = reactive<Record<string, 'success' | 'failed' | 'pending'>>({})
const currentTutorialProvider = ref<string | null>(null)
const napcatStatus = ref<'idle' | 'downloading' | 'ready'>('idle')
const downloadProgress = ref(0)
const qqLoginStatus = ref<'waiting' | 'scanned' | 'logged' | 'idle'>('idle')

const providers = [
  { id: 'alibaba', name: '阿里云通义', flag: '🇨🇳', desc: '推荐，响应快速', badge: '推荐', url: 'https://bailian.console.aliyun.com/' },
  { id: 'deepseek', name: 'DeepSeek', flag: '🇨🇳', desc: '性价比高', badge: '热门', url: 'https://platform.deepseek.com/' },
  { id: 'zhipu', name: '智谱 AI', flag: '🇨🇳', desc: '国产大模型', url: 'https://open.bigmodel.cn/' },
  { id: 'moonshot', name: '月之暗面', flag: '🇨🇳', desc: '长文本能力强', url: 'https://platform.moonshot.cn/' },
  { id: 'openai', name: 'OpenAI', flag: '🌍', desc: 'GPT-4', url: 'https://platform.openai.com/' },
  { id: 'google', name: 'Google Gemini', flag: '🌍', desc: '免费额度大', url: 'https://ai.google.dev/' },
  { id: 'ollama', name: '本地 Ollama', flag: '💻', desc: '免费离线，需要显卡', url: 'https://ollama.com/' }
]

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: return selectedMode.value !== null
    case 1: return selectedProviders.value.length > 0
    case 2: return selectedProviders.value.every(p => 
      p === 'ollama' || (apiKeys[p] && apiKeys[p].length > 0)
    )
    case 3: return napcatStatus.value === 'ready'
    default: return true
  }
})

function getProviderInfo(id: string) {
  return providers.find(p => p.id === id) || { name: id, url: '' }
}

function getProviderTutorial(id: string): string[] {
  const tutorials: Record<string, string[]> = {
    alibaba: [
      '打开阿里云百炼官网',
      '登录/注册阿里云账号',
      '开通 DashScope 服务',
      '点击左侧菜单「API-KEY 管理」',
      '点击「创建 API Key」并复制'
    ],
    deepseek: [
      '打开 DeepSeek 官网',
      '注册账号',
      '进入「API Keys」页面',
      '点击「创建 API Key」',
      '复制生成的 API Key'
    ],
    zhipu: [
      '打开智谱 AI 官网',
      '注册账号',
      '进入「API 密钥」页面',
      '点击「添加 API 密钥」',
      '复制生成的密钥'
    ],
    openai: [
      '打开 OpenAI 官网',
      '注册账号',
      '进入「API keys」页面',
      '点击「Create new secret key」',
      '复制生成的 API Key'
    ]
  }
  return tutorials[id] || ['请参考官网说明']
}

function toggleProvider(id: string) {
  const index = selectedProviders.value.indexOf(id)
  if (index > -1) {
    selectedProviders.value.splice(index, 1)
  } else {
    selectedProviders.value.push(id)
  }
}

function toggleApiKeyVisibility(id: string) {
  showApiKey[id] = !showApiKey[id]
}

async function testConnection(id: string) {
  testResults[id] = 'pending'
  const result = await store.testApiConnection(id)
  testResults[id] = result?.success ? 'success' : 'failed'
}

function openTutorial(id: string) {
  currentTutorialProvider.value = id
}

function openExternal(url: string) {
  window.electronAPI?.openExternal(url)
}

async function downloadNapcat() {
  napcatStatus.value = 'downloading'
  downloadProgress.value = 0
  
  // 模拟下载进度
  const interval = setInterval(() => {
    downloadProgress.value += 10
    if (downloadProgress.value >= 100) {
      clearInterval(interval)
      napcatStatus.value = 'ready'
    }
  }, 200)
  
  // 实际下载
  // const result = await window.electronAPI?.downloadNapcat()
  // if (result?.success) {
  //   napcatStatus.value = 'ready'
  // }
}

async function launchNapcat() {
  await window.electronAPI?.startNapcat()
  qqLoginStatus.value = 'waiting'
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    // 保存配置并完成
    await store.saveConfig({
      mode: selectedMode.value,
      isFirstRun: false,
      ai: {
        ...store.config?.ai!,
        provider: selectedProviders.value[0],
        providers: {
          ...store.config?.ai.providers,
          ...Object.fromEntries(
            selectedProviders.value.map(p => [p, {
              ...store.config?.ai.providers[p as keyof typeof store.config.ai.providers],
              apiKey: apiKeys[p] || '',
              enabled: true
            }])
          )
        }
      }
    })
    emit('complete')
  }
}
</script>

<style scoped>
.welcome-wizard {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: 40px;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-bottom: 40px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.step.active, .step.completed {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.step.active .step-number {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.step.completed .step-number {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.step-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.step.active .step-label {
  color: var(--text-primary);
  font-weight: 500;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.step-panel {
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.step-panel h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.step-desc {
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.mode-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-card:hover {
  border-color: var(--primary-color);
}

.mode-card.selected {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
}

.mode-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.mode-card h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.mode-card p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.mode-card ul {
  text-align: left;
  list-style: none;
  padding: 0;
}

.mode-card li {
  padding: 4px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.mode-card li::before {
  content: '✓ ';
  color: #22c55e;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.provider-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.provider-card:hover {
  border-color: var(--primary-color);
}

.provider-card.selected {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
}

.provider-flag {
  font-size: 24px;
  margin-bottom: 8px;
}

.provider-card h3 {
  font-size: 14px;
  margin-bottom: 4px;
}

.provider-card p {
  font-size: 12px;
  color: var(--text-secondary);
}

.provider-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--primary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.api-config-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 500px;
  margin: 0 auto;
  text-align: left;
}

.api-config-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.api-header h4 {
  font-size: 15px;
}

.tutorial-link {
  color: var(--primary-color);
  font-size: 13px;
  text-decoration: none;
}

.api-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.api-input {
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: var(--text-primary);
}

.toggle-visibility {
  background: var(--bg-hover);
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  cursor: pointer;
}

.api-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-test {
  background: var(--bg-hover);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text-primary);
}

.test-result {
  font-size: 13px;
}

.test-result.success {
  color: #22c55e;
}

.test-result.failed {
  color: #ef4444;
}

.tutorial-section {
  margin-top: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-hover);
}

.tutorial-header h4 {
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
}

.tutorial-content {
  padding: 20px;
  text-align: left;
}

.tutorial-content ol {
  padding-left: 20px;
}

.tutorial-content li {
  padding: 4px 0;
  color: var(--text-secondary);
}

.external-link {
  display: inline-block;
  margin-top: 16px;
  color: var(--primary-color);
  text-decoration: none;
}

.napcat-section {
  max-width: 400px;
  margin: 0 auto;
}

.napcat-status {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.napcat-status.ready {
  border-color: #22c55e;
}

.status-icon {
  font-size: 32px;
}

.status-info h4 {
  margin-bottom: 4px;
}

.status-info p {
  color: var(--text-secondary);
  font-size: 13px;
}

.napcat-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-download, .btn-launch {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download {
  background: var(--primary-color);
  color: white;
}

.btn-download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-launch {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-launch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.napcat-progress {
  margin-top: 16px;
}

.progress-bar {
  height: 4px;
  background: var(--bg-hover);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.2s;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  display: block;
  text-align: center;
}

.qq-login-section {
  margin-top: 32px;
}

.qr-placeholder {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 60px;
  margin-top: 16px;
}

.qr-status {
  font-size: 14px;
}

.qr-status.logged {
  color: #22c55e;
}

.complete-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.summary {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  max-width: 400px;
  margin: 0 auto 24px;
}

.summary h4 {
  margin-bottom: 16px;
  text-align: center;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  color: var(--text-secondary);
}

.next-steps {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.next-steps h4 {
  margin-bottom: 12px;
}

.next-steps ol {
  padding-left: 20px;
}

.next-steps li {
  padding: 8px 0;
  color: var(--text-secondary);
}

.next-steps code {
  background: var(--bg-card);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--primary-color);
}

.wizard-nav {
  display: flex;
  justify-content: space-between;
  padding-top: 40px;
}

.btn-back, .btn-next {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back {
  background: var(--bg-card);
  color: var(--text-primary);
}

.btn-next {
  background: var(--primary-color);
  color: white;
}

.btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-spacer {
  flex: 1;
}

@media (max-width: 768px) {
  .provider-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mode-cards {
    grid-template-columns: 1fr;
  }
}
</style>
