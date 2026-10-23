import { createHash } from 'node:crypto'
import { diagnostic, parseYaml } from '../yaml'
import { collectHeadings } from './anchors'
import { linkCandidates } from './candidates'
import { classifyLink, isMilvusUrl } from './map'
import { collectReferences } from './references'
import type { ImageRecord, LinkRef, Notice, RewriteInput } from './types'

export const imageDigest = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
/** The extension is part of the source pathname, never a query or fragment. */
export function imageAddress(original: string, sha256: string): string {
  const pathname = /^https?:\/\//i.test(original) ? new URL(original).pathname : original.split(/[?#]/)[0]
  const extension = /\.([a-z0-9]+)$/i.exec(pathname)?.[1].toLowerCase()
  return `shared/${sha256}${extension ? `.${extension}` : ''}`
}
function targetTitle(markdown: string): string | undefined {
  const front = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(markdown)
  if (front) {
    const parsed = parseYaml(front[1], 'LINK_UNRESOLVED', {})
    if ('document' in parsed) {
      const title = (parsed.document.value as { title?: unknown } | null)?.title
      if (typeof title === 'string' && title.trim()) return title
    }
  }
  return collectHeadings(markdown).find(heading => heading.level === 1)?.text
}
export function rewriteLinksAndImages(input: RewriteInput) {
  const errors = [...(input.errors ?? [])]
  const notices: Notice[] = []
  const images: ImageRecord[] = []
  const edits = new Map<number, { end: number; url: string }>()
  const refs = collectReferences(input.markdown)
  const context = { ...input.context, file: input.context.file ?? input.sourceFile }
  const fail = (ref: LinkRef, code: string, message: string, detail?: unknown) => {
    errors.push({ ...diagnostic(code, message, context, ref.line), detail })
  }
  const edit = (ref: LinkRef, url: string) => edits.set(ref.start, { end: ref.end, url })
  for (const ref of refs.links) {
    const kind = classifyLink(ref.url)
    if (kind === 'external' || kind === 'milvus-url') continue
    if (kind === 'root' || kind === 'unknown') {
      fail(ref, kind === 'root' ? 'LINK_ROOT_PATH' : 'LINK_UNKNOWN_FORM', `Unsupported link: ${ref.url}`)
      continue
    }
    const hash = ref.url.indexOf('#')
    const file = hash < 0 ? ref.url : ref.url.slice(0, hash)
    const fragment = hash < 0 ? undefined : ref.url.slice(hash + 1)
    const target = kind === 'anchor' ? input.markdown : input.targets.get(file)
    let destination = ''
    if (kind === 'page') {
      const shared = input.sharedPages.get(file)
      const mapped = input.linkMap.get(file)
      if (shared !== undefined) {
        destination = `./${shared}`
        if (target == null) {
          fail(ref, 'LINK_TARGET_ABSENT', `Shared target is absent in this commit: ${file}`, { target: file })
          continue
        }
      } else if (mapped !== undefined) destination = isMilvusUrl(mapped) ? mapped : `./${mapped}`
      else if (input.cloudPages.some(page => page.slug === file.slice(0, -3))) destination = `./${file.slice(0, -3)}`
      else {
        const fallback = file.slice(0, -3).replace(/-/g, ' ')
        const title = target == null ? fallback : targetTitle(target) ?? fallback
        fail(ref, 'LINK_UNRESOLVED', `Add a destination for ${file} to links.yaml.`, { target: file, candidates: linkCandidates(title, input.cloudPages) })
        continue
      }
      if (isMilvusUrl(destination)) {
        edit(ref, fragment === undefined ? destination : `${destination.split('#')[0]}#${fragment}`)
        continue
      }
    }
    if (fragment !== undefined) {
      let anchor = fragment
      try { anchor = decodeURIComponent(fragment) } catch { /* Invalid fragments cannot match a heading. */ }
      const heading = target == null ? undefined : collectHeadings(target).find(heading => heading.milvus === anchor)
      if (!heading) {
        fail(ref, 'ANCHOR_NOT_FOUND', `No heading matches #${fragment} in ${file || input.sourceFile}.`, { target: file || input.sourceFile, anchor: fragment })
        continue
      }
      destination += `#${heading.cloud}`
    }
    edit(ref, destination)
  }
  const seenImages = new Set<string>()
  for (const ref of refs.images) {
    const content = input.images.get(ref.url)
    if (!content) {
      // A preparation failure already names the same occurrence; do not duplicate it.
      if (!errors.some(error => error.line === ref.line && error.file === context.file && error.code.startsWith('IMAGE_') && (!error.detail || (error.detail as { original?: string }).original === ref.url))) {
        fail(ref, /^https?:\/\//i.test(ref.url) ? 'IMAGE_FETCH_FAILED' : 'IMAGE_NOT_IN_COMMIT', `Image content is unavailable: ${ref.url}`, { original: ref.url })
      }
      continue
    }
    const digest = input.recorded?.get(ref.url) ?? content.sha256
    const address = imageAddress(ref.url, digest)
    edit(ref, address)
    if (seenImages.has(ref.url)) continue
    seenImages.add(ref.url)
    images.push({ original: ref.url, sha256: digest, address })
    if (digest !== content.sha256) notices.push({ ...diagnostic('IMAGE_SOURCE_CHANGED', 'The original image content has changed; keeping the recorded image.', context, ref.line),
      code: 'IMAGE_SOURCE_CHANGED', detail: { original: ref.url, recorded: digest, observed: content.sha256 } })
  }
  if (errors.length) return { errors }
  let markdown = input.markdown
  for (const [start, { end, url }] of [...edits].sort(([a], [b]) => b - a)) markdown = markdown.slice(0, start) + url + markdown.slice(end)
  return { markdown, images, notices }
}
