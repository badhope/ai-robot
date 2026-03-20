# 💬 QQ + Ollama 最小示例

**最基础的配置，快速验证机器人是否能跑通**

## 适用场景

- ✅ 首次部署测试
- ✅ 验证基本功能是否正常
- ✅ 最小化配置需求

## 快速开始

### 1. 准备

确保已完成：
- [x] 安装 Ollama
- [x] 下载 qwen2.5:7b 模型
- [x] 启动 NapCatQQ

### 2. 配置

创建 `.env` 文件：

```env
QQ_ENABLED=true
QQ_WS_URL=ws://localhost:3001
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
SESSION_STORAGE=memory
LOG_LEVEL=info
```

### 3. 运行

```bash
pnpm install
pnpm dev
```

### 4. 测试

在群里发送：

```
@你的机器人 你是谁
```

**预期回复**：机器人介绍自己

---

## 说明

这是最小化配置，使用内存存储（服务重启后会话丢失）。

适合验证功能，不适合长期使用。

---

## 所需环境变量

| 变量 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| QQ_ENABLED | ✅ | false | 必须设为 true |
| QQ_WS_URL | ❌ | ws://localhost:3001 | NapCatQQ 地址 |
| OLLAMA_BASE_URL | ❌ | http://localhost:11434 | Ollama 地址 |
| OLLAMA_MODEL | ❌ | qwen2.5:7b | 模型名称 |
| SESSION_STORAGE | ❌ | sqlite | memory 或 sqlite |
