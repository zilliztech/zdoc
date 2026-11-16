// Executable hermetic fixture entry. Never loaded by production entrypoints.
// All traffic is forced to the test-owned loopback server, including the real Check writer.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { request } from 'node:http'
import { join } from 'node:path'
import {
  loadTargetCheckContract,
  createTargetCheckFixture
} from '../target-check.mjs'

const [manifestPath, phase, out] = process.argv.slice(2)
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
if (!Number.isInteger(manifest.port) || manifest.port < 1)
  throw Error('Fixture server required')
const socketRequest = (_url, options, callback) =>
  request(
    {
      hostname: '127.0.0.1',
      port: manifest.port,
      path: new URL(_url).pathname + new URL(_url).search,
      method: options.method,
      headers: options.headers,
      signal: options.signal,
      agent: false
    },
    callback
  )
const transport = (input) =>
  new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: '127.0.0.1',
        port: manifest.port,
        path: input.path,
        method: input.method,
        signal: input.signal,
        agent: false
      },
      (res) => {
        const chunks = []
        let size = 0
        res.on('data', (chunk) => {
          size += chunk.length
          if (size > input.maximum) req.destroy(Error('fixture byte limit'))
          else chunks.push(chunk)
        })
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            headers: {},
            body: Buffer.concat(chunks)
          })
        )
        res.on('error', reject)
      }
    )
    req.on('error', reject)
    if (input.body) req.write(input.body)
    req.end()
  })
const git = (args, input) =>
  execFileSync(
    '/usr/bin/git',
    ['--no-replace-objects', '-C', manifest.git, ...args],
    {
      input,
      env: {
        PATH: '/usr/bin:/bin',
        GIT_CONFIG_GLOBAL: '/dev/null',
        GIT_CONFIG_NOSYSTEM: '1',
        GIT_NO_LAZY_FETCH: '1'
      },
      maxBuffer: 16 * 1024 * 1024
    }
  )
const reader = {
  head: manifest.master,
  baseFile: (m, path) => git(['show', m + ':' + path]),
  source: { read: (oid, type) => git(['cat-file', type, oid]) },
  baseline: {
    read: (oid, type) => git(['cat-file', type, oid]),
    verifyConnected: async (ids) => {
      git(['fsck', '--connectivity-only', '--no-dangling', ...ids])
    }
  },
  readSeal: (oid) => git(['cat-file', 'commit', oid])
}
const c = await loadTargetCheckContract()
const env = {
  ...manifest.env,
  GITHUB_JOB: phase,
  GITHUB_RUN_ID: phase === 'finalize' ? '32' : '31',
  ...manifest.inputs
}
// Import the actual CLI's exported orchestration, not a duplicate test implementation.
const { runTargetCheckCLI } = await import(
  phase === 'finalize' ? '../finalize.mjs' : '../validate.mjs'
)
let session
try {
  session = await createTargetCheckFixture({
    c,
    registration: manifest.registration,
    env,
    git: reader,
    transport,
    sourceTransport: transport,
    socketRequest,
    phase,
    evidenceRoot: out + '-evidence'
  })
} catch (error) {
  process.stderr.write(String(error.stack) + '\n')
  session = { status: 'held', reasons: ['FIXTURE_CONTEXT_REJECTED'] }
}
const result = await runTargetCheckCLI({ session, phase, env, out })
if (['held', 'unknown'].includes(result.status)) process.exitCode = 1
