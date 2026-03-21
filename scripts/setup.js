#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

function log(msg, color = RESET) {
  console.log(`${color}${msg}${RESET}`);
}

function logStep(num, msg) {
  console.log(`\n${BLUE}[${num}]${RESET} ${msg}`);
}

function logSuccess(msg) {
  console.log(`  ${GREEN}✓${RESET} ${msg}`);
}

function logFail(msg) {
  console.log(`  ${RED}✗${RESET} ${msg}`);
}

function logWarn(msg) {
  console.log(`  ${YELLOW}!${RESET} ${msg}`);
}

async function checkOllama() {
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(50));
  log('🤖 AI Robot v1.20 - 自动配置工具', BLUE);
  console.log('='.repeat(50));

  const created = [];
  const failed = [];
  const manual = [];

  logStep(1, '检查配置文件');
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');

  if (fs.existsSync(envPath)) {
    logSuccess('.env 已存在，跳过创建');
  } else if (fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envPath);
      created.push('.env 配置文件（从 .env.example 复制）');
      logSuccess('已从 .env.example 创建 .env');
    } catch (e) {
      failed.push({ item: '.env 创建', reason: e.message });
      logFail('创建失败: ' + e.message);
    }
  } else {
    const defaultEnv = `# AI Robot v1.20 配置
# 请修改以下配置

# QQ 设置
QQ_ENABLED=true
QQ_WS_URL=ws://localhost:3001

# AI Provider 设置 (默认: alibaba)
LLM_PROVIDER=alibaba

# 阿里云/通义 API 配置
ALIBABA_API_KEY=your-api-key-here
ALIBABA_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIBABA_MODEL=qwen-plus

# 本地模型配置 (可选，如使用 LLM_PROVIDER=ollama)
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=qwen2.5:7b

# 会话存储
SESSION_STORAGE=sqlite
SESSION_MAX_MESSAGES=100
`;
    try {
      fs.writeFileSync(envPath, defaultEnv);
      created.push('.env 配置文件（已创建默认模板）');
      logSuccess('已创建默认 .env 配置');
    } catch (e) {
      failed.push({ item: '.env 创建', reason: e.message });
      logFail('创建失败: ' + e.message);
    }
  }

  logStep(2, '创建必要目录');
  const dirs = ['data', 'logs', 'cache'];
  for (const dir of dirs) {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        created.push(`${dir}/ 目录`);
        logSuccess(`${dir}/ 目录已创建`);
      } catch (e) {
        failed.push({ item: `${dir}/ 目录创建`, reason: e.message });
        logFail(`创建 ${dir}/ 失败: ${e.message}`);
      }
    } else {
      logSuccess(`${dir}/ 目录已存在`);
    }
  }

  logStep(3, '检查 SQLite 数据库');
  const dbPath = path.join(rootDir, 'data', 'sessions.db');
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    try {
      fs.writeFileSync(dbPath, '');
      created.push('SQLite 数据库文件');
      logSuccess('SQLite 数据库文件已创建');
    } catch (e) {
      failed.push({ item: 'SQLite 初始化', reason: e.message });
      logFail('创建失败: ' + e.message);
    }
  } else {
    logSuccess('SQLite 数据库已存在');
  }

  logStep(4, '检查 AI Provider 配置');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasApiKey = envContent.includes('ALIBABA_API_KEY=') && !envContent.match(/ALIBABA_API_KEY\s*=\s*your-api-key-here/);

  if (!hasApiKey) {
    manual.push({
      item: '配置阿里云 API Key',
      action: '在 .env 中填写 ALIBABA_API_KEY',
      link: 'https://bailian.console.aliyun.com/'
    });
    logWarn('需要手动配置 ALIBABA_API_KEY');
    log('  访问 https://bailian.console.aliyun.com/ 获取 API Key');
  } else {
    logSuccess('阿里云 API Key 已配置');
  }

  logStep(5, '检查 Ollama（可选）');
  const isOllamaRunning = await checkOllama();
  const isOllamaMode = envContent.match(/LLM_PROVIDER\s*=\s*ollama/i);

  if (isOllamaMode) {
    if (isOllamaRunning) {
      logSuccess('Ollama 服务已运行');
    } else {
      manual.push({
        item: '启动 Ollama',
        action: '运行 ollama serve 启动 Ollama 服务',
        link: 'https://ollama.com/'
      });
      logWarn('需要启动 Ollama 服务');
    }
  } else {
    log('  使用阿里云 API 模式（无需 Ollama）');
    if (!isOllamaRunning) {
      logWarn('Ollama 未运行（本地模式可选，暂未启用）');
    }
  }

  console.log('\n' + '='.repeat(50));
  log('📊 配置结果汇总', BLUE);
  console.log('='.repeat(50));

  if (created.length > 0) {
    console.log('\n✅ 已完成:');
    created.forEach(item => logSuccess(item));
  }

  if (failed.length > 0) {
    console.log('\n❌ 失败:');
    failed.forEach(item => {
      logFail(`${item.item}: ${item.reason}`);
    });
  }

  if (manual.length > 0) {
    console.log('\n⚠️  需要手动完成:');
    manual.forEach(item => {
      logWarn(`${item.item}`);
      console.log(`   操作: ${item.action}`);
      if (item.link) {
        console.log(`   链接: ${item.link}`);
      }
    });
  }

  console.log('\n' + '='.repeat(50));
  if (manual.length === 0 && failed.length === 0) {
    log('🎉 所有配置已完成！', GREEN);
    console.log('\n下一步:');
    console.log('  1. 运行 pnpm dev 启动机器人');
    console.log('  2. 打开 http://localhost:3002 查看控制台');
    console.log('  3. 在 QQ 群发送 @机器人 你好 测试\n');
  } else {
    log('⚠️  配置未完成，请完成上述手动步骤后重试', YELLOW);
    console.log('\n完成后可运行 pnpm setup 重新检查\n');
  }
}

main().catch(console.error);
