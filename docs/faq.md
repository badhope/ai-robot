# 常见问题 (FAQ)

## 🚀 快速入门

### Q: 这个项目需要什么配置才能运行？

**API 模式（默认推荐）**：
- Node.js 18+
- 任意电脑（不需要 GPU）
- 能联网

**本地模型模式（可选）**：
- NVIDIA 显卡（建议 6GB+ 显存）
- 安装 Ollama
- 下载模型文件

---

### Q: 默认使用哪个 AI Provider？

**默认：阿里云/通义 API**

这是 API-first 设计，不需要本地算力，响应快，配置简单。

可选：Ollama 本地模型（需要 GPU）。

---

### Q: 需要自己训练模型吗？

**不需要。**

- API 模式：使用阿里云托管的 Qwen 模型
- 本地模式：使用 Ollama 拉取开源模型

---

## 💰 费用相关

### Q: 使用阿里云 API 需要付费吗？

阿里云 DashScope 有免费额度。

具体请查看：[阿里云百炼定价](https://help.aliyun.com/zh/dashscope/)

---

### Q: 本地模式需要付费吗？

**不需要。**

本地模式使用 Ollama + 开源模型（如 Qwen2.5），完全免费。

但需要：
- GPU 显卡
- 电费 😄

---

## 🛠️ 技术问题

### Q: NapCatQQ 是什么？

NapCatQQ 是一个 QQ 机器人框架，让你的 QQ 号可以被程序控制。

项目地址：[NapCatQQ](https://github.com/NapNeko/NapCatQQ)

---

### Q: 为什么需要 NapCatQQ？

AI Robot 本身不直接连接 QQ，而是通过 NapCatQQ 提供的 WebSocket 接口接收消息。

架构：
```
QQ → NapCatQQ (WebSocket) → AI Robot → 阿里云 API
```

---

### Q: 可以不用 NapCatQQ 吗？

目前不行。

NapCatQQ 是 QQ 机器人化的主流方案。项目设计围绕它展开。

---

### Q: 支持微信吗？

v1.20 暂不支持。

路线图中有计划支持，请关注 [roadmap.md](roadmap.md)

---

## 🔧 配置问题

### Q: .env 文件在哪？

项目根目录。

如果不存在，运行：
```bash
pnpm setup
```
会自动创建。

---

### Q: ALIBABA_API_KEY 怎么获取？

1. 打开 [阿里云百炼](https://bailian.console.aliyun.com/)
2. 注册/登录
3. 开通 DashScope 服务
4. 创建 API Key

---

### Q: 启动后显示 "NapCatQQ 未连接"？

1. 确认 NapCatQQ 已启动
2. 确认 WebSocket 地址是 `ws://localhost:3001`
3. 确认 QQ 已扫码登录

---

## 📱 使用问题

### Q: 群里怎么触发机器人？

两种方式：

1. **@机器人**：发送 `@你的机器人名 你好`
2. **命令触发**：发送 `/ai 你好`

---

### Q: 机器人不回复怎么办？

1. 检查环境检测状态：`pnpm doctor`
2. 查看控制台：http://localhost:3002
3. 参考 [故障排查](troubleshooting.md)

---

### Q: 怎么清空会话？

发送 `/ai clear`

---

### Q: 怎么查看帮助？

发送 `/ai help`

---

## 🔒 隐私问题

### Q: 我的聊天记录会被保存吗？

本地 SQLite 数据库只保存会话上下文，用于保持对话连贯性。

不会上传到任何服务器。

---

### Q: API Key 安全吗？

你的 API Key 只会被发往阿里云 DashScope API。

不会经过任何第三方服务器。

---

## 🤝 贡献

### Q: 可以提交 PR 吗？

欢迎！

请先阅读 [AI 扩展指南](ai-extension-guide.md) 了解架构边界。

---

### Q: 怎么报告 Bug？

在 GitHub Issue 中描述：
- 环境配置
- 复现步骤
- 错误日志

---

## 📚 更多文档

| 文档 | 说明 |
|------|------|
| [快速开始](quick-start-qq.md) | 5 分钟快速上手 |
| [部署指南](deployment.md) | 详细部署说明 |
| [故障排查](troubleshooting.md) | 问题排查 |
| [架构文档](architecture.md) | 开发者架构说明 |
| [AI 扩展指南](ai-extension-guide.md) | AI 扩展者指南 |
