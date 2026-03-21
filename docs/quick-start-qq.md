# 🚀 QQ 机器人快速开始（API-first）

**目标：5 分钟内，让你的 QQ 群有一个能跑的 AI 机器人**

默认使用阿里云/通义 API，无需本地 GPU，开箱即用。

---

## 🎯 你将得到

- 一个可以在 QQ 群被 @ 或用 `/ai` 命令调用的 AI 机器人
- 默认使用阿里云/通义 API，配置简单，响应快
- 支持上下文记忆，会话不丢失

---

## 🧱 准备条件

### 必需的软件

| 软件 | 用途 | 安装地址 |
|------|------|----------|
| Node.js 18+ | 运行机器人 | [nodejs.org](https://nodejs.org) |
| Git | 克隆项目 | [git-scm.com](https://git-scm.com) |
| QQ | 聊天用 | 你的电脑 |
| NapCatQQ | QQ 机器人框架 | [GitHub](https://github.com/NapNeko/NapCatQQ/releases) |
| 阿里云 API Key | AI 能力 | [阿里云百炼](https://bailian.console.aliyun.com/) |

### 硬件要求

| 配置 | 可用性 | 说明 |
|------|--------|------|
| 任意电脑 | ✅ 推荐 | API 模式不需要本地算力 |
| 有 NVIDIA 显卡 | ✅ 可选 | 可切换到本地模型 |
| 4GB+ 内存 | ✅ 足够 | API 模式要求低 |

---

## ☁️ API 模式快速开始（默认推荐）

### 第一步：获取阿里云 API Key

> ⏱️ 预计时间：2 分钟

1. 打开 [阿里云百炼](https://bailian.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 开通 DashScope 服务
4. 创建 API Key

![创建 API Key 示意](https://img.shields.io/badge/步骤-4步-blue?style=for-the-badge)

复制你的 API Key，格式类似：`sk-xxxxxxxxxxxxxxxxxxxxxxxx`

### 第二步：启动 NapCatQQ

> ⏱️ 预计时间：3 分钟

1. **下载 NapCatQQ**
   - 地址：https://github.com/NapNeko/NapCatQQ/releases
   - 下载对应系统的版本

2. **运行并扫码登录**
   - 启动 NapCatQQ
   - 用 QQ 扫描二维码登录

3. **确认 WebSocket 地址**
   - 默认：`ws://localhost:3001`
   - 确认在 NapCatQQ 设置中开启 WebSocket

### 第三步：配置并启动

> ⏱️ 预计时间：2 分钟

```bash
# 克隆项目
git clone https://github.com/badhope/ai-robot.git
cd ai-robot

# 安装依赖
pnpm install

# 复制配置
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 开启 QQ
QQ_ENABLED=true

# 填入你的 API Key
ALIBABA_API_KEY=sk-your-key-here
```

启动：

```bash
pnpm dev
```

### ✅ 验证

在 QQ 群里发送：

```
@你的机器人 你好
```

或者：

```
/ai 你好
```

机器人应该回复！

---

## 🤖 测试内置命令

| 命令 | 说明 |
|------|------|
| `/ai help` | 查看帮助 |
| `/ai clear` | 清空当前会话 |

---

## 💡 可选：切换到本地模型

如果你有 NVIDIA 显卡，想降低 API 调用成本：

### 1. 安装 Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# https://ollama.com 下载安装
```

### 2. 下载模型

```bash
ollama pull qwen2.5:7b
```

### 3. 修改配置

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

### 4. 启动 Ollama

```bash
ollama serve
```

---

## ❓ 常见问题

<details>
<summary>机器人没有回复？</summary>

1. 确认服务已启动（终端有输出）
2. 确认 NapCatQQ 在线
3. 确认 @ 的是正确的机器人账号
4. 查看终端日志

</details>

<details>
<summary>API 调用失败？</summary>

1. 确认 `ALIBABA_API_KEY` 正确
2. 确认 API Key 有余额
3. 确认网络可以访问阿里云

</details>

<details>
<summary>回复很慢？</summary>

- API 模式通常 3-5 秒回复
- 如果太慢，可能是网络或 API 限流
- 本地模型响应速度取决于硬件

</details>

<details>
<summary>想清空会话？</summary>

发送 `/ai clear` 即可清空当前会话历史。

</details>

---

## 🚀 下一步

- 查看 [Prompt 调整指南](prompt-guide.md)
- 查看 [部署文档](../deployment.md)
- 查看 [故障排除](troubleshooting.md)
