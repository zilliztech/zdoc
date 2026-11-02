import { lstat, mkdir, readdir, realpath, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { reportUpdates, UpdateArgumentError, type UpdateDependencies, type UpdateOptions } from '../adapters/updates/runner'
import { gitMetadataDirectories, sha } from '../adapters/updates/git'
export type { UpdateOptions } from '../adapters/updates/runner'
const within = (root: string, path: string) => { const r = relative(root, path); return r === '' || r !== '..' && !r.startsWith(`..${sep}`) && !isAbsolute(r) }
async function checkOutput(out: string, inputs: string[]) {
  if (out.split(sep).includes('.git')) throw new UpdateArgumentError('Output cannot be Git metadata')
  for (let current = out; ; current = dirname(current)) {
    try { const stat = await lstat(current); if (stat.isSymbolicLink() || !stat.isDirectory()) throw new UpdateArgumentError('Output ancestors must be regular directories') }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
    if (dirname(current) === current) break
  }
  try { if ((await readdir(out)).length) throw new UpdateArgumentError('Output must be absent or empty') }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  for (const path of inputs) {
    let canonical: string
    try { canonical = await realpath(path) } catch { canonical = resolve(path) }
    if (within(canonical, out) || within(out, canonical)) throw new UpdateArgumentError('Output overlaps input data')
  }
}
export async function runUpdate(options: UpdateOptions, write: (text: string) => void = text => process.stdout.write(text),
  repositoryRoot = process.cwd(), dependencies: UpdateDependencies = {}): Promise<number> {
  try {
    if (options.mode !== undefined && options.mode !== 'report') throw new UpdateArgumentError('Only --mode report is supported')
    if (![options.sharedDocs, options.repo, options.dev, options.out].every(v => typeof v === 'string' && !!v && !/[\0\r\n]/.test(v))) throw new UpdateArgumentError('shared-docs, repo, dev and out are required')
    if (resolve(repositoryRoot, options.sharedDocs) !== join(resolve(repositoryRoot), 'shared-docs/guides')) throw new UpdateArgumentError('Only shared-docs/guides is supported')
    for (const value of [options.masterSha, options.devSha, options.sourceSha, options.comparisonMasterSha]) if (value !== undefined && !sha(value)) throw new UpdateArgumentError('Commit options must be exact lowercase SHAs')
    const pages = options.pages?.split(',')
    if (pages && (new Set(pages).size !== pages.length || pages.some(p => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p)))) throw new UpdateArgumentError('Invalid --pages')
    if (options.evidenceRun !== undefined && (!/^[1-9][0-9]*$/.test(options.evidenceRun) || !Number.isSafeInteger(Number(options.evidenceRun)))) throw new UpdateArgumentError('Invalid --evidence-run')
    if (options.evidenceZip && !options.evidenceRun) throw new UpdateArgumentError('--evidence-zip requires --evidence-run')
    const out = resolve(options.out), repo = resolve(options.repo), dev = resolve(options.dev)
    const inputs = [repo, join(repositoryRoot, 'shared-docs'), join(repositoryRoot, '.git'), join(repositoryRoot, 'packages'),
      join(dev, '.git'), join(dev, 'content'), join(dev, 'packages'), ...(options.evidenceZip ? [resolve(options.evidenceZip)] : [])]
    await checkOutput(out, inputs)
    for (const repository of new Set([resolve(repositoryRoot), repo, dev])) inputs.push(...await gitMetadataDirectories(repository))
    await checkOutput(out, inputs)
    const result = await reportUpdates({ ...options, repo, dev }, resolve(repositoryRoot), dependencies)
    await checkOutput(out, inputs)
    await mkdir(out, { recursive: true })
    for (const [name, content] of [['pins.json', result.pins], ['report.json', result.report], ['plan.json', result.plan]] as const)
      await writeFile(join(out, name), JSON.stringify(content, null, 2) + '\n', { flag: 'wx' })
    await writeFile(join(out, 'report.md'), result.markdown, { flag: 'wx' })
    write(JSON.stringify({ exitCode: result.exitCode, out, ...result.report.counts }) + '\n')
    return result.exitCode
  } catch (error) { write(`${String(error)}\n`); return error instanceof UpdateArgumentError ? 2 : 1 }
}
