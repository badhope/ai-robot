# 部署指南

## 环境要求

### API 模式（默认推荐）

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | 运行机器人 |
| pnpm | 8+ | 包管理器 |
| NapCatQQ | 最新版 | QQ 机器人框架 |

### 本地模式（可选，需要 GPU）

| 软件 | 版本 | 说明 |
|------|------|------|
| NVIDIA 显卡 | 6GB+ 显存 | 运行本地模型 |
| Ollama | 最新版 | 本地模型运行时 |

---

## 🚀 快速部署（API 模式）

### 第一步：安装依赖

```bash
git clone https://github.com/badhope/ai-robot.git
cd ai-robot
pnpm install
```

### 第二步：自动配置

```bash
pnpm setup
```

这会自动：
- 创建 `.env` 文件
- 创建必要目录
- 初始化 SQLite 数据库

### 第三步：配置 API Key

编辑 `.env` 文件，填入你的阿里云 API Key：

```env
ALIBABA_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

获取 API Key：https://bailian.console.aliyun.com/

### 第四步：启动 NapCatQQ

1. 下载 [NapCatQQ](https://github.com/NapNeko/NapCatQQ/releases)
2. 运行并扫码登录
3. 确认 WebSocket 是 `ws://localhost:3001`

### 第五步：启动机器人

```bash
pnpm dev
```

打开 http://localhost:3002 查看控制台状态。

---

## 🐳 Docker 部署

### 1. 构建镜像

```bash
docker build -t ai-robot .
```

### 2. 配置环境

创建 `.env` 文件：

```env
# AI Provider - API 模式（默认）
LLM_PROVIDER=alibaba
ALIBABA_API_KEY=sk-xxxxxxxxxxxxxxxx

# 或本地模式（需要 Ollama）
# LLM_PROVIDER=ollama
# OLLAMA_BASE_URL=http://host.docker.internal:11434
# OLLAMA_MODEL=qwen2.5:7b

# QQ 配置
QQ_ENABLED=true
QQ_WS_URL=ws://host.docker.internal:3001

# 存储
SESSION_STORAGE=sqlite
```

### 3. 启动服务

```bash
cd deployments
docker-compose up -d
```

### 4. 查看日志

```bash
docker-compose logs -f
```

---

## 💻 本地开发

### 启动开发模式

```bash
pnpm dev
```

### 启动控制台

```bash
pnpm dev:ui
# 访问 http://localhost:3002
```

### 环境检测

```bash
pnpm doctor
```

---

## 🔧 高级配置

### 切换到本地模式

编辑 `.env`：

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

安装 Ollama：

```bash
# 安装 Ollama: https://ollama.com
ollama pull qwen2.5:7b
ollama serve
```

### 配置代理

如果网络受限，可以配置代理：

```env
HTTP_PROXY=http://localhost:7890
HTTPS_PROXY=http://localhost:7890
```

### 日志级别

```env
LOG_LEVEL=debug  # debug | info | warn | error
```

---

## 📁 目录结构

部署后会产生以下目录：

| 目录 | 说明 |
|------|------|
| `./data/` | SQLite 数据库、会话存储 |
| `./logs/` | 日志文件 |
| `./cache/` | 临时缓存 |

---

## 🔒 安全建议

1. **API Key 安全**
   - 不要提交 `.env` 到 Git
   - 生产环境使用环境变量

2. **网络隔离**
   - 生产环境建议在内网运行
   - 配置防火墙规则

3. **定期备份**
   - 备份 `data/sessions.db`
   - 备份 `.env` 配置文件

---

## 🆘 常见问题

### Q: 启动后显示 "NapCatQQ 未连接"？

1. 确认 NapCatQQ 已启动
2. 确认 WebSocket 地址是 `ws://localhost:3001`
3. 确认 QQ 已扫码登录

### Q: API 调用失败？

1. 检查 `ALIBABA_API_KEY` 是否正确
2. 检查阿里云账户余额
3. 运行 `pnpm doctor` 检查

### Q: Docker 部署无法连接 NapCatQQ？

使用 `host.docker.internal` 代替 `localhost`：

```env
QQ_WS_URL=ws://host.docker.internal:3001
```

---

## 📚 相关文档

- [快速开始](quick-start-qq.md)
- [故障排查](troubleshooting.md)
- [FAQ](faq.md)
