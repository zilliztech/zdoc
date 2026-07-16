import type {WhiteboardGateway} from '../application/ports.js';
import {larkMachineEnv, runJsonCommand, type ProcessRunner} from './process-runner.js';

export class LarkWhiteboardAdapter implements WhiteboardGateway {
  constructor(private readonly runner: ProcessRunner) {}

  async queryRaw(token: string): Promise<unknown> {
    return runJsonCommand<unknown>(this.runner, {
      executable: 'lark-cli',
      args: [
        'whiteboard', '+query', '--whiteboard-token', token,
        '--output_as', 'raw', '--format', 'json', '--as', 'user',
      ],
      env: larkMachineEnv,
    });
  }

  async overwriteRaw(input: {token: string; raw: unknown; idempotencyToken: string}): Promise<void> {
    await runJsonCommand<unknown>(this.runner, {
      executable: 'lark-cli',
      args: [
        'whiteboard', '+update', '--whiteboard-token', input.token,
        '--input_format', 'raw', '--source', '-', '--overwrite',
        '--idempotent-token', input.idempotencyToken,
        '--format', 'json', '--as', 'user',
      ],
      env: larkMachineEnv,
      stdin: JSON.stringify(input.raw),
    });
  }
}
