# QQ + Ollama 快速开始指南

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

### 3. 安装 NapCatQQ

NapCatQQ 是一个 QQ 机器人框架，需要配合 QQ 客户端使用。

#### Windows 环境

1. 下载 NapCatQQ 安装包：https://github.com/NapNeko/NapCatQQ/releases
2. 解压到本地目录
3. 运行 NapCatQQ 并登录你的 QQ 号
4. 确保 NapCatQQ 的 WebSocket 服务运行在 `ws://localhost:3001`
5. HTTP API 服务运行在 `http://localhost:3001`

#### 配置文件

NapCatQQ 配置文件路径：`{NapCatQQ安装目录}/config/setting.json`

参考配置：
```json
{
  "ws": {
    "enable": true,
    "port": 3001
  },
  "http": {
    "enable": true,
    "port": 3001
  }
}
```

## 配置

### 环境变量

在项目根目录创建 `.env` 文件：

```bash
# QQ 配置（NapCatQQ）
QQ_ENABLED=true
QQ_HTTP_PORT=3001
QQ_WS_URL=ws://localhost:3001
QQ_NUMBER=你的QQ号

# LLM 配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b

# 聊天配置
CHAT_PREFIX=/ai
GROUP_AI_TRIGGER=both
PRIVATE_AUTO_REPLY=true
MAX_MESSAGES=20

# 日志
LOG_LEVEL=info
```

## 启动服务

```bash
# 安装依赖
pnpm install

# 启动服务（开发模式）
pnpm dev
```

## 验证 QQ 机器人

### 启动顺序

1. 启动 Ollama：`ollama serve`
2. 启动 NapCatQQ 并确保已登录 QQ
3. 启动应用服务：`pnpm dev`

### 私聊测试

- 添加机器人为 QQ 好友
- 发送任意消息
- 机器人应自动回复（配置 PRIVATE_AUTO_REPLY=true）

### 群聊测试

- 将机器人拉入群聊
- 使用 `@机器人` 或发送 `/ai 你好`
- 机器人应回复

## NapCatQQ 接入说明

### 接入方式

采用 **WebSocket + HTTP API** 混合方式：

1. **WebSocket**：接收 QQ 事件（消息、状态等）
2. **HTTP API**：发送消息

### 为什么这样选

- NapCatQQ 原生支持 WebSocket 事件推送，实时性好
- HTTP API 发送消息简单可靠
- 两种方式都是 NapCatQQ 的标准接口

### 当前方案局限性

1. **需要本地运行 QQ 客户端**：NapCatQQ 需要配合 QQNT 客户端使用
2. **Windows 环境最佳**：NapCatQQ 主要面向 Windows 环境优化
3. **登录限制**：QQ 可能检测到异常登录
4. **无法在服务器运行**：需要图形界面登录 QQ

### 未来扩展

如需切换到其他 QQ 接入方案（如 LagrangeCore、ICQQ 等），只需：

1. 在 `packages/qq-adapter/` 中实现新的 adapter
2. 确保实现 `IMAdapter` 接口
3. 在 `apps/server/src/index.ts` 中切换 adapter 选择逻辑

## 故障排除

### WebSocket 连接失败

```
Error: WebSocket connection failed
```

解决：确保 NapCatQQ 的 WebSocket 服务已启动，端口配置正确。

### 无法发送消息

```
Failed to send reply: 403
```

解决：检查 NapCatQQ 的 HTTP API 权限配置，确保已开启发送消息权限。

### Ollama 连接失败

```
Error: fetch failed
```

解决：
1. 确保 Ollama 服务已启动：`ollama serve`
2. 确保模型已下载：`ollama pull qwen2.5:7b`
3. 检查 OLLAMA_BASE_URL 配置
