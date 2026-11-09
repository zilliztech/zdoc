import { runLocalCommand, type LocalCommandDependencies, type LocalCommandIO } from './update-plan'

export function runUpdatePrepare(args: readonly string[], io?: LocalCommandIO, dependencies?: LocalCommandDependencies): Promise<number> {
  return runLocalCommand('update-prepare', args, io, dependencies)
}
