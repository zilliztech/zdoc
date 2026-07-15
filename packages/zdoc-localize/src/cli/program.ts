import {Command, CommanderError} from 'commander';

export const CLI_VERSION = '0.1.0';
export const SCHEMA_VERSION = 1;

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

const commands = [
  'doctor',
  'pair',
  'bootstrap',
  'plan',
  'apply',
  'status',
  'recover',
] as const;

const features = [
  'external-translation-provider',
  'review-markdown-v1',
] as const;

class MemoryIo {
  private readonly stdoutChunks: string[] = [];
  private readonly stderrChunks: string[] = [];

  writeStdout(value: string): void {
    this.stdoutChunks.push(value);
  }

  writeStderr(value: string): void {
    this.stderrChunks.push(value);
  }

  result(exitCode: number): CliResult {
    return {
      exitCode,
      stdout: this.stdoutChunks.join(''),
      stderr: this.stderrChunks.join(''),
    };
  }
}

function createProgram(io: MemoryIo): Command {
  const program = new Command();
  program
    .name('zdoc-localize')
    .description('Stale-safe localization planning for ZDoc Feishu documents.')
    .version(CLI_VERSION)
    .exitOverride()
    .configureOutput({
      writeOut: (value) => io.writeStdout(value),
      writeErr: (value) => io.writeStderr(value),
    });

  program
    .command('capabilities')
    .option('--format <format>', 'Output format: json | pretty', 'pretty')
    .action((options: {format: string}) => {
      const data = {
        cliVersion: CLI_VERSION,
        schemaVersion: SCHEMA_VERSION,
        commands: [...commands],
        features: [...features],
      };
      io.writeStdout(options.format === 'json'
        ? `${JSON.stringify({ok: true, data})}\n`
        : `${JSON.stringify(data, null, 2)}\n`);
    });

  for (const name of commands) {
    program.command(name).description(`${name} workflow commands`);
  }

  return program;
}

export async function runCli(argv: string[]): Promise<CliResult> {
  const io = new MemoryIo();
  const program = createProgram(io);
  try {
    await program.parseAsync(['node', 'zdoc-localize', ...argv]);
    return io.result(0);
  } catch (error) {
    if (error instanceof CommanderError) {
      if (error.code === 'commander.version') {
        return io.result(0);
      }
      return io.result(error.exitCode || 2);
    }
    io.writeStderr(`${JSON.stringify({
      ok: false,
      error: {
        type: 'internal',
        message: error instanceof Error ? error.message : String(error),
      },
    })}\n`);
    return io.result(5);
  }
}
