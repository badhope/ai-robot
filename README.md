# 🌟 AI Robot

<p align="center">
  <a href="#english-documentation"><img src="https://img.shields.io/badge/Language-English-blue?style=flat-square" alt="English"></a>
  <a href="#中文文档"><img src="https://img.shields.io/badge/语言-中文-red?style=flat-square" alt="中文"></a>
</p>

<div align="center">

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║        🌟 AI Robot - Intelligent Group Chat Assistant 🤖         ║
║                                                                  ║
║        智能群聊助手 - Smart QQ/WeChat Group Chat AI Bot          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**🚀 Plug-and-Play QQ Group AI Bot | Multi-Platform API Support | One-Click Launch | Ready to Use**

[![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)](https://github.com/badhope/ai-robot)
[![License](https://img.shields.io/badge/license-Proprietary-green?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](https://github.com/badhope/ai-robot/releases)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org)
[![Stars](https://img.shields.io/github/stars/badhope/ai-robot?style=flat-square)](https://github.com/badhope/ai-robot/stargazers)

</div>

---

<a name="english-documentation"></a>
## 📚 English Documentation

### Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Quick Start Guide](#quick-start-guide)
- [Configuration](#configuration)
- [Protocol Documentation](#protocol-documentation)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Changelog](#changelog)

---

### Project Overview

AI Robot is a sophisticated, production-ready intelligent group chat assistant designed for QQ and WeChat platforms. Built with modern technologies (Electron, Vue 3, TypeScript), it provides seamless AI-powered conversations with support for multiple LLM providers.

#### Key Highlights

| Feature | Description |
|---------|-------------|
| 🎯 **Zero-Configuration** | Download → Install → API Key → Launch |
| 🌐 **Multi-Platform AI** | Alibaba Cloud, DeepSeek, Zhipu, Moonshot, OpenAI, Google, Ollama |
| 💬 **Smart Conversations** | @ mentions, command triggers, auto-reply in private chats |
| 🖼️ **Vision Support** | Image recognition with multimodal AI (Pro version) |
| 🎤 **Voice Reply** | Text-to-speech responses (Pro version) |
| 🔌 **Plugin System** | Extensible plugin architecture |
| 💾 **Session Persistence** | SQLite storage, survives restarts |
| 🎨 **Modern UI** | Electron + Vue 3, smooth and beautiful |
| 🌙 **Dark Theme** | Eye-friendly dark interface |

---

### Architecture

AI Robot follows a modular, adapter-based architecture that separates concerns and enables easy extensibility.

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
│                    │  - IM Handler   │                          │
│                    │  - LLM Selector │                          │
│                    │  - Storage      │                          │
│                    │  - Plugin       │                          │
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

#### Core Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **apps/server** | `apps/server/` | Main service entry, HTTP/WebSocket server, component initialization |
| **apps/setup-ui** | `apps/setup-ui/` | Visual console, environment detection, configuration wizard |
| **packages/core** | `packages/core/` | Core logic: IM handling, LLM routing, storage, plugins |
| **packages/qq-adapter** | `packages/qq-adapter/` | NapCatQQ WebSocket integration |
| **packages/wechat-adapter** | `packages/wechat-adapter/` | WeChat HTTP adapter (reserved) |
| **packages/alibaba-adapter** | `packages/alibaba-adapter/` | Alibaba Cloud/DashScope API |
| **packages/ollama-adapter** | `packages/ollama-adapter/` | Local Ollama model integration |
| **packages/sqlite-storage** | `packages/sqlite-storage/` | SQLite session persistence |
| **packages/doctor** | `packages/doctor/` | Environment diagnostics |

---

### Features

#### 🤖 AI Capabilities

| Capability | Description | Status |
|------------|-------------|--------|
| Multi-turn Conversation | Context-aware dialogue with session memory | ✅ |
| System Prompts | Customizable AI personality and behavior | ✅ |
| Temperature Control | Adjust response creativity | ✅ |
| Token Limits | Configure max response length | ✅ |
| Vision (Multimodal) | Image understanding and description | 👑 Pro |
| Voice Synthesis | Text-to-speech responses | 👑 Pro |

#### 💬 Messaging Features

| Feature | Description |
|---------|-------------|
| @ Mention Trigger | Bot responds when mentioned in groups |
| Command Prefix | Use `/ai` or custom prefix to trigger |
| Private Auto-Reply | Automatic responses in private chats |
| Group Smart Reply | Intelligent group conversation handling |
| Message Quoting | Reply to specific messages |

#### 🎛️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `LLM_PROVIDER` | string | `alibaba` | AI provider selection |
| `ALIBABA_API_KEY` | string | - | Alibaba Cloud API key |
| `ALIBABA_MODEL` | string | `qwen-plus` | Model selection |
| `OLLAMA_BASE_URL` | string | `http://localhost:11434` | Ollama server URL |
| `SESSION_STORAGE` | string | `sqlite` | Storage backend |
| `SESSION_MAX_MESSAGES` | number | `100` | Max messages per session |
| `CHAT_PREFIX` | string | `/ai` | Command trigger prefix |
| `PRIVATE_AUTO_REPLY` | boolean | `true` | Auto-reply in private chats |
| `GROUP_AI_TRIGGER` | string | `both` | Group trigger mode: `at`, `prefix`, `both` |

---

### System Requirements

#### Minimum Requirements

| Platform | Requirement |
|----------|-------------|
| **Windows** | Windows 10 64-bit |
| **macOS** | macOS 10.15 (Catalina) |
| **Linux** | Ubuntu 20.04 LTS |

#### Recommended Configuration

| Platform | Recommendation |
|----------|----------------|
| **Windows** | Windows 11 64-bit |
| **macOS** | macOS 12+ (Monterey) |
| **Linux** | Ubuntu 22.04 LTS |

#### Software Dependencies

| Software | Version | Required For |
|----------|---------|--------------|
| Node.js | 18.0.0+ | Source build |
| pnpm | 8.0.0+ | Source build |
| NapCatQQ | Latest | QQ integration |
| Ollama | Latest | Local models (optional) |

---

### Installation

#### Method 1: Pre-built Release (Recommended)

1. Visit the [Releases](https://github.com/badhope/ai-robot/releases) page
2. Download the installer for your platform
3. Install and launch the application
4. Select your AI platform and enter your API Key
5. Start NapCatQQ and scan QR code to login
6. Click "Start Bot" to begin

#### Method 2: Build from Source

```bash
# Clone repository
git clone https://github.com/badhope/ai-robot.git
cd ai-robot

# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build for production
pnpm build:win   # Windows
pnpm build:mac   # macOS
pnpm build:linux # Linux
```

#### Method 3: Docker Deployment

```bash
# Build image
docker build -t ai-robot .

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run container
cd deployments
docker-compose up -d
```

---

### Quick Start Guide

#### Step 1: Get Your API Key

<details>
<summary>📖 How to obtain API keys</summary>

**Alibaba Cloud (Recommended)**
1. Visit [Alibaba Cloud Bailian](https://bailian.console.aliyun.com/)
2. Login or register an account
3. Enable DashScope service
4. Navigate to "API-KEY Management" → "Create API Key"

**DeepSeek**
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Register an account
3. Go to "API Keys" → "Create API Key"

**Zhipu AI**
1. Visit [Zhipu Open Platform](https://open.bigmodel.cn/)
2. Register an account
3. Go to "API Keys" → "Add API Key"

**OpenAI**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account
3. Generate an API key from the dashboard

</details>

#### Step 2: Configure NapCatQQ

<details>
<summary>📖 NapCatQQ Setup Guide</summary>

1. Download [NapCatQQ](https://github.com/NapNeko/NapCatQQ/releases)
2. Extract and run the application
3. Scan QR code with your bot QQ account
4. Ensure WebSocket port is set to `3001`

For detailed instructions, see [NapCatQQ Guide](docs/quick-start-qq.md)

</details>

#### Step 3: Start the Bot

```bash
# Run the application
pnpm dev

# Or use the desktop app
# Simply click "Start Bot" in the UI
```

#### Step 4: Test the Bot

In a QQ group:
```
@YourBot Hello, how are you?
```

Or use the command prefix:
```
/ai What's the weather today?
```

---

### Configuration

#### Environment Variables

Create a `.env` file in the project root:

```env
# ====================
# Server Configuration
# ====================
APP_HOST=0.0.0.0
APP_PORT=3000

# ====================
# QQ Configuration
# ====================
QQ_ENABLED=true
QQ_HTTP_PORT=3001
QQ_WS_URL=ws://localhost:3001
QQ_NUMBER=123456789
QQ_TOKEN=

# ====================
# AI Provider Configuration
# ====================
LLM_PROVIDER=alibaba

# Alibaba Cloud (Default)
ALIBABA_API_KEY=your-api-key-here
ALIBABA_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIBABA_MODEL=qwen-plus
ALIBABA_TIMEOUT=120000

# Ollama (Local Mode)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_TIMEOUT=120000

# ====================
# Session Storage
# ====================
SESSION_STORAGE=sqlite
SQLITE_DB_PATH=./data/sessions.db
SESSION_MAX_MESSAGES=100

# ====================
# Trigger Rules
# ====================
CHAT_PREFIX=/ai
PRIVATE_AUTO_REPLY=true
GROUP_AI_TRIGGER=both

# ====================
# Logging
# ====================
LOG_LEVEL=info
```

#### Supported AI Platforms

| Platform | Features | Free Tier | Rating |
|----------|----------|-----------|--------|
| 🇨🇳 **Alibaba Cloud** | Fast, stable | Yes | ⭐⭐⭐⭐⭐ |
| 🇨🇳 **DeepSeek** | Cost-effective | Yes | ⭐⭐⭐⭐⭐ |
| 🇨🇳 **Zhipu AI** | Chinese LLM | Yes | ⭐⭐⭐⭐ |
| 🇨🇳 **Moonshot** | Long context | Yes | ⭐⭐⭐⭐ |
| 🌍 **OpenAI** | GPT-4 | Limited | ⭐⭐⭐⭐ |
| 🌍 **Google Gemini** | Large free tier | Yes | ⭐⭐⭐⭐ |
| 💻 **Local Ollama** | Completely free | Unlimited | ⭐⭐⭐ (GPU required) |

---

### Protocol Documentation

#### Overview

AI Robot implements multiple protocols for communication between components, external services, and messaging platforms. This section documents all protocols used in the system.

---

#### 1. IM Platform Protocol

##### Purpose

The IM (Instant Messaging) Platform Protocol defines the standard interface for integrating different messaging platforms (QQ, WeChat, etc.) into AI Robot.

##### Interface Specification

```typescript
interface IMAdapter {
  name: string;
  platform: 'wechat' | 'qq' | 'mock';
  start(): Promise<void>;
  stop(): Promise<void>;
  sendReply(event: ChatMessageEvent, reply: ChatReply): Promise<void>;
  onMessage(handler: (event: ChatMessageEvent) => Promise<void>): void;
}
```

##### Message Event Structure

```typescript
interface ChatMessageEvent {
  platform: Platform;
  chatType: 'private' | 'group';
  messageId: string;
  senderId: string;
  senderName?: string;
  roomId?: string;
  roomName?: string;
  text: string;
  mentions?: string[];
  isAt?: boolean;
  replyToMessageId?: string;
  timestamp: number;
  raw?: unknown;
}
```

##### Reply Structure

```typescript
interface ChatReply {
  text: string;
  replyToMessageId?: string;
}
```

##### Implementation Details

| Adapter | Protocol | Transport | Port |
|---------|----------|-----------|------|
| NapCatQQ | WebSocket | WS | 3001 |
| WeChat | HTTP | REST | Configurable |

##### Usage Example

```typescript
import { NapCatQQAdapter } from '@ai-robot/qq-adapter';

const adapter = new NapCatQQAdapter({
  httpPort: 3001,
  wsUrl: 'ws://localhost:3001',
  qqNumber: '123456789',
});

await adapter.start();

adapter.onMessage(async (event) => {
  console.log(`Message from ${event.senderName}: ${event.text}`);
  await adapter.sendReply(event, { text: 'Hello!' });
});
```

---

#### 2. LLM Provider Protocol

##### Purpose

The LLM (Large Language Model) Provider Protocol defines the standard interface for integrating different AI providers into AI Robot.

##### Interface Specification

```typescript
interface LLMProvider {
  name: string;
  kind: 'local' | 'remote' | 'experimental';
  generate(input: LLMGenerateRequest): Promise<LLMGenerateResponse>;
  healthCheck(): Promise<boolean>;
  listModels?(): Promise<string[]>;
}
```

##### Request Structure

```typescript
interface LLMGenerateRequest {
  model?: string;
  systemPrompt?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}
```

##### Response Structure

```typescript
interface LLMGenerateResponse {
  provider: string;
  model: string;
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  raw?: unknown;
}
```

##### Supported Providers

| Provider | Kind | API Endpoint | Authentication |
|----------|------|--------------|----------------|
| Alibaba Cloud | remote | `dashscope.aliyuncs.com` | Bearer Token |
| Ollama | local | `localhost:11434` | None |
| OpenAI | remote | `api.openai.com` | Bearer Token |
| DeepSeek | remote | `api.deepseek.com` | Bearer Token |

##### Usage Example

```typescript
import { AlibabaProvider } from '@ai-robot/alibaba-adapter';

const provider = new AlibabaProvider({
  apiKey: 'sk-xxx',
  model: 'qwen-plus',
});

const response = await provider.generate({
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
});

console.log(response.content);
```

---

#### 3. NapCatQQ WebSocket Protocol

##### Purpose

NapCatQQ uses WebSocket for real-time bidirectional communication between the QQ client and AI Robot.

##### Connection Details

| Parameter | Value |
|-----------|-------|
| Protocol | WebSocket |
| Default URL | `ws://localhost:3001` |
| Message Format | JSON |
| Encoding | UTF-8 |

##### Message Types

**Incoming Message (from NapCatQQ)**

```json
{
  "post_type": "message",
  "message_type": "group",
  "sub_type": "normal",
  "user_id": 123456789,
  "group_id": 987654321,
  "group_name": "Test Group",
  "sender": {
    "nickname": "User",
    "card": "Card Name"
  },
  "message_id": 12345,
  "message": [
    { "type": "text", "text": "Hello" },
    { "type": "at", "data": { "qq": 987654321 } }
  ],
  "raw_message": "Hello @bot",
  "time": 1234567890
}
```

**Outgoing Message (to NapCatQQ)**

```json
{
  "message_type": "group",
  "group_id": 987654321,
  "message": "Reply text here"
}
```

##### Reconnection Strategy

| Parameter | Value |
|-----------|-------|
| Max Attempts | 10 |
| Base Delay | 1000ms |
| Max Delay | 30000ms |
| Backoff | Exponential |

---

#### 4. Alibaba Cloud API Protocol

##### Purpose

Alibaba Cloud DashScope API provides access to Qwen series language models.

##### API Endpoint

| Environment | URL |
|-------------|-----|
| Production | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| Chat Completions | `/chat/completions` |

##### Authentication

```http
Authorization: Bearer sk-xxxxxxxxxxxxxxxx
Content-Type: application/json
```

##### Request Format

```json
{
  "model": "qwen-plus",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

##### Response Format

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "qwen-plus",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

##### Available Models

| Model | Context | Description |
|-------|---------|-------------|
| `qwen-turbo` | 8K | Fast, cost-effective |
| `qwen-plus` | 32K | Balanced performance |
| `qwen-max` | 32K | Best quality |
| `qwen-long` | 1M | Long context |

---

#### 5. Ollama API Protocol

##### Purpose

Ollama provides a local REST API for running open-source language models.

##### API Endpoint

| Endpoint | URL |
|----------|-----|
| Base URL | `http://localhost:11434` |
| Chat API | `/api/chat` |
| Models List | `/api/tags` |

##### Request Format

```json
{
  "model": "qwen2.5:7b",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "stream": false,
  "options": {
    "temperature": 0.7,
    "top_p": 0.9,
    "num_predict": 512
  }
}
```

##### Response Format

```json
{
  "model": "qwen2.5:7b",
  "created_at": "2024-01-01T00:00:00Z",
  "message": {
    "role": "assistant",
    "content": "Hello! How can I help you?"
  },
  "done": true,
  "total_duration": 1000000000,
  "prompt_eval_count": 10,
  "eval_count": 20
}
```

---

#### 6. Session Storage Protocol

##### Purpose

The Session Storage Protocol defines how conversation history is persisted and retrieved.

##### Interface Specification

```typescript
interface SessionStore {
  getSession(sessionId: string): Promise<SessionMessage[]>;
  appendMessage(sessionId: string, message: SessionMessage): Promise<void>;
  clearSession(sessionId: string): Promise<void>;
}
```

##### Message Structure

```typescript
interface SessionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}
```

##### SQLite Schema

```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_session_id ON sessions(session_id);
CREATE INDEX idx_timestamp ON sessions(session_id, timestamp);
```

##### Usage Example

```typescript
import { SQLiteSessionStore } from '@ai-robot/sqlite-storage';

const store = new SQLiteSessionStore({
  dbPath: './data/sessions.db',
  maxMessages: 100,
});

// Get session history
const messages = await store.getSession('group_123456');

// Append message
await store.appendMessage('group_123456', {
  role: 'user',
  content: 'Hello!',
  timestamp: Date.now(),
});
```

---

#### 7. HTTP API Protocol

##### Purpose

The HTTP API provides REST endpoints for external integrations and the setup UI.

##### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/send` | Send message |
| `GET` | `/status` | Bot status |

##### Send Message Request

```http
POST /send HTTP/1.1
Content-Type: application/json

{
  "message_type": "group",
  "group_id": 123456789,
  "message": "Hello from HTTP API"
}
```

---

#### 8. Plugin Protocol

##### Purpose

The Plugin Protocol enables extensibility through custom message processors.

##### Interface Specification

```typescript
interface Plugin {
  name: string;
  priority: number;
  process(event: ChatMessageEvent, context: PluginContext): Promise<PluginResult | null>;
}

interface PluginContext {
  provider: LLMProvider;
  storage: SessionStore;
  config: Record<string, unknown>;
}

interface PluginResult {
  handled: boolean;
  reply?: string;
}
```

---

### Advanced Usage

#### Custom System Prompts

Create custom prompts in the `prompts/` directory:

```
prompts/
├── default/
│   ├── friendly.txt
│   └── tech-expert.txt
├── group/
│   ├── active.txt
│   └── concise.txt
└── helper/
    └── assistant.txt
```

#### Switching Providers at Runtime

```typescript
// In configuration
LLM_PROVIDER=ollama  // Switch to local model
OLLAMA_MODEL=llama3:8b
```

#### Custom Trigger Rules

```env
# Only respond to @ mentions
GROUP_AI_TRIGGER=at

# Only respond to prefix commands
GROUP_AI_TRIGGER=prefix

# Respond to both (default)
GROUP_AI_TRIGGER=both
```

---

### Troubleshooting

#### Quick Diagnostics

```bash
pnpm doctor
```

This checks:
- Node.js version
- Configuration files
- API connectivity
- NapCatQQ connection
- SQLite status

#### Common Issues

<details>
<summary>🔧 Bot not responding</summary>

1. Verify NapCatQQ is running
2. Check WebSocket connection (`ws://localhost:3001`)
3. Ensure `QQ_ENABLED=true` in `.env`
4. Verify API key is configured
5. Check bot is mentioned correctly with `@`

</details>

<details>
<summary>🔧 API connection failed</summary>

1. Verify API key is correct
2. Check account has available credits
3. Test network connectivity: `ping dashscope.aliyuncs.com`
4. Verify base URL is correct

</details>

<details>
<summary>🔧 SQLite errors</summary>

1. Check directory permissions
2. Verify disk space available
3. Delete and recreate database:
   ```bash
   rm data/sessions.db
   ```

</details>

<details>
<summary>🔧 Ollama connection issues</summary>

1. Verify Ollama is installed: `ollama --version`
2. Check Ollama service: `ollama serve`
3. Verify model is downloaded: `ollama list`
4. Check configuration:
   ```env
   LLM_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   ```

</details>

#### Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| `401 Unauthorized` | Invalid API key | Check API key configuration |
| `Connection refused` | Service not running | Start the required service |
| `WebSocket closed` | NapCatQQ disconnected | Restart NapCatQQ |
| `Model not found` | Model doesn't exist | Download model or check name |
| `Out of credit` | Insufficient balance | Add credits to account |

---

### Contributing

We welcome all contributions! Please follow these guidelines:

#### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit: `git commit -m 'Add AmazingFeature'`
6. Push: `git push origin feature/AmazingFeature`
7. Open a Pull Request

#### Development Setup

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Run linter
pnpm lint

# Type check
pnpm typecheck

# Build
pnpm build
```

#### Code Style

- Use TypeScript for all new code
- Follow existing code conventions
- Add appropriate comments
- Update documentation

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

### License

This project uses a dual-license model:

| Component | License |
|-----------|---------|
| Open Source Parts | [MIT License](LICENSE-MIT) |
| Commercial Parts | [Commercial License](LICENSE-COMMERCIAL) |

See [LICENSE](LICENSE) for details.

---

### Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

#### Recent Changes

**[2.0.0] - 2024-03-26**

- 🎉 New Electron desktop application architecture
- 🎨 Vue 3 + TypeScript modern UI
- 🌟 Star theme UI design
- 📱 Simple and Expert mode toggle
- 🔧 Visual configuration wizard
- 🧠 Multi-platform AI API support
- 💻 Local Ollama model support
- 🔌 Plugin system architecture
- 👑 Pro version features
- 📊 Conversation statistics
- 🌙 Dark theme support

---

### Contact

| Channel | Link |
|---------|------|
| 📧 Email | contact@ai-robot.dev |
| 💬 QQ Group | 123456789 |
| 🌐 Website | https://ai-robot.dev |
| 📖 Documentation | https://docs.ai-robot.dev |
| 🐛 Issues | [GitHub Issues](https://github.com/badhope/ai-robot/issues) |

---

<a name="中文文档"></a>
## 📚 中文文档

### 目录

- [项目概述](#项目概述)
- [系统架构](#系统架构)
- [功能特性](#功能特性)
- [系统要求](#系统要求)
- [安装指南](#安装指南)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [协议文档](#协议文档)
- [高级用法](#高级用法)
- [故障排查](#故障排查)
- [贡献指南](#贡献指南)
- [开源协议](#开源协议)
- [更新日志](#更新日志)

---

### 项目概述

AI Robot 是一个成熟的、生产就绪的智能群聊助手，专为 QQ 和微信平台设计。基于现代技术栈（Electron、Vue 3、TypeScript）构建，提供流畅的 AI 对话体验，支持多种大语言模型提供商。

#### 核心亮点

| 特性 | 描述 |
|------|------|
| 🎯 **傻瓜式操作** | 下载 → 安装 → 填写 API Key → 一键启动 |
| 🌐 **多平台支持** | 阿里云、DeepSeek、智谱、月之暗面、OpenAI、Google、本地 Ollama |
| 💬 **智能对话** | 支持 @ 触发、命令触发、私聊自动回复 |
| 🖼️ **图片识别** | 识别图片内容，多模态 AI 支持（专业版） |
| 🎤 **语音回复** | 文字转语音回复（专业版） |
| 🔌 **插件系统** | 丰富的插件生态，可扩展功能 |
| 💾 **会话持久化** | SQLite 存储，重启不丢失 |
| 🎨 **现代界面** | Electron + Vue 3，流畅美观 |
| 🌙 **暗色主题** | 护眼的深色界面 |

---

### 系统架构

AI Robot 采用模块化、适配器模式的架构，实现关注点分离和易于扩展。

```
┌─────────────────────────────────────────────────────────────────┐
│                          AI Robot                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│   │  QQ 适配器  │     │ IM 适配器   │     │ 微信适配器  │      │
│   │  (NapCatQQ) │     │  (平台)     │     │ (预留)      │      │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘      │
│          │                  │                  │              │
│          └──────────────────┼──────────────────┘              │
│                             ▼                                   │
│                    ┌─────────────────┐                          │
│                    │    核心层      │                          │
│                    │  - IM 处理器   │                          │
│                    │  - LLM 选择器  │                          │
│                    │  - 存储层      │                          │
│                    │  - 插件系统    │                          │
│                    └────────┬────────┘                          │
│                             │                                   │
│          ┌──────────────────┼──────────────────┐                │
│          ▼                  ▼                  ▼                │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│   │ 阿里云      │    │ Ollama      │    │ 未来        │       │
│   │ 适配器      │    │ 适配器      │    │ 提供商      │       │
│   └─────────────┘    └─────────────┘    └─────────────┘       │
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐                           │
│   │  设置界面   │    │  SQLite     │                           │
│   │  (控制台)   │    │  存储       │                           │
│   └─────────────┘    └─────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 核心组件

| 组件 | 位置 | 职责 |
|------|------|------|
| **apps/server** | `apps/server/` | 主服务入口，HTTP/WebSocket 服务，组件初始化 |
| **apps/setup-ui** | `apps/setup-ui/` | 可视化控制台，环境检测，配置向导 |
| **packages/core** | `packages/core/` | 核心逻辑：IM 处理，LLM 路由，存储，插件 |
| **packages/qq-adapter** | `packages/qq-adapter/` | NapCatQQ WebSocket 集成 |
| **packages/wechat-adapter** | `packages/wechat-adapter/` | 微信 HTTP 适配器（预留） |
| **packages/alibaba-adapter** | `packages/alibaba-adapter/` | 阿里云/DashScope API |
| **packages/ollama-adapter** | `packages/ollama-adapter/` | 本地 Ollama 模型集成 |
| **packages/sqlite-storage** | `packages/sqlite-storage/` | SQLite 会话持久化 |
| **packages/doctor** | `packages/doctor/` | 环境诊断 |

---

### 功能特性

#### 🤖 AI 能力

| 能力 | 描述 | 状态 |
|------|------|------|
| 多轮对话 | 上下文感知的对话，带会话记忆 | ✅ |
| 系统提示词 | 可自定义 AI 人格和行为 | ✅ |
| 温度控制 | 调整回复创造性 | ✅ |
| Token 限制 | 配置最大回复长度 | ✅ |
| 视觉（多模态） | 图像理解和描述 | 👑 专业版 |
| 语音合成 | 文字转语音回复 | 👑 专业版 |

#### 💬 消息功能

| 功能 | 描述 |
|------|------|
| @ 提及触发 | 群聊中被 @ 时响应 |
| 命令前缀 | 使用 `/ai` 或自定义前缀触发 |
| 私聊自动回复 | 私聊中自动响应 |
| 群聊智能回复 | 智能群聊对话处理 |
| 消息引用 | 回复特定消息 |

---

### 系统要求

#### 最低要求

| 平台 | 要求 |
|------|------|
| **Windows** | Windows 10 64 位 |
| **macOS** | macOS 10.15 (Catalina) |
| **Linux** | Ubuntu 20.04 LTS |

#### 推荐配置

| 平台 | 推荐 |
|------|------|
| **Windows** | Windows 11 64 位 |
| **macOS** | macOS 12+ (Monterey) |
| **Linux** | Ubuntu 22.04 LTS |

#### 软件依赖

| 软件 | 版本 | 用途 |
|------|------|------|
| Node.js | 18.0.0+ | 源码构建 |
| pnpm | 8.0.0+ | 源码构建 |
| NapCatQQ | 最新版 | QQ 集成 |
| Ollama | 最新版 | 本地模型（可选） |

---

### 安装指南

#### 方式一：预编译版本（推荐）

1. 前往 [Releases](https://github.com/badhope/ai-robot/releases) 页面
2. 下载对应平台的安装包
3. 安装并启动应用
4. 选择 AI 平台，填写 API Key
5. 启动 NapCatQQ 并扫码登录
6. 点击「启动机器人」开始使用

#### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/badhope/ai-robot.git
cd ai-robot

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build:win   # Windows
pnpm build:mac   # macOS
pnpm build:linux # Linux
```

#### 方式三：Docker 部署

```bash
# 构建镜像
docker build -t ai-robot .

# 配置环境
cp .env.example .env
# 编辑 .env 填入 API 密钥

# 运行容器
cd deployments
docker-compose up -d
```

---

### 快速开始

#### 步骤 1：获取 API Key

<details>
<summary>📖 如何获取 API Key</summary>

**阿里云（推荐）**
1. 打开 [阿里云百炼](https://bailian.console.aliyun.com/)
2. 登录/注册阿里云账号
3. 开通 DashScope 服务
4. 点击左侧「API-KEY 管理」→「创建 API Key」

**DeepSeek**
1. 打开 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册账号
3. 进入「API Keys」→「创建 API Key」

**智谱 AI**
1. 打开 [智谱开放平台](https://open.bigmodel.cn/)
2. 注册账号
3. 进入「API 密钥」→「添加 API 密钥」

</details>

#### 步骤 2：配置 NapCatQQ

<details>
<summary>📖 NapCatQQ 设置指南</summary>

1. 下载 [NapCatQQ](https://github.com/NapNeko/NapCatQQ/releases)
2. 解压并运行
3. 扫码登录你的 QQ 机器人账号
4. 确保 WebSocket 端口为 3001

详细教程请查看 [NapCatQQ 使用指南](docs/quick-start-qq.md)

</details>

#### 步骤 3：启动机器人

```bash
# 运行应用
pnpm dev

# 或使用桌面应用
# 在界面中点击「启动机器人」
```

#### 步骤 4：测试机器人

在 QQ 群中：
```
@你的机器人 你好，今天天气怎么样？
```

或使用命令前缀：
```
/ai 今天天气怎么样？
```

---

### 配置说明

#### 环境变量

在项目根目录创建 `.env` 文件：

```env
# ====================
# 服务器配置
# ====================
APP_HOST=0.0.0.0
APP_PORT=3000

# ====================
# QQ 配置
# ====================
QQ_ENABLED=true
QQ_HTTP_PORT=3001
QQ_WS_URL=ws://localhost:3001
QQ_NUMBER=123456789
QQ_TOKEN=

# ====================
# AI 提供商配置
# ====================
LLM_PROVIDER=alibaba

# 阿里云（默认）
ALIBABA_API_KEY=your-api-key-here
ALIBABA_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIBABA_MODEL=qwen-plus
ALIBABA_TIMEOUT=120000

# Ollama（本地模式）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_TIMEOUT=120000

# ====================
# 会话存储
# ====================
SESSION_STORAGE=sqlite
SQLITE_DB_PATH=./data/sessions.db
SESSION_MAX_MESSAGES=100

# ====================
# 触发规则
# ====================
CHAT_PREFIX=/ai
PRIVATE_AUTO_REPLY=true
GROUP_AI_TRIGGER=both

# ====================
# 日志
# ====================
LOG_LEVEL=info
```

#### 支持的 AI 平台

| 平台 | 特点 | 免费额度 | 推荐指数 |
|------|------|----------|----------|
| 🇨🇳 **阿里云通义** | 响应快，稳定 | 有 | ⭐⭐⭐⭐⭐ |
| 🇨🇳 **DeepSeek** | 性价比高 | 有 | ⭐⭐⭐⭐⭐ |
| 🇨🇳 **智谱 AI** | 国产大模型 | 有 | ⭐⭐⭐⭐ |
| 🇨🇳 **月之暗面** | 长文本强 | 有 | ⭐⭐⭐⭐ |
| 🌍 **OpenAI** | GPT-4 | 有限 | ⭐⭐⭐⭐ |
| 🌍 **Google Gemini** | 免费额度大 | 有 | ⭐⭐⭐⭐ |
| 💻 **本地 Ollama** | 完全免费 | 无限 | ⭐⭐⭐（需显卡）|

---

### 协议文档

#### 概述

AI Robot 实现了多种协议用于组件间通信、外部服务和消息平台集成。本节记录系统中使用的所有协议。

---

#### 1. IM 平台协议

##### 目的

IM（即时通讯）平台协议定义了将不同消息平台（QQ、微信等）集成到 AI Robot 的标准接口。

##### 接口规范

```typescript
interface IMAdapter {
  name: string;
  platform: 'wechat' | 'qq' | 'mock';
  start(): Promise<void>;
  stop(): Promise<void>;
  sendReply(event: ChatMessageEvent, reply: ChatReply): Promise<void>;
  onMessage(handler: (event: ChatMessageEvent) => Promise<void>): void;
}
```

##### 消息事件结构

```typescript
interface ChatMessageEvent {
  platform: Platform;
  chatType: 'private' | 'group';
  messageId: string;
  senderId: string;
  senderName?: string;
  roomId?: string;
  roomName?: string;
  text: string;
  mentions?: string[];
  isAt?: boolean;
  replyToMessageId?: string;
  timestamp: number;
  raw?: unknown;
}
```

##### 实现细节

| 适配器 | 协议 | 传输方式 | 端口 |
|--------|------|----------|------|
| NapCatQQ | WebSocket | WS | 3001 |
| 微信 | HTTP | REST | 可配置 |

---

#### 2. LLM 提供商协议

##### 目的

LLM（大语言模型）提供商协议定义了将不同 AI 提供商集成到 AI Robot 的标准接口。

##### 接口规范

```typescript
interface LLMProvider {
  name: string;
  kind: 'local' | 'remote' | 'experimental';
  generate(input: LLMGenerateRequest): Promise<LLMGenerateResponse>;
  healthCheck(): Promise<boolean>;
  listModels?(): Promise<string[]>;
}
```

##### 请求结构

```typescript
interface LLMGenerateRequest {
  model?: string;
  systemPrompt?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}
```

##### 响应结构

```typescript
interface LLMGenerateResponse {
  provider: string;
  model: string;
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  raw?: unknown;
}
```

---

#### 3. NapCatQQ WebSocket 协议

##### 目的

NapCatQQ 使用 WebSocket 实现 QQ 客户端与 AI Robot 之间的实时双向通信。

##### 连接详情

| 参数 | 值 |
|------|-----|
| 协议 | WebSocket |
| 默认 URL | `ws://localhost:3001` |
| 消息格式 | JSON |
| 编码 | UTF-8 |

##### 消息类型

**传入消息（来自 NapCatQQ）**

```json
{
  "post_type": "message",
  "message_type": "group",
  "user_id": 123456789,
  "group_id": 987654321,
  "sender": {
    "nickname": "用户",
    "card": "群名片"
  },
  "message": [
    { "type": "text", "text": "你好" },
    { "type": "at", "data": { "qq": 987654321 } }
  ],
  "raw_message": "你好 @机器人",
  "time": 1234567890
}
```

**传出消息（发送到 NapCatQQ）**

```json
{
  "message_type": "group",
  "group_id": 987654321,
  "message": "回复内容"
}
```

---

#### 4. 阿里云 API 协议

##### 目的

阿里云 DashScope API 提供对通义系列语言模型的访问。

##### API 端点

| 环境 | URL |
|------|-----|
| 生产环境 | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| 对话补全 | `/chat/completions` |

##### 认证方式

```http
Authorization: Bearer sk-xxxxxxxxxxxxxxxx
Content-Type: application/json
```

##### 请求格式

```json
{
  "model": "qwen-plus",
  "messages": [
    { "role": "system", "content": "你是一个有帮助的助手。" },
    { "role": "user", "content": "你好！" }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

##### 可用模型

| 模型 | 上下文 | 描述 |
|------|--------|------|
| `qwen-turbo` | 8K | 快速，性价比高 |
| `qwen-plus` | 32K | 平衡性能 |
| `qwen-max` | 32K | 最佳质量 |
| `qwen-long` | 1M | 长上下文 |

---

#### 5. Ollama API 协议

##### 目的

Ollama 提供本地 REST API 用于运行开源语言模型。

##### API 端点

| 端点 | URL |
|------|-----|
| 基础 URL | `http://localhost:11434` |
| 对话 API | `/api/chat` |
| 模型列表 | `/api/tags` |

##### 请求格式

```json
{
  "model": "qwen2.5:7b",
  "messages": [
    { "role": "user", "content": "你好！" }
  ],
  "stream": false,
  "options": {
    "temperature": 0.7,
    "top_p": 0.9,
    "num_predict": 512
  }
}
```

---

#### 6. 会话存储协议

##### 目的

会话存储协议定义了对话历史的持久化和检索方式。

##### 接口规范

```typescript
interface SessionStore {
  getSession(sessionId: string): Promise<SessionMessage[]>;
  appendMessage(sessionId: string, message: SessionMessage): Promise<void>;
  clearSession(sessionId: string): Promise<void>;
}
```

##### SQLite 数据库结构

```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_session_id ON sessions(session_id);
CREATE INDEX idx_timestamp ON sessions(session_id, timestamp);
```

---

### 高级用法

#### 自定义系统提示词

在 `prompts/` 目录创建自定义提示词：

```
prompts/
├── default/
│   ├── friendly.txt
│   └── tech-expert.txt
├── group/
│   ├── active.txt
│   └── concise.txt
└── helper/
    └── assistant.txt
```

#### 运行时切换提供商

```typescript
// 在配置中
LLM_PROVIDER=ollama  // 切换到本地模型
OLLAMA_MODEL=llama3:8b
```

#### 自定义触发规则

```env
# 仅响应 @ 提及
GROUP_AI_TRIGGER=at

# 仅响应前缀命令
GROUP_AI_TRIGGER=prefix

# 两者都响应（默认）
GROUP_AI_TRIGGER=both
```

---

### 故障排查

#### 快速诊断

```bash
pnpm doctor
```

检查项目：
- Node.js 版本
- 配置文件
- API 连接
- NapCatQQ 连接
- SQLite 状态

#### 常见问题

<details>
<summary>🔧 机器人没有反应</summary>

1. 确认 NapCatQQ 正在运行
2. 检查 WebSocket 连接（`ws://localhost:3001`）
3. 确保 `.env` 中 `QQ_ENABLED=true`
4. 验证 API Key 已配置
5. 检查是否正确 @ 机器人

</details>

<details>
<summary>🔧 API 连接失败</summary>

1. 验证 API Key 正确
2. 检查账户有可用额度
3. 测试网络连接：`ping dashscope.aliyuncs.com`
4. 验证 Base URL 正确

</details>

<details>
<summary>🔧 SQLite 错误</summary>

1. 检查目录权限
2. 验证磁盘空间
3. 删除并重建数据库：
   ```bash
   rm data/sessions.db
   ```

</details>

#### 错误代码

| 错误 | 含义 | 解决方案 |
|------|------|----------|
| `401 Unauthorized` | API Key 无效 | 检查 API Key 配置 |
| `Connection refused` | 服务未启动 | 启动对应服务 |
| `WebSocket closed` | NapCatQQ 断开 | 重启 NapCatQQ |
| `Model not found` | 模型不存在 | 下载模型或检查名称 |
| `Out of credit` | 余额不足 | 充值账户 |

---

### 贡献指南

我们欢迎所有形式的贡献！

#### 开始贡献

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 进行更改
4. 运行测试：`pnpm test`
5. 提交：`git commit -m 'Add AmazingFeature'`
6. 推送：`git push origin feature/AmazingFeature`
7. 提交 Pull Request

#### 开发设置

```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 运行代码检查
pnpm lint

# 类型检查
pnpm typecheck

# 构建
pnpm build
```

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

---

### 开源协议

本项目采用双协议模式：

| 组件 | 协议 |
|------|------|
| 开源部分 | [MIT License](LICENSE-MIT) |
| 商业部分 | [商业许可协议](LICENSE-COMMERCIAL) |

详见 [LICENSE](LICENSE)

---

### 更新日志

详见 [CHANGELOG.md](CHANGELOG.md)

#### 最近更新

**[2.0.0] - 2024-03-26**

- 🎉 全新的 Electron 桌面应用架构
- 🎨 基于 Vue 3 + TypeScript 的现代化界面
- 🌟 星辰主题 UI 设计
- 📱 简单模式和专业模式双模式切换
- 🔧 可视化配置向导
- 🧠 支持多平台 AI API
- 💻 支持本地 Ollama 模型
- 🔌 插件系统架构
- 👑 专业版付费功能
- 🌙 暗色主题支持

---

### 联系我们

| 渠道 | 链接 |
|------|------|
| 📧 邮箱 | contact@ai-robot.dev |
| 💬 QQ群 | 123456789 |
| 🌐 官网 | https://ai-robot.dev |
| 📖 文档 | https://docs.ai-robot.dev |
| 🐛 问题反馈 | [GitHub Issues](https://github.com/badhope/ai-robot/issues) |

---

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=badhope/ai-robot&type=Date)](https://star-history.com/#badhope/ai-robot&Date)

---

<div align="center">

**Made with ❤️ by AI Robot Team**

**⭐ 如果这个项目对你有帮助，请给一个 Star ⭐**

</div>
