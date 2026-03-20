# 微信 + Ollama 快速开始指南

## 前置要求

### 1. 安装 Ollama

访问 https://ollama.com 下载并安装 Ollama。

### 2. 拉取模型

```bash
# 拉取 Qwen 2.5 7B 模型（推荐配置）
ollama pull qwen2.5:7b

# 验证模型是否可用
ollama list
```

### 3. 启动 Ollama 服务

```bash
# Ollama 默认监听 localhost:11434
ollama serve
```

## 配置

### 环境变量（可选）

在项目根目录创建 `.env` 文件：

```bash
# LLM 配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b

# 微信配置（可选，需要有效的 puppet token）
WECHAT_PUPPET_TOKEN=your_token_here
```

## 启动服务

```bash
# 安装依赖
pnpm install

# 启动服务（开发模式）
pnpm dev
```

## 验证微信机器人

### 私聊
- 添加机器人为微信好友
- 发送任意消息
- 机器人应自动回复

### 群聊
- 将机器人拉入群聊
- 使用 `@机器人` 或发送 `/ai 你好`
- 机器人应回复

## 配置说明

编辑 `packages/config/src/index.ts` 或通过环境变量修改配置：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `llm.providers.ollama.baseUrl` | http://localhost:11434 | Ollama 服务地址 |
| `llm.providers.ollama.model` | qwen2.5:7b | 默认模型 |
| `chat.privateAutoReply` | true | 私聊是否自动回复 |
| `chat.groupPrefix` | /ai | 群聊触发前缀 |
| `storage.maxMessages` | 20 | 上下文窗口大小 |

## 故障排除

### 微信登录失败
- 需要有效的 wechaty puppet token
- 推荐使用 padlocal 或 official 协议

### Ollama 连接失败
- 确认 Ollama 服务已启动
- 检查 baseUrl 配置是否正确

### 模型响应慢
- 尝试使用更小的模型（如 qwen2.5:3b）
- 增加 timeout 配置
