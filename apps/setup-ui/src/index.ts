import express, { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
const app = express();
const PORT = 3002;

function openBrowser(url: string): void {
  const platform = process.platform;
  let cmd: string;
  let args: string[];

  if (platform === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', url];
  } else if (platform === 'darwin') {
    cmd = 'open';
    args = [url];
  } else {
    cmd = 'xdg-open';
    args = [url];
  }

  try {
    spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
  } catch (e) {
    // 忽略错误，不影响主流程
  }
}

app.use(express.json());

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'pending';
  message: string;
  hint?: string;
}

interface DoctorReport {
  os: CheckResult;
  node: CheckResult;
  alibaba: CheckResult;
  alibabaModel: CheckResult;
  ollama: CheckResult;
  ollamaModel: CheckResult;
  napcatqq: CheckResult;
  sqlite: CheckResult;
  network: CheckResult;
}

interface SetupResult {
  success: boolean;
  created: string[];
  failed: { item: string; reason: string }[];
  manual: { item: string; action: string; link?: string }[];
}

async function checkNode(): Promise<CheckResult> {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0], 10);
  return {
    name: 'Node.js',
    status: major >= 18 ? 'pass' : 'fail',
    message: `Node.js ${version}`,
    hint: major < 18 ? '请升级 Node.js 到 18+' : undefined,
  };
}

async function checkConfig(): Promise<CheckResult> {
  try {
    const configFiles = ['.env', '.env.local', '.env.production'];
    const found = configFiles.some((f) => fs.existsSync(f));
    return {
      name: '配置文件',
      status: found ? 'pass' : 'warn',
      message: found ? '.env 已存在' : '未找到 .env 文件',
      hint: found ? undefined : '运行 pnpm setup 自动创建',
    };
  } catch {
    return { name: '配置文件', status: 'fail', message: '无法检查配置文件' };
  }
}

async function checkAlibabaAPI(): Promise<CheckResult> {
  try {
    const apiKey = process.env.ALIBABA_API_KEY || '';
    if (!apiKey) {
      return { name: '阿里云 API', status: 'warn', message: '未配置 API Key', hint: '需要填写 ALIBABA_API_KEY' };
    }
    const baseUrl = process.env.ALIBABA_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    await axios.post(
      `${baseUrl}/chat/completions`,
      { model: 'qwen-plus', messages: [{ role: 'user', content: 'test' }], max_tokens: 5 },
      { headers: { 'Authorization': `Bearer ${apiKey}` }, timeout: 8000 }
    );
    return { name: '阿里云 API', status: 'pass', message: 'API 可用' };
  } catch (e: any) {
    const msg = e?.response?.status === 401 ? 'API Key 无效' : '连接失败';
    return { name: '阿里云 API', status: 'fail', message: msg, hint: '请检查 ALIBABA_API_KEY 是否正确' };
  }
}

async function checkOllama(): Promise<CheckResult> {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', { timeout: 3000 });
    if (response.status === 200) {
      return { name: 'Ollama', status: 'pass', message: 'Ollama 已连接' };
    }
    return { name: 'Ollama', status: 'fail', message: '状态异常' };
  } catch {
    return { name: 'Ollama', status: 'fail', message: 'Ollama 未运行', hint: '运行: ollama serve' };
  }
}

async function checkNapCatQQ(): Promise<CheckResult> {
  return new Promise((resolve) => {
    try {
      const WebSocket = require('ws');
      const wsUrl = process.env.QQ_WS_URL || 'ws://localhost:3001';
      const ws = new WebSocket(wsUrl, { handshakeTimeout: 3000 });
      const timer = setTimeout(() => { ws.close(); resolve({ name: 'NapCatQQ', status: 'fail', message: '未连接', hint: '请启动 NapCatQQ' }); }, 3000);
      ws.on('open', () => { clearTimeout(timer); ws.close(); resolve({ name: 'NapCatQQ', status: 'pass', message: 'WebSocket 已连接' }); });
      ws.on('error', () => { clearTimeout(timer); resolve({ name: 'NapCatQQ', status: 'fail', message: '连接失败', hint: '请确保 NapCatQQ 已启动' }); });
    } catch { resolve({ name: 'NapCatQQ', status: 'fail', message: '无法检查' }); }
  });
}

async function checkSQLite(): Promise<CheckResult> {
  const dbPath = process.env.SQLITE_DB_PATH || './data/sessions.db';
  try {
    if (fs.existsSync(dbPath)) {
      return { name: 'SQLite', status: 'pass', message: '数据库文件已就绪' };
    } else {
      return { name: 'SQLite', status: 'warn', message: '数据库文件不存在', hint: '运行 pnpm setup 自动创建' };
    }
  } catch {
    return { name: 'SQLite', status: 'fail', message: '无法检查数据库状态' };
  }
}

async function runDoctor(): Promise<DoctorReport> {
  const [node, _config, alibaba, ollama, napcatqq, sqlite] = await Promise.all([
    checkNode(), checkConfig(), checkAlibabaAPI(), checkOllama(), checkNapCatQQ(), checkSQLite()
  ]);
  return {
    os: { name: 'OS', status: 'pass', message: process.platform },
    node,
    alibaba,
    alibabaModel: { name: 'AI 模型', status: 'pass', message: process.env.ALIBABA_MODEL || 'qwen-plus' },
    ollama,
    ollamaModel: { name: '本地模型', status: 'warn', message: '未启用本地模式' },
    napcatqq,
    sqlite,
    network: { name: '网络', status: 'pass', message: '正常' }
  };
}

async function runSetup(): Promise<SetupResult> {
  const result: SetupResult = { success: true, created: [], failed: [], manual: [] };

  try {
    if (!fs.existsSync('.env')) {
      if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        result.created.push('.env 配置文件');
      } else {
        const defaultEnv = `# AI Robot v1.20 配置
QQ_ENABLED=true
QQ_WS_URL=ws://localhost:3001

LLM_PROVIDER=alibaba
ALIBABA_API_KEY=your-api-key-here
ALIBABA_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIBABA_MODEL=qwen-plus

SESSION_STORAGE=sqlite
SESSION_MAX_MESSAGES=100
`;
        fs.writeFileSync('.env', defaultEnv);
        result.created.push('.env 配置文件（已创建默认模板）');
      }
    }
  } catch (e: any) {
    result.failed.push({ item: '.env 创建', reason: e.message });
    result.success = false;
  }

  try {
    ['data', 'logs', 'cache'].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        result.created.push(`${dir}/ 目录`);
      }
    });
  } catch (e: any) {
    result.failed.push({ item: '目录创建', reason: e.message });
  }

  try {
    const dbPath = process.env.SQLITE_DB_PATH || './data/sessions.db';
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, '');
      result.created.push('SQLite 数据库文件');
    }
  } catch (e: any) {
    result.failed.push({ item: 'SQLite 初始化', reason: e.message });
  }

  const apiKey = process.env.ALIBABA_API_KEY;
  if (!apiKey) {
    result.manual.push({ item: '配置阿里云 API Key', action: '在 .env 中填写 ALIBABA_API_KEY', link: 'https://bailian.console.aliyun.com/' });
  }

  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
  } catch {
    result.manual.push({ item: 'Ollama（可选，本地模式需要）', action: '如需本地模式，安装并启动 Ollama', link: 'https://ollama.com/' });
  }

  return result;
}

app.get('/api/doctor', async (_req: Request, res: Response) => {
  try {
    const report = await runDoctor();
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/setup', async (_req: Request, res: Response) => {
  try {
    const result = await runSetup();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/prompts', (_req: Request, res: Response) => {
  res.json([
    { id: 'friendly', name: '友好助手', desc: '通用场景，友好耐心', scene: '默认' },
    { id: 'tech-expert', name: '技术专家', desc: '技术讨论，准确解答', scene: '技术群' },
    { id: 'group-concise', name: '群聊简洁', desc: '回复简短有力', scene: 'QQ 群' },
    { id: 'group-active', name: '群聊活跃', desc: '活泼有趣', scene: '活跃群' },
  ]);
});

app.get('/api/provider', (_req: Request, res: Response) => {
  const provider = process.env.LLM_PROVIDER || 'alibaba';
  res.json({
    current: provider,
    apiMode: {
      name: '阿里云/通义 API',
      desc: '默认推荐，无需 GPU，配置即用',
      model: process.env.ALIBABA_MODEL || 'qwen-plus',
      status: process.env.ALIBABA_API_KEY ? 'configured' : 'unconfigured'
    },
    localMode: {
      name: 'Ollama 本地模型',
      desc: '需要 NVIDIA 显卡，可降低 API 成本',
      model: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
      status: 'optional'
    }
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.send(V1_20_HTML);
});

const V1_20_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Robot v1.20 - 控制台</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg-primary: #0a0a1a;
      --bg-card: #12122a;
      --bg-card-hover: #1a1a3a;
      --border: #2a2a4a;
      --text: #e0e0ff;
      --text-dim: #8888aa;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --success: #22c55e;
      --warning: #f59e0b;
      --error: #ef4444;
      --info: #3b82f6;
    }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg-primary); color: var(--text); min-height: 100vh; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 20px; }

    .hero { text-align: center; padding: 50px 20px; background: linear-gradient(135deg, #1a1a3a 0%, #0a0a1a 100%); border-radius: 16px; margin-bottom: 30px; border: 1px solid var(--border); position: relative; overflow: hidden; }
    .hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%); pointer-events: none; }
    .hero-badge { display: inline-block; background: var(--accent); color: white; padding: 4px 16px; border-radius: 20px; font-size: 0.85em; font-weight: 600; margin-bottom: 16px; }
    .hero h1 { font-size: 2.5em; margin-bottom: 12px; background: linear-gradient(90deg, #fff 0%, #a5b4fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { color: var(--text-dim); font-size: 1.1em; max-width: 600px; margin: 0 auto; }
    .hero-actions { margin-top: 24px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .card-title { font-size: 1.2em; font-weight: 600; display: flex; align-items: center; gap: 10px; }
    .card-title .icon { width: 32px; height: 32px; background: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; }

    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95em; font-weight: 500; transition: all 0.2s; text-decoration: none; }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
    .btn-success { background: var(--success); color: white; }
    .btn-success:hover { background: #16a34a; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: var(--bg-card-hover); }
    .btn-sm { padding: 8px 16px; font-size: 0.85em; }

    .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .status-card { background: var(--bg-primary); border-radius: 10px; padding: 18px; border-left: 4px solid var(--border); transition: all 0.2s; }
    .status-card.pass { border-left-color: var(--success); }
    .status-card.fail { border-left-color: var(--error); }
    .status-card.warn { border-left-color: var(--warning); }
    .status-card .name { font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
    .status-card .message { font-size: 0.9em; color: var(--text-dim); }
    .status-card .hint { font-size: 0.8em; color: var(--warning); margin-top: 8px; }
    .status-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
    .status-card.pass .status-icon { background: rgba(34,197,94,0.2); color: var(--success); }
    .status-card.fail .status-icon { background: rgba(239,68,68,0.2); color: var(--error); }
    .status-card.warn .status-icon { background: rgba(245,158,11,0.2); color: var(--warning); }

    .summary-bar { display: flex; gap: 20px; padding: 20px; background: var(--bg-primary); border-radius: 10px; margin-bottom: 20px; justify-content: center; }
    .summary-item { text-align: center; min-width: 80px; }
    .summary-item .num { font-size: 2em; font-weight: 700; }
    .summary-item .label { font-size: 0.85em; color: var(--text-dim); }
    .summary-item.passed .num { color: var(--success); }
    .summary-item.failed .num { color: var(--error); }
    .summary-item.warnings .num { color: var(--warning); }

    .setup-list { list-style: none; }
    .setup-item { padding: 14px 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
    .setup-item:last-child { border-bottom: none; }
    .setup-item .icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
    .setup-item.done .icon { background: var(--success); color: white; }
    .setup-item.failed .icon { background: var(--error); color: white; }
    .setup-item.pending .icon { background: var(--border); color: var(--text-dim); }
    .setup-item .text { flex: 1; }
    .setup-item .title { font-weight: 500; }
    .setup-item .desc { font-size: 0.85em; color: var(--text-dim); }

    .provider-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .provider-card { background: var(--bg-primary); border-radius: 10px; padding: 20px; border: 2px solid var(--border); }
    .provider-card.active { border-color: var(--accent); }
    .provider-card .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 0.75em; font-weight: 600; margin-bottom: 10px; }
    .provider-card .badge.default { background: rgba(99,102,241,0.2); color: var(--accent); }
    .provider-card .badge.optional { background: rgba(136,136,170,0.2); color: var(--text-dim); }
    .provider-card h3 { margin-bottom: 8px; }
    .provider-card p { font-size: 0.9em; color: var(--text-dim); margin-bottom: 12px; }
    .provider-card .model { font-size: 0.85em; color: var(--info); }

    .prompt-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .prompt-card { background: var(--bg-primary); border-radius: 8px; padding: 16px; }
    .prompt-card h4 { margin-bottom: 6px; color: var(--accent); }
    .prompt-card .scene { font-size: 0.75em; background: var(--border); padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
    .prompt-card p { font-size: 0.85em; color: var(--text-dim); }

    .test-commands { background: var(--bg-primary); border-radius: 10px; padding: 20px; }
    .test-cmd { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
    .test-cmd:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .test-cmd code { background: #1e1e3f; padding: 10px 16px; border-radius: 6px; font-family: 'Fira Code', monospace; flex: 1; overflow-x: auto; color: #f472b6; }
    .test-cmd .label { font-size: 0.85em; color: var(--text-dim); min-width: 80px; }

    .next-steps { background: linear-gradient(135deg, #1a1a3a 0%, #12122a 100%); border-radius: 12px; padding: 24px; border: 1px solid var(--border); }
    .next-steps h3 { margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
    .next-steps ol { padding-left: 20px; }
    .next-steps li { margin-bottom: 12px; color: var(--text-dim); }
    .next-steps li code { background: #2a2a4a; padding: 3px 8px; border-radius: 4px; color: #f472b6; font-size: 0.9em; }

    .footer { text-align: center; padding: 30px; color: var(--text-dim); font-size: 0.85em; }
    .footer a { color: var(--accent); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 1.8em; }
      .hero-actions { flex-direction: column; }
      .card { padding: 18px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="hero-badge">✨ v1.20 正式版</div>
      <h1>AI Robot 控制台</h1>
      <p>QQ 群聊 AI 机器人，默认使用阿里云/通义 API，无需 GPU，开箱即用</p>
      <div class="hero-actions">
        <button class="btn btn-primary" onclick="runSetup()">🚀 一键初始化</button>
        <button class="btn btn-success" onclick="runDoctor()">🔍 检查环境</button>
      </div>
    </div>

    <div class="summary-bar" id="summary-bar" style="display:none;">
      <div class="summary-item passed"><div class="num" id="summary-passed">-</div><div class="label">通过</div></div>
      <div class="summary-item failed"><div class="num" id="summary-failed">-</div><div class="label">失败</div></div>
      <div class="summary-item warnings"><div class="num" id="summary-warnings">-</div><div class="label">警告</div></div>
    </div>

    <div class="card" id="setup-card" style="display:none;">
      <div class="card-header">
        <div class="card-title"><div class="icon">⚙️</div>自动配置结果</div>
        <button class="btn btn-sm btn-outline" onclick="loadProvider()">刷新</button>
      </div>
      <ul class="setup-list" id="setup-list"></ul>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><div class="icon">📊</div>环境状态</div>
        <button class="btn btn-sm btn-outline" onclick="runDoctor()">🔄 重新检测</button>
      </div>
      <div class="status-grid" id="status-grid">
        <div class="status-card"><div class="name">加载中...</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><div class="icon">☁️</div>Provider 设置</div>
      </div>
      <div class="provider-cards" id="provider-cards">
        <div class="provider-card"><div class="badge">加载中...</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><div class="icon">💬</div>Prompt 预设</div>
      </div>
      <div class="prompt-grid" id="prompt-grid">
        <div class="prompt-card"><h4>加载中...</h4></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><div class="icon">🧪</div>测试命令</div>
      </div>
      <div class="test-commands">
        <div class="test-cmd">
          <span class="label">群聊 @</span>
          <code>@你的机器人 你好</code>
          <button class="btn btn-sm btn-outline" onclick="copyCmd(this)">复制</button>
        </div>
        <div class="test-cmd">
          <span class="label">命令触发</span>
          <code>/ai 你好</code>
          <button class="btn btn-sm btn-outline" onclick="copyCmd(this)">复制</button>
        </div>
        <div class="test-cmd">
          <span class="label">查看帮助</span>
          <code>/ai help</code>
          <button class="btn btn-sm btn-outline" onclick="copyCmd(this)">复制</button>
        </div>
        <div class="test-cmd">
          <span class="label">清空会话</span>
          <code>/ai clear</code>
          <button class="btn btn-sm btn-outline" onclick="copyCmd(this)">复制</button>
        </div>
      </div>
    </div>

    <div class="next-steps">
      <h3>📋 启动步骤</h3>
      <ol>
        <li>确保上方环境状态全部 <strong style="color:var(--success)">绿色</strong>（如有问题，点击 <strong>一键初始化</strong>）</li>
        <li>打开终端，运行 <code>pnpm dev</code> 启动机器人</li>
        <li>在 QQ 群发送 <code>@机器人 你好</code> 或 <code>/ai 你好</code> 测试</li>
        <li>如需帮助，查看 <a href="docs/quick-start-qq.md" style="color:var(--accent)">快速开始文档</a></li>
      </ol>
    </div>

    <div class="footer">
      <p>AI Robot v1.20 | <a href="https://github.com/badhope/ai-robot">GitHub</a> | 默认推荐阿里云/通义 API</p>
    </div>
  </div>

<script>
let lastDoctorResult = null;

async function runDoctor() {
  const grid = document.getElementById('status-grid');
  grid.innerHTML = '<div class="status-card"><div class="name">检测中...</div></div>';
  document.getElementById('summary-bar').style.display = 'flex';

  try {
    const res = await fetch('/api/doctor');
    const r = await res.json();
    lastDoctorResult = r;

    const checks = [r.node, r.alibaba, r.alibabaModel, r.ollama, r.napcatqq, r.sqlite, r.network];
    let passed = 0, failed = 0, warnings = 0;

    grid.innerHTML = checks.map(c => {
      if (c.status === 'pass') passed++;
      else if (c.status === 'fail') failed++;
      else warnings++;
      const icon = c.status === 'pass' ? '✓' : c.status === 'fail' ? '✗' : '!';
      return '<div class="status-card ' + c.status + '"><div class="name"><span class="status-icon">' + icon + '</span>' + c.name + '</div><div class="message">' + c.message + '</div>' + (c.hint ? '<div class="hint">' + c.hint + '</div>' : '') + '</div>';
    }).join('');

    document.getElementById('summary-passed').textContent = passed;
    document.getElementById('summary-failed').textContent = failed;
    document.getElementById('summary-warnings').textContent = warnings;
  } catch (e) {
    grid.innerHTML = '<div class="status-card fail"><div class="name">检查失败</div><div class="message">' + e + '</div></div>';
  }
}

async function runSetup() {
  const card = document.getElementById('setup-card');
  const list = document.getElementById('setup-list');
  card.style.display = 'block';
  list.innerHTML = '<li class="setup-item pending"><div class="icon">⟳</div><div class="text"><div class="title">正在初始化...</div></div></li>';

  try {
    const res = await fetch('/api/setup');
    const r = await res.json();

    list.innerHTML = '';
    r.created.forEach(item => {
      list.innerHTML += '<li class="setup-item done"><div class="icon">✓</div><div class="text"><div class="title">' + item + '</div><div class="desc">已完成</div></div></li>';
    });
    r.failed.forEach(item => {
      list.innerHTML += '<li class="setup-item failed"><div class="icon">✗</div><div class="text"><div class="title">' + item.item + '</div><div class="desc">' + item.reason + '</div></div></li>';
    });
    r.manual.forEach(item => {
      const link = item.link ? ' <a href="' + item.link + '" target="_blank" style="color:var(--accent)">去设置 →</a>' : '';
      list.innerHTML += '<li class="setup-item pending"><div class="icon">!</div><div class="text"><div class="title">' + item.item + '</div><div class="desc">' + item.action + link + '</div></div></li>';
    });

    if (r.success && r.manual.length === 0) {
      list.innerHTML += '<li class="setup-item done"><div class="icon">✓</div><div class="text"><div class="title">所有配置已完成！</div><div class="desc">可以启动机器人了</div></div></li>';
    }

    runDoctor();
  } catch (e) {
    list.innerHTML = '<li class="setup-item failed"><div class="icon">✗</div><div class="text"><div class="title">初始化失败</div><div class="desc">' + e + '</div></div></li>';
  }
}

async function loadProvider() {
  try {
    const res = await fetch('/api/provider');
    const p = await res.json();
    const cards = document.getElementById('provider-cards');
    cards.innerHTML = '<div class="provider-card active">' +
      '<div class="badge default">当前使用</div>' +
      '<h3>' + p.apiMode.name + '</h3>' +
      '<p>' + p.apiMode.desc + '</p>' +
      '<div class="model">模型: ' + p.apiMode.model + '</div>' +
      '</div>' +
      '<div class="provider-card">' +
      '<div class="badge optional">可选</div>' +
      '<h3>' + p.localMode.name + '</h3>' +
      '<p>' + p.localMode.desc + '</p>' +
      '<div class="model">模型: ' + p.localMode.model + '</div>' +
      '</div>';
  } catch (e) { console.error(e); }
}

async function loadPrompts() {
  try {
    const res = await fetch('/api/prompts');
    const prompts = await res.json();
    document.getElementById('prompt-grid').innerHTML = prompts.map(p =>
      '<div class="prompt-card"><span class="scene">' + p.scene + '</span><h4>' + p.name + '</h4><p>' + p.desc + '</p></div>'
    ).join('');
  } catch (e) { console.error(e); }
}

function copyCmd(btn) {
  const code = btn.previousElementSibling;
  navigator.clipboard.writeText(code.textContent).then(() => {
    btn.textContent = '已复制!';
    setTimeout(() => btn.textContent = '复制', 1500);
  });
}

loadProvider();
loadPrompts();
runDoctor();
</script>
</body>
</html>`;

app.listen(PORT, () => {
  console.log(`\n🤖 AI Robot v1.20 控制台已启动`);
  console.log(`📍 http://localhost:${PORT}\n`);
  openBrowser(`http://localhost:${PORT}`);
});
