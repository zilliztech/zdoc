import {spawn} from 'node:child_process';

import {LocalizeError, type LocalizeErrorType} from '../domain/errors.js';

export interface ProcessCall {
  executable: string;
  args: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  stdin?: string;
}

export interface ProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface ProcessRunner {
  run(call: ProcessCall): Promise<ProcessResult>;
}

export class NodeProcessRunner implements ProcessRunner {
  run(call: ProcessCall): Promise<ProcessResult> {
    return new Promise((resolve, reject) => {
      const child = spawn(call.executable, call.args, {
        cwd: call.cwd,
        env: {...process.env, ...call.env},
        shell: false,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk: string) => { stdout += chunk; });
      child.stderr.on('data', (chunk: string) => { stderr += chunk; });
      child.on('error', reject);
      child.on('close', (code) => resolve({exitCode: code ?? 5, stdout, stderr}));
      if (call.stdin !== undefined) child.stdin.end(call.stdin);
      else child.stdin.end();
    });
  }
}

interface SuccessEnvelope<T> {ok: true; data: T}
interface ErrorEnvelope {
  ok: false;
  error: {
    type?: string;
    subtype?: string;
    message?: string;
    hint?: string;
    retryable?: boolean;
    [key: string]: unknown;
  };
}

const knownTypes = new Set<LocalizeErrorType>([
  'validation', 'configuration', 'authentication', 'authorization', 'not_found',
  'compatibility', 'stale_plan', 'alignment_blocked', 'unsupported_content',
  'confirmation_required', 'partial_write', 'verification_failed', 'upstream', 'internal',
]);

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value.trim());
  } catch {
    return undefined;
  }
}

export async function runJsonCommand<T>(
  runner: ProcessRunner,
  call: ProcessCall,
): Promise<T> {
  const result = await runner.run(call);
  if (result.exitCode === 0) {
    const envelope = parseJson(result.stdout) as SuccessEnvelope<T> | undefined;
    if (!envelope || envelope.ok !== true) {
      throw new LocalizeError({
        type: 'upstream',
        subtype: 'invalid_success_envelope',
        message: `${call.executable} returned invalid JSON success output.`,
        details: {stdout: result.stdout},
      });
    }
    return envelope.data;
  }

  const envelope = parseJson(result.stderr) as ErrorEnvelope | undefined;
  const upstream = envelope?.error;
  const rawType = upstream?.type;
  const type: LocalizeErrorType = rawType && knownTypes.has(rawType as LocalizeErrorType)
    ? rawType as LocalizeErrorType
    : result.exitCode === 10
      ? 'confirmation_required'
      : result.exitCode === 3
        ? 'authentication'
        : 'upstream';
  throw new LocalizeError({
    type,
    subtype: upstream?.subtype,
    message: upstream?.message ?? `${call.executable} exited with code ${result.exitCode}.`,
    hint: upstream?.hint,
    retryable: upstream?.retryable ?? result.exitCode === 4,
    details: upstream ?? {stderr: result.stderr},
  });
}

export const larkMachineEnv: NodeJS.ProcessEnv = {
  LARKSUITE_CLI_NO_UPDATE_NOTIFIER: '1',
  LARKSUITE_CLI_NO_SKILLS_NOTIFIER: '1',
};
