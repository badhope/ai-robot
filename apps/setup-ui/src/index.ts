import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
const PORT = 3002;

app.use(express.json());

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'pending';
  message: string;
  hint?: string;
}

interface SystemStatus {
  timestamp: string;
  checks: {
    node: CheckResult;
    config: CheckResult;
    ollama: CheckResult;
    model: CheckResult;
    napcatqq: CheckResult;
    sqlite: CheckResult;
  };
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

async function checkNode(): Promise<CheckResult> {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0], 10);
  return {
    name: 'Node.js',
    status: major >= 18 ? 'pass' : 'fail',
    message: `Node.js ${version} ${major >= 18 ? '✅' : '❌ (需要 18+)'}`,
    hint: major < 18 ? '请升级 Node.js 到 18 或更高版本' : undefined,
  };
}

async function checkConfig(): Promise<CheckResult> {
  try {
    const fs = await import('fs');
    const configFiles = ['.env', '.env.local', '.env.production'];
    const found = configFiles.some((f) => fs.existsSync(f));
    return {
      name: '配置文件',
      status: found ? 'pass' : 'warn',
      message: found ? '配置文件存在 ✅' : '未找到 .env 文件 ⚠️',
      hint: found ? undefined : '运行 cp .env.example .env 创建配置',
    };
  } catch {
    return { name: '配置文件', status: 'fail', message: '无法检查配置文件 ❌' };
  }
}

async function checkOllama(baseUrl = 'http://localhost:11434'): Promise<CheckResult> {
  try {
    const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 3000 });
    if (response.status === 200) {
      return {
        name: 'Ollama',
        status: 'pass',
        message: `Ollama 已连接 ✅ (${baseUrl})`,
      };
    }
    return { name: 'Ollama', status: 'fail', message: `Ollama 状态异常 (${response.status})` };
  } catch {
    return {
      name: 'Ollama',
      status: 'fail',
      message: `Ollama 未运行 ❌ (${baseUrl})`,
      hint: '请运行: ollama serve',
    };
  }
}

async function checkModel(baseUrl = 'http://localhost:11434', model = 'qwen2.5:7b'): Promise<CheckResult> {
  try {
    const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 3000 });
    const models: Array<{ name: string }> = response.data.models || [];
    const found = models.some((m) => m.name === model);
    if (found) {
      return { name: 'AI 模型', status: 'pass', message: `模型 ${model} 已安装 ✅` };
    }
    return {
      name: 'AI 模型',
      status: 'fail',
      message: `模型 ${model} 未安装 ❌`,
      hint: `请运行: ollama pull ${model}`,
    };
  } catch {
    return { name: 'AI 模型', status: 'warn', message: '无法检查模型 ⚠️ (Ollama 未运行)' };
  }
}

async function checkNapCatQQ(wsUrl = 'ws://localhost:3001'): Promise<CheckResult> {
  return new Promise((resolve) => {
    try {
      const WebSocket = require('ws');
      const ws = new WebSocket(wsUrl, { handshakeTimeout: 3000 });
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          name: 'NapCatQQ',
          status: 'fail',
          message: `NapCatQQ 未运行 ❌ (${wsUrl})`,
          hint: '请启动 NapCatQQ 并开启 WebSocket',
        });
      }, 3000);
      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve({ name: 'NapCatQQ', status: 'pass', message: `NapCatQQ 已连接 ✅` });
      });
      ws.on('error', () => {
        clearTimeout(timeout);
        resolve({
          name: 'NapCatQQ',
          status: 'fail',
          message: `NapCatQQ 未运行 ❌`,
          hint: '请启动 NapCatQQ 并开启 WebSocket',
        });
      });
    } catch {
      resolve({ name: 'NapCatQQ', status: 'fail', message: '无法连接 NapCatQQ ❌' });
    }
  });
}

async function checkSQLite(): Promise<CheckResult> {
  try {
    const fs = await import('fs');
    const dir = './data';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return {
      name: 'SQLite',
      status: 'pass',
      message: '数据目录可写 ✅',
    };
  } catch {
    return { name: 'SQLite', status: 'fail', message: '数据目录不可写 ❌' };
  }
}

async function getSystemStatus(): Promise<SystemStatus> {
  const [node, config, ollama, model, napcatqq, sqlite] = await Promise.all([
    checkNode(),
    checkConfig(),
    checkOllama(),
    checkModel(),
    checkNapCatQQ(),
    checkSQLite(),
  ]);

  const checks = { node, config, ollama, model, napcatqq, sqlite };
  const summary = {
    total: 6,
    passed: Object.values(checks).filter((c) => c.status === 'pass').length,
    failed: Object.values(checks).filter((c) => c.status === 'fail').length,
    warnings: Object.values(checks).filter((c) => c.status === 'warn').length,
  };

  return { timestamp: new Date().toISOString(), checks, summary };
}

app.get('/api/status', async (_req: Request, res: Response) => {
  try {
    const status = await getSystemStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/prompts', (_req: Request, res: Response) => {
  const prompts = [
    { id: 'default/friendly', name: '友好助手', desc: '适合通用场景，友好耐心的回复风格' },
    { id: 'default/tech-expert', name: '技术专家', desc: '适合技术讨论，准确的解答' },
    { id: 'group/concise', name: '群聊简洁', desc: '适合 QQ 群，回复简短有力' },
    { id: 'group/active', name: '群聊活跃', desc: '适合活跃群聊，活泼有趣' },
  ];
  res.json(prompts);
});

app.get('/api/check-all', async (_req: Request, res: Response) => {
  try {
    const status = await getSystemStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.send(html);
});

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Robot - Setup UI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f23; color: #fff; min-height: 100vh; }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    header { text-align: center; padding: 40px 0; border-bottom: 1px solid #333; margin-bottom: 30px; }
    header h1 { font-size: 2em; margin-bottom: 10px; }
    header p { color: #888; }
    .card { background: #1a1a2e; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid #333; }
    .card h2 { margin-bottom: 16px; font-size: 1.2em; color: #888; }
    .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .status-item { background: #16162a; padding: 16px; border-radius: 8px; border-left: 4px solid #666; }
    .status-item.pass { border-left-color: #4ade80; }
    .status-item.fail { border-left-color: #f87171; }
    .status-item.warn { border-left-color: #fbbf24; }
    .status-item .name { font-weight: bold; margin-bottom: 4px; }
    .status-item .message { color: #aaa; font-size: 0.9em; }
    .status-item .hint { color: #888; font-size: 0.8em; margin-top: 8px; font-style: italic; }
    .summary { display: flex; gap: 24px; justify-content: center; padding: 20px; background: #16162a; border-radius: 8px; margin-bottom: 20px; }
    .summary-item { text-align: center; }
    .summary-item .num { font-size: 2em; font-weight: bold; }
    .summary-item .label { color: #888; font-size: 0.9em; }
    .summary-item.passed .num { color: #4ade80; }
    .summary-item.failed .num { color: #f87171; }
    .summary-item.warnings .num { color: #fbbf24; }
    .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 1em; text-decoration: none; }
    .btn:hover { background: #4f46e5; }
    .btn-success { background: #22c55e; }
    .btn-success:hover { background: #16a34a; }
    .btn-warning { background: #f59e0b; }
    .btn-warning:hover { background: #d97706; }
    .next-steps { background: #1e1e3f; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .next-steps h3 { margin-bottom: 12px; color: #a5b4fc; }
    .next-steps ol { padding-left: 20px; }
    .next-steps li { margin-bottom: 8px; color: #ccc; }
    .next-steps li code { background: #2d2d5a; padding: 2px 6px; border-radius: 4px; color: #f472b6; }
    .refresh-info { text-align: center; color: #666; font-size: 0.8em; margin-top: 10px; }
    .prompt-list { display: grid; gap: 12px; }
    .prompt-item { background: #16162a; padding: 16px; border-radius: 8px; }
    .prompt-item .title { font-weight: bold; color: #a5b4fc; margin-bottom: 4px; }
    .prompt-item .desc { color: #888; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🤖 AI Robot 控制台</h1>
      <p>本地 AI 机器人 - 状态监控与配置引导</p>
    </header>

    <div class="summary" id="summary">
      <div class="summary-item passed"><div class="num" id="passed">-</div><div class="label">通过</div></div>
      <div class="summary-item failed"><div class="num" id="failed">-</div><div class="label">失败</div></div>
      <div class="summary-item warnings"><div class="num" id="warnings">-</div><div class="label">警告</div></div>
    </div>

    <button class="btn" onclick="refresh()">🔄 刷新状态</button>
    <div class="refresh-info">页面将在 30 秒后自动刷新</div>

    <div class="card" style="margin-top: 24px;">
      <h2>📋 系统状态</h2>
      <div class="status-grid" id="status-grid">
        <div class="status-item"><div class="name">加载中...</div></div>
      </div>
    </div>

    <div class="card">
      <h2>💬 Prompt 预设</h2>
      <div class="prompt-list" id="prompt-list">
        <div class="prompt-item"><div class="title">加载中...</div></div>
      </div>
    </div>

    <div class="next-steps">
      <h3>🚀 下一步</h3>
      <ol id="next-steps">
        <li>检查上方状态，确保所有项目都通过 ✅</li>
        <li>打开终端，运行 <code>pnpm dev</code> 启动机器人</li>
        <li>在 QQ 群发送 <code>@机器人 你好</code> 测试</li>
        <li>或发送 <code>/ai 你好</code> 测试命令</li>
      </ol>
    </div>
  </div>

  <script>
    async function loadStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        updateStatus(data);
      } catch (e) {
        document.getElementById('status-grid').innerHTML = '<div class="status-item fail"><div class="name">错误</div><div class="message">无法获取状态: ' + e.message + '</div></div>';
      }
    }

    async function loadPrompts() {
      try {
        const res = await fetch('/api/prompts');
        const prompts = await res.json();
        document.getElementById('prompt-list').innerHTML = prompts.map(p => 
          '<div class="prompt-item"><div class="title">' + p.name + '</div><div class="desc">' + p.desc + '</div></div>'
        ).join('');
      } catch (e) {
        document.getElementById('prompt-list').innerHTML = '<div class="prompt-item"><div class="desc">无法加载 Prompt 列表</div></div>';
      }
    }

    function updateStatus(data) {
      document.getElementById('passed').textContent = data.summary.passed;
      document.getElementById('failed').textContent = data.summary.failed;
      document.getElementById('warnings').textContent = data.summary.warnings;

      const grid = document.getElementById('status-grid');
      const checks = data.checks;
      grid.innerHTML = Object.values(checks).map(c => {
        const icon = c.status === 'pass' ? '✅' : c.status === 'fail' ? '❌' : c.status === 'warn' ? '⚠️' : '⏳';
        return '<div class="status-item ' + c.status + '">' +
          '<div class="name">' + icon + ' ' + c.name + '</div>' +
          '<div class="message">' + c.message + '</div>' +
          (c.hint ? '<div class="hint">💡 ' + c.hint + '</div>' : '') +
          '</div>';
      }).join('');
    }

    function refresh() { loadStatus(); loadPrompts(); }

    loadStatus();
    loadPrompts();
    setInterval(refresh, 30000);
  </script>
</body>
</html>`;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🤖 AI Robot Setup UI                                     ║
║                                                            ║
║   本地控制台已启动: http://localhost:${PORT}                  ║
║                                                            ║
║   功能:                                                    ║
║   • 系统状态检查                                           ║
║   • Prompt 预设管理                                        ║
║   • 部署引导                                               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
