# ❓ 常见问题与故障排除

本文档整理了部署和使用过程中的常见问题及解决方案。

---

## 🔍 基础检查

### 如何确认服务启动成功？

1. **检查进程**
   ```bash
   # Windows
   tasklist | findstr node

   # macOS / Linux
   ps aux | grep node
   ```

2. **查看日志**
   服务启动后应该看到类似输出：
   ```
   [AI Robot] 服务器已启动
   [QQ Adapter] 正在连接到 ws://localhost:3001...
   [Ollama] 健康检查通过
   ```

3. **使用 Doctor 检查**
   ```bash
   node packages/doctor/dist/index.js
   ```

---

## 💬 机器人没有回复

### 排查步骤

| 步骤 | 检查 | 操作 |
|------|------|------|
| 1 | 服务是否运行 | `tasklist \| findstr node` |
| 2 | NapCatQQ 是否正常 | 检查 NapCatQQ 是否在线 |
| 3 | @ 格式是否正确 | 确认 @ 的是机器人账号 |
| 4 | 日志是否有错误 | 查看终端日志 |
| 5 | 网络连通性 | Ping localhost:11434 |

### 常见原因

**1. NapCatQQ 掉线**
```
症状：突然不回复，之前正常
解决：重新启动 NapCatQQ，重新扫码登录
```

**2. 触发规则问题**
```
症状：私聊正常，群里不回复
检查：.env 中 GROUP_AI_TRIGGER 设置
- both = @ 或 /ai 都触发
- at = 只有 @ 触发
- mention = 只有 /ai 触发
```

**3. 消息被风控**
```
症状：有时候回复有时候不回复
原因：QQ 消息频率限制
解决：降低消息频率，避免短时间大量消息
```

---

## 🔗 Ollama 连不上

### 症状
```
[Ollama] ❌ 健康检查失败
[Ollama] ❌ 生成失败: connect ECONNREFUSED
```

### 排查步骤

1. **Ollama 是否启动**
   ```bash
   # Windows: 检查任务管理器中是否有 ollama.exe
   # macOS: 检查进程
   ps aux | grep ollama
   ```

2. **手动测试 Ollama**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   如果返回 JSON 说明 Ollama 正常。

3. **检查端口**
   ```env
   # 确认 .env 中地址正确
   OLLAMA_BASE_URL=http://localhost:11434
   ```

### 解决方案

**原因 1：Ollama 未启动**
```bash
ollama serve
```

**原因 2：端口被占用**
```bash
# 查找占用端口的进程
netstat -ano | findstr 11434

# kill 对应进程或换端口
OLLAMA_BASE_URL=http://localhost:11435
```

**原因 3：Windows 防火墙**
```
解决：允许 Node.js 通过防火墙
设置 -> 网络和 Internet -> Windows 防火墙
-> 允许应用通过防火墙 -> 添加 node.exe
```

---

## 🐢 回复太慢

### 原因分析

| 原因 | 症状 | 解决方案 |
|------|------|----------|
| 仅 CPU | 首token 10s+ | 使用 GPU |
| 模型太大 | 7B 模型慢 | 换 3B 模型 |
| 上下文过长 | 越来越慢 | 减少历史 |
| Ollama 版本旧 | 不稳定 | 升级 Ollama |

### 解决方案

**1. 使用 GPU 加速**
```env
# NVIDIA 显卡
OLLAMA_MODEL=qwen2.5:7b

# Ollama 会自动检测 CUDA
```

**2. 使用更小的模型**
```env
# 3B 模型，速度快但智能度降低
OLLAMA_MODEL=qwen2.5:3b
```

**3. 减少上下文窗口**
```env
# 减少对话历史记忆
SESSION_MAX_MESSAGES=20
```

**4. 升级 Ollama**
```bash
# macOS
brew upgrade ollama

# Windows: 重新下载安装包
```

---

## 📢 @机器人 没反应

### 检查清单

- [ ] `GROUP_AI_TRIGGER` 设置为 `both` 或 `at`
- [ ] @ 的是正确的机器人账号（不是自己的号）
- [ ] NapCatQQ 运行正常
- [ ] 机器人已加入群聊

### 解决方法

1. **检查配置**
   ```env
   GROUP_AI_TRIGGER=both  # 推荐
   ```

2. **确认 @ 对象**
   在群里 @ 机器人时，确认显示的是机器人的昵称而不是你的 QQ 昵称。

3. **检查 NapCatQQ**
   NapCatQQ 需要开启 WebSocket 且 AI Robot 配置的地址要匹配。

---

## 🔥 /ai 命令没触发

### 可能原因

| 原因 | 检查 | 解决 |
|------|------|------|
| 空格 | `/ai你好` vs `/ai 你好` | 中间必须有空格 |
| 前缀 | `/chat 你好` | 必须是 `/ai` |
| 配置 | `CHAT_PREFIX` | 确认为 `/ai` |

### 正确用法
```
✅ /ai 你好
✅ /ai 今天天气怎么样
❌ /ai你好（没有空格）
```

---

## 💾 会话问题

### 如何清空会话？

发送 `/ai clear` 即可清空当前会话。

### 会话什么时候丢失？

使用 `SESSION_STORAGE=memory` 时：
- 服务重启后会话丢失
- 长时间不对话可能会话过期

使用 `SESSION_STORAGE=sqlite` 时：
- 服务重启后不会丢失
- 数据持久化在 `data/sessions.db`

### 如何切换存储方式？

```env
# 内存存储（默认）
SESSION_STORAGE=memory

# SQLite 持久化
SESSION_STORAGE=sqlite
SQLITE_DB_PATH=./data/sessions.db
```

---

## 🔄 如何更换模型？

### 步骤

1. **下载新模型**
   ```bash
   ollama pull qwen2.5:3b
   # 或其他模型
   ollama pull llama2:7b
   ```

2. **修改配置**
   ```env
   OLLAMA_MODEL=qwen2.5:3b
   ```

3. **重启服务**
   ```bash
   # Ctrl+C 停止
   pnpm dev
   ```

### 推荐模型

| 模型 | 大小 | 速度 | 适用场景 |
|------|------|------|----------|
| qwen2.5:3b | 2GB | 快 | 日常闲聊 |
| qwen2.5:7b | 4GB | 中 | 通用场景 |
| llama2:7b | 3.8GB | 中 | 英文为主 |

---

## 💬 如何切换 Prompt？

### 方法 1：指定文件

```env
SYSTEM_PROMPT_FILE=./prompts/group/concise.txt
```

### 方法 2：直接写内容

```env
SYSTEM_PROMPT=你是一个友好的助手，总是尽可能地帮助用户。
```

### 可用预设

| 文件 | 风格 |
|------|------|
| `prompts/default/friendly.txt` | 友好助手 |
| `prompts/default/tech-expert.txt` | 技术专家 |
| `prompts/group/concise.txt` | 群聊简洁 |
| `prompts/group/active.txt` | 群聊活跃 |

---

## 🐳 Docker 相关

### 容器内无法连接 Ollama

Docker 容器内需要用 `host.docker.internal` 访问宿主机：

```yaml
environment:
  - OLLAMA_BASE_URL=http://host.docker.internal:11434
  - QQ_WS_URL=ws://host.docker.internal:3001
```

### Windows Docker Desktop

确保已在 Docker Settings -> General 中勾选 "Expose daemon on tcp://localhost:2375"

---

## 🆘 其他问题

### 提交 Issue 前

请准备以下信息：
1. 操作系统和版本
2. Node.js 版本：`node -v`
3. Ollama 版本：`ollama -v`
4. 错误日志（完整，不要截断）
5. 复现步骤

### 获取日志

```bash
# 查看详细日志
LOG_LEVEL=debug pnpm dev

# 保存日志到文件
pnpm dev > output.log 2>&1
```

---

## 📞 获得帮助

- 🐛 提交 Bug：[GitHub Issues](https://github.com/badhope/ai-robot/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/badhope/ai-robot/discussions)
- 📖 查看文档：[README.md](../README.md)
