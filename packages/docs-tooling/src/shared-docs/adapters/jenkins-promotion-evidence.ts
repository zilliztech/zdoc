import { createHash } from 'node:crypto'
import { request } from 'node:https'
import type { JenkinsUatDeployment } from '../core/promotion'
import { parseStrictJson } from '../core/updates/canonical'

const responseLimit = 512 * 1024
const requestTimeoutMs = 10_000
const metadataTree = 'number,building,result,url,artifacts[fileName,relativePath]'
const artifactPath = 'output.json'
const stageName = 'uat-en'
const tokenKey = 'VDC_JENKINS_PREVIEW_API_TOKEN'

export type JenkinsEvidenceReader = () => Promise<JenkinsUatDeployment>

export function isJenkinsBuildNumber(value: string) {
  return /^[1-9][0-9]{0,9}$/.test(value) && String(Number(value)) === value && Number(value) <= 2_147_483_647
}

/** Called before importing the Guides command, whose legacy dependencies load checkout dotenv. */
export function captureJenkinsPreviewEnvironment() {
  const { VDC_JENKINS_PREVIEW_ORIGIN: origin, VDC_JENKINS_PREVIEW_JOB: job, VDC_JENKINS_PREVIEW_USER: user } = process.env
  const token = process.env[tokenKey]
  delete process.env[tokenKey]
  return { origin, job, user, token }
}

export type JenkinsPreviewEnvironment = ReturnType<typeof captureJenkinsPreviewEnvironment>

export function openJenkinsUatEvidence(build: string, environment?: JenkinsPreviewEnvironment): JenkinsEvidenceReader {
  const { origin, job, user, token } = environment ?? {}
  // The command import may have supplied a checkout dotenv value with the same key.
  delete process.env[tokenKey]
  return async () => {
    if (!isJenkinsBuildNumber(build)) throw new Error('Expected an exact Jenkins build number')
    const configured = origin && URL.canParse(origin) ? new URL(origin) : null
    if (!configured || configured.protocol !== 'https:' || (origin !== configured.origin && origin !== configured.origin + '/')) {
      throw new Error('VDC_JENKINS_PREVIEW_ORIGIN must be an HTTPS origin')
    }
    if (!job || job.length > 256 || job.split('/').some(part => !/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(part)) || /\s/.test(job)) {
      throw new Error('VDC_JENKINS_PREVIEW_JOB must be a Jenkins job full name')
    }
    if (!user || user.length > 256 || /[^!-~]|:/.test(user) || !token || token.length > 256 || /[^!-~]/.test(token)) {
      throw new Error('The Jenkins preview requires a runner-provided read-only user and API token')
    }
    const authorization = `Basic ${Buffer.from(`${user}:${token}`, 'utf8').toString('base64')}`
    return observeBuild(configured.origin, job, build, authorization)
  }
}

/** Only the fixed build, stages and archive paths reach this transport. No response links are followed. */
function readBytes(url: URL, label: string, authorization: string): Promise<Buffer> {
  const signal = AbortSignal.timeout(requestTimeoutMs)
  return new Promise((resolve, reject) => {
    const failed = () => reject(new Error(`Jenkins ${label} read ${signal.aborted ? 'timed out' : 'failed'}`))
    try {
      const req = request(url, {
        method: 'GET', agent: false, rejectUnauthorized: true, signal, maxHeaderSize: 16 * 1024,
        headers: { Authorization: authorization, Accept: 'application/json', 'Accept-Encoding': 'identity' },
      }, response => {
        const stop = (reason: string) => {
          reject(new Error(`Jenkins ${label} ${reason}`))
          response.destroy()
          req.destroy()
        }
        response.once('error', failed)
        const status = response.statusCode ?? 0
        if (status >= 300 && status < 400) return stop('redirect was rejected')
        if (status !== 200) return stop(`read failed (HTTP ${status})`)
        const encoding = response.headers['content-encoding']
        if (encoding && encoding !== 'identity') return stop('response encoding is unsupported')
        const length = response.headers['content-length']
        if (length !== undefined && (!/^[0-9]+$/.test(length) || Number(length) > responseLimit)) {
          return stop('response exceeds the byte limit or has an invalid content length')
        }
        const chunks: Buffer[] = []
        let size = 0
        response.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > responseLimit) return stop('response exceeds the byte limit')
          chunks.push(chunk)
        })
        response.once('end', () => {
          if (!response.complete || (length !== undefined && size !== Number(length))) return failed()
          resolve(Buffer.concat(chunks, size))
        })
      })
      req.once('error', failed)
      req.end()
    } catch {
      failed()
    }
  })
}

const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Jenkins ${label} must be an object`)
  return value as Record<string, unknown>
}

function json(bytes: Buffer, label: string) {
  let value: unknown
  try { value = parseStrictJson(bytes) }
  catch { throw new Error(`Jenkins ${label} is not strict JSON`) }
  return object(value, label)
}

function isFullSha(value: unknown): value is string {
  return typeof value === 'string' && value.length === 40 && /^[a-f0-9]{40}$/.test(value)
}

function isImageDigest(value: unknown): value is string {
  return typeof value === 'string' && value.length === 71 && /^sha256:[a-f0-9]{64}$/.test(value)
}

function isSelected(values: unknown, target: string, allowed: readonly string[]) {
  return Array.isArray(values) && values.includes(target) && new Set(values).size === values.length
    && values.every(value => allowed.includes(value))
}

async function observeBuild(origin: string, job: string, number: string, authorization: string): Promise<JenkinsUatDeployment> {
  const buildUrl = `${origin}/job/${job.split('/').join('/job/')}/${number}/`
  const metadataUrl = new URL('api/json', buildUrl)
  metadataUrl.searchParams.set('tree', metadataTree)
  const metadataBytes = await readBytes(metadataUrl, 'build metadata', authorization)
  const metadata = json(metadataBytes, 'build metadata')
  if (metadata.number !== Number(number) || metadata.url !== buildUrl) throw new Error('Jenkins build metadata identity does not match the requested job and build')
  if (metadata.building !== false || metadata.result !== 'SUCCESS') throw new Error('Jenkins build must be completed successfully')
  if (!Array.isArray(metadata.artifacts)) throw new Error('Jenkins build metadata is missing its artifact list')
  const archives = metadata.artifacts.map(value => object(value, 'artifact entry')).filter(({ fileName, relativePath }) => {
    if (typeof fileName !== 'string' || typeof relativePath !== 'string') throw new Error('Jenkins artifact entry is missing its name or path')
    return fileName === artifactPath || relativePath.split('/').at(-1) === artifactPath
  })
  if (archives.length !== 1 || archives[0].fileName !== artifactPath || archives[0].relativePath !== artifactPath) {
    throw new Error('Jenkins build must have one output.json at the fixed archive path')
  }

  const stagesBytes = await readBytes(new URL('wfapi/describe', buildUrl), 'stages', authorization)
  const stages = json(stagesBytes, 'stages')
  if (stages.id !== number || stages.name !== `#${number}` || stages.status !== 'SUCCESS' || !Array.isArray(stages.stages)) {
    throw new Error('Jenkins stages must describe the same successful build')
  }
  const rows = stages.stages.map(value => object(value, 'stage entry'))
  const matches = rows.filter(row => row.name === stageName)
  const stage = matches[0]
  if (matches.length !== 1 || stage.status !== 'SUCCESS' || typeof stage.id !== 'string' || !isJenkinsBuildNumber(stage.id)
    || rows.filter(row => row.id === stage.id).length !== 1) {
    throw new Error('Jenkins build must have one successful uat-en stage with a unique stage ID')
  }

  const archiveBytes = await readBytes(new URL(`artifact/${artifactPath}`, buildUrl), 'output.json', authorization)
  const archive = json(archiveBytes, 'output.json')
  const buildId = `jenkins-${job.replaceAll('/', '-')}-${number}`
  if (archive.job_name !== job || archive.build_number !== number || archive.build_url !== buildUrl || archive.jenkins_build_id !== buildId) {
    throw new Error('Jenkins output.json identity does not match the job, build number and Jenkins build ID')
  }
  const sourceSha = archive.zdoc_sha
  if (archive.status !== 'SUCCESS' || !isFullSha(sourceSha) || archive.build_from_branch !== 'true' || archive.release_source !== `branch:dev@${sourceSha.slice(0, 9)}`) {
    throw new Error('Jenkins output.json must record a successful dev rebuild with the full zdoc SHA')
  }
  const targets = object(archive.targets, 'output.json targets')
  if (!isSelected(targets.sites, 'oversea', ['oversea', 'cn']) || !isSelected(targets.environments, 'uat', ['uat', 'prod'])) {
    throw new Error('Jenkins output.json does not select English UAT')
  }
  const images = object(archive.images, 'output.json images')
  const image = object(images.oversea, 'output.json English image')
  const deployments = object(image.deployments, 'output.json English deployments')
  const deployment = object(deployments.uat, 'output.json English UAT deployment')
  if (image.selected !== true || deployment.selected !== true) throw new Error('Jenkins output.json must select the English image and its UAT deployment')
  if (image.revision !== sourceSha) throw new Error('Jenkins source image revision does not match the full zdoc SHA')
  if (!isImageDigest(image.source_digest) || image.source_digest !== deployment.deployment_digest) {
    throw new Error('Jenkins source image and English UAT deployment must have the same immutable digest')
  }
  return { job, number, buildId, stage: { id: stage.id, name: stageName, status: 'SUCCESS' }, archivePath: artifactPath,
    archiveSha256: sha256(archiveBytes), buildMetadataSha256: sha256(metadataBytes), stagesSha256: sha256(stagesBytes),
    sourceSha, finalDeployedDigest: image.source_digest }
}
