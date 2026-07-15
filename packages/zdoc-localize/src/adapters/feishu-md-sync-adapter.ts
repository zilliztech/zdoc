import {LocalizeError} from '../domain/errors.js';
import type {ProcessRunner} from './process-runner.js';

export class FeishuMdSyncAdapter {
  constructor(
    private readonly runner: ProcessRunner,
    private readonly executable = 'feishu-md-sync',
  ) {}

  async checkCompatibility(): Promise<string> {
    const result = await this.runner.run({executable: this.executable, args: ['--version']});
    const version = result.stdout.trim();
    const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
    if (result.exitCode !== 0 || !match || Number(match[1]) !== 0 || Number(match[2]) !== 3) {
      throw new LocalizeError({
        type: 'compatibility',
        subtype: 'feishu_md_sync_version',
        message: `zdoc-localize requires feishu-md-sync >=0.3.0 <0.4.0; found ${version || 'unavailable'}.`,
        hint: 'Install a compatible feishu-md-sync release.',
      });
    }
    return version;
  }

  async status(input: {markdownFile: string; target: string; profile?: 'zilliz' | 'milvus' | 'none'}): Promise<unknown> {
    await this.checkCompatibility();
    const result = await this.runner.run({
      executable: this.executable,
      args: [
        'status', input.markdownFile, '--target', input.target,
        '--profile', input.profile ?? 'none', '--format', 'json',
      ],
    });
    if (result.exitCode !== 0) {
      throw new LocalizeError({
        type: 'upstream',
        subtype: 'feishu_md_sync_status',
        message: 'feishu-md-sync status failed.',
        details: {stderr: result.stderr},
      });
    }
    return JSON.parse(result.stdout) as unknown;
  }
}
