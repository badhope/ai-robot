# 🤖 AI Robot

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   █████╗ ██╗███████╗██╗  ██╗██╗  ██╗   ██╗                   ║
║  ██╔══██╗██║██╔════╝╚██╗██╔╝╚██╗██╔╝   ██║                   ║
║  ███████║██║███████╗ ╚███╔╝  ╚███╔╝    ██║                   ║
║  ██╔══██║██║╚════██║ ██╔██╗  ██╔██╗    ╚═╝                   ║
║  ██║  ██║██║███████║██╔╝ ██╗██╔╝ ██╗   ██╗                   ║
║  ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝                   ║
║                                                                  ║
║            🤖 Local AI Robot for QQ Groups 🤖                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**在 QQ 群里调戏本地 AI 机器人**

一个轻量级的自托管 AI 聊天机器人，专为 QQ 群聊设计。无需云服务，无需 API Key，让你的群友与本地运行的 AI 直接对话。

---

[![Node.js Version](https://img.shields.io/badge/node-18%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge&logo=git)](LICENSE)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20AI-purple?style=for-the-badge&logo=anthropic)](https://ollama.com)
[![Qwen](https://img.shields.io/badge/Qwen-2.5%20Model-ff6b6b?style=for-the-badge&logo=alibaba)](https://github.com/QwenLM)
[![NapCatQQ](https://img.shields.io/badge/NapCatQQ-QQ%20Adapter-12defa?style=for-the-badge&logo=TencentQQ)](https://github.com/NapNeko/NapCatQQ)

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

> 🚀 **3 分钟部署，5 分钟跑通** —— 比想象中简单得多

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
│ [AIRobot] 你好！👋 我是基于 Qwen2.5 模型运行的本地 AI 助手   │
│                                                             │
│ 我的特点是：                                                 │
│ • 完全离线运行，不依赖任何外部 API                           │
│ • 响应速度快，所有推理都在本地完成                           │
│ • 完全开源，你可以随意修改和部署                             │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│ 私聊                                                        │
├─────────────────────────────────────────────────────────────┤
│ [小李] 你好                                                  │
│                                                             │
│ [AIRobot] 你好！有什么我可以帮你的吗？😊                     │
└─────────────────────────────────────────────────────────────┘
```

</details>

---

## ⚡ 快速开始

```
┌────────────────────────────────────────────────────────────────┐
│                     🚀 3 步快速启动                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ① 安装 Ollama          ② 启动 NapCatQQ       ③ 启动机器人     │
│  ─────────────          ─────────────         ─────────────     │
│  ollama serve           NapCatQQ 运行         pnpm dev         │
│  ollama pull qwen2.5    扫码登录 QQ           @机器人 测试     │
│                                                                │
│  ⏱️ ~5 分钟              ⏱️ ~3 分钟            ⏱️ ~1 分钟        │
└────────────────────────────────────────────────────────────────┘
```

### 第一步：安装 Ollama 并下载模型

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: 从 https://ollama.com 下载安装

# 启动 Ollama
ollama serve

# 下载推荐模型（约 4GB）
ollama pull qwen2.5:7b
```

✅ **验证**：`ollama list` 能看到 qwen2.5:7b

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

# 配置
cp .env.example .env
# 修改 QQ_ENABLED=true

# 启动
pnpm dev
```

🎉 **验证**：在群里发送 `@你的机器人 你好`

### 🎯 Setup UI 控制台（可选）

启动本地控制台，查看系统状态：

```bash
cd apps/setup-ui
pnpm start
# 打开 http://localhost:3002
```

控制台功能：
- 📊 查看系统状态（Ollama、NapCatQQ、模型）
- 💬 查看 Prompt 预设
- 🚀 下一步操作引导

---

## 🔧 配置说明

```env
# ──────────── QQ 设置 ────────────
QQ_ENABLED=true                    # 开启 QQ 机器人
QQ_WS_URL=ws://localhost:3001     # NapCatQQ 地址

# ──────────── AI 模型 ────────────
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b

# ──────────── 会话存储 ────────────
SESSION_STORAGE=sqlite             # 持久化存储
SESSION_MAX_MESSAGES=100          # 上下文窗口

# ──────────── 触发规则 ────────────
CHAT_PREFIX=/ai                   # 命令前缀
GROUP_AI_TRIGGER=both             # both=@或/ai都触发
PRIVATE_AUTO_REPLY=true           # 私聊自动回复
```

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `QQ_ENABLED` | false | 是否启用 QQ |
| `OLLAMA_MODEL` | qwen2.5:7b | 模型名称 |
| `SESSION_MAX_MESSAGES` | 100 | 记住多少条历史 |
| `GROUP_AI_TRIGGER` | both | at / mention / both |

---

## 📖 工作原理

```
                    ┌─────────────┐
                    │   NapCatQQ  │
                    │  (QQ客户端) │
                    └──────┬──────┘
                           │ WebSocket
                           ▼
┌──────────┐      ┌─────────────────┐      ┌─────────────────┐
│   QQ     │◀────▶│   AI Robot      │◀────▶│     Ollama      │
│   群友   │      │   (Node.js)     │      │   (本地模型)     │
└──────────┘      └─────────────────┘      └─────────────────┘
```

1. 群友在 QQ 群 @机器人 发消息
2. NapCatQQ 通过 WebSocket 转发给 AI Robot
3. AI Robot 构造 Prompt，调用 Ollama
4. Ollama 用本地 Qwen 模型生成回复
5. AI Robot 把回复发回 QQ 群

---

## 🤖 内置命令

| 命令 | 适用 | 说明 |
|------|------|------|
| `@机器人 xxx` | 群聊 | 通过 @ 触发 AI |
| `/ai xxx` | 群聊 | 通过命令触发 AI |
| `/ai help` | 两者 | 显示帮助 |
| `/ai clear` | 两者 | 清空当前会话 |

---

## 🛠️ 技术栈

```
┌─────────────────────────────────────────────────────┐
│                    技术架构                          │
├─────────────┬─────────────┬───────────────────────┤
│    Node.js  │  TypeScript │      NapCatQQ         │
│   18+       │   类型安全   │      QQ 接入          │
├─────────────┼─────────────┼───────────────────────┤
│    Ollama   │   Qwen 2.5  │       SQLite         │
│  本地模型    │   阿里开源   │      持久化          │
└─────────────┴─────────────┴───────────────────────┘
```

---

## 📁 项目结构

```
ai-robot/
├── apps/
│   ├── server/              # 🤖 主服务
│   └── setup-ui/            # 🎯 Setup UI 控制台
├── packages/
│   ├── core/               # 📋 核心接口定义
│   ├── qq-adapter/         # 💬 QQ 适配器 (NapCatQQ)
│   ├── ollama-adapter/     # 🤖 Ollama 适配器
│   ├── sqlite-storage/     # 💾 SQLite 持久化
│   ├── memory-storage/     # 💾 内存存储
│   ├── doctor/             # 🩺 环境检查工具
│   └── config/             # ⚙️ 配置管理
├── prompts/                # 💬 Prompt 预设
│   ├── default/            # 默认风格
│   ├── group/              # 群聊专用
│   └── helper/             # 辅助提示
├── docs/
│   ├── quick-start-qq.md   # 🚀 快速开始
│   ├── deployment.md       # 🐳 部署指南
│   ├── prompt-guide.md     # 💬 Prompt 调整
│   └── troubleshooting.md   # ❓ 故障排除
├── examples/               # 📚 示例配置
│   └── qq-ollama-minimal/  # 最小配置示例
├── deployments/
│   └── docker-compose.yml   # 🐳 Docker 部署
└── Dockerfile
```

---

## ⚠️ 已知限制

| 限制 | 说明 | 解决方案 |
|------|------|----------|
| 🔒 需要图形界面 | NapCatQQ 需本地运行 | 未来考虑无头方案 |
| 🐢 CPU 运行较慢 | 无 GPU 时响应慢 | 建议使用 GPU |
| 📦 单实例 | SQLite 不支持并发 | 未来考虑 PostgreSQL |
| 💾 模型需手动下载 | qwen2.5:7B 约 4GB | 首次下载后可持续使用 |

---

## 📋 常见问题

<details>
<summary>🤔 机器人没有回复怎么办？</summary>

1. 确认服务已启动：`tasklist | findstr node` (Windows)
2. 确认 NapCatQQ 运行正常
3. 确认 `@机器人` 格式正确
4. 查看服务日志是否有错误

</details>

<details>
<summary>🔗 Ollama 连不上？</summary>

1. 确认 Ollama 已启动：`ollama serve`
2. 确认模型已下载：`ollama list`
3. 确认端口：`OLLAMA_BASE_URL=http://localhost:11434`

</details>

<details>
<summary>📢 群聊 @没反应？</summary>

1. 确认 `GROUP_AI_TRIGGER=both` 或 `at`
2. 确认 @ 的是正确的机器人账号
3. 检查日志中的 `[Trigger]` 信息

</details>

<details>
<summary>🐢 回复太慢？</summary>

- 用 GPU：NVIDIA 显卡 + CUDA 驱动
- 用更小的模型：`OLLAMA_MODEL=qwen2.5:3b`
- 减少上下文：`SESSION_MAX_MESSAGES=20`

</details>

---

## 🗺️ 路线图

```
Phase 1 ✅ 工程骨架与核心接口
Phase 2 ✅ QQ + Ollama MVP 闭环
Phase 3 ✅ SQLite 持久化 + 命令 + Docker
Phase 4 ✅ Setup UI + Doctor 环境检查

未来计划
├── 🐳 Docker 部署优化
├── 💬 微信接入
├── 🔄 多模型支持
├── 📊 管理员命令
└── 🎨 Prompt 可视化编辑
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT License
