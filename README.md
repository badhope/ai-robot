# 🤖 AI Robot

**在 QQ 群里调戏本地 AI 机器人**

一个轻量级的自托管 AI 聊天机器人，专为 QQ 群聊设计。无需云服务，无需 API Key，让你的群友与本地运行的 AI 直接对话。

[![Node.js Version](https://img.shields.io/badge/node-18%2B-green?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue?style=flat-square)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)](LICENSE)

---

## ✨ 你能做什么

- **在 QQ 群里 @机器人 提问** → 机器人用本地 AI 模型回答
- **发送 `/ai 你好`** → 同样触发 AI 对话
- **私聊机器人** → 自动回复
- **服务重启后会话不丢失** → SQLite 持久化存储
- **使用 /ai help 和 /ai clear** → 查看帮助或清空对话

> 🚀 **3 分钟部署，5 分钟跑通** —— 比想象中简单得多

---

## 🎯 效果演示

```
群聊消息:
[小明] @AIRobot 你好，请介绍一下自己
[AIRobot] 你好！我是基于 Qwen2.5 模型运行的本地 AI 助手...
         我的特点是：
         • 完全离线运行，不依赖任何外部 API
         • 响应速度快，所有推理都在本地完成
         • 完全开源，你可以随意修改和部署
```

```
私聊消息:
[小李] 你好
[AIRobot] 你好！有什么我可以帮你的吗？
```

---

## ⚡ 快速开始

### 你需要准备

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | 后端运行环境 |
| Ollama | 最新 | 本地模型运行引擎 |
| QQ | 任意版本 | 需要配合 NapCatQQ 使用 |

### 第一步：安装 Ollama 并下载模型（约 5 分钟）

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: 直接从 https://ollama.com 下载安装

# 启动 Ollama 服务
ollama serve

# 下载推荐模型（首次约 4GB）
ollama pull qwen2.5:7b
```

✅ **验证**：运行 `ollama list` 能看到 qwen2.5:7b

### 第二步：启动 NapCatQQ（约 3 分钟）

> NapCatQQ 让你用 QQ 客户端控制 QQ 机器人

1. 下载 NapCatQQ：https://github.com/NapNeko/NapCatQQ/releases
2. 运行 NapCatQQ，用 QQ 账号扫码登录
3. 确认 WebSocket 地址是 `ws://localhost:3001`

✅ **验证**：NapCatQQ 日志显示 "WebSocket 服务已启动"

### 第三步：启动 AI Robot（约 1 分钟）

```bash
# 克隆项目
git clone https://github.com/badhope/ai-robot.git
cd ai-robot

# 安装依赖
pnpm install

# 复制配置
cp .env.example .env

# 启动服务
pnpm dev
```

修改 `.env` 中的配置：

```env
QQ_ENABLED=true
OLLAMA_MODEL=qwen2.5:7b
```

✅ **验证**：在群里发送 `@你的QQ号 你好`，机器人应该回复了！

---

## 🔧 配置说明

所有配置通过 `.env` 文件管理：

```env
# QQ 设置
QQ_ENABLED=true              # 开启 QQ
QQ_WS_URL=ws://localhost:3001

# AI 模型设置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b

# 会话设置
SESSION_STORAGE=sqlite        # 持久化存储
SESSION_MAX_MESSAGES=100     # 上下文窗口大小

# 触发规则
CHAT_PREFIX=/ai              # 群聊命令前缀
PRIVATE_AUTO_REPLY=true      # 私聊自动回复
GROUP_AI_TRIGGER=both        # both=@或/ai都触发
```

---

## 📖 工作原理

```
┌─────────────┐     WebSocket      ┌─────────────────┐
│   NapCatQQ  │ ──────────────────▶│   AI Robot      │
│   (QQ客户端) │                    │   (Node.js)     │
└─────────────┘                    └────────┬────────┘
                                            │
                                       HTTP 请求
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │     Ollama      │
                                   │   (本地模型)     │
                                   └─────────────────┘
```

1. 你在 QQ 群 @机器人 发消息
2. NapCatQQ 通过 WebSocket 转发给 AI Robot
3. AI Robot 构造 Prompt，调用 Ollama
4. Ollama 用本地 Qwen 模型生成回复
5. AI Robot 把回复发回 QQ 群

---

## 📁 项目结构

```
ai-robot/
├── apps/
│   └── server/              # 主服务
├── packages/
│   ├── qq-adapter/          # QQ 适配器（NapCatQQ）
│   ├── ollama-adapter/       # Ollama 模型适配器
│   ├── sqlite-storage/       # SQLite 会话存储
│   └── config/              # 配置管理
├── docs/
│   ├── quick-start-qq.md    # 🚀 快速开始（必读）
│   ├── deployment.md         # 部署指南
│   └── prompt-guide.md       # Prompt 调整指南
├── deployments/
│   └── docker-compose.yml    # Docker 部署配置
└── Dockerfile
```

---

## 🤖 内置命令

| 命令 | 适用场景 | 说明 |
|------|----------|------|
| `@机器人 你好` | 群聊 | 通过 @ 触发 AI |
| `/ai 你好` | 群聊 | 通过命令触发 AI |
| `/ai help` | 两者 | 显示帮助信息 |
| `/ai clear` | 两者 | 清空当前会话 |

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 运行时 | Node.js 18+ | 后端服务 |
| 语言 | TypeScript | 类型安全 |
| 消息协议 | NapCatQQ WebSocket | QQ 接入 |
| AI 引擎 | Ollama | 本地模型运行 |
| 推荐模型 | Qwen 2.5 | 阿里巴巴开源模型 |
| 会话存储 | SQLite | 持久化 + 轻量 |
| 部署 | Docker | 一键部署 |

---

## ⚠️ 已知限制

1. **需要 Windows/Mac 本地运行 QQ** - NapCatQQ 目前需要图形界面
2. **CPU 运行较慢** - 建议使用 GPU 以获得更好体验
3. **单实例** - SQLite 不支持多实例并发写入
4. **模型需手动下载** - Qwen2.5:7B 约 4GB

---

## 📋 常见问题

<details>
<summary>机器人没有回复怎么办？</summary>

1. 确认服务已启动：`ps aux | grep node`
2. 确认 NapCatQQ 运行正常
3. 确认 `@机器人` 格式正确（机器人账号要对）
4. 查看服务日志是否有错误
</details>

<details>
<summary>Ollama 连不上？</summary>

1. 确认 Ollama 已启动：`ollama serve`
2. 确认模型已下载：`ollama list`
3. 确认端口配置：`OLLAMA_BASE_URL=http://localhost:11434`
</details>

<details>
<summary>群聊 @没反应？</summary>

1. 确认 `GROUP_AI_TRIGGER=both` 或 `GROUP_AI_TRIGGER=at`
2. 确认 @ 的是正确的机器人账号
3. 检查日志中的 `[Trigger]` 信息
</details>

---

## 🗺️ 路线图

- [x] QQ 群聊 AI 对话
- [x] 私聊自动回复
- [x] SQLite 持久化
- [x] /ai help & /ai clear
- [ ] Docker 一键部署优化
- [ ] 微信接入
- [ ] 更多模型支持
- [ ] 管理员命令

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT License
