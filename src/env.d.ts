/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ElectronAPI {
  getConfig: () => Promise<AppConfig>
  setConfig: (config: Record<string, unknown>) => Promise<boolean>
  getStore: (key: string) => Promise<unknown>
  setStore: (key: string, value: unknown) => Promise<boolean>
  testApiConnection: (provider: string) => Promise<{ success: boolean; message: string }>
  downloadNapcat: () => Promise<{ success: boolean; path?: string }>
  startNapcat: () => Promise<{ success: boolean }>
  startRobot: () => Promise<{ success: boolean }>
  stopRobot: () => Promise<{ success: boolean }>
  getRobotStatus: () => Promise<{ running: boolean }>
  activateLicense: (key: string) => Promise<{ success: boolean; message: string }>
  openExternal: (url: string) => Promise<void>
  selectDirectory: () => Promise<string | null>
  onNavigate: (callback: (route: string) => void) => void
  onRobotStatus: (callback: (status: { running: boolean }) => void) => void
  onShowWelcome: (callback: () => void) => void
  onError: (callback: (error: { message: string }) => void) => void
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
  
  interface AppConfig {
    isFirstRun: boolean
    mode: 'simple' | 'expert'
    language: string
    theme: 'dark' | 'light'
    autoStart: boolean
    minimizeToTray: boolean
    
    ai: {
      provider: string
      providers: {
        alibaba: AIProviderConfig
        deepseek: AIProviderConfig
        zhipu: AIProviderConfig
        moonshot: AIProviderConfig
        openai: AIProviderConfig
        google: AIProviderConfig
        ollama: OllamaProviderConfig
      }
      temperature: number
      maxTokens: number
      contextLength: number
    }
    
    qq: {
      enabled: boolean
      wsUrl: string
      httpPort: number
    }
    
    bot: {
      name: string
      triggerMode: 'at' | 'prefix' | 'both'
      prefix: string
      privateAutoReply: boolean
    }
    
    advanced: {
      sessionStorage: 'sqlite' | 'memory'
      dbPath: string
      maxMessages: number
      logLevel: 'debug' | 'info' | 'warn' | 'error'
    }
    
    license: {
      type: 'free' | 'pro'
      key: string
      activatedAt: string | null
      expiresAt: string | null
    }
    
    stats: {
      totalMessages: number
      todayMessages: number
      lastResetDate: string
    }
  }
  
  interface AIProviderConfig {
    apiKey: string
    baseUrl: string
    model: string
    enabled: boolean
  }
  
  interface OllamaProviderConfig {
    baseUrl: string
    model: string
    enabled: boolean
  }
}

export {}
