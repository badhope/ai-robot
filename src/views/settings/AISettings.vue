<template>
  <div class="ai-settings">
    <h2>AI 模型配置</h2>
    
    <div class="settings-section">
      <h3>当前 AI 平台</h3>
      <div class="provider-selector">
        <div 
          v-for="provider in providers" 
          :key="provider.id"
          class="provider-option"
          :class="{ active: currentProvider === provider.id }"
          @click="selectProvider(provider.id)"
        >
          <span class="provider-flag">{{ provider.flag }}</span>
          <span class="provider-name">{{ provider.name }}</span>
          <span class="provider-badge" v-if="provider.badge">{{ provider.badge }}</span>
        </div>
      </div>
    </div>

    <div class="settings-section" v-if="currentProviderConfig">
      <h3>{{ getProviderInfo(currentProvider).name }} 配置</h3>
      
      <div class="form-group">
        <label>API Key</label>
        <div class="input-group">
          <input 
            :type="showApiKey ? 'text' : 'password'"
            v-model="apiKey"
            placeholder="请输入 API Key"
          />
          <button class="btn-toggle" @click="showApiKey = !showApiKey">
            {{ showApiKey ? '🙈' : '👁️' }}
          </button>
        </div>
        <a href="#" class="help-link" @click.prevent="openTutorial">如何获取 API Key？</a>
      </div>

      <div class="form-group" v-if="currentProvider !== 'ollama'">
        <label>Base URL</label>
        <input type="text" v-model="baseUrl" placeholder="API Base URL" />
      </div>

      <div class="form-group">
        <label>模型</label>
        <select v-model="model">
          <option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>

      <div class="form-actions">
        <button class="btn-test" @click="testConnection">测试连接</button>
        <span class="test-result" :class="testResult">{{ testMessage }}</span>
      </div>
    </div>

    <div class="settings-section">
      <h3>模型参数</h3>
      
      <div class="form-group">
        <label>温度 (Temperature)</label>
        <div class="range-group">
          <input type="range" v-model="temperature" min="0" max="2" step="0.1" />
          <span class="range-value">{{ temperature }}</span>
        </div>
        <p class="form-hint">越高越随机，越低越确定。建议 0.7</p>
      </div>

      <div class="form-group">
        <label>最大 Token</label>
        <input type="number" v-model="maxTokens" />
        <p class="form-hint">单次回复的最大长度</p>
      </div>

      <div class="form-group">
        <label>上下文长度</label>
        <input type="number" v-model="contextLength" />
        <p class="form-hint">保留的历史消息数量</p>
      </div>
    </div>

    <div class="settings-section" v-if="!isSimpleMode">
      <h3>备用平台（负载均衡）</h3>
      <p class="section-desc">配置多个平台可以分散请求压力</p>
      
      <div class="backup-providers">
        <div 
          v-for="provider in backupProviders" 
          :key="provider.id"
          class="backup-item"
        >
          <label class="checkbox-label">
            <input type="checkbox" v-model="provider.enabled" />
            {{ provider.name }}
          </label>
          <input 
            type="range" 
            v-model="provider.weight" 
            min="0" 
            max="100" 
            step="10"
            :disabled="!provider.enabled"
          />
          <span class="weight-value">{{ provider.weight }}%</span>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Prompt 模板</h3>
      
      <div class="form-group">
        <label>当前模板</label>
        <select v-model="promptTemplate">
          <option value="friendly">友好助手</option>
          <option value="tech">技术专家</option>
          <option value="concise">群聊简洁</option>
          <option value="active">群聊活跃</option>
          <option value="custom">自定义</option>
        </select>
      </div>

      <div class="form-group" v-if="promptTemplate === 'custom'">
        <label>自定义系统提示词</label>
        <textarea v-model="customPrompt" rows="5" placeholder="输入自定义的系统提示词..."></textarea>
      </div>
    </div>

    <div class="form-actions-bottom">
      <button class="btn-save" @click="saveSettings">保存设置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '../../stores/app'

const store = useAppStore()

const isSimpleMode = computed(() => store.mode === 'simple')
const currentProvider = computed(() => store.aiProvider)

const providers = [
  { id: 'alibaba', name: '阿里云通义', flag: '🇨🇳', badge: '推荐' },
  { id: 'deepseek', name: 'DeepSeek', flag: '🇨🇳', badge: '热门' },
  { id: 'zhipu', name: '智谱 AI', flag: '🇨🇳' },
  { id: 'moonshot', name: '月之暗面', flag: '🇨🇳' },
  { id: 'openai', name: 'OpenAI', flag: '🌍' },
  { id: 'google', name: 'Google', flag: '🌍' },
  { id: 'ollama', name: '本地 Ollama', flag: '💻' },
]

const showApiKey = ref(false)
const apiKey = ref('')
const baseUrl = ref('')
const model = ref('')
const temperature = ref(0.7)
const maxTokens = ref(2048)
const contextLength = ref(20)
const promptTemplate = ref('friendly')
const customPrompt = ref('')
const testResult = ref<'success' | 'failed' | ''>('')
const testMessage = ref('')

const backupProviders = reactive([
  { id: 'alibaba', name: '阿里云', enabled: true, weight: 50 },
  { id: 'deepseek', name: 'DeepSeek', enabled: false, weight: 30 },
  { id: 'zhipu', name: '智谱', enabled: false, weight: 20 },
])

const currentProviderConfig = computed(() => {
  return store.config?.ai?.providers?.[currentProvider.value as keyof typeof store.config.ai.providers]
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
  return models[currentProvider.value] || []
})

function getProviderInfo(id: string) {
  return providers.find(p => p.id === id) || { name: id, flag: '' }
}

function selectProvider(id: string) {
  // 切换 provider
  model.value = availableModels.value[0]
}

function openTutorial() {
  window.electronAPI?.openExternal(getProviderInfo(currentProvider.value).url || '')
}

async function testConnection() {
  testResult.value = ''
  testMessage.value = '测试中...'
  
  const result = await store.testApiConnection(currentProvider.value)
  testResult.value = result?.success ? 'success' : 'failed'
  testMessage.value = result?.success ? '✓ 连接成功' : '✗ 连接失败'
}

async function saveSettings() {
  await store.saveConfig({
    ai: {
      ...store.config?.ai!,
      provider: currentProvider.value,
      providers: {
        ...store.config?.ai.providers,
        [currentProvider.value]: {
          ...currentProviderConfig.value,
          apiKey: apiKey.value,
          baseUrl: baseUrl.value,
          model: model.value,
        }
      },
      temperature: temperature.value,
      maxTokens: maxTokens.value,
      contextLength: contextLength.value
    }
  })
}
</script>

<style scoped>
.ai-settings {
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

.provider-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.provider-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.provider-option:hover {
  border-color: var(--primary-color);
}

.provider-option.active {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
}

.provider-flag {
  font-size: 20px;
}

.provider-name {
  flex: 1;
  font-size: 13px;
}

.provider-badge {
  background: var(--primary-color);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group input {
  flex: 1;
}

.btn-toggle {
  background: var(--bg-hover);
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  cursor: pointer;
}

.help-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--primary-color);
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.range-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-group input[type="range"] {
  flex: 1;
}

.range-value {
  font-size: 14px;
  color: var(--text-secondary);
  min-width: 32px;
  text-align: right;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  margin-top: 16px;
}

.btn-test {
  background: var(--bg-hover);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: var(--text-primary);
  cursor: pointer;
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

.backup-providers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.backup-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.backup-item input[type="range"] {
  width: 100px;
}

.weight-value {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 40px;
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

.btn-save:hover {
  background: var(--primary-hover);
}
</style>
