# 更新日志

本项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.0.0] - 2024-03-26

### 新增
- 🎉 全新的 Electron 桌面应用架构
- 🎨 基于 Vue 3 + TypeScript 的现代化界面
- 🌟 星辰主题 UI 设计
- 📱 简单模式和专业模式双模式切换
- 🔧 可视化配置向导
- 🧠 支持多平台 AI API（阿里云、DeepSeek、智谱、月之暗面、OpenAI、Google）
- 💻 支持本地 Ollama 模型
- 🔌 插件系统架构
- 👑 专业版付费功能
- 📊 对话统计和监控
- 🎛️ 高级参数配置
- 🌙 暗色主题支持
- 📦 自动下载 NapCatQQ
- 🔄 系统托盘支持
- ⚡ 开机自启动
- 📖 内置帮助文档

### 变更
- 从 monorepo 结构迁移到 Electron 单体应用
- 重构核心服务层
- 优化会话存储性能
- 改进错误处理机制

### 修复
- 修复 WebSocket 重连问题
- 修复 SQLite 数据库锁定问题
- 修复高 DPI 显示问题

---

## [1.20.0] - 2024-02-15

### 新增
- 自动环境检测功能 (pnpm doctor)
- 可视化控制台 (http://localhost:3002)
- 自动配置脚本 (pnpm setup)
- 阿里云/通义 API 作为默认 Provider

### 变更
- 默认使用 API 模式而非本地模型
- 优化启动流程
- 改进错误提示

### 修复
- 修复 NapCatQQ WebSocket 连接问题
- 修复会话持久化问题

---

## [1.0.0] - 2024-01-01

### 新增
- 初始版本发布
- 基础 QQ 群聊 AI 回复功能
- 支持 Ollama 本地模型
- 会话持久化存储
- 基础 Prompt 配置

---

[2.0.0]: https://github.com/badhope/ai-robot/compare/v1.20.0...v2.0.0
[1.20.0]: https://github.com/badhope/ai-robot/compare/v1.0.0...v1.20.0
[1.0.0]: https://github.com/badhope/ai-robot/releases/tag/v1.0.0
