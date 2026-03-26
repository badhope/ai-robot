<template>
  <div class="chat-view">
    <header class="page-header">
      <h1>对话记录</h1>
      <div class="header-actions">
        <select v-model="filterRoom" class="filter-select">
          <option value="">全部群聊</option>
          <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.name }}</option>
        </select>
        <button class="btn-export" @click="exportChats">导出记录</button>
      </div>
    </header>

    <div class="chat-container">
      <div class="chat-sidebar">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索对话..." />
        </div>
        <div class="room-list">
          <div 
            v-for="room in filteredRooms" 
            :key="room.id"
            class="room-item"
            :class="{ active: selectedRoom === room.id }"
            @click="selectedRoom = room.id"
          >
            <div class="room-avatar">{{ room.name[0] }}</div>
            <div class="room-info">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-last-message">{{ room.lastMessage }}</div>
            </div>
            <div class="room-meta">
              <span class="room-time">{{ room.lastTime }}</span>
              <span class="room-count">{{ room.messageCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="filteredMessages.length === 0" class="empty-state">
            暂无对话记录
          </div>
          <div 
            v-for="message in filteredMessages" 
            :key="message.id"
            class="message-item"
            :class="message.role"
          >
            <div class="message-avatar">
              {{ message.senderName[0] }}
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{ message.senderName }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const filterRoom = ref('')
const searchQuery = ref('')
const selectedRoom = ref<string | null>(null)

const rooms = ref([
  { id: '1', name: '技术交流群', lastMessage: '好的，我来看看', lastTime: '12:35', messageCount: 156 },
  { id: '2', name: '闲聊群', lastMessage: '这个很有趣！', lastTime: '11:20', messageCount: 89 },
])

const messages = ref([
  { id: '1', roomId: '1', senderName: '小明', role: 'user', content: '@机器人 如何学习 Python？', timestamp: Date.now() - 3600000 },
  { id: '2', roomId: '1', senderName: 'AI Robot', role: 'assistant', content: '推荐从基础语法开始，可以试试以下路线：\n1. 学习基础语法（变量、条件、循环）\n2. 学习函数和模块\n3. 实践小项目\n4. 学习常用框架如 Flask、Django', timestamp: Date.now() - 3500000 },
])

const filteredRooms = computed(() => {
  if (!searchQuery.value) return rooms.value
  return rooms.value.filter(r => r.name.includes(searchQuery.value))
})

const filteredMessages = computed(() => {
  let result = messages.value
  if (filterRoom.value) {
    result = result.filter(m => m.roomId === filterRoom.value)
  }
  if (selectedRoom.value) {
    result = result.filter(m => m.roomId === selectedRoom.value)
  }
  return result.sort((a, b) => a.timestamp - b.timestamp)
})

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function exportChats() {
  // TODO: 导出对话记录
}
</script>

<style scoped>
.chat-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-select {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--text-primary);
}

.btn-export {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--text-primary);
  cursor: pointer;
}

.chat-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.chat-sidebar {
  width: 280px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 12px;
}

.search-box input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  color: var(--text-primary);
}

.room-list {
  flex: 1;
  overflow-y: auto;
}

.room-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.room-item:hover {
  background: var(--bg-hover);
}

.room-item.active {
  background: var(--primary-color);
}

.room-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.room-info {
  flex: 1;
  overflow: hidden;
}

.room-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.room-last-message {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-meta {
  text-align: right;
}

.room-time {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}

.room-count {
  display: inline-block;
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  margin-top: 4px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 60px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-item.assistant .message-avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
}

.message-item.user .message-avatar {
  background: var(--bg-hover);
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-header {
  margin-bottom: 4px;
}

.message-sender {
  font-weight: 500;
  margin-right: 8px;
}

.message-time {
  font-size: 12px;
  color: var(--text-muted);
}

.message-text {
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
