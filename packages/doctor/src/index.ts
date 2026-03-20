import axios from 'axios';

export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  hint?: string;
}

export interface DoctorReport {
  os: CheckResult;
  node: CheckResult;
  ollama: CheckResult;
  ollamaModel: CheckResult;
  napcatqq: CheckResult;
  network: CheckResult;
}

export class Doctor {
  private results: Map<string, CheckResult> = new Map();

  async checkAll(config: {
    ollamaBaseUrl?: string;
    ollamaModel?: string;
    napcatqqWsUrl?: string;
  }): Promise<DoctorReport> {
    const {
      ollamaBaseUrl = 'http://localhost:11434',
      ollamaModel = 'qwen2.5:7b',
      napcatqqWsUrl = 'ws://localhost:3001',
    } = config;

    await Promise.all([
      this.checkOS(),
      this.checkNode(),
      this.checkOllama(ollamaBaseUrl),
      this.checkOllamaModel(ollamaBaseUrl, ollamaModel),
      this.checkNapCatQQ(napcatqqWsUrl),
      this.checkNetwork(),
    ]);

    return {
      os: this.results.get('os')!,
      node: this.results.get('node')!,
      ollama: this.results.get('ollama')!,
      ollamaModel: this.results.get('ollamaModel')!,
      napcatqq: this.results.get('napcatqq')!,
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

  private async checkNetwork(): Promise<void> {
    try {
      await axios.get('https://ollama.com', { timeout: 5000 });
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
        hint: '仅影响模型下载，不影响已下载模型的运行',
      });
    }
  }

  printReport(report: DoctorReport): void {
    console.log('\n🩺 AI Robot 环境检查\n');
    console.log('═'.repeat(60));

    const checks = [
      report.os,
      report.node,
      report.ollama,
      report.ollamaModel,
      report.napcatqq,
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
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  napcatqqWsUrl?: string;
}): Promise<DoctorReport> {
  const report = await doctor.checkAll(config || {});
  doctor.printReport(report);
  return report;
}
