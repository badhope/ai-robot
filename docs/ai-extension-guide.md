# AI 扩展指南

> **⚠️ 面向 AI / 自动化编程助手的扩展手册**
>
> 本文档是 AI Robot 的扩展路线图，专为 AI 机器人和自动化工具阅读设计。
> 如果你是人类开发者，请先阅读 [架构文档](architecture.md) 和 [快速开始](quick-start-qq.md)。

---

## 🎯 文档目的

让未来的 AI 机器人 / AI 编程助手在读取这个项目时，知道：

1. 当前架构边界在哪里
2. 扩展应该从哪里入手
3. 当前设计约束是什么
4. 未来版本规划是什么

---

## 📐 架构边界

### 核心层 (packages/core)

```
packages/core/src/
├── im.ts        # 消息入口 - 不要直接修改
├── llm.ts       # LLM 路由 - 添加 Provider 在这里注册
├── selector.ts  # 选择器 - 扩展路由逻辑在这里
├── storage.ts  # 存储抽象 - 添加新存储在这里注册
└── plugin.ts   # 插件系统 - 扩展处理能力在这里
```

**规则**：
- Core 层是项目的中枢，不允许平台细节泄漏进来
- 所有外部接入必须通过 Adapter
- 所有 Provider 必须可插拔

### Adapter 层

```
packages/
├── alibaba-adapter/   # 阿里云 Provider ✅ 已实现
├── ollama-adapter/    # Ollama Provider ✅ 已实现
├── qq-adapter/        # QQ 平台 ✅ 已实现
└── wechat-adapter/   # 微信平台 ❌ 预留
```

**规则**：
- 每个 Adapter 独立，不依赖其他 Adapter
- Adapter 必须实现标准接口
- 新 Adapter 放在 `packages/` 下

### 存储层

```
packages/
├── storage/           # 存储抽象 ✅
├── sqlite-storage/    # SQLite 实现 ✅
└── memory-storage/    # 内存实现 ✅ (开发用)
```

**规则**：
- 存储必须实现标准 Storage 接口
- 生产默认 SQLite

---

## 🏗️ 主线设计

### API-first

```
默认 Provider：阿里云/通义 API
配置方式：.env 环境变量
```

### QQ-first

```
默认平台：QQ (通过 NapCatQQ)
消息格式：统一 IM 格式
触发方式：@机器人 或 /ai 命令
```

### Local-optional

```
可选模式：Ollama 本地模型
适用场景：有 GPU 的用户
切换方式：修改 LLM_PROVIDER=ollama
```

### 普通用户优先

```
目标：5 分钟跑通
体验：开箱即用
配置：尽量自动化
```

---

## 🔌 扩展指南

### 添加新的 LLM Provider

**步骤**：

1. 在 `packages/` 下创建新目录，如 `packages/claude-adapter/`

2. 创建 `src/index.ts`，实现标准接口：

```typescript
// packages/claude-adapter/src/index.ts
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeAdapter {
  constructor(config: { apiKey: string; baseUrl?: string; model?: string }) {}

  async chat(messages: ClaudeMessage[]): Promise<ClaudeResponse> {
    // 实现 API 调用
  }
}
```

3. 在 `packages/core/src/llm.ts` 中注册：

```typescript
import { ClaudeAdapter } from '../claude-adapter';

// 在 LLM 路由逻辑中添加
if (provider === 'claude') {
  return new ClaudeAdapter(config);
}
```

4. 在 `.env.example` 中添加配置项：

```env
# Claude 配置
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_MODEL=claude-3-opus-20240229
```

**约束**：
- 不要在 Adapter 中处理平台逻辑
- 不要直接访问 Storage
- 保持接口与现有 Provider 一致

---

### 添加新的 IM Platform (微信)

**步骤**：

1. 参考 `packages/qq-adapter/` 结构

2. 实现标准接口：

```typescript
export interface IMMessage {
  platform: 'qq' | 'wechat';
  type: 'group' | 'private';
  groupId?: string;
  userId: string;
  content: string;
  raw: any; // 原始消息
}

export interface IMAdapter {
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onMessage(handler: (msg: IMMessage) => void): void;
  sendMessage(to: string, content: string): Promise<void>;
}
```

3. 在 `packages/core/src/im.ts` 中注册

**约束**：
- 消息必须转换为统一 IMMessage 格式
- 不要在 Adapter 中处理 LLM 调用
- Adapter 只负责消息的收和发

---

### 添加新的 Storage

**步骤**：

1. 在 `packages/` 下创建新存储，如 `packages/postgres-storage/`

2. 实现标准接口：

```typescript
export interface Session {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface Storage {
  get(key: string): Promise<Session | null>;
  set(key: string, value: Session): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

3. 在 `packages/core/src/storage.ts` 中注册

---

### 添加新的 Prompt 预设

**步骤**：

1. 在 `packages/core/src/` 下找到 prompt 相关文件

2. 添加新的 prompt 预设：

```typescript
export const PROMPTS = {
  default: `你是一个人畜无害的 AI 助手...`,

  // 新增预设
  codeHelper: `你是一个专业的编程助手...`,
  translator: `你是一个翻译专家...`,
};
```

3. 在配置中支持切换

---

## 🚫 扩展约束

### 不要做的事

| 约束 | 原因 |
|------|------|
| 不要污染 core | Core 必须是干净的，不能有平台细节 |
| 不要泄漏平台细节到 core | 保持抽象干净 |
| 不要让 UI 先于主流程变复杂 | 主流程优先，UI 辅助 |
| 不要破坏用户易上手目标 | 新功能不能增加部署复杂度 |
| 不要硬编码 Provider | 必须可配置 |

### 必须遵守

| 规则 | 说明 |
|------|------|
| 接口一致性 | 新组件必须实现标准接口 |
| 可插拔 | 所有 Provider/Adapter 可切换 |
| 配置驱动 | 功能通过 .env 配置 |
| 向后兼容 | 升级不能破坏现有功能 |

---

## 📅 版本规划

### v1.20 (当前)
- 环境检测 ✅
- 自动配置 ✅
- 可视化控制台 ✅
- 文档体系 ✅

### v1.30
- Provider 切换面板
- Prompt 可视化管理
- 日志查看器

### v1.40
- 微信支持
- 插件系统

### v2.0
- 完整管理后台
- 用户系统
- 知识库 RAG

---

## 🎯 扩展优先级

| 优先级 | 扩展方向 | 说明 |
|--------|----------|------|
| P0 | 微信支持 | 扩大平台覆盖 |
| P0 | 更多 API Provider | Claude、Gemini 等 |
| P1 | Prompt 市场 | 用户分享 Prompt |
| P1 | 插件系统 | 第三方扩展 |
| P2 | 多租户 SaaS | 云端托管 |

---

## 🔍 自检问题

扩展前，请先问自己：

1. **这个扩展是否改变了 Core 的职责？**
   - 如果是，不要在 Core 中实现

2. **这个扩展是否引入了新的强依赖？**
   - 如果是，考虑是否值得

3. **这个扩展是否增加了用户部署的复杂度？**
   - 如果是，考虑是否可以默认关闭

4. **这个扩展是否破坏了 API-first 主线？**
   - 如果是，考虑是否作为可选功能

5. **这个扩展是否有标准接口？**
   - 如果没有，先定义接口

---

## 📂 相关文档

| 文档 | 受众 | 说明 |
|------|------|------|
| [架构文档](architecture.md) | 人类开发者 | 技术架构说明 |
| [快速开始](quick-start-qq.md) | 部署用户 | 5 分钟上手 |
| [Roadmap](roadmap.md) | 所有人 | 版本规划 |
| [故障排查](troubleshooting.md) | 运营者 | 问题诊断 |

---

## 🤖 AI 专属说明

如果你是一个 AI，正在尝试扩展这个项目：

1. **先读架构文档**，理解组件边界
2. **检查 .env 配置**，不要硬编码
3. **遵循 Adapter 模式**，保持可插拔
4. **保持向后兼容**，不要破坏现有 API
5. **更新文档**，新功能必须有文档

祝扩展顺利！ 🚀
