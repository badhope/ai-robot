# 故障排查

## 🔍 快速检查清单

遇到问题时，先运行：

```bash
pnpm doctor
```

这会检查：
- Node.js 版本
- 配置文件
- 阿里云 API 连接
- NapCatQQ 连接
- SQLite 状态

---

## ❌ 常见问题

### 1. 机器人没有反应

**症状**：发送消息后没有任何回应

**排查步骤**：

1. ✅ 检查 NapCatQQ 是否运行
   ```bash
   # NapCatQQ 应该显示 "WebSocket 服务已就绪"
   ```

2. ✅ 检查 AI Robot 是否运行
   ```bash
   # 应该看到：🤖 AI Robot 已启动
   ```

3. ✅ 检查配置
   ```bash
   # 确认 .env 中 QQ_ENABLED=true
   # 确认 ALIBABA_API_KEY 已填写
   ```

4. ✅ 检查 QQ 是否正确 @机器人
   ```bash
   # 格式应该是：@你的机器人名 问题
   ```

---

### 2. 阿里云 API 连接失败

**症状**：doctor 显示 "阿里云 API 失败"

**排查步骤**：

1. ✅ 确认 API Key 正确
   ```bash
   # 检查 .env 中
   ALIBABA_API_KEY=sk-xxxxxxxxxxxxxxxx
   ```

2. ✅ 确认 API Key 有余额
   - 登录 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
   - 查看账户余额

3. ✅ 检查网络
   ```bash
   ping dashscope.aliyuncs.com
   ```

4. ✅ 检查 Base URL
   ```
   ALIBABA_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   ```

---

### 3. NapCatQQ 连接失败

**症状**：doctor 显示 "NapCatQQ 未连接"

**排查步骤**：

1. ✅ 确认 NapCatQQ 已启动
   - 运行 NapCatQQ.exe
   - 确认已扫码登录

2. ✅ 确认 WebSocket 地址
   ```env
   QQ_WS_URL=ws://localhost:3001
   ```

3. ✅ 确认端口未被占用
   ```bash
   netstat -an | findstr 3001
   ```

4. ✅ 重启 NapCatQQ
   - 完全关闭
   - 重新启动

---

### 4. SQLite 错误

**症状**：数据库相关错误

**排查步骤**：

1. ✅ 检查目录权限
   ```bash
   # data 目录需要可写
   ls -la data/
   ```

2. ✅ 检查磁盘空间
   ```bash
   # 确保有足够空间
   df -h
   ```

3. ✅ 删除重建
   ```bash
   rm data/sessions.db
   # 重启服务会自动创建
   ```

---

### 5. 本地模式 Ollama 连接失败

**症状**：使用本地模式时报错

**排查步骤**：

1. ✅ 确认 Ollama 已安装
   ```bash
   ollama --version
   ```

2. ✅ 确认 Ollama 服务运行中
   ```bash
   ollama serve
   ```

3. ✅ 确认模型已下载
   ```bash
   ollama list
   # 应该看到 qwen2.5:7b
   ```

4. ✅ 检查配置
   ```env
   LLM_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=qwen2.5:7b
   ```

---

### 6. 机器人回复很慢

**可能原因**：

1. **API 模式**：网络延迟或阿里云负载高
2. **本地模式**：GPU 显存不足或模型太大

**解决方案**：

- API 模式：检查网络或稍后再试
- 本地模式：尝试更小的模型（如 qwen2.5:3b）

---

## 📋 错误代码对照

| 错误信息 | 含义 | 解决方案 |
|---------|------|----------|
| `401 Unauthorized` | API Key 无效 | 检查 ALIBABA_API_KEY |
| `Connection refused` | 服务未启动 | 启动对应服务 |
| `WebSocket closed` | NapCatQQ 断开 | 重启 NapCatQQ |
| `Model not found` | 模型不存在 | 下载模型或检查名称 |
| `Out of credit` | 余额不足 | 充值或等待下月额度 |

---

## 🆘 获取帮助

如果以上都不能解决你的问题：

1. 查看 [GitHub Issues](https://github.com/badhope/ai-robot/issues)
2. 提交新 Issue，包含：
   - 错误日志
   - 环境配置
   - 复现步骤

---

## 📚 相关文档

- [快速开始](quick-start-qq.md)
- [FAQ](faq.md)
- [架构文档](architecture.md)
