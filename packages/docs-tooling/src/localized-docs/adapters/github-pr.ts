import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { isCommit, isRepositoryPath } from '../../shared-docs/core/yaml.ts'
import { isTranslationBranch } from '../core/schedule.ts'
import { withinPath } from './fs-reader.ts'

const execFileAsync = promisify(execFile)

const DEFAULT_BOT_LOGINS = new Set([
  'github-actions[bot]',
  'github-actions',
  'zdoc-bot[bot]',
  'zilliz-docs-bot[bot]',
])

export interface GitHubPullRequestSummary {
  number: number
  url: string
  title: string
  headRef: string
  headSha: string
  baseRef: string
  body: string
  labels: string[]
  isDraft: boolean
}

export interface GitHubPrCommit {
  sha: string
  authorLogin: string | null
  authorName: string | null
  isBot: boolean
  touchedFiles?: string[]
}

export interface GitHubPrComment {
  body: string
  createdAt?: string
}

export interface GitHubPrAdapter {
  findOpenPrByBranch(input: {
    repo: string
    headBranch: string
    baseBranch: string
  }): Promise<GitHubPullRequestSummary | null>

  listPrCommits(input: {
    repo: string
    prNumber: number
  }): Promise<GitHubPrCommit[]>

  listPrComments?(input: {
    repo: string
    prNumber: number
  }): Promise<GitHubPrComment[]>

  readBranchFile?(input: {
    repo: string
    ref: string
    filePath: string
  }): Promise<string | null>

  pushBranchFiles(input: {
    repo: string
    baseBranch: string
    headBranch: string
    expectedHeadSha?: string | null
    commitMessage: string
    files: Readonly<Record<string, string>>
  }): Promise<{ headSha: string; baseSha: string }>

  createPr(input: {
    repo: string
    baseBranch: string
    headBranch: string
    title: string
    body: string
    labels?: readonly string[]
    draft?: boolean
  }): Promise<GitHubPullRequestSummary>

  updatePr(input: {
    repo: string
    prNumber: number
    title?: string
    body: string
    addLabels?: readonly string[]
  }): Promise<GitHubPullRequestSummary>

  postPrComment?(input: {
    repo: string
    prNumber: number
    body: string
  }): Promise<void>

  dispatchValidationWorkflow?(input: {
    repo: string
    workflowFile: string
    ref: string
    prNumber: number
    sourceSha: string
    baseSha: string
    requestId: string
  }): Promise<{ dispatched: boolean; requestId: string }>
}

export interface GitHubCliPrAdapterOptions {
  repositoryRoot: string
  token?: string
  botLogins?: readonly string[]
}

const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/

function assertValidRepo(repo: string): void {
  if (!REPO_RE.test(repo)) {
    throw new Error(`Invalid GitHub repository slug: ${repo}`)
  }
}

function assertSafeTranslationBranch(branch: string): void {
  if (branch === 'master' || branch === 'dev' || branch.startsWith('refs/')) {
    throw new Error(`Refusing to write protected branch: ${branch}`)
  }
  if (!isTranslationBranch(branch)) {
    throw new Error(`Branch "${branch}" is outside the controlled translate/zh-guides-* namespace`)
  }
}

function buildGitAuthEnv(token?: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
    GIT_AUTHOR_NAME: 'github-actions[bot]',
    GIT_AUTHOR_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com',
    GIT_COMMITTER_NAME: 'github-actions[bot]',
    GIT_COMMITTER_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com',
  }
  if (token) {
    const basic = Buffer.from(`x-access-token:${token}`, 'utf8').toString('base64')
    env.GIT_CONFIG_COUNT = '1'
    env.GIT_CONFIG_KEY_0 = 'http.https://github.com/.extraheader'
    env.GIT_CONFIG_VALUE_0 = `AUTHORIZATION: basic ${basic}`
  }
  return env
}

function buildGhEnv(token?: string): NodeJS.ProcessEnv {
  return token
    ? { ...process.env, GH_TOKEN: token, GITHUB_TOKEN: token }
    : { ...process.env }
}

export function createGitHubCliPrAdapter(options: GitHubCliPrAdapterOptions): GitHubPrAdapter {
  const repoRoot = resolve(options.repositoryRoot)
  const token = options.token
  const botLogins = new Set([...DEFAULT_BOT_LOGINS, ...(options.botLogins ?? [])])

  const runGh = async (args: readonly string[]): Promise<string> => {
    const { stdout } = await execFileAsync('gh', [...args], {
      cwd: repoRoot,
      env: buildGhEnv(token),
      maxBuffer: 10 * 1024 * 1024,
    })
    return stdout
  }

  const runGit = async (cwd: string, args: readonly string[], withAuth = false): Promise<string> => {
    const { stdout } = await execFileAsync('git', [...args], {
      cwd,
      env: withAuth ? buildGitAuthEnv(token) : { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      maxBuffer: 10 * 1024 * 1024,
    })
    return stdout
  }

  const parsePrPayload = (raw: {
    number: number
    url: string
    title: string
    headRefName: string
    headRefOid: string
    baseRefName: string
    body?: string
    labels?: { name: string }[]
    isDraft?: boolean
  }): GitHubPullRequestSummary => ({
    number: raw.number,
    url: raw.url,
    title: raw.title,
    headRef: raw.headRefName,
    headSha: raw.headRefOid,
    baseRef: raw.baseRefName,
    body: raw.body ?? '',
    labels: (raw.labels ?? []).map(l => l.name),
    isDraft: Boolean(raw.isDraft),
  })

  return {
    async findOpenPrByBranch({ repo, headBranch, baseBranch }) {
      assertValidRepo(repo)
      const stdout = await runGh([
        'pr',
        'list',
        '--repo',
        repo,
        '--state',
        'open',
        '--base',
        baseBranch,
        '--head',
        headBranch,
        '--limit',
        '5',
        '--json',
        'number,url,title,headRefName,headRefOid,baseRefName,body,labels,isDraft',
      ])
      const list = JSON.parse(stdout || '[]') as Parameters<typeof parsePrPayload>[0][]
      const exact = list.find(item => item.headRefName === headBranch && item.baseRefName === baseBranch)
      return exact ? parsePrPayload(exact) : null
    },

    async listPrCommits({ repo, prNumber }) {
      assertValidRepo(repo)
      const stdout = await runGh([
        'api',
        '--paginate',
        `repos/${repo}/pulls/${prNumber}/commits`,
      ])
      const raw = JSON.parse(stdout || '[]') as {
        sha: string
        author?: { login?: string; type?: string } | null
        commit?: { author?: { name?: string } }
      }[]
      return raw.map(entry => {
        const login = entry.author?.login ?? null
        const authorName = entry.commit?.author?.name ?? null
        const isBot =
          entry.author?.type === 'Bot' ||
          (login !== null && (botLogins.has(login) || login.endsWith('[bot]'))) ||
          (authorName !== null && botLogins.has(authorName))
        return {
          sha: entry.sha,
          authorLogin: login,
          authorName,
          isBot,
        }
      })
    },

    async listPrComments({ repo, prNumber }) {
      assertValidRepo(repo)
      const stdout = await runGh([
        'api',
        '--paginate',
        `repos/${repo}/issues/${prNumber}/comments`,
      ])
      const raw = JSON.parse(stdout || '[]') as { body?: string; created_at?: string }[]
      return raw.map(item => ({
        body: String(item.body ?? ''),
        ...(item.created_at ? { createdAt: item.created_at } : {}),
      }))
    },

    async readBranchFile({ repo, ref, filePath }) {
      assertValidRepo(repo)
      if (!isRepositoryPath(filePath)) {
        throw new Error(`Unsafe repository file path: ${filePath}`)
      }
      try {
        const stdout = await runGh([
          'api',
          `repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`,
        ])
        const parsed = JSON.parse(stdout) as { content?: string; encoding?: string }
        if (parsed.encoding === 'base64' && typeof parsed.content === 'string') {
          return Buffer.from(parsed.content.replace(/\n/g, ''), 'base64').toString('utf8')
        }
        return null
      } catch {
        return null
      }
    },

    async pushBranchFiles({ repo, baseBranch, headBranch, expectedHeadSha, commitMessage, files }) {
      assertValidRepo(repo)
      assertSafeTranslationBranch(headBranch)
      if (baseBranch !== 'master') {
        throw new Error(`Translation PR base branch must be "master", got "${baseBranch}"`)
      }

      const fileEntries = Object.entries(files)
      if (fileEntries.length === 0) {
        throw new Error('pushBranchFiles requires at least one file')
      }
      for (const [relPath] of fileEntries) {
        if (!isRepositoryPath(relPath) || !relPath.startsWith('localized-docs/zh-CN/guides/pages/')) {
          throw new Error(`Refusing to write file outside localized-docs/zh-CN/guides/pages/: ${relPath}`)
        }
      }

      const remoteUrl = `https://github.com/${repo}.git`
      const baseSha = (await runGit(repoRoot, ['rev-parse', 'HEAD'])).trim()
      if (!isCommit(baseSha)) {
        throw new Error(`Failed to resolve immutable base SHA: ${baseSha}`)
      }

      const lsRemote = (
        await runGit(repoRoot, ['ls-remote', '--heads', remoteUrl, `refs/heads/${headBranch}`], true)
      ).trim()
      const remoteHeadSha = lsRemote ? lsRemote.split(/\s+/)[0] : null

      if (expectedHeadSha) {
        if (!remoteHeadSha || remoteHeadSha !== expectedHeadSha) {
          throw new Error(
            `Remote head mismatch for ${headBranch}: expected ${expectedHeadSha}, found ${remoteHeadSha ?? 'absent'}`,
          )
        }
      }

      const worktreeDir = await mkdtemp(join(tmpdir(), 'localized-docs-schedule-wt-'))
      let worktreeAdded = false
      try {
        let startRef = baseSha
        if (remoteHeadSha && isCommit(remoteHeadSha)) {
          await runGit(repoRoot, ['fetch', '--no-tags', remoteUrl, remoteHeadSha], true)
          if (expectedHeadSha) {
            startRef = remoteHeadSha
          } else {
            let isAncestor = false
            try {
              await runGit(repoRoot, ['merge-base', '--is-ancestor', remoteHeadSha, baseSha])
              isAncestor = true
            } catch {
              isAncestor = false
            }
            if (!isAncestor) {
              throw new Error(
                `Stale unmerged remote branch ${headBranch} (${remoteHeadSha}) exists without an open PR; delete or merge it before opening a new rolling PR`,
              )
            }
            // Previously merged branch can fast-forward cleanly from current master (baseSha) without force-push.
            startRef = baseSha
          }
        }
        await runGit(repoRoot, ['worktree', 'add', '--detach', worktreeDir, startRef])
        worktreeAdded = true

        const stagedPaths: string[] = []
        for (const [relPath, content] of fileEntries) {
          const absTarget = resolve(worktreeDir, relPath)
          if (!withinPath(worktreeDir, absTarget)) {
            throw new Error(`File escapes temporary worktree: ${relPath}`)
          }
          await mkdir(dirname(absTarget), { recursive: true })
          await writeFile(absTarget, content, 'utf8')
          stagedPaths.push(relPath)
        }

        await runGit(worktreeDir, ['add', '--', ...stagedPaths])
        const diffStatus = await runGit(worktreeDir, ['diff', '--cached', '--name-only'])
        let headSha = startRef
        if (diffStatus.trim().length > 0) {
          await runGit(worktreeDir, ['commit', '-m', commitMessage], true)
          headSha = (await runGit(worktreeDir, ['rev-parse', 'HEAD'])).trim()
          if (!isCommit(headSha)) {
            throw new Error(`Invalid committed head SHA: ${headSha}`)
          }
          await runGit(worktreeDir, ['push', remoteUrl, `HEAD:refs/heads/${headBranch}`], true)
        }

        return { headSha, baseSha }
      } finally {
        if (worktreeAdded) {
          await runGit(repoRoot, ['worktree', 'remove', '--force', worktreeDir]).catch(() => {})
        }
        await rm(worktreeDir, { recursive: true, force: true })
      }
    },

    async createPr({ repo, baseBranch, headBranch, title, body, labels = [], draft = false }) {
      assertValidRepo(repo)
      assertSafeTranslationBranch(headBranch)
      const scratchDir = await mkdtemp(join(tmpdir(), 'localized-docs-pr-body-'))
      try {
        const bodyFile = join(scratchDir, 'pr-body.md')
        await writeFile(bodyFile, body, 'utf8')

        for (const label of labels) {
          await runGh([
            'label',
            'create',
            label,
            '--color',
            '1D76DB',
            '--description',
            'Automated zh-CN Guides translation PR',
            '--repo',
            repo,
          ]).catch(() => {})
        }

        const args = [
          'pr',
          'create',
          '--repo',
          repo,
          '--base',
          baseBranch,
          '--head',
          headBranch,
          '--title',
          title,
          '--body-file',
          bodyFile,
        ]
        if (draft) args.push('--draft')
        for (const label of labels) {
          args.push('--label', label)
        }
        await runGh(args)

        const created = await this.findOpenPrByBranch({ repo, headBranch, baseBranch })
        if (!created) {
          throw new Error(`Created PR for ${headBranch} could not be queried back`)
        }
        return created
      } finally {
        await rm(scratchDir, { recursive: true, force: true })
      }
    },

    async updatePr({ repo, prNumber, title, body, addLabels = [] }) {
      assertValidRepo(repo)
      const scratchDir = await mkdtemp(join(tmpdir(), 'localized-docs-pr-body-'))
      try {
        const bodyFile = join(scratchDir, 'pr-body.md')
        await writeFile(bodyFile, body, 'utf8')
        const args = ['pr', 'edit', String(prNumber), '--repo', repo, '--body-file', bodyFile]
        if (title) args.push('--title', title)
        for (const label of addLabels) {
          args.push('--add-label', label)
        }
        await runGh(args)
        const viewOut = await runGh([
          'pr',
          'view',
          String(prNumber),
          '--repo',
          repo,
          '--json',
          'number,url,title,headRefName,headRefOid,baseRefName,body,labels,isDraft',
        ])
        return parsePrPayload(JSON.parse(viewOut))
      } finally {
        await rm(scratchDir, { recursive: true, force: true })
      }
    },

    async postPrComment({ repo, prNumber, body }) {
      assertValidRepo(repo)
      const scratchDir = await mkdtemp(join(tmpdir(), 'localized-docs-pr-comment-'))
      try {
        const bodyFile = join(scratchDir, 'comment.md')
        await writeFile(bodyFile, body, 'utf8')
        await runGh(['pr', 'comment', String(prNumber), '--repo', repo, '--body-file', bodyFile])
      } finally {
        await rm(scratchDir, { recursive: true, force: true })
      }
    },

    async dispatchValidationWorkflow({ repo, workflowFile, ref, prNumber, sourceSha, baseSha, requestId }) {
      assertValidRepo(repo)
      assertSafeTranslationBranch(ref)
      if (!isCommit(sourceSha) || !isCommit(baseSha)) {
        throw new Error(`Validation workflow dispatch requires 40-char sourceSha and baseSha`)
      }
      await runGh([
        'workflow',
        'run',
        workflowFile,
        '--repo',
        repo,
        '--ref',
        ref,
        '-f',
        `pr_number=${prNumber}`,
        '-f',
        `source_sha=${sourceSha}`,
        '-f',
        `base_sha=${baseSha}`,
        '-f',
        `request_id=${requestId}`,
      ])
      return { dispatched: true, requestId }
    },
  }
}
