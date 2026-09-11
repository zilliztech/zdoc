#!/usr/bin/env node
'use strict';

/**
 * tm-retrieve.js — TM (translation memory) layer 1 for zdoc EN->JA translation.
 *
 * Retrieves published EN/JA parallel pages for a target English page based on
 * path adjacency at a historical checkpoint commit, and emits JSON that can be
 * rendered into a few-shot prompt block.
 *
 * Path mapping (per repository convention):
 *   content/en/guides/<rest> <-> i18n/ja-JP/docusaurus-plugin-content-docs/current/<rest>
 *   content/en/byoc/<rest>   <-> i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/<rest>
 *
 * Usage:
 *   node tm-retrieve.js --checkpoint <sha> --page <content/en-relative-path> \
 *       [--k 2] [--max-chars 3500] [--out <file>] [--repo <dir>]
 *   node tm-retrieve.js --render-fewshot <json-file> [--out <file>]
 *
 * Determinism: no LLM, no network, no timestamps; all orderings are explicit
 * (score desc, then path asc). Same inputs -> byte-identical output.
 *
 * Fail-closed: when no usable pair exists, prints {"matches":[]} and exits 0;
 * the caller decides whether to inject an empty block.
 *
 * Environment:
 *   TM_LSTREE_CACHE=<dir>  cache `git ls-tree` output on disk, keyed by commit,
 *                          so repeated invocations enumerate the tree once.
 *
 * Exit codes: 0 = success (including empty matches), 2 = usage/config error.
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DOMAINS = [
  {
    name: 'guides',
    enRoot: 'content/en/guides',
    jaRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs/current',
  },
  {
    name: 'byoc',
    enRoot: 'content/en/byoc',
    jaRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current',
  },
];

const DEFAULT_K = 2;
const DEFAULT_MAX_CHARS = 3500;
const MAX_EXCERPTS_PER_MATCH = 3;

/** Base score by tier: same dir = 100, each walk-up level -20. */
const BASE_SAME_DIR = 100;
const BASE_STEP_PER_LEVEL = 20;
/** Base score for the domain-root tier (whole product domain, similarity-gated). */
const BASE_DOMAIN_ROOT = 20;
/** Token-overlap bonus per distinct shared token. */
const OVERLAP_BONUS = 10;
/**
 * Read frontmatter titles of tier candidates only up to this many files
 * (one batched git call); larger tiers are scored from filename tokens only.
 */
const TITLE_READ_LIMIT = 80;
/** Domain-root tier requires filename token overlap >= 1 or edit similarity >= this. */
const DOMAIN_ROOT_EDIT_SIM = 0.45;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'with', 'in', 'on', 'at',
  'by', 'from', 'as', 'is', 'are', 'be', 'your', 'you', 'how', 'what', 'when',
  'which', 'that', 'this', 'it', 'its', 'into', 'using', 'use', 'docs', 'doc',
]);

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage() {
  return [
    'Usage: node scripts/translation/tm-retrieve.js --repository <absolute-dir> --checkpoint <sha> --page <content/en-relative-path> [--k 2] [--max-chars 3500] [--out <file>]',
    '       node scripts/translation/tm-retrieve.js --render-fewshot <json-file> [--out <file>]',
  ].join('\n')
}

function parseArgs(argv) {
  if (argv.length % 2 !== 0 && !argv.includes('--render-fewshot')) throw new Error(usage())
  const opts = {
    checkpoint: null,
    page: null,
    k: DEFAULT_K,
    maxChars: DEFAULT_MAX_CHARS,
    out: null,
    repository: null,
    renderFewshot: null,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => {
      if (i + 1 >= argv.length) throw new Error(usage())
      return argv[++i]
    }
    switch (a) {
      case '--checkpoint': opts.checkpoint = next(); break
      case '--page': opts.page = next(); break
      case '--k': opts.k = Number.parseInt(next(), 10); break
      case '--max-chars': opts.maxChars = Number.parseInt(next(), 10); break
      case '--out': opts.out = next(); break
      case '--repository': opts.repository = next(); break
      case '--render-fewshot': opts.renderFewshot = next(); break
      case '--help': case '-h': return {...opts, help: true}
      default: throw new Error(`Unknown argument: ${a}\n${usage()}`)
    }
  }
  if (!opts.renderFewshot && !opts.repository) throw new Error(`--repository is required\n${usage()}`)
  if (!Number.isInteger(opts.k) || opts.k < 1) throw new Error('--k must be a positive integer')
  if (!Number.isInteger(opts.maxChars) || opts.maxChars < 200) throw new Error('--max-chars must be an integer >= 200')
  if (opts.repository) {
    const resolved = path.resolve(opts.repository)
    if (path.isAbsolute(opts.repository) && opts.repository !== resolved) {
      throw new Error('--repository must be an absolute normalized path')
    }
    opts.repository = resolved
  }
  return opts
}

// ---------------------------------------------------------------------------
// Git access
// ---------------------------------------------------------------------------

function gitCheck(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' });
  return r.status === 0;
}

/** Enumerate all file paths at a commit. Cached on disk via $TM_LSTREE_CACHE. */
function listTreeOnce(repo, sha) {
  const readThrough = () => {
    const out = spawnSync('git', ['-C', repo, 'ls-tree', '-r', sha, '--name-only'], {
      encoding: 'utf8',
      maxBuffer: 128 * 1024 * 1024,
    })
    if (out.status !== 0) throw new Error(`git ls-tree failed: ${(out.stderr || '').trim()}`)
    return out.stdout
  }
  const cacheDir = process.env.TM_LSTREE_CACHE;
  if (cacheDir) {
    const cacheFile = path.join(cacheDir, `${sha}.lstree.txt`);
    try {
      const cached = fs.readFileSync(cacheFile, 'utf8');
      if (cached.startsWith(`# ${sha}\n`)) {
        return cached.slice(cached.indexOf('\n') + 1).split('\n').filter(Boolean);
      }
    } catch (_) { /* miss */ }
    const fresh = readThrough(cacheDir);
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cacheFile, `# ${sha}\n${fresh}`);
    return fresh.split('\n').filter(Boolean);
  }
  return readThrough(null).split('\n').filter(Boolean);
}

/**
 * Read many blobs with a single `git cat-file --batch` invocation.
 * Returns a Map path -> string|null (null = missing).
 */
function batchRead(repo, sha, files) {
  const result = new Map();
  if (!files.length) return result;
  const req = files.map((f) => `${sha}:${f}`).join('\n') + '\n';
  const r = spawnSync('git', ['-C', repo, 'cat-file', '--batch'], {
    input: req,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (r.status !== 0) {
    // Fall back to per-file `git show`.
    for (const f of files) {
      const s = spawnSync('git', ['-C', repo, 'show', `${sha}:${f}`], { encoding: 'utf8' });
      result.set(f, s.status === 0 ? s.stdout : null);
    }
    return result;
  }
  const buf = Buffer.from(r.stdout);
  // Walk the --batch response stream using declared blob sizes.
  const want = files.slice();
  let off = 0;
  let idx = 0;
  while (off < buf.length && idx < want.length) {
    const nl = buf.indexOf(0x0a, off);
    if (nl < 0) break;
    const header = buf.slice(off, nl).toString('utf8');
    const m = header.match(/^([0-9a-f]+) (blob|tree|commit) (\d+)$/);
    if (!m) {
      // "<request> missing" line
      result.set(want[idx], null);
      off = nl + 1;
      idx++;
      continue;
    }
    const size = Number.parseInt(m[3], 10);
    const body = buf.slice(nl + 1, nl + 1 + size);
    result.set(want[idx], body.toString('utf8'));
    off = nl + 1 + size + 1; // skip trailing newline after content
    idx++;
  }
  for (; idx < want.length; idx++) result.set(want[idx], null);
  return result;
}

// ---------------------------------------------------------------------------
// Text utilities
// ---------------------------------------------------------------------------

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/(\\)?\{#[^}]*\}/g, ' ')
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

function tokenSet(text) {
  return new Set(tokenize(text));
}

function filenameStem(p) {
  return path.posix.basename(p).replace(/\.mdx?$/, '');
}

function filenameTokens(p) {
  return new Set(
    filenameStem(p)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t && !STOPWORDS.has(t))
  );
}

function overlapCount(a, b) {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n;
}

/** Normalized Levenshtein similarity in [0,1] between two strings. */
function editSimilarity(a, b) {
  const s = a.toLowerCase();
  const t = b.toLowerCase();
  if (s === t) return 1;
  const m = s.length;
  const n = t.length;
  if (!m || !n) return 0;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let cur = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (s[i - 1] === t[j - 1] ? 0 : 1)
      );
    }
    [prev, cur] = [cur, prev];
  }
  return 1 - prev[n] / Math.max(m, n);
}

function truncateChars(s, n) {
  if (s.length <= n) return s;
  if (n <= 1) return '…';
  return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}

/** Frontmatter title -> H1 -> filename stem. Trailing "| Cloud" removed. */
function extractTitle(content, enPath) {
  let title = null;
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const m = fm[1].match(/^title:[ \t]*(.*)$/m);
    if (m) title = m[1].trim().replace(/^["']|["']$/g, '');
  }
  if (!title) {
    const h1 = content.match(/^#[ \t]+(.+)$/m);
    if (h1) title = h1[1].trim();
  }
  if (!title) title = filenameStem(enPath);
  return title.replace(/\s*\|\s*cloud\s*$/i, '').trim();
}

/**
 * Split a page into sections on level-2/3 headings (`## ` / `### `).
 * Heading anchor ids (`\{#like-this}`) are captured for EN/JA alignment.
 */
function splitSections(content) {
  const lines = content.split('\n');
  const sections = [];
  let cur = null;
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const m = inFence ? null : line.match(/^(#{2,3})[ \t]+(.*)$/);
    if (m) {
      if (cur) sections.push(cur);
      const raw = m[2];
      let anchor = null;
      const am = raw.match(/(\\)?\{#([^}\s]+)\}\s*$/);
      if (am) anchor = am[2];
      cur = {
        level: m[1].length,
        anchor,
        text: raw.replace(/(\\)?\{#[^}]*\}\s*$/, '').trim(),
        body: [],
        order: sections.length,
      };
    } else if (cur) {
      cur.body.push(line);
    }
  }
  if (cur) sections.push(cur);
  return sections;
}

/** Similarity of two heading anchor ids (edit distance or token Jaccard). */
function anchorSimilarity(a, b) {
  if (a === b) return 1;
  const at = new Set(a.split('-'));
  const bt = new Set(b.split('-'));
  let inter = 0;
  for (const t of at) if (bt.has(t)) inter++;
  const jac = inter / (at.size + bt.size - inter);
  return Math.max(editSimilarity(a, b), jac);
}

const FUZZY_ANCHOR_THRESHOLD = 0.55;

/**
 * Align EN and JA sections of one parallel pair.
 * Pass 1: exact heading anchor id (`\{#like-this}`).
 * Pass 2: fuzzy anchor match — published JA pages sometimes rewrite anchor ids
 *         (e.g. shortened step titles), so exact matching alone misaligns.
 * Pass 3: mutual order among the remainders (labeled `position`, lowest trust).
 */
function pairSections(enSections, jaSections) {
  const pairs = [];
  const usedJa = new Set();

  const jaByAnchor = new Map();
  for (const s of jaSections) {
    if (s.anchor && !jaByAnchor.has(s.anchor)) jaByAnchor.set(s.anchor, s);
  }
  let remainingEn = [];
  for (const en of enSections) {
    const ja = en.anchor ? jaByAnchor.get(en.anchor) : undefined;
    if (ja && !usedJa.has(ja)) {
      usedJa.add(ja);
      pairs.push({ en, ja, via: 'anchor' });
    } else {
      remainingEn.push(en);
    }
  }

  let remainingJa = jaSections.filter((s) => !usedJa.has(s));
  if (remainingEn.length && remainingJa.length) {
    const cands = [];
    for (const en of remainingEn) {
      if (!en.anchor) continue;
      for (const ja of remainingJa) {
        if (!ja.anchor) continue;
        const sim = anchorSimilarity(en.anchor, ja.anchor);
        if (sim >= FUZZY_ANCHOR_THRESHOLD) cands.push({ en, ja, sim });
      }
    }
    cands.sort(
      (a, b) => b.sim - a.sim || a.en.order - b.en.order || a.ja.order - b.ja.order
    );
    const takenEn = new Set();
    for (const c of cands) {
      if (takenEn.has(c.en) || usedJa.has(c.ja)) continue;
      takenEn.add(c.en);
      usedJa.add(c.ja);
      pairs.push({ en: c.en, ja: c.ja, via: 'anchor-fuzzy' });
    }
    remainingEn = remainingEn.filter((e) => !takenEn.has(e));
    remainingJa = remainingJa.filter((s) => !usedJa.has(s));
  }

  const n = Math.min(remainingEn.length, remainingJa.length);
  for (let i = 0; i < n; i++) {
    pairs.push({ en: remainingEn[i], ja: remainingJa[i], via: 'position' });
  }
  pairs.sort((a, b) => a.en.order - b.en.order);
  return pairs;
}

// ---------------------------------------------------------------------------
// Retrieval
// ---------------------------------------------------------------------------

function buildResultSkeleton(checkpoint, page) {
  return { checkpoint, page, matches: [] };
}

function retrieve(repo, checkpoint, pageArg, k, maxChars) {
  const result = buildResultSkeleton(checkpoint, pageArg);

  // Normalize page -> domain + rest. Accept "content/en/<domain>/..." or "<domain>/...".
  let rel = pageArg.replace(/^\.\//, '');
  if (rel.startsWith('content/en/')) rel = rel.slice('content/en/'.length);
  const domain = DOMAINS.find(
    (d) => rel === d.name || rel.startsWith(`${d.name}/`)
  );
  if (!domain) {
    result.note = 'page is not under a supported product domain (guides|byoc)';
    return result;
  }
  const rest = rel.slice(domain.name.length + 1);
  if (!/\.mdx?$/.test(rest)) {
    result.note = 'page is not a markdown document';
    return result;
  }
  const enPath = `${domain.enRoot}/${rest}`;
  const jaPath = `${domain.jaRoot}/${rest}`;

  // 1. Enumerate the tree once and build the pair index for this domain.
  const allFiles = listTreeOnce(repo, checkpoint);
  const fileSet = new Set(allFiles);
  const pairsByDir = new Map(); // dir (rest-relative) -> [rest,...]
  const isPair = (r) =>
    /\.(md|mdx)$/.test(r) &&
    fileSet.has(`${domain.enRoot}/${r}`) &&
    fileSet.has(`${domain.jaRoot}/${r}`);
  const prefix = `${domain.enRoot}/`;
  for (const f of allFiles) {
    if (!f.startsWith(prefix)) continue;
    const r = f.slice(prefix.length);
    if (!isPair(r)) continue;
    const dir = path.posix.dirname(r);
    if (!pairsByDir.has(dir)) pairsByDir.set(dir, []);
    pairsByDir.get(dir).push(r);
  }
  for (const arr of pairsByDir.values()) arr.sort(); // ls-tree is sorted; keep it explicit.

  // 2. Target page context.
  const targetBlob = batchRead(repo, checkpoint, [enPath]).get(enPath);
  const targetTitle = targetBlob != null
    ? extractTitle(targetBlob, enPath)
    : filenameStem(enPath);
  const targetTitleTokens = tokenSet(targetTitle);
  const targetHeadingTokens = new Set();
  if (targetBlob != null) {
    for (const s of splitSections(targetBlob)) {
      for (const t of tokenize(s.text)) targetHeadingTokens.add(t);
    }
  }

  // 3. Tier expansion: same dir, then ancestors, then the gated domain-wide
  //    fallback (all pairs under the same product domain).
  const dir = path.posix.dirname(rest);
  const dirKey = dir === '.' ? '' : dir;
  const segments = dirKey === '' ? [] : dirKey.split('/');
  const tiers = [];
  for (let up = 0; up <= segments.length; up++) {
    tiers.push({
      dir: segments.slice(0, segments.length - up).join('/'),
      up,
      isRoot: up === segments.length,
    });
  }

  const accumulated = [];
  let accumulatedEnough = false;
  for (const tier of tiers) {
    if (accumulatedEnough) break;
    // The root tier scans the entire domain, not only files directly under it.
    const tierPairLists = tier.isRoot
      ? [...pairsByDir.values()]
      : [pairsByDir.get(tier.dir) || []];
    const dirPairs = tierPairLists
      .flat()
      .filter((r) => r !== rest)
      .sort();
    if (!dirPairs.length) continue;

    let tierCandidates = dirPairs.map((r) => ({ rest: r, enPath: `${prefix}${r}` }));

    if (tier.isRoot) {
      // Last-resort tier: require filename similarity to the target.
      const targetFn = filenameStem(rest);
      tierCandidates = tierCandidates.filter((c) => {
        const candFn = filenameStem(c.rest);
        return (
          overlapCount(filenameTokens(c.rest), filenameTokens(rest)) >= 1 ||
          editSimilarity(candFn, targetFn) >= DOMAIN_ROOT_EDIT_SIM
        );
      });
    }

    // Read candidate frontmatter titles for scoring when the tier is small.
    let titles = new Map();
    if (tierCandidates.length <= TITLE_READ_LIMIT && !tier.isRoot) {
      const blobs = batchRead(repo, checkpoint, tierCandidates.map((c) => c.enPath));
      titles = blobs;
    }

    for (const c of tierCandidates) {
      const base = tier.isRoot
        ? BASE_DOMAIN_ROOT
        : BASE_SAME_DIR - BASE_STEP_PER_LEVEL * tier.up;
      const candTokens = new Set(filenameTokens(c.rest));
      const blob = titles.get(c.enPath);
      if (blob != null) {
        for (const t of tokenize(extractTitle(blob, c.enPath))) candTokens.add(t);
      }
      const score = base + OVERLAP_BONUS * overlapCount(candTokens, targetTitleTokens);
      accumulated.push({ rest: c.rest, enPath: c.enPath, score, tierDir: tier.dir, tierUp: tier.up, tierRoot: tier.isRoot });
    }
    if (accumulated.length >= k) accumulatedEnough = true;
  }

  if (!accumulated.length) {
    result.note = 'no published parallel pair found for this page\'s domain';
    return result;
  }

  // 4. Rank and select top-k.
  accumulated.sort((a, b) => b.score - a.score || (a.enPath < b.enPath ? -1 : 1));
  const selected = accumulated.slice(0, k);

  // 5. Fetch selected pairs and build aligned excerpts.
  const blobs = batchRead(
    repo,
    checkpoint,
    selected.flatMap((s) => [s.enPath, `${domain.jaRoot}/${s.rest}`])
  );

  for (const s of selected) {
    const en = blobs.get(s.enPath);
    const ja = blobs.get(`${domain.jaRoot}/${s.rest}`);
    if (en == null || ja == null) continue; // unreadable pair: skip, fail-closed per entry
    const sectionPairs = pairSections(splitSections(en), splitSections(ja));
    const scored = sectionPairs
      .map((sp, idx) => ({
        sp,
        idx,
        overlap: overlapCount(tokenSet(sp.en.text), targetHeadingTokens),
        enBody: sp.en.body.join('\n').trim(),
        jaBody: sp.ja.body.join('\n').trim(),
      }))
      .filter((x) => x.enBody && x.jaBody);
    scored.sort((a, b) => b.overlap - a.overlap || a.idx - b.idx);

    const excerpts = [];
    let used = 0;
    const chosen = [];
    for (const c of scored) {
      if (chosen.length >= MAX_EXCERPTS_PER_MATCH) break;
      const cost = c.sp.en.text.length + c.enBody.length + c.jaBody.length;
      if (used + cost <= maxChars) {
        chosen.push(c);
        used += cost;
      }
    }
    if (!chosen.length && scored.length) {
      // No section fits: hard-truncate the highest-priority one.
      const c = scored[0];
      const rem = Math.max(0, maxChars - c.sp.en.text.length);
      const enBudget = Math.floor(rem * 0.55);
      const jaBudget = rem - enBudget;
      excerpts.push({
        heading: c.sp.en.text,
        align: c.sp.via,
        en: truncateChars(c.enBody, enBudget),
        ja: truncateChars(c.jaBody, jaBudget),
        truncated: true,
      });
      used = maxChars;
    } else {
      // Present excerpts in document order for readable few-shot blocks.
      chosen.sort((a, b) => a.idx - b.idx);
      for (const c of chosen) {
        excerpts.push({
          heading: c.sp.en.text,
          align: c.sp.via,
          en: c.enBody,
          ja: c.jaBody,
        });
      }
    }
    result.matches.push({
      enPath: s.enPath,
      jaPath: `${domain.jaRoot}/${s.rest}`,
      score: s.score,
      tier: s.tierRoot ? 'domain-wide' : s.tierUp === 0 ? 'same-dir' : `ancestor+${s.tierUp}`,
      excerpts,
      charsUsed: used,
    });
  }

  // Re-sort matches by score for a stable, descending output order.
  result.matches.sort((a, b) => b.score - a.score || (a.enPath < b.enPath ? -1 : 1));
  result.pairCountIndexed = pairsByDir.get(dirKey) ? pairsByDir.get(dirKey).length : 0;
  return result;
}

// ---------------------------------------------------------------------------
// Few-shot rendering
// ---------------------------------------------------------------------------

function renderFewshot(json) {
  const lines = [];
  lines.push('<tm_examples>');
  lines.push(
    '以下是本产品域已发布的高质量译文示例，仅作风格与术语参照，' +
    '不要将示例内容直接照搬进译文。（Published samples for style/terminology reference only.）'
  );
  if (json.checkpoint) lines.push(`(reference checkpoint: ${json.checkpoint})`);
  const matches = Array.isArray(json.matches) ? json.matches : [];
  if (!matches.length) {
    lines.push('(参照可能な公開訳例はありません / no usable examples found)');
    lines.push('</tm_examples>');
    return lines.join('\n') + '\n';
  }
  matches.forEach((m, i) => {
    lines.push('');
    lines.push(`--- 例 ${i + 1} / example ${i + 1}（関連度スコア ${m.score}）---`);
    lines.push(`EN: ${m.enPath}`);
    lines.push(`JA: ${m.jaPath}`);
    for (const ex of m.excerpts || []) {
      lines.push('');
      lines.push(`## ${ex.heading}`);
      lines.push('');
      lines.push('[EN]');
      lines.push(ex.en);
      lines.push('');
      lines.push('[JA]');
      lines.push(ex.ja);
    }
  });
  lines.push('');
  lines.push('</tm_examples>');
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function emit(text, outFile) {
  if (outFile) {
    fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
    fs.writeFileSync(outFile, text);
  } else {
    process.stdout.write(text);
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help) {
    console.log(usage())
    return
  }

  if (opts.renderFewshot) {
    let json
    try {
      json = JSON.parse(fs.readFileSync(opts.renderFewshot, 'utf8'))
    } catch (e) {
      throw new Error(`cannot read/parse ${opts.renderFewshot}: ${e.message}`)
    }
    emit(renderFewshot(json), opts.out)
    return
  }

  if (!opts.repository) throw new Error(`--repository is required\n${usage()}`)
  if (!opts.checkpoint || !/^[0-9a-f]{40}$/.test(opts.checkpoint)) throw new Error('--checkpoint must be a lowercase 40-character Git SHA')
  if (!opts.page) throw new Error(`--page is required\n${usage()}`)

  if (!gitCheck(opts.repository, ['cat-file', '-e', `${opts.checkpoint}^{commit}`])) {
    throw new Error(`checkpoint ${opts.checkpoint} is not a commit reachable in ${opts.repository}`)
  }

  const result = retrieve(opts.repository, opts.checkpoint, opts.page, opts.k, opts.maxChars)
  const summary = `[tm-retrieve] page=${opts.page} matches=${result.matches.length} excerpts=${result.matches.reduce((total, match) => total + match.excerpts.length, 0)}${result.note ? ` note=${result.note}` : ''}`
  console.error(summary)
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`)
  }
  emit(JSON.stringify(result, null, 2) + '\n', opts.out)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(String(error?.message || error))
    process.exitCode = 1
  }
}

module.exports = {
  DEFAULT_K,
  DEFAULT_MAX_CHARS,
  DOMAINS,
  anchorSimilarity,
  editSimilarity,
  pairSections,
  parseArgs,
  renderFewshot,
  retrieve,
  splitSections,
  tokenize,
}
