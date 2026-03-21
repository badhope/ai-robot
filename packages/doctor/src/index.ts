import axios from 'axios';
import fs from 'fs';
import path from 'path';

export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  hint?: string;
}

export interface DoctorReport {
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

export class Doctor {
  private results: Map<string, CheckResult> = new Map();

  async checkAll(config: {
    alibabaApiKey?: string;
    alibabaBaseUrl?: string;
    alibabaModel?: string;
    ollamaBaseUrl?: string;
    ollamaModel?: string;
    napcatqqWsUrl?: string;
    sqliteDbPath?: string;
  }): Promise<DoctorReport> {
    const {
      alibabaApiKey = '',
      alibabaBaseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      alibabaModel = 'qwen-plus',
      ollamaBaseUrl = 'http://localhost:11434',
      ollamaModel = 'qwen2.5:7b',
      napcatqqWsUrl = 'ws://localhost:3001',
      sqliteDbPath = './data/sessions.db',
    } = config;

    await Promise.all([
      this.checkOS(),
      this.checkNode(),
      this.checkAlibaba(alibabaBaseUrl, alibabaApiKey),
      this.checkAlibabaModel(alibabaBaseUrl, alibabaApiKey, alibabaModel),
      this.checkOllama(ollamaBaseUrl),
      this.checkOllamaModel(ollamaBaseUrl, ollamaModel),
      this.checkNapCatQQ(napcatqqWsUrl),
      this.checkSQLite(sqliteDbPath),
      this.checkNetwork(),
    ]);

    return {
      os: this.results.get('os')!,
      node: this.results.get('node')!,
      alibaba: this.results.get('alibaba')!,
      alibabaModel: this.results.get('alibabaModel')!,
      ollama: this.results.get('ollama')!,
      ollamaModel: this.results.get('ollamaModel')!,
      napcatqq: this.results.get('napcatqq')!,
      sqlite: this.results.get('sqlite')!,
      network: this.results.get('network')!,
    };
  }

  private async checkOS(): Promise<void> {
    const platform = process.platform;
    let status: CheckResult['status'] = 'pass';
    let message = `OS: ${platform}`;

    if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') {
      status = 'warn';
      message += ' (unknown platform)';
    }

    this.results.set('os', { name: 'Operating System', status, message });
  }

  private async checkNode(): Promise<void> {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0], 10);

    let status: CheckResult['status'] = 'pass';
    let message = `Node.js: ${version}`;

    if (major < 18) {
      status = 'fail';
      message += ' - 需要 Node.js 18+';
    } else if (major < 20) {
      message += ' (建议升级到 Node.js 20+)';
    }

    this.results.set('node', { name: 'Node.js', status, message });
  }

  private async checkOllama(baseUrl: string): Promise<void> {
    try {
      const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 3000 });
      if (response.status === 200) {
        this.results.set('ollama', {
          name: 'Ollama',
          status: 'pass',
          message: `Ollama: ✅ 运行正常 (${baseUrl})`,
        });
      } else {
        this.results.set('ollama', {
          name: 'Ollama',
          status: 'fail',
          message: `Ollama: ⚠️ 状态异常 (${response.status})`,
        });
      }
    } catch {
      this.results.set('ollama', {
        name: 'Ollama',
        status: 'fail',
        message: `Ollama: ❌ 无法连接 (${baseUrl})`,
        hint: '请确保 Ollama 已启动 (ollama serve)',
      });
    }
  }

  private async checkOllamaModel(baseUrl: string, model: string): Promise<void> {
    try {
      const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 3000 });
      const models: Array<{ name: string }> = response.data.models || [];
      const found = models.some((m) => m.name === model);

      if (found) {
        this.results.set('ollamaModel', {
          name: 'AI 模型',
          status: 'pass',
          message: `模型 ${model}: ✅ 已安装`,
        });
      } else {
        this.results.set('ollamaModel', {
          name: 'AI 模型',
          status: 'fail',
          message: `模型 ${model}: ❌ 未安装`,
          hint: `请运行: ollama pull ${model}`,
        });
      }
    } catch {
      this.results.set('ollamaModel', {
        name: 'AI 模型',
        status: 'warn',
        message: '模型: ⚠️ 无法检查 (Ollama 未运行)',
        hint: '请先确保 Ollama 正常运行',
      });
    }
  }

  private async checkNapCatQQ(wsUrl: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ws = new (require('ws'))(wsUrl, {
          handshakeTimeout: 3000,
        });

        ws.on('open', () => {
          ws.close();
          this.results.set('napcatqq', {
            name: 'NapCatQQ',
            status: 'pass',
            message: `NapCatQQ: ✅ WebSocket 已连接 (${wsUrl})`,
          });
          resolve();
        });

        ws.on('error', () => {
          this.results.set('napcatqq', {
            name: 'NapCatQQ',
            status: 'fail',
            message: `NapCatQQ: ❌ 无法连接 (${wsUrl})`,
            hint: '请确保 NapCatQQ 已启动并开启 WebSocket',
          });
          resolve();
        });

        setTimeout(() => {
          ws.close();
          resolve();
        }, 3500);
      } catch {
        this.results.set('napcatqq', {
          name: 'NapCatQQ',
          status: 'fail',
          message: `NapCatQQ: ❌ 无法建立连接`,
          hint: '请确保 NapCatQQ 已启动',
        });
        resolve();
      }
    });
  }

  private async checkAlibaba(baseUrl: string, apiKey: string): Promise<void> {
    if (!apiKey) {
      this.results.set('alibaba', {
        name: '阿里云/通义 API',
        status: 'warn',
        message: '阿里云 API: ⚠️ 未配置 API Key',
        hint: '请在 .env 中设置 ALIBABA_API_KEY',
      });
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model: 'qwen-plus',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        this.results.set('alibaba', {
          name: '阿里云/通义 API',
          status: 'pass',
          message: `阿里云 API: ✅ 连接正常`,
        });
      } else {
        this.results.set('alibaba', {
          name: '阿里云/通义 API',
          status: 'fail',
          message: `阿里云 API: ⚠️ 状态异常 (${response.status})`,
        });
      }
    } catch (error) {
      this.results.set('alibaba', {
        name: '阿里云/通义 API',
        status: 'fail',
        message: `阿里云 API: ❌ 连接失败`,
        hint: '请检查 API Key 是否有效，或网络是否正常',
      });
    }
  }

  private async checkAlibabaModel(baseUrl: string, apiKey: string, model: string): Promise<void> {
    if (!apiKey) {
      this.results.set('alibabaModel', {
        name: '通义模型',
        status: 'warn',
        message: `模型: ⚠️ 无法检查 (API Key 未配置)`,
        hint: '请先配置 ALIBABA_API_KEY',
      });
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model: model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        this.results.set('alibabaModel', {
          name: '通义模型',
          status: 'pass',
          message: `模型 ${model}: ✅ 可用`,
        });
      } else {
        this.results.set('alibabaModel', {
          name: '通义模型',
          status: 'fail',
          message: `模型 ${model}: ⚠️ 状态异常`,
        });
      }
    } catch (error) {
      this.results.set('alibabaModel', {
        name: '通义模型',
        status: 'fail',
        message: `模型 ${model}: ❌ 无法使用`,
        hint: '请检查模型名称是否正确，或 API Key 是否有权限',
      });
    }
  }

  private async checkNetwork(): Promise<void> {
    try {
      await axios.get('https://www.aliyun.com', { timeout: 5000 });
      this.results.set('network', {
        name: 'Network',
        status: 'pass',
        message: '网络: ✅ 可以访问外网',
      });
    } catch {
      this.results.set('network', {
        name: 'Network',
        status: 'warn',
        message: '网络: ⚠️ 无法访问外网',
        hint: '仅影响 API 调用，不影响本地服务运行',
      });
    }
  }

  private async checkSQLite(dbPath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(dbPath);
      if (fs.existsSync(resolvedPath)) {
        this.results.set('sqlite', {
          name: 'SQLite',
          status: 'pass',
          message: 'SQLite: ✅ 数据库文件已就绪',
        });
      } else {
        this.results.set('sqlite', {
          name: 'SQLite',
          status: 'warn',
          message: 'SQLite: ⚠️ 数据库文件不存在',
          hint: '运行 pnpm setup 自动创建，或确保 ./data 目录存在',
        });
      }
    } catch {
      this.results.set('sqlite', {
        name: 'SQLite',
        status: 'fail',
        message: 'SQLite: ❌ 无法检查数据库状态',
      });
    }
  }

  printReport(report: DoctorReport): void {
    console.log('\n🩺 AI Robot 环境检查\n');
    console.log('═'.repeat(60));

    const checks = [
      report.os,
      report.node,
      report.alibaba,
      report.alibabaModel,
      report.ollama,
      report.ollamaModel,
      report.napcatqq,
      report.sqlite,
      report.network,
    ];

    checks.forEach((check) => {
      const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
      console.log(`${icon} ${check.message}`);
      if (check.hint) {
        console.log(`   💡 ${check.hint}`);
      }
    });

    console.log('═'.repeat(60));

    const failedCount = checks.filter((c) => c.status === 'fail').length;
    const warnCount = checks.filter((c) => c.status === 'warn').length;

    console.log('\n📊 总结:');
    if (failedCount === 0 && warnCount === 0) {
      console.log('   🎉 所有检查通过！可以启动机器人了。');
    } else if (failedCount === 0) {
      console.log(`   ⚠️  ${warnCount} 个警告，但不影响运行。`);
    } else {
      console.log(`   ❌ ${failedCount} 个检查失败，请先修复。`);
    }
    console.log('');
  }
}

export const doctor = new Doctor();

export async function runDoctorCheck(config?: {
  alibabaApiKey?: string;
  alibabaBaseUrl?: string;
  alibabaModel?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  napcatqqWsUrl?: string;
  sqliteDbPath?: string;
}): Promise<DoctorReport> {
  const report = await doctor.checkAll(config || {});
  doctor.printReport(report);
  return report;
}

const isMain = import.meta.url.endsWith(process.argv[1]?.replace(/^.*[\\/]/, '') || '');
if (isMain || process.argv[1]?.endsWith('index.js')) {
  runDoctorCheck().catch(console.error);
}
