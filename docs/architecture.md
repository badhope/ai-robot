# 架构文档

> **面向开发者与 AI 扩展者**
>
> 本文档描述 AI Robot 的技术架构，帮助你理解系统边界、核心组件和扩展路线。

---

## 🎯 设计原则

| 原则 | 说明 |
|------|------|
| **API-first** | 默认使用阿里云/通义 API，无需本地算力 |
| **Adapter 模式** | 平台适配器与核心逻辑分离 |
| **Provider 抽象** | LLM Provider 可插拔 |
| **Storage 抽象** | 会话存储可切换 |
| **普通用户优先** | 易于部署和上手 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                          AI Robot                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│   │  QQ Adapter │     │ IM Adapters │     │ WeChat      │      │
│   │  (NapCatQQ) │     │  (Platform) │     │ (Future)    │      │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘      │
│          │                  │                  │              │
│          └──────────────────┼──────────────────┘              │
│                             ▼                                   │
│                    ┌─────────────────┐                          │
│                    │   Core Layer    │                          │
│                    │  - IM Handler  │                          │
│                    │  - LLM Selector │                          │
│                    │  - Storage     │                          │
│                    │  - Plugin      │                          │
│                    └────────┬────────┘                          │
│                             │                                   │
│          ┌──────────────────┼──────────────────┐                │
│          ▼                  ▼                  ▼                │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│   │ Alibaba     │    │ Ollama      │    │ Future      │       │
│   │ Adapter     │    │ Adapter     │    │ Providers   │       │
│   └─────────────┘    └─────────────┘    └─────────────┘       │
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐                           │
│   │   Setup UI  │    │  SQLite     │                           │
│   │  (Console)  │    │  Storage    │                           │
│   └─────────────┘    └─────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 核心组件

### 1. apps/server

主服务入口，负责：
- 启动 HTTP/WebSocket 服务
- 加载配置
- 初始化各组件
- 协调消息流转

### 2. apps/setup-ui

可视化控制台，负责：
- 环境状态检测
- 自动配置引导
- Provider 状态显示
- 测试引导

### 3. packages/core

核心逻辑层，包含：

| 模块 | 文件 | 职责 |
|------|------|------|
| IM Handler | `im.ts` | 统一消息入口，分发到 Plugin |
| LLM Selector | `llm.ts` | 选择合适的 LLM Provider |
| Storage | `storage.ts` | 会话存储抽象 |
| Plugin | `plugin.ts` | 消息处理插件系统 |
| Selector | `selector.ts` | 路由选择器 |

### 4. packages/adapters

#### LLM Adapters

| Adapter | 路径 | 说明 |
|---------|------|------|
| Alibaba | `packages/alibaba-adapter/` | 阿里云/通义 API（默认）|
| Ollama | `packages/ollama-adapter/` | 本地模型（可选）|

#### IM Adapters

| Adapter | 路径 | 说明 |
|---------|------|------|
| QQ | `packages/qq-adapter/` | NapCatQQ WebSocket |
| WeChat | `packages/wechat-adapter/` | 微信（预留）|

### 5. packages/storage

| Storage | 路径 | 说明 |
|---------|------|------|
| Memory | `packages/storage/` | 内存存储（开发用）|
| SQLite | `packages/sqlite-storage/` | 持久化存储（生产用）|

### 6. packages/doctor

环境检测模块，负责：
- Node.js 版本检查
- 配置文件检查
- API 连接检查
- 服务状态检查

---

## 🔌 消息流转

```
QQ Message
    │
    ▼
packages/qq-adapter
    │  (转换为统一 IM 消息格式)
    ▼
packages/core (im.ts)
    │  (路由到 Plugin)
    ▼
packages/core (plugin.ts)
    │  (调用 LLM)
    ▼
packages/core (llm.ts)
    │  (选择 Provider)
    ▼
packages/alibaba-adapter 或 packages/ollama-adapter
    │  (调用 AI)
    ▼
Response
    │
    ▼
packages/qq-adapter
    │
    ▼
QQ Response
```

---

## ⚙️ 配置体系

### 环境变量 (.env)

```env
# ====================
# AI Provider 配置
# ====================
LLM_PROVIDER=alibaba          # alibaba | ollama
ALIBABA_API_KEY=xxx            # 阿里云 API Key
ALIBABA_BASE_URL=https://...
ALIBABA_MODEL=qwen-plus        # 模型名称

# ====================
# Ollama 配置 (本地模式)
# ====================
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b

# ====================
# QQ 配置
# ====================
QQ_ENABLED=true
QQ_WS_URL=ws://localhost:3001

# ====================
# 存储配置
# ====================
SESSION_STORAGE=sqlite
SESSION_MAX_MESSAGES=100
SQLITE_DB_PATH=./data/sessions.db
```

---

## 📂 目录结构

```
ai-robot/
├── apps/
│   ├── server/               # 主服务入口
│   │   └── src/
│   │       └── index.ts
│   └── setup-ui/             # 可视化控制台
│       └── src/
│           └── index.ts     # Express + HTML UI
├── packages/
│   ├── core/                 # 核心逻辑
│   │   └── src/
│   │       ├── im.ts         # IM 消息处理
│   │       ├── llm.ts        # LLM 路由
│   │       ├── selector.ts   # 选择器
│   │       ├── storage.ts    # 存储抽象
│   │       └── plugin.ts     # 插件系统
│   ├── alibaba-adapter/      # 阿里云 Provider
│   │   └── src/
│   │       └── index.ts
│   ├── ollama-adapter/       # Ollama Provider
│   │   └── src/
│   │       └── provider.ts
│   ├── qq-adapter/           # QQ 适配器
│   │   └── src/
│   │       └── index.ts
│   ├── storage/              # 存储抽象
│   │   └── src/
│   ├── sqlite-storage/       # SQLite 实现
│   │   └── src/
│   │       └── index.ts
│   └── doctor/               # 环境检测
│       └── src/
│           └── index.ts
├── docs/                     # 文档
├── scripts/                  # 脚本
│   └── setup.js             # 自动配置脚本
└── deployments/             # 部署配置
    └── docker-compose.yml
```

---

## 🔀 Provider 切换

当前支持的 Provider：

| Provider | 状态 | 配置Key |
|----------|------|---------|
| Alibaba (DashScope) | ✅ 默认 | `LLM_PROVIDER=alibaba` |
| Ollama | ✅ 可选 | `LLM_PROVIDER=ollama` |

切换 Provider 只需修改 `.env` 中的 `LLM_PROVIDER`。

---

## 💾 Storage 切换

| Storage | 状态 | 配置Key |
|---------|------|---------|
| SQLite | ✅ 生产默认 | `SESSION_STORAGE=sqlite` |
| Memory | ✅ 开发用 | `SESSION_STORAGE=memory` |

---

## 🚀 扩展指南

### 添加新的 LLM Provider

1. 在 `packages/` 下创建新 adapter
2. 实现标准接口：
   ```typescript
   interface LLMProvider {
     chat(messages: Message[]): Promise<Response>;
     embed?(text: string): Promise<number[]>;
   }
   ```
3. 在 `packages/core/llm.ts` 中注册
4. 在 `.env.example` 中添加配置项

### 添加新的 IM Platform

1. 在 `packages/` 下创建新 adapter
2. 实现标准接口：
   ```typescript
   interface IMAdapter {
     connect(): Promise<void>;
     onMessage(handler: MessageHandler): void;
     sendMessage(to: string, content: string): Promise<void>;
   }
   ```
3. 在 `packages/core/im.ts` 中注册

### 添加新的 Storage

1. 在 `packages/` 下创建新 storage
2. 实现标准接口：
   ```typescript
   interface Storage {
     get(key: string): Promise<Session | null>;
     set(key: string, value: Session): Promise<void>;
     delete(key: string): Promise<void>;
   }
   ```
3. 在 `packages/core/storage.ts` 中注册

---

## 📖 相关文档

- [AI 扩展指南](ai-extension-guide.md) - AI 扩展者必读
- [Roadmap](roadmap.md) - 版本规划
- [快速开始](../quick-start-qq.md) - 部署指南
