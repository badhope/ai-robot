# Prompt 预设说明

本目录包含机器人的 prompt 预设配置。

## 目录结构

```
prompts/
├── default/           # 默认风格
│   ├── friendly.txt   # 友好助手
│   └── tech-expert.txt # 技术专家
├── group/            # 群聊专用
│   ├── concise.txt    # 简洁风格
│   └── active.txt     # 活跃风格
└── helper/           # 辅助提示
    └── assistant.txt  # 基础助手
```

## 使用方法

### 方法 1：环境变量

```env
SYSTEM_PROMPT_FILE=./prompts/group/concise.txt
```

### 方法 2：命令行

启动时指定：
```bash
SYSTEM_PROMPT_FILE=./prompts/default/tech-expert.txt pnpm dev
```

## 如何创建自己的 Prompt

1. 复制一个现有文件作为模板
2. 修改内容
3. 测试效果
4. 调整直到满意

## 编写建议

- 简洁：控制在 500 字以内
- 明确：说清楚机器人应该做什么
- 具体：给出具体的规则和行为
- 测试：不同问题都要试试
