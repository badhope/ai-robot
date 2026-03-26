# 🌟 AI Robot

<div align="center">

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║        🌟 AI Robot - 智能群聊助手 🤖                              ║
║                                                                  ║
║        Intelligent QQ Group Chat Assistant                       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**🚀 傻瓜式 QQ 群聊 AI 机器人 | 支持多平台 API | 一键启动 | 开箱即用**

[![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)](https://github.com/badhope/ai-robot)
[![License](https://img.shields.io/badge/license-Proprietary-green?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](https://github.com/badhope/ai-robot/releases)
[![Stars](https://img.shields.io/github/stars/badhope/ai-robot?style=flat-square)](https://github.com/badhope/ai-robot/stargazers)

</div>

---

## ✨ 特性

| 功能 | 描述 |
|------|------|
| 🎯 **傻瓜式操作** | 下载 → 安装 → 填写 API Key → 一键启动 |
| 🌐 **多平台支持** | 阿里云、DeepSeek、智谱、月之暗面、OpenAI、Google、本地 Ollama |
| 💬 **智能对话** | 支持 @ 触发、命令触发、私聊自动回复 |
| 🖼️ **图片识别** | 识别图片内容，多模态 AI 支持（专业版） |
| 🎤 **语音回复** | 文字转语音回复（专业版） |
| 🔌 **插件系统** | 丰富的插件生态，可扩展功能 |
| 💾 **会话持久化** | SQLite 存储，重启不丢失 |
| 🎨 **现代界面** | Electron + Vue 3，流畅美观 |
| 🌙 **暗色主题** | 护眼的深色界面 |

---

## 📸 截图

<details>
<summary>👆 点击查看截图</summary>

### 主界面
![主界面](docs/images/screenshot-main.png)

### 设置界面
![设置界面](docs/images/screenshot-settings.png)

### 插件中心
![插件中心](docs/images/screenshot-plugins.png)

</details>

---

## 🚀 快速开始

### 方式一：直接下载（推荐）

1. 前往 [Releases](https://github.com/badhope/ai-robot/releases) 页面
2. 下载对应平台的安装包
3. 安装并启动应用
4. 选择 AI 平台，填写 API Key
5. 启动 NapCatQQ 并扫码登录
6. 点击「启动机器人」开始使用

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/badhope/ai-robot.git
cd ai-robot

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build:win   # Windows
pnpm build:mac   # macOS
pnpm build:linux # Linux
```

---

## 📋 系统要求

| 平台 | 最低要求 | 推荐配置 |
|------|----------|----------|
| **Windows** | Windows 10 64位 | Windows 11 64位 |
| **macOS** | macOS 10.15+ | macOS 12+ |
| **Linux** | Ubuntu 20.04+ | Ubuntu 22.04+ |

**其他要求：**
- Node.js 18+ （仅源码构建需要）
- pnpm 8+ （仅源码构建需要）
- NapCatQQ （QQ 机器人框架）

---

## 🎯 支持的 AI 平台

| 平台 | 特点 | 免费额度 | 推荐指数 |
|------|------|----------|----------|
| 🇨🇳 **阿里云通义** | 响应快，稳定 | 有 | ⭐⭐⭐⭐⭐ |
| 🇨🇳 **DeepSeek** | 性价比高 | 有 | ⭐⭐⭐⭐⭐ |
| 🇨🇳 **智谱 AI** | 国产大模型 | 有 | ⭐⭐⭐⭐ |
| 🇨🇳 **月之暗面** | 长文本强 | 有 | ⭐⭐⭐⭐ |
| 🌍 **OpenAI** | GPT-4 | 有限 | ⭐⭐⭐⭐ |
| 🌍 **Google Gemini** | 免费额度大 | 有 | ⭐⭐⭐⭐ |
| 💻 **本地 Ollama** | 完全免费 | 无限 | ⭐⭐⭐（需显卡）|

---

## 📖 使用教程

<details>
<summary>🔧 如何获取 API Key？</summary>

### 阿里云通义
1. 打开 [阿里云百炼](https://bailian.console.aliyun.com/)
2. 登录/注册阿里云账号
3. 开通 DashScope 服务
4. 点击左侧「API-KEY 管理」→「创建 API Key」

### DeepSeek
1. 打开 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册账号
3. 进入「API Keys」→「创建 API Key」

### 智谱 AI
1. 打开 [智谱开放平台](https://open.bigmodel.cn/)
2. 注册账号
3. 进入「API 密钥」→「添加 API 密钥」

</details>

<details>
<summary>📱 如何使用 NapCatQQ？</summary>

1. 下载 [NapCatQQ](https://github.com/NapNeko/NapCatQQ/releases)
2. 解压并运行
3. 扫码登录你的 QQ 机器人账号
4. 确保 WebSocket 端口为 3001

详细教程请查看 [NapCatQQ 使用指南](docs/napcat-guide.md)

</details>

---

## 💰 专业版功能

| 功能 | 免费版 | 专业版 |
|------|--------|--------|
| 每日对话次数 | 1000 次 | ∞ 无限 |
| AI 模型 | 基础模型 | 全部模型 |
| 图片识别 | ❌ | ✅ |
| 语音回复 | ❌ | ✅ |
| 高级插件 | ❌ | ✅ |
| 技术支持 | 社区 | 优先 |
| 多账号管理 | ❌ | ✅ |

**专业版价格：**
- 年付：¥99/年
- 月付：¥19.9/月

[立即升级](https://ai-robot.dev/pricing)

---

## 🏗️ 项目结构

```
ai-robot/
├── electron/              # Electron 主进程
│   ├── main.ts           # 主进程入口
│   └── preload.ts        # 预加载脚本
├── src/                   # 渲染进程（Vue 3）
│   ├── components/       # 组件
│   ├── views/            # 页面
│   ├── stores/           # Pinia 状态管理
│   ├── router/           # 路由
│   └── styles/           # 样式
├── build/                 # 构建资源
│   └── icon.icns         # 应用图标
├── docs/                  # 文档
├── resources/             # 额外资源
└── package.json
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 开源协议

本项目采用双协议模式：

- **开源部分**：采用 [MIT License](LICENSE-MIT) 协议
- **商业部分**：采用 [商业许可协议](LICENSE-COMMERCIAL)

具体请查看 [LICENSE](LICENSE) 文件。

---

## 📞 联系我们

- 📧 Email: contact@ai-robot.dev
- 💬 QQ群: 123456789
- 🌐 官网: https://ai-robot.dev
- 📖 文档: https://docs.ai-robot.dev
- 🐛 问题反馈: [GitHub Issues](https://github.com/badhope/ai-robot/issues)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=badhope/ai-robot&type=Date)](https://star-history.com/#badhope/ai-robot&Date)

---

<div align="center">

**Made with ❤️ by AI Robot Team**

**⭐ 如果这个项目对你有帮助，请给一个 Star ⭐**

</div>
