<template>
  <div class="bot-settings">
    <h2>机器人设置</h2>
    
    <div class="settings-section">
      <h3>基础设置</h3>
      
      <div class="form-group">
        <label>机器人名称</label>
        <input type="text" v-model="botName" placeholder="AI Robot" />
      </div>

      <div class="form-group">
        <label>触发方式</label>
        <div class="trigger-options">
          <label class="radio-label">
            <input type="radio" v-model="triggerMode" value="at" />
            @机器人
          </label>
          <label class="radio-label">
            <input type="radio" v-model="triggerMode" value="prefix" />
            /ai 命令
          </label>
          <label class="radio-label">
            <input type="radio" v-model="triggerMode" value="both" />
            两者都支持
          </label>
        </div>
      </div>

      <div class="form-group" v-if="triggerMode !== 'at'">
        <label>命令前缀</label>
        <input type="text" v-model="prefix" placeholder="/ai" />
      </div>
    </div>

    <div class="settings-section">
      <h3>回复设置</h3>
      
      <div class="toggle-group">
        <label class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">私聊自动回复</span>
            <span class="toggle-desc">收到私聊消息时自动回复</span>
          </div>
          <input type="checkbox" v-model="privateAutoReply" />
          <span class="toggle-switch"></span>
        </label>

        <label class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">群聊 @ 回复</span>
            <span class="toggle-desc">被 @ 时回复消息</span>
          </div>
          <input type="checkbox" v-model="groupAtReply" />
          <span class="toggle-switch"></span>
        </label>

        <label class="toggle-item" :class="{ disabled: !isPro }">
          <div class="toggle-info">
            <span class="toggle-title">图片识别 {{ !isPro ? '(专业版)' : '' }}</span>
            <span class="toggle-desc">识别图片内容并回复</span>
          </div>
          <input type="checkbox" v-model="imageRecognition" :disabled="!isPro" />
          <span class="toggle-switch"></span>
        </label>

        <label class="toggle-item" :class="{ disabled: !isPro }">
          <div class="toggle-info">
            <span class="toggle-title">语音回复 {{ !isPro ? '(专业版)' : '' }}</span>
            <span class="toggle-desc">将文字转换为语音回复</span>
          </div>
          <input type="checkbox" v-model="voiceReply" :disabled="!isPro" />
          <span class="toggle-switch"></span>
        </label>
      </div>
    </div>

    <div class="settings-section">
      <h3>回复格式</h3>
      
      <div class="form-group">
        <label>回复前缀</label>
        <input type="text" v-model="replyPrefix" placeholder="留空则无前缀" />
        <p class="form-hint">例如：[AI回复] 会在每条回复前添加</p>
      </div>

      <div class="form-group">
        <label>回复后缀</label>
        <input type="text" v-model="replySuffix" placeholder="留空则无后缀" />
      </div>
    </div>

    <div class="settings-section">
      <h3>黑名单设置</h3>
      
      <div class="form-group">
        <label>屏蔽的用户 QQ 号（每行一个）</label>
        <textarea v-model="blockedUsers" rows="4" placeholder="12345678&#10;87654321"></textarea>
      </div>

      <div class="form-group">
        <label>屏蔽的群号（每行一个）</label>
        <textarea v-model="blockedGroups" rows="4" placeholder="123456789&#10;987654321"></textarea>
      </div>
    </div>

    <div class="form-actions-bottom">
      <button class="btn-save" @click="saveSettings">保存设置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/app'

const store = useAppStore()
const isPro = computed(() => store.isPro)

const botName = ref('AI Robot')
const triggerMode = ref<'at' | 'prefix' | 'both'>('both')
const prefix = ref('/ai')
const privateAutoReply = ref(true)
const groupAtReply = ref(true)
const imageRecognition = ref(false)
const voiceReply = ref(false)
const replyPrefix = ref('')
const replySuffix = ref('')
const blockedUsers = ref('')
const blockedGroups = ref('')

async function saveSettings() {
  await store.saveConfig({
    bot: {
      name: botName.value,
      triggerMode: triggerMode.value,
      prefix: prefix.value,
      privateAutoReply: privateAutoReply.value
    }
  })
}
</script>

<style scoped>
.bot-settings {
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.form-group input[type="text"],
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
  font-family: monospace;
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.trigger-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
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

.toggle-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
