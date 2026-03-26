<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="upgrade-modal">
        <button class="close-btn" @click="$emit('close')">×</button>
        
        <div class="modal-header">
          <h2>升级专业版</h2>
          <p>解锁更多强大功能</p>
        </div>
        
        <div class="plans-grid">
          <div class="plan-card free">
            <div class="plan-header">
              <span class="plan-badge free-badge">免费版</span>
              <h3>基础功能</h3>
            </div>
            <ul class="plan-features">
              <li><CheckIcon /> 每日 1000 次对话</li>
              <li><CheckIcon /> 基础 AI 模型</li>
              <li><CheckIcon /> 群聊/私聊回复</li>
              <li><CheckIcon /> 基础插件</li>
              <li class="disabled"><XIcon /> 图片识别</li>
              <li class="disabled"><XIcon /> 语音回复</li>
              <li class="disabled"><XIcon /> 高级插件</li>
            </ul>
            <div class="plan-footer">
              <span class="current-plan">当前方案</span>
            </div>
          </div>
          
          <div class="plan-card pro">
            <div class="plan-header">
              <span class="plan-badge pro-badge">专业版</span>
              <h3>全功能解锁</h3>
            </div>
            <ul class="plan-features">
              <li><CheckIcon class="check-green" /> 无限对话次数</li>
              <li><CheckIcon class="check-green" /> 所有 AI 模型</li>
              <li><CheckIcon class="check-green" /> 图片识别</li>
              <li><CheckIcon class="check-green" /> 语音回复</li>
              <li><CheckIcon class="check-green" /> 所有插件免费</li>
              <li><CheckIcon class="check-green" /> 优先技术支持</li>
              <li><CheckIcon class="check-green" /> 多账号管理</li>
            </ul>
            <div class="plan-footer">
              <div class="plan-prices">
                <span class="price">¥99</span>
                <span class="period">/年</span>
              </div>
              <button class="upgrade-btn" @click="showPayment">
                立即升级
              </button>
            </div>
          </div>
        </div>
        
        <div class="activation-section" v-if="!showPaymentForm">
          <p>已有激活码？</p>
          <div class="activation-input">
            <input 
              type="text" 
              v-model="activationKey" 
              placeholder="请输入激活码"
            />
            <button @click="activate">激活</button>
          </div>
          <p class="activation-error" v-if="activationError">{{ activationError }}</p>
        </div>
        
        <div class="purchase-channels" v-if="!showPaymentForm">
          <h4>购买渠道</h4>
          <div class="channel-list">
            <a href="#" class="channel" @click.prevent="openExternal('https://ai-robot.dev')">
              <span>🌐</span> 官方网站
            </a>
            <a href="#" class="channel" @click.prevent="openExternal('https://淘宝.com')">
              <span>🛒</span> 淘宝店铺
            </a>
            <a href="#" class="channel">
              <span>💬</span> 微信客服
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import CheckIcon from './icons/CheckIcon.vue'
import XIcon from './icons/XIcon.vue'

const emit = defineEmits<{
  close: []
}>()

const store = useAppStore()

const activationKey = ref('')
const activationError = ref('')
const showPaymentForm = ref(false)

function showPayment() {
  showPaymentForm.value = true
}

async function activate() {
  if (!activationKey.value.trim()) {
    activationError.value = '请输入激活码'
    return
  }
  
  const result = await store.activateLicense(activationKey.value)
  if (result?.success) {
    emit('close')
  } else {
    activationError.value = result?.message || '激活码无效'
  }
}

function openExternal(url: string) {
  window.electronAPI?.openExternal(url)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 1, 1, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  max-width: 800px;
  width: 90%;
}

.upgrade-modal {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-header {
  text-align: center;
  padding: 40px 40px 30px;
}

.modal-header h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.modal-header p {
  color: var(--text-secondary);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 0 40px 40px;
}

.plan-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.plan-card:hover {
  border-color: var(--primary-color);
}

.plan-card.pro {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.plan-header {
  text-align: center;
  margin-bottom: 20px;
}

.plan-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.free-badge {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.pro-badge {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
}

.plan-header h3 {
  font-size: 20px;
  margin-bottom: 4px;
}

.plan-features {
  list-style: none;
  margin-bottom: 24px;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  color: var(--text-secondary);
}

.plan-features li.disabled {
  opacity: 0.4;
}

.check-green {
  color: #22c55e;
}

.plan-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.current-plan {
  color: var(--text-secondary);
  font-size: 13px;
}

.plan-prices {
  margin-bottom: 16px;
}

.price {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.period {
  color: var(--text-secondary);
}

.upgrade-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

.activation-section {
  text-align: center;
  padding: 20px 40px;
  border-top: 1px solid var(--border-color);
}

.activation-section p {
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.activation-input {
  display: flex;
  gap: 12px;
}

.activation-input input {
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-primary);
}

.activation-input button {
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.activation-error {
  color: var(--error-color);
  font-size: 13px;
  margin-top: 8px;
}

.purchase-channels {
  padding: 20px 40px 40px;
  border-top: 1px solid var(--border-color);
}

.purchase-channels h4 {
  text-align: center;
  margin-bottom: 16px;
}

.channel-list {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.channel {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
}

.channel:hover {
  color: var(--primary-color);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
