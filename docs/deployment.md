# 部署指南

## 环境要求

- Node.js 18+
- Docker & Docker Compose (用于容器部署)
- Ollama (本地运行 AI 模型)
- NapCatQQ (QQ 机器人接入)

## 本地开发部署

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件配置必要的参数
```

### 3. 启动 Ollama

```bash
# 安装 Ollama: https://ollama.com

# 拉取模型
ollama pull qwen2.5:7b

# 启动 Ollama 服务
ollama serve
```

### 4. 启动 NapCatQQ

参见 [快速开始指南](./quick-start-qq.md)

### 5. 启动服务

```bash
# 开发模式
pnpm dev

# 或构建后运行
pnpm build
node apps/server/dist/index.js
```

## Docker 部署

### 1. 构建镜像

```bash
docker build -t ai-robot .
```

### 2. 配置 docker-compose

编辑 `deployments/docker-compose.yml` 或创建 `.env` 文件：

```env
# QQ 配置
QQ_ENABLED=true
QQ_WS_URL=ws://host.docker.internal:3001

# Ollama 配置 (需要宿主机运行)
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=qwen2.5:7b

# 会话存储
SESSION_STORAGE=sqlite
SESSION_MAX_MESSAGES=100

# 日志
LOG_LEVEL=info
```

### 3. 启动服务

```bash
cd deployments
docker-compose up -d
```

### 4. 查看日志

```bash
docker-compose logs -f app
```

## 数据存储

- **SQLite 数据库**: `./data/sessions.db`
- Docker 部署时映射到宿主机 `./data` 目录
- 服务重启后会话历史保留

## 网络说明

### Docker 网络模式

本项目使用 `network_mode: host`，容器直接使用宿主机网络。

- Ollama 需要在宿主机运行，容器通过 `host.docker.internal` 访问
- NapCatQQ 的 WebSocket 服务也需要在宿主机运行

### 独立部署 Ollama

Ollama 不适合放入 docker-compose，因为：

1. Ollama 需要 GPU 支持
2. 模型文件较大，重复下载浪费空间
3. 建议独立部署，与 AI Robot 通过 HTTP 通信

推荐部署架构：

```
┌─────────────────┐
│   NapCatQQ      │
│   (Windows/Mac) │
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐     ┌─────────────────┐
│   AI Robot      │────▶│   Ollama        │
│   (Docker/App)  │     │   (独立部署)    │
└─────────────────┘     └─────────────────┘
```

## 验证部署

1. 检查服务是否运行：

```bash
# 查看进程
ps aux | grep node

# 或 Docker
docker ps | grep ai-robot
```

2. 查看日志确认启动成功：

```
AI Robot Server v0.1.0
QQ adapter: enabled
LLM provider: ollama
Session storage: sqlite
Adapter started successfully
LLM provider health check passed
Chat Server started successfully
```

3. 在 QQ 群中测试：

- `@机器人 你好`
- `/ai 你好`
- `/ai help`
- `/ai clear`

## 故障排查

### 服务启动失败

1. 检查端口占用：
```bash
lsof -i :3000
```

2. 检查配置文件权限

### Ollama 连接失败

1. 确认 Ollama 服务运行中
2. 确认 `OLLAMA_BASE_URL` 配置正确
3. 尝试手动调用：`curl http://localhost:11434/api/generate -d '{"model":"qwen2.5:7b","prompt":"hi"}'`

### QQ 消息无响应

1. 确认 NapCatQQ 运行正常
2. 检查 WebSocket 连接状态
3. 确认 `QQ_ENABLED=true`

## 更新升级

```bash
# 拉取最新代码
git pull

# 重新构建
pnpm build

# 重启服务
# 开发模式: pnpm dev
# Docker: docker-compose down && docker-compose up -d
```
