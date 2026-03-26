# 贡献指南

感谢你考虑为 AI Robot 做出贡献！我们欢迎所有形式的贡献。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发指南](#开发指南)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)

## 行为准则

本项目采用贡献者公约作为行为准则。参与此项目即表示你同意遵守其条款。请阅读 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) 了解详情。

## 如何贡献

### 报告 Bug

如果你发现了 bug，请通过 [GitHub Issues](https://github.com/badhope/ai-robot/issues) 提交。提交时请包含：

1. **描述**：清晰描述问题
2. **复现步骤**：如何复现这个问题
3. **预期行为**：你期望发生什么
4. **实际行为**：实际发生了什么
5. **截图**：如果适用，添加截图
6. **环境**：操作系统、软件版本等

### 建议新功能

我们欢迎新功能建议！请在 Issues 中详细描述：

1. 功能描述
2. 使用场景
3. 可能的实现方式

### 提交代码

1. Fork 本仓库
2. 创建特性分支
3. 编写代码和测试
4. 提交 Pull Request

## 开发指南

### 环境准备

```bash
# 安装 Node.js 18+
# 安装 pnpm
npm install -g pnpm

# 克隆仓库
git clone https://github.com/badhope/ai-robot.git
cd ai-robot

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 项目结构

```
ai-robot/
├── electron/          # Electron 主进程
├── src/               # Vue 前端代码
├── build/             # 构建资源
├── docs/              # 文档
└── resources/         # 额外资源
```

### 代码风格

- 使用 TypeScript
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格

### 提交代码前

```bash
# 运行 lint
pnpm lint

# 运行类型检查
pnpm typecheck

# 构建测试
pnpm build
```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例

```
feat(provider): add support for DeepSeek API

- Add DeepSeek provider implementation
- Update provider selection UI
- Add API key configuration

Closes #123
```

## Pull Request 流程

1. **Fork 仓库** 并创建特性分支
2. **编写代码** 确保代码质量和测试
3. **提交更改** 使用规范的提交信息
4. **推送分支** 到你的 Fork
5. **创建 PR** 填写 PR 模板

### PR 检查清单

- [ ] 代码遵循项目风格规范
- [ ] 已进行自我代码审查
- [ ] 代码已添加必要注释
- [ ] 文档已更新（如需要）
- [ ] 没有引入新的警告
- [ ] 测试已通过
- [ ] 依赖变更已记录

## 许可证

通过贡献代码，你同意你的代码将按照本项目的许可证发布。

---

再次感谢你的贡献！❤️
