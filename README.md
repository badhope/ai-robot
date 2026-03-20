# AI Robot

聊天机器人网关系统，支持微信、QQ 接入，本地模型与云 API。

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
│   ├── im-adapters/      # IM 平台适配器
│   └── llm-adapters/     # LLM 模型适配器
├── docs/
├── examples/
└── prompts/
```

## 开发

```bash
pnpm install
pnpm dev
```
