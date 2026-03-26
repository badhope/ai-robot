import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const config = ref<AppConfig | null>(null)
  const robotRunning = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 计算属性
  const isFirstRun = computed(() => config.value?.isFirstRun ?? true)
  const theme = computed(() => config.value?.theme ?? 'dark')
  const mode = computed(() => config.value?.mode ?? 'simple')
  const license = computed(() => config.value?.license)
  const isPro = computed(() => license.value?.type === 'pro')
  const aiProvider = computed(() => config.value?.ai?.provider ?? 'alibaba')
  const stats = computed(() => config.value?.stats)
  
  // 加载配置
  async function loadConfig() {
    loading.value = true
    try {
      const cfg = await window.electronAPI?.getConfig()
      config.value = cfg
    } catch (e) {
      error.value = '加载配置失败'
    } finally {
      loading.value = false
    }
  }
  
  // 保存配置
  async function saveConfig(newConfig: Partial<AppConfig>) {
    try {
      await window.electronAPI?.setConfig(newConfig)
      config.value = { ...config.value!, ...newConfig }
    } catch (e) {
      error.value = '保存配置失败'
    }
  }
  
  // 设置首次运行完成
  async function setFirstRunComplete() {
    await saveConfig({ isFirstRun: false })
  }
  
  // 切换机器人状态
  async function toggleRobot() {
    if (robotRunning.value) {
      await window.electronAPI?.stopRobot()
    } else {
      await window.electronAPI?.startRobot()
    }
  }
  
  // 更新机器人状态
  function setRobotStatus(running: boolean) {
    robotRunning.value = running
  }
  
  // 激活许可证
  async function activateLicense(key: string) {
    const result = await window.electronAPI?.activateLicense(key)
    if (result?.success) {
      await loadConfig()
    }
    return result
  }
  
  // 测试 API 连接
  async function testApiConnection(provider: string) {
    return await window.electronAPI?.testApiConnection(provider)
  }
  
  return {
    config,
    robotRunning,
    loading,
    error,
    isFirstRun,
    theme,
    mode,
    license,
    isPro,
    aiProvider,
    stats,
    loadConfig,
    saveConfig,
    setFirstRunComplete,
    toggleRobot,
    setRobotStatus,
    activateLicense,
    testApiConnection
  }
})
