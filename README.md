# AI Robot

聊天机器人网关系统，支持微信、QQ 接入，本地模型与云 API。

## 当前状态

### 第二阶段：微信 + Ollama MVP

已实现：
- ✅ 微信 Adapter（基于 Wechaty）
- ✅ Ollama Provider（本地模型调用）
- ✅ 最小会话管理（上下文窗口）
- ✅ 消息处理主流程
- ✅ 触发规则（私聊自动回复 / 群聊@触发）
- ✅ 快速开始文档

## 项目结构

```
ai-robot/
├── apps/
│   └── server/           # 主服务入口
├── packages/
│   ├── core/             # 核心类型与接口
│   ├── config/           # 配置管理
│   ├── logger/           # 日志
│   ├── storage/          # 存储抽象
│   ├── shared/           # 共享工具
│   ├── im-adapters/      # IM 适配器
│   │   ├── mock/         # Mock 适配器
│   │   └── wechat/       # 微信适配器
│   └── llm-adapters/     # LLM 适配器
│       ├── mock/         # Mock 适配器
│       └── local/
│           └── ollama/   # Ollama 适配器
├── docs/
│   └── quick-start-wechat.md
└── examples/
    └── wechat-ollama/
```

## 快速开始

### 1. 安装 Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: 从 https://ollama.com 下载安装
```

### 2. 拉取模型

```bash
ollama pull qwen2.5:7b
```

### 3. 启动服务

```bash
pnpm install
pnpm dev
```

详细文档请参考 [快速开始指南](docs/quick-start-wechat.md)

## 技术选型

### 微信接入
- **方案**：Wechaty + Puppet
- **原因**：Wechaty 是最成熟的微信机器人 SDK，支持多种协议
- **局限**：需要有效的 Puppet Token 才能登录微信

### 本地模型
- **方案**：Ollama
- **原因**：最简单易用的本地模型运行方案，支持多种开源模型
- **推荐模型**：Qwen 2.5 系列

## 下一步

- [ ] 接入真实微信（需要 Puppet Token）
- [ ] 添加 QQ 适配器
- [ ] 添加远程 API Provider
- [ ] 添加持久化存储
