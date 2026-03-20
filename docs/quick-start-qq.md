# 🚀 QQ + Ollama 快速开始

**目标：在 10 分钟内，让你的 QQ 群有一个能跑的本地 AI 机器人**

---

## 📦 你将得到

- 一个可以在 QQ 群被 @ 或用 `/ai` 命令调用的 AI 机器人
- 基于本地 Qwen2.5 模型，完全离线运行
- 支持上下文记忆，会话不丢失

---

## 🧱 准备条件

### 必需的软件

| 软件 | 版本要求 | 安装地址 |
|------|----------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Git | 任意 | [git-scm.com](https://git-scm.com) |
| QQ | 任意版本 | 你的电脑 |
| Ollama | 最新版 | [ollama.com](https://ollama.com) |
| NapCatQQ | 最新版 | [GitHub](https://github.com/NapNeko/NapCatQQ/releases) |

### 硬件建议

| 配置 | 可用性 | 说明 |
|------|--------|------|
| 有 GPU (Nvidia) | ✅ 推荐 | 响应快，体验好 |
| 有 GPU (AMD) | ✅ 可用 | Ollama 支持 |
| 仅 CPU | ⚠️ 勉强 | 响应较慢，但能跑 |
| 8GB 以下内存 | ❌ 不建议 | 模型需要足够内存 |

---

## 第一步：安装 Ollama 并下载模型

> ⏱️ 预计时间：5 分钟（取决于网速）

### 1.1 安装 Ollama

**macOS / Linux：**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows：**
1. 访问 https://ollama.com
2. 点击下载 Windows 版本
3. 运行安装包

### 1.2 启动 Ollama

```bash
ollama serve
```

> 💡 **提示**：保持这个终端窗口开着，Ollama 需要一直在后台运行

### 1.3 下载模型

```bash
ollama pull qwen2.5:7b
```

> 📦 首次下载约 4GB，请耐心等待
> 🤗 推荐原因：阿里开源，中文支持好，7B 参数适合大多数设备

### ✅ 验证

```bash
ollama list
```

**预期输出：**
```
NAME                SIZE      MODIFIED
qwen2.5:7b          4.7GB     2 minutes ago
```

如果看到这个，Ollama 部分就搞定了！

---

## 第二步：启动 NapCatQQ

> ⏱️ 预计时间：3 分钟

### 2.1 什么是 NapCatQQ？

NapCatQQ 是一个"QQ 机器人框架"。它让你的 QQ 号变成可以被程序控制的机器人。

简单说：它是一座桥，把 QQ 消息转成 WebSocket 事件，让我们的程序能收到。

### 2.2 下载并运行

1. **下载 NapCatQQ**
   - 地址：https://github.com/NapNeko/NapCatQQ/releases
   - 选择对应系统的版本下载

2. **运行 NapCatQQ**
   - Windows：直接运行 `.exe`
   - 首次运行会要求扫码登录你的 QQ

3. **确认登录成功**
   - 日志应该显示 "登录成功" 或类似信息
   - 记住显示的 WebSocket 地址（通常是 `ws://localhost:3001`）

### 2.3 配置 WebSocket

如果 NapCatQQ 不是默认 3001 端口，修改 `.env`：

```env
QQ_WS_URL=ws://localhost:3001
```

### ✅ 验证

NapCatQQ 日志应该显示类似：
```
WebSocket 服务已启动: ws://0.0.0.0:3001
```

---

## 第三步：启动 AI Robot

> ⏱️ 预计时间：2 分钟

### 3.1 克隆项目

```bash
git clone https://github.com/badhope/ai-robot.git
cd ai-robot
```

### 3.2 安装依赖

```bash
pnpm install
```

> 💡 如果没有 pnpm：`npm install -g pnpm`

### 3.3 配置

```bash
cp .env.example .env
```

编辑 `.env` 文件，至少修改：

```env
# 开启 QQ
QQ_ENABLED=true

# Ollama 配置（通常不需要改）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

### 3.4 启动

```bash
pnpm dev
```

### ✅ 验证成功

终端应该显示：
```
==================================================
AI Robot Server v0.1.0
==================================================
QQ adapter: enabled
LLM provider: ollama
Session storage: sqlite
Adapter started successfully
LLM provider health check passed
Chat Server started successfully
```

---

## 🎉 验证：让它回复你

### 在群里测试

1. 打开你的 QQ，进入任意群
2. **@你的机器人** 发一条消息：
   ```
   @你的机器人名称 你好
   ```
3. 等待几秒，机器人应该回复了！

### 用命令测试

在群里发：
```
/ai 你好
```

### 用私聊测试

给机器人发一条私信，它应该自动回复。

### /ai help 和 /ai clear

```
/ai help     # 查看帮助
/ai clear    # 清空当前会话
```

---

## ❌ 常见问题

### Q: 机器人完全没有反应

**排查步骤：**

1. **检查服务是否在跑**
   ```bash
   # Windows
   tasklist | findstr node

   # Mac/Linux
   ps aux | grep node
   ```
   如果没有输出，说明服务没启动。

2. **检查 NapCatQQ 是否在线**
   - NapCatQQ 窗口应该开着
   - 状态应该是"已登录"

3. **检查 QQ_ENABLED**
   - `.env` 中 `QQ_ENABLED=true` 应该是 `true`

4. **看日志**
   - 服务日志应该有收到消息的记录
   - 如果完全没有日志，说明 NapCatQQ 没连上

---

### Q: Ollama 连不上

**错误表现：** 机器人回复"AI 服务暂时不可用"

**排查步骤：**

1. **Ollama 开了吗？**
   ```bash
   # 新开一个终端，运行：
   curl http://localhost:11434/api/tags
   ```
   如果报错 `Connection refused`，说明 Ollama 没运行。

2. **运行 Ollama**
   ```bash
   ollama serve
   ```

3. **模型下好了吗？**
   ```bash
   ollama list
   ```
   应该看到 `qwen2.5:7b`

4. **端口对吗？**
   `.env` 中：
   ```
   OLLAMA_BASE_URL=http://localhost:11434
   ```

---

### Q: 群里 @没反应

**排查步骤：**

1. **@的是对的机器人吗？**
   - 确认机器人 QQ 号是对的
   - 确认 @ 格式是 `@机器人名称`（不是 @QQ号）

2. **检查触发配置**
   `.env` 中：
   ```
   GROUP_AI_TRIGGER=both
   ```
   - `at` = 只有 @ 才触发
   - `both` = @ 和 `/ai` 都触发

3. **看日志**
   服务日志应该有 `[Trigger]` 或 `[Message]` 开头的行

---

### Q: 回复太慢了

**原因：** CPU 运行模型本来就慢

**解决方案：**

1. **用 GPU**
   - NVIDIA 显卡最好
   - 安装 CUDA 驱动后，Ollama 会自动用 GPU

2. **用更小的模型**
   ```env
   OLLAMA_MODEL=qwen2.5:3b   # 更快，但智能程度降低
   ```

3. **减少上下文**
   ```env
   SESSION_MAX_MESSAGES=20   # 减少对话历史
   ```

---

### Q: 服务重启后没有回复了

**原因：** 可能是 NapCatQQ 掉线了

**解决：**
1. 重启 NapCatQQ（重新扫码登录）
2. 重新启动 AI Robot

---

## 📁 接下来做什么

- **[配置 Prompt](./prompt-guide.md)** - 让机器人有不同的性格
- **[部署指南](./deployment.md)** - 用 Docker 部署到服务器
- **[常见问题 FAQ](../README.md#-常见问题)** - 更多问题解答

---

## 🆘 求助

如果按照以上步骤还是跑不通：

1. 截图错误信息
2. 描述你做到哪一步
3. 提交 GitHub Issue

我们会尽快帮你解决！
