import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell, dialog } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { spawn, ChildProcess } from 'child_process'
import Store from 'electron-store'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 配置存储
const store = new Store({
  name: 'ai-robot-config',
  defaults: {
    isFirstRun: true,
    mode: 'simple', // 'simple' | 'expert'
    language: 'zh-CN',
    theme: 'dark',
    autoStart: false,
    minimizeToTray: true,
    
    // AI 配置
    ai: {
      provider: 'alibaba',
      providers: {
        alibaba: {
          apiKey: '',
          baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
          model: 'qwen-plus',
          enabled: true
        },
        deepseek: {
          apiKey: '',
          baseUrl: 'https://api.deepseek.com/v1',
          model: 'deepseek-chat',
          enabled: false
        },
        zhipu: {
          apiKey: '',
          baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
          model: 'glm-4',
          enabled: false
        },
        moonshot: {
          apiKey: '',
          baseUrl: 'https://api.moonshot.cn/v1',
          model: 'moonshot-v1-8k',
          enabled: false
        },
        openai: {
          apiKey: '',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4o-mini',
          enabled: false
        },
        google: {
          apiKey: '',
          baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
          model: 'gemini-pro',
          enabled: false
        },
        ollama: {
          baseUrl: 'http://localhost:11434',
          model: 'qwen2.5:7b',
          enabled: false
        }
      },
      temperature: 0.7,
      maxTokens: 2048,
      contextLength: 20
    },
    
    // QQ 配置
    qq: {
      enabled: true,
      wsUrl: 'ws://localhost:3001',
      httpPort: 3001
    },
    
    // 机器人配置
    bot: {
      name: 'AI Robot',
      triggerMode: 'both', // 'at' | 'prefix' | 'both'
      prefix: '/ai',
      privateAutoReply: true
    },
    
    // 高级设置
    advanced: {
      sessionStorage: 'sqlite',
      dbPath: './data/sessions.db',
      maxMessages: 100,
      logLevel: 'info'
    },
    
    // 许可证
    license: {
      type: 'free',
      key: '',
      activatedAt: null,
      expiresAt: null
    },
    
    // 统计
    stats: {
      totalMessages: 0,
      todayMessages: 0,
      lastResetDate: new Date().toDateString()
    }
  }
})

// 全局变量
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let napcatProcess: ChildProcess | null = null
let robotProcess: ChildProcess | null = null
let isRobotRunning = false

// 检查是否是开发环境
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'AI Robot',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    frame: true,
    titleBarStyle: 'default'
  })

  // 加载页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    
    // 首次运行显示欢迎页面
    if (store.get('isFirstRun')) {
      mainWindow?.webContents.send('show-welcome')
    }
  })

  // 关闭窗口时最小化到托盘
  mainWindow.on('close', (event) => {
    if (store.get('minimizeToTray') && !app.isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 创建托盘图标
function createTray() {
  const iconPath = isDev 
    ? path.join(__dirname, '../build/icon.png')
    : path.join(process.resourcesPath, 'icon.png')
  
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '显示主窗口', 
      click: () => mainWindow?.show() 
    },
    { type: 'separator' },
    { 
      label: isRobotRunning ? '停止机器人' : '启动机器人',
      click: () => toggleRobot()
    },
    { 
      label: '重启机器人',
      click: () => restartRobot()
    },
    { type: 'separator' },
    { 
      label: `今日对话: ${store.get('stats.todayMessages')} 次`,
      enabled: false
    },
    { type: 'separator' },
    { 
      label: '设置',
      click: () => {
        mainWindow?.show()
        mainWindow?.webContents.send('navigate', '/settings')
      }
    },
    { 
      label: '帮助',
      click: () => shell.openExternal('https://github.com/badhope/ai-robot/wiki')
    },
    { type: 'separator' },
    { 
      label: '退出',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('AI Robot - 智能群聊助手')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow?.show()
  })
}

// 切换机器人状态
async function toggleRobot() {
  if (isRobotRunning) {
    await stopRobot()
  } else {
    await startRobot()
  }
}

// 启动机器人
async function startRobot() {
  if (isRobotRunning) return
  
  try {
    // TODO: 启动机器人服务
    isRobotRunning = true
    mainWindow?.webContents.send('robot-status', { running: true })
    updateTrayMenu()
  } catch (error) {
    console.error('Failed to start robot:', error)
    mainWindow?.webContents.send('error', { message: '启动失败: ' + (error as Error).message })
  }
}

// 停止机器人
async function stopRobot() {
  if (!isRobotRunning) return
  
  try {
    if (robotProcess) {
      robotProcess.kill()
      robotProcess = null
    }
    isRobotRunning = false
    mainWindow?.webContents.send('robot-status', { running: false })
    updateTrayMenu()
  } catch (error) {
    console.error('Failed to stop robot:', error)
  }
}

// 重启机器人
async function restartRobot() {
  await stopRobot()
  await startRobot()
}

// 更新托盘菜单
function updateTrayMenu() {
  if (!tray) return
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: isRobotRunning ? '停止机器人' : '启动机器人', click: () => toggleRobot() },
    { label: '重启机器人', click: () => restartRobot() },
    { type: 'separator' },
    { label: `今日对话: ${store.get('stats.todayMessages')} 次`, enabled: false },
    { type: 'separator' },
    { label: '设置', click: () => { mainWindow?.show(); mainWindow?.webContents.send('navigate', '/settings') } },
    { label: '帮助', click: () => shell.openExternal('https://github.com/badhope/ai-robot/wiki') },
    { type: 'separator' },
    { label: '退出', click: () => { app.isQuitting = true; app.quit() } }
  ])
  
  tray.setContextMenu(contextMenu)
}

// IPC 处理
ipcMain.handle('get-config', () => {
  return store.store
})

ipcMain.handle('set-config', (_event, config: Record<string, unknown>) => {
  Object.entries(config).forEach(([key, value]) => {
    store.set(key, value)
  })
  return true
})

ipcMain.handle('get-store', (_event, key: string) => {
  return store.get(key)
})

ipcMain.handle('set-store', (_event, key: string, value: unknown) => {
  store.set(key, value)
  return true
})

ipcMain.handle('test-api-connection', async (_event, provider: string) => {
  // TODO: 实现 API 连接测试
  return { success: true, message: '连接成功' }
})

ipcMain.handle('download-napcat', async () => {
  // TODO: 实现下载 NapCatQQ
  return { success: true, path: '' }
})

ipcMain.handle('start-napcat', async () => {
  // TODO: 实现 NapCatQQ
  return { success: true }
})

ipcMain.handle('start-robot', async () => {
  await startRobot()
  return { success: true }
})

ipcMain.handle('stop-robot', async () => {
  await stopRobot()
  return { success: true }
})

ipcMain.handle('get-robot-status', () => {
  return { running: isRobotRunning }
})

ipcMain.handle('activate-license', async (_event, key: string) => {
  // TODO: 实现许可证激活
  return { success: false, message: '激活码无效' }
})

ipcMain.handle('open-external', (_event, url: string) => {
  shell.openExternal(url)
})

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  })
  return result.filePaths[0] || null
})

// 应用生命周期
app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  app.isQuitting = true
  await stopRobot()
})
