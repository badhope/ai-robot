# 🤖 AI Robot

<div align="center">

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   █████╗ ██╗███████╗██╗  ██╗██╗  ██╗   ██╗                   ║
║  ██╔══██╗██║██╔════╝╚██╗██╔╝╚██╗██╔╝   ██║                   ║
║  ███████║██║███████╗ ╚███╔╝  ╚███╔╝    ██║                   ║
║  ██╔══██║██║╚════██║ ██╔██╗  ██╔██╗    ╚═╝                   ║
║  ██║  ██║██║███████║██╔╝ ██╗██╔╝ ██╗   ██║                   ║
║  ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝                   ║
║                                                                  ║
║        🤖 QQ 群聊 AI 机器人 · 阿里云/通义 API 主线 🤖              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**🚀 v1.20 正式版 · 默认阿里云/通义 API · 无需 GPU · 开箱即用**

[![Node.js Version](https://img.shields.io/badge/node-18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-yellow?style=flat-square&logo=git)](LICENSE)
[![Alibaba](https://img.shields.io/badge/DashScope-API%20First-ff6b6b?style=flat-square&logo=alibaba)](https://help.aliyun.com/zh/dashscope)
[![NapCatQQ](https://img.shields.io/badge/NapCatQQ-QQ%20Adapter-12defa?style=flat-square&logo=TencentQQ)](https://github.com/NapNeko/NapCatQQ)

</div>

---

## ✨ 你能做什么

| 功能 | 说明 |
|------|------|
| 🎯 **@机器人提问** | 在 QQ 群 @机器人 发消息，AI 立即回答 |
| 🔥 **/ai 命令触发** | 发送 `/ai 你好` 同样触发 AI 对话 |
| 💬 **私聊自动回复** | 给机器人发私信，自动回复 |
| 💾 **会话持久化** | 服务重启后会话不丢失（SQLite） |
| 🧹 **/ai clear** | 清空当前会话，重新开始 |
| 📖 **/ai help** | 查看帮助信息 |

---

## 🎯 效果演示

<details>
<summary>👆 点击查看对话示例</summary>

```
┌─────────────────────────────────────────────────────────────┐
│ 群聊 @机器人                                                │
├─────────────────────────────────────────────────────────────┤
│ [小明] @AIRobot 你好，请介绍一下自己                         │
│                                                             │
│ [AIRobot] 你好！👋 我是基于 Qwen2.5 模型运行的 AI 助手      │
│                                                             │
│ 我的特点是：                                                 │
│ • 默认使用阿里云/通义 API，响应快速                          │
│ • 支持上下文记忆，会话连贯                                   │
│ • 完全开源，你可以随意修改和部署                             │
└─────────────────────────────────────────────────────────────┘
```

</details>

---

## 🚀 快速开始（API 模式 - 默认推荐）

```
┌────────────────────────────────────────────────────────────────┐
│                     🚀 3 步快速启动                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ① 获取 API Key      ② 启动 NapCatQQ       ③ 启动机器人       │
│  ─────────────        ─────────────          ─────────────      │
│  阿里云百炼           NapCatQQ 运行          pnpm dev           │
│  ~2 分钟              ~3 分钟                ~1 分钟           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 第一步：获取阿里云 API Key

1. 打开 [阿里云百炼](https://bailian.console.aliyun.com/)
2. 注册并登录
3. 开通 DashScope 服务
4. 创建 API Key

```bash
# 配置到 .env 文件
ALIBABA_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 第二步：启动 NapCatQQ

> NapCatQQ 让你的 QQ 号变成可被程序控制的机器人

1. 下载 [NapCatQQ](https://github.com/NapNeko/NapCatQQ/releases)
2. 运行并扫码登录你的 QQ
3. 确认 WebSocket 是 `ws://localhost:3001`

### 第三步：启动 AI Robot

```bash
# 克隆并安装
git clone https://github.com/badhope/ai-robot.git
cd ai-robot
pnpm install

# 自动配置（推荐）
pnpm setup

# 或手动配置
cp .env.example .env
# 修改 .env 中的 ALIBABA_API_KEY

# 启动
pnpm dev

# 打开控制台查看状态
# http://localhost:3002
```

🎉 **验证**：在群里发送 `@你的机器人 你好`

---

## 🔍 环境检测

项目提供了自动环境检测功能：

```bash
# 检查环境状态
pnpm doctor
```

检测内容包括：
- Node.js 版本
- 配置文件状态
- 阿里云 API 连接
- NapCatQQ 连接
- SQLite 数据库

---

## 💡 可选：使用本地模型（需要 GPU）

如果你有 NVIDIA 显卡，可以切换到本地 Ollama 模型：

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

```bash
# 安装 Ollama: https://ollama.com
ollama pull qwen2.5:7b
ollama serve
```

> ⚠️ 本地模式需要：
> - NVIDIA 显卡（建议 6GB+ 显存）
> - 安装并运行 Ollama
> - 下载模型文件

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [快速开始](docs/quick-start-qq.md) | 5 分钟快速上手 |
| [部署指南](docs/deployment.md) | 详细部署说明 |
| [Prompt 指南](docs/prompt-guide.md) | 机器人风格配置 |
| [常见问题](docs/faq.md) | FAQ |
| [故障排查](docs/troubleshooting.md) | 问题排查 |
| [架构文档](docs/architecture.md) | 开发者架构说明 |
| [AI 扩展指南](docs/ai-extension-guide.md) | AI 扩展者指南 |

---

## 🏗️ 项目结构

```
ai-robot/
├── apps/
│   ├── server/              # 主服务
│   └── setup-ui/           # 可视化控制台 (http://localhost:3002)
├── packages/
│   ├── core/                # 核心逻辑
│   ├── config/              # 配置管理
│   ├── doctor/              # 环境检测 (pnpm doctor)
│   ├── storage/             # 存储抽象层
│   ├── sqlite-storage/      # SQLite 实现
│   ├── memory-storage/      # 内存实现 (开发用)
│   ├── llm-adapters/        # LLM 适配器抽象
│   ├── im-adapters/         # IM 适配器抽象
│   ├── alibaba-adapter/     # 阿里云/通义 API Provider
│   ├── ollama-adapter/      # Ollama 本地模型 Provider
│   ├── qq-adapter/          # QQ 平台适配器
│   ├── wechat-adapter/      # 微信平台适配器 (预留)
│   ├── shared/              # 共享工具
│   └── logger/              # 日志
├── docs/                    # 文档
├── prompts/                 # Prompt 预设
├── scripts/                 # 脚本 (pnpm setup)
├── deployments/             # 部署配置
└── examples/                # 示例配置
```

---

## 🎨 v1.20 升级亮点

| 能力 | 说明 |
|------|------|
| 🔍 **自动环境检测** | `pnpm doctor` 一键检查环境状态 |
| ⚡ **自动配置** | `pnpm setup` 自动初始化项目 |
| 🎁 **可视化控制台** | http://localhost:3002 查看状态 |
| 📊 **状态可视化** | 清晰的成功/警告/失败提示 |
| 📖 **文档升级** | 更完整的文档体系 |

---

## 📄 License

MIT
