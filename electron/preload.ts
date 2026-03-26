import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 配置管理
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: Record<string, unknown>) => ipcRenderer.invoke('set-config', config),
  getStore: (key: string) => ipcRenderer.invoke('get-store', key),
  setStore: (key: string, value: unknown) => ipcRenderer.invoke('set-store', key, value),

  // API 测试
  testApiConnection: (provider: string) => ipcRenderer.invoke('test-api-connection', provider),

  // NapCatQQ 管理
  downloadNapcat: () => ipcRenderer.invoke('download-napcat'),
  startNapcat: () => ipcRenderer.invoke('start-napcat'),

  // 机器人控制
  startRobot: () => ipcRenderer.invoke('start-robot'),
  stopRobot: () => ipcRenderer.invoke('stop-robot'),
  getRobotStatus: () => ipcRenderer.invoke('get-robot-status'),

  // 许可证
  activateLicense: (key: string) => ipcRenderer.invoke('activate-license', key),

  // 系统
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // 事件监听
  onNavigate: (callback: (route: string) => void) => {
    ipcRenderer.on('navigate', (_event, route) => callback(route))
  },
  onRobotStatus: (callback: (status: { running: boolean }) => void) => {
    ipcRenderer.on('robot-status', (_event, status) => callback(status))
  },
  onShowWelcome: (callback: () => void) => {
    ipcRenderer.on('show-welcome', () => callback())
  },
  onError: (callback: (error: { message: string }) => void) => {
    ipcRenderer.on('error', (_event, error) => callback(error))
  },

  // 移除监听
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
})
