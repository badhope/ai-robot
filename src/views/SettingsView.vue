<template>
  <div class="settings-view">
    <header class="page-header">
      <h1>设置</h1>
    </header>

    <div class="settings-layout">
      <aside class="settings-sidebar">
        <nav class="settings-nav">
          <router-link to="/settings" class="nav-item" exact-active-class="active">
            <SettingsIcon />
            通用设置
          </router-link>
          <router-link to="/settings/ai" class="nav-item" active-class="active">
            <span class="nav-icon">🧠</span>
            AI 模型配置
          </router-link>
          <router-link to="/settings/qq" class="nav-item" active-class="active">
            <span class="nav-icon">📱</span>
            QQ 设置
          </router-link>
          <router-link to="/settings/bot" class="nav-item" active-class="active">
            <span class="nav-icon">🤖</span>
            机器人设置
          </router-link>
          <router-link to="/settings/advanced" class="nav-item" active-class="active">
            <span class="nav-icon">⚙️</span>
            高级设置
          </router-link>
          <router-link to="/settings/about" class="nav-item" active-class="active">
            <span class="nav-icon">ℹ️</span>
            关于
          </router-link>
        </nav>
      </aside>

      <main class="settings-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import SettingsIcon from '../components/icons/SettingsIcon.vue'
</script>

<style scoped>
.settings-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 20px;
}

.settings-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.settings-sidebar {
  width: 220px;
  border-right: 1px solid var(--border-color);
  padding: 16px;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.nav-icon {
  font-size: 16px;
}

.settings-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
