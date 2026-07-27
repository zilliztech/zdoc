'use strict';

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

function pluginTranslationDirectoryName(id) {
  return id === 'default'
    ? 'docusaurus-plugin-content-docs'
    : `docusaurus-plugin-content-docs-${id}`;
}

function resolveSourceFolder(source, lifecycle) {
  const currentLocale = lifecycle.i18n?.currentLocale;
  const defaultLocale = lifecycle.i18n?.defaultLocale;
  if (!currentLocale || currentLocale === defaultLocale) return source.folder;
  if (!path.isAbsolute(lifecycle.localizationDir || '')) {
    throw new Error('[llms-txt] localizationDir must be absolute for localized builds');
  }
  return path.join(lifecycle.localizationDir, pluginTranslationDirectoryName(source.id), 'current');
}

function safeRelativePath(value, label) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    path.isAbsolute(value) ||
    value.includes('\0') ||
    value.includes('\\') ||
    value.split('/').includes('..')
  ) {
    throw new Error(`[llms-txt] ${label} must be a safe relative path`);
  }
  const normalized = path.normalize(value);
  if (normalized === '.' || normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new Error(`[llms-txt] ${label} must stay within outDir`);
  }
  return normalized;
}

function collisionKey(relativePath) {
  return path.normalize(relativePath).replace(/\\/g, '/').toLowerCase();
}

function validateOutputOptions(sources, outputDir, outputPaths) {
  const safeOutputDir = safeRelativePath(outputDir, 'outputDir');
  if (!Array.isArray(outputPaths) || outputPaths.length === 0) {
    throw new Error('[llms-txt] outputPaths must contain at least one safe relative path');
  }
  const safeOutputPaths = outputPaths.map(outputPath => safeRelativePath(outputPath, 'outputPaths entry'));
  const destinations = [
    ...sources.map(source => path.join(safeOutputDir, `${source.outputFile}.txt`)),
    ...safeOutputPaths,
  ];
  const seen = new Set();
  for (const destination of destinations) {
    const key = collisionKey(destination);
    if (seen.has(key)) throw new Error(`[llms-txt] Duplicate or colliding output path: ${destination}`);
    seen.add(key);
  }
  return {outputDir: safeOutputDir, outputPaths: safeOutputPaths};
}

function containedOutputPath(outDir, relativePath) {
  const root = path.resolve(outDir);
  const destination = path.resolve(root, relativePath);
  const relative = path.relative(root, destination);
  if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`[llms-txt] Output path must stay within outDir: ${relativePath}`);
  }
  return destination;
}

function publicUrl(siteUrl, baseUrl, relativePath) {
  return new URL(relativePath.replace(/^\//, ''), new URL(baseUrl || '/', siteUrl)).toString();
}

function validateSources(sources) {
  const ids = new Set();
  for (const source of sources) {
    for (const field of ['id', 'folder', 'route', 'outputFile', 'label']) {
      if (typeof source[field] !== 'string' || source[field].length === 0) {
        throw new Error(`[llms-txt] Source ${field} must be a non-empty string`);
      }
    }
    if (ids.has(source.id)) {
      throw new Error(`[llms-txt] Duplicate source id: ${source.id}`);
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(source.id)) {
      throw new Error(`[llms-txt] Source id must be a stable safe token: ${source.id}`);
    }
    if (!path.isAbsolute(source.folder)) {
      throw new Error(`[llms-txt] Source folder must be absolute: ${source.folder}`);
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(source.outputFile)) {
      throw new Error(`[llms-txt] Source outputFile must be a basename-only safe token: ${source.outputFile}`);
    }
    ids.add(source.id);
  }
  return sources;
}

/**
 * Parse YAML frontmatter from a content string.
 * @param {string} content
 * @returns {Record<string, any>}
 */
function parseFrontmatterFromContent(content) {
  try {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};
    return /** @type {Record<string, any>} */ (yaml.load(match[1])) || {};
  } catch {
    return {};
  }
}

/**
 * Parse YAML frontmatter from a markdown file.
 * @param {string} filePath
 * @returns {Record<string, any>}
 */
function parseFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseFrontmatterFromContent(content);
  } catch {
    return {};
  }
}

/**
 * Strip trailing " | Suffix" patterns common in Zilliz doc titles/descriptions,
 * and remove any inline markdown (links, emphasis, code) from plain-text fields.
 * @param {string} str
 */
function cleanText(str) {
  return str
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) → text
    .replace(/`([^`]+)`/g, '$1')              // `code` → code
    .replace(/\*+([^*]+)\*+/g, '$1')          // **bold** / *italic* → text
    .replace(/\s*\|.*$/, '')                   // trailing " | Cloud" suffix
    .trim();
}

/**
 * Detect programming languages from fenced code blocks.
 * @param {string} rawContent
 * @returns {string[]}
 */
function detectLanguages(rawContent) {
  const langs = new Set();
  const re = /^```(\w+)/gm;
  const map = {
    py: 'python', python: 'python',
    java: 'java',
    javascript: 'nodejs', js: 'nodejs', typescript: 'nodejs', ts: 'nodejs', node: 'nodejs',
    go: 'go', golang: 'go',
    curl: 'rest', http: 'rest', rest: 'rest',
    bash: null, shell: null, sh: null, json: null, yaml: null, xml: null, sql: null, text: null,
  };
  let match;
  while ((match = re.exec(rawContent)) !== null) {
    const lang = match[1].toLowerCase();
    const normalized = map.hasOwnProperty(lang) ? map[lang] : null;
    if (normalized) langs.add(normalized);
  }
  return [...langs];
}

/**
 * Extract a one-line description from the page body.
 * Takes the first non-heading, non-empty paragraph (up to 200 chars).
 * @param {string} strippedBody  Output of stripMdxBody()
 * @returns {string}
 */
function extractDescription(strippedBody) {
  const lines = strippedBody.split('\n');
  let paragraph = '';
  for (const line of lines) {
    if (!line || /^(#|```|>|- |\d+\.)/.test(line.trimStart())) continue;
    if (/^\w+:/.test(line)) continue;
    paragraph = line.trim();
    break;
  }
  if (paragraph.length > 200) {
    paragraph = paragraph.slice(0, 197) + '...';
  }
  return paragraph;
}

/**
 * Infer content type from frontmatter or file path.
 * @param {Record<string, any>} fm
 * @param {string} filePath
 * @returns {string}
 */
function inferContentType(fm, filePath) {
  if (fm.content_type) {
    const ct = String(fm.content_type).toLowerCase();
    const valid = ['tutorial', 'api-reference', 'conceptual', 'troubleshooting'];
    if (valid.includes(ct)) return ct;
    console.warn(`[llms-txt] Invalid content_type "${fm.content_type}" in ${filePath}, inferring from path`);
  }
  if (/[/\\]reference[/\\]/.test(filePath)) return 'api-reference';
  if (/faq|troubleshoot/i.test(filePath)) return 'troubleshooting';
  return 'tutorial';
}

/**
 * Strip MDX-specific syntax from raw markdown content, leaving clean prose + code blocks.
 * Processes line-by-line, preserving fenced code blocks as-is.
 * @param {string} rawContent
 * @returns {string}
 */
function stripMdxBody(rawContent) {
  // Remove frontmatter block
  const noFrontmatter = rawContent.replace(/^---[\s\S]*?^---[ \t]*\n/m, '');

  const lines = noFrontmatter.split('\n');
  const out = [];
  let inCodeFence = false;

  for (let line of lines) {
    // Track fenced code blocks (``` or ~~~); do not process MDX inside them
    if (/^(`{3,}|~{3,})/.test(line)) {
      inCodeFence = !inCodeFence;
      out.push(line);
      continue;
    }
    if (inCodeFence) {
      out.push(line);
      continue;
    }

    // Remove JS/TS import statements (MDX component imports)
    if (/^import\s+.+\s+from\s+['"]/.test(line)) continue;

    // Remove <Tabs> / </Tabs> wrapper tags
    if (/^<\/?(Tabs)[\s/>]/.test(line) || line.trim() === '</Tabs>') continue;

    // <TabItem value="python"> → **Python:** label
    const tabMatch = line.match(/^<TabItem\s[^>]*value=['"]([^'"]+)['"]/);
    if (tabMatch) {
      out.push(`**${tabMatch[1]}:**`);
      continue;
    }
    // </TabItem>
    if (/^<\/TabItem>/.test(line)) continue;

    // <Admonition type="..." title="Note"> → > **Note**
    const admonMatch = line.match(/^<Admonition[^>]*title="([^"]*)"[^>]*>/);
    if (admonMatch) {
      out.push(`> **${admonMatch[1]}**`);
      continue;
    }
    // </Admonition>
    if (/^<\/Admonition>/.test(line)) continue;

    // <Supademo .../> → [Interactive demo]
    if (/^<Supademo[\s/]/.test(line)) {
      out.push('[Interactive demo]');
      continue;
    }

    // Remove <DocCardList />, <Procedures>, </Procedures>
    if (/^<DocCardList[\s/>]/.test(line)) continue;
    if (/^<\/?(Procedures)[\s/>]/.test(line) || line.trim() === '</Procedures>') continue;

    // Remove bare <ul>, </ul>, <table>, </table> wrapper tags
    if (/^<\/?(ul|table)>/.test(line.trim())) continue;

    // Strip anchor IDs from headings: \{#id} or {#id}
    line = line.replace(/\\?\{#[a-z0-9-]+\}/g, '').trimEnd();

    // <li><p>content</p></li> → - content
    line = line.replace(/^<li><p>(.*?)<\/p><\/li>$/, '- $1');
    // <li>content</li> → - content
    line = line.replace(/^<li>(.*?)<\/li>$/, '- $1');

    // Strip bare <p> / </p> tags
    line = line.replace(/^<p>/, '').replace(/<\/p>$/, '');

    out.push(line);
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Recursively walk all .md/.mdx files in a directory, sorted by sidebar_position
 * at each level before descending into subdirectories.
 * @param {string} dir
 * @returns {string[]}
 */
function walkAllFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  /** @type {{ path: string, pos: number }[]} */
  const files = [];
  const subdirs = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      subdirs.push(fullPath);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      const pos = Number(parseFrontmatter(fullPath).sidebar_position) || 999;
      files.push({ path: fullPath, pos });
    }
  }

  files.sort((a, b) => a.pos - b.pos);

  const result = files.map((f) => f.path);
  for (const sub of subdirs) {
    result.push(...walkAllFiles(sub));
  }
  return result;
}

/**
 * Build a summary-only index for one source section.
 * @param {string} sourceDir
 * @param {string} route
 * @param {string} siteUrl
 * @param {string} baseUrl
 * @returns {{ content: string, count: number }}
 */
function buildSectionSummary(sourceDir, route, siteUrl, baseUrl) {
  const files = walkAllFiles(sourceDir);
  const parts = [];

  for (const filePath of files) {
    let raw;
    try {
      raw = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    const fm = parseFrontmatterFromContent(raw);
    const title = fm.sidebar_label || fm.title;
    if (!title) continue;

    const cleanedTitle = cleanText(String(title));
    // Build .md URL directly from route + slug
    const slug = fm.slug
      ? String(fm.slug).replace(/^\//, '')
      : path.relative(sourceDir, filePath).replace(/\.mdx?$/, '').replace(/\\/g, '/');
    const mdUrl = publicUrl(siteUrl, baseUrl, `${route}/${slug}.md`);
    const contentType = inferContentType(fm, filePath);
    const languages = fm.languages
      ? [].concat(fm.languages).map(l => String(l).toLowerCase())
      : detectLanguages(raw);
    const prerequisites = fm.prerequisites
      ? [].concat(fm.prerequisites)
      : [];
    const body = stripMdxBody(raw);
    const description = fm.description
      ? cleanText(String(fm.description))
      : extractDescription(body);

    const lines = [`## ${cleanedTitle}`];
    lines.push(`- URL: ${mdUrl}`);
    lines.push(`- Type: ${contentType}`);
    if (languages.length) lines.push(`- Languages: ${languages.join(', ')}`);
    if (prerequisites.length) lines.push(`- Prerequisites: ${prerequisites.join(', ')}`);
    if (description) lines.push(`> ${description}`);

    parts.push(lines.join('\n'));
  }

  return {
    content: parts.join('\n\n'),
    count: parts.length,
  };
}

/**
 * Render the slim root llms.txt that links to per-section content files.
 * @param {{ label: string, outputFile: string, optional?: boolean }[]} sources
 * @param {string} outDirUrl
 * @param {string} header
 * @param {string} summary
 * @param {string} [mcpEndpoint]
 */
function renderRoot(sources, outDirUrl, header, summary, mcpEndpoint) {
  const lines = [`# ${header}`, ''];

  if (summary) {
    lines.push(`> ${summary}`, '');
  }

  if (mcpEndpoint) {
    lines.push('## Programmatic Access', '');
    lines.push(`- MCP Server: ${mcpEndpoint}`, '');
  }

  const regular = sources.filter((s) => !s.optional);
  const optional = sources.filter((s) => s.optional);

  lines.push('## Documentation', '');
  for (const { label, outputFile } of regular) {
    lines.push(`- [${label}](${outDirUrl}/${outputFile}.txt)`);
  }
  if (regular.length) lines.push('');

  if (optional.length > 0) {
    lines.push('## Optional', '');
    for (const { label, outputFile } of optional) {
      lines.push(`- [${label}](${outDirUrl}/${outputFile}.txt)`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Docusaurus plugin: generates a slim root llms.txt + per-section full-content files.
 *
 * Configuration:
 *   sources     — array of source descriptors:
 *                   folder      {string}   directory containing the docs (relative to siteDir)
 *                   route       {string}   URL route prefix, e.g. "/docs"
 *                   outputFile  {string}   filename (without extension) for the section file
 *                   label       {string}   display name used in root llms.txt link
 *                   optional    {boolean}  if true, listed under ## Optional in root file
 *   outputDir   — subdirectory (relative to outDir) for section files (default: 'llms')
 *   outputPaths — paths relative to outDir for the root index file (default: ['llms.txt'])
 */
module.exports = function pluginLlmsTxt(context, options) {
  const {
    sources: configuredSources = /** @type {{ id: string, folder: string, route: string, outputFile: string, label: string, optional?: boolean }[]} */ ([]),
    outputDir = 'llms',
    outputPaths = /** @type {string[]} */ (['llms.txt']),
  } = options || {};
  const sources = validateSources(configuredSources);
  const safeOutputs = validateOutputOptions(sources, outputDir, outputPaths);

  return {
    name: 'llms-txt',

    async postBuild(lifecycle) {
      const {outDir, siteConfig} = lifecycle;
      const siteUrl = siteConfig.url;
      const baseUrl = lifecycle.baseUrl || siteConfig.baseUrl || '/';
      const header = siteConfig.title;
      const summary = siteConfig.tagline || '';
      const outDirUrl = publicUrl(siteUrl, baseUrl, safeOutputs.outputDir).replace(/\/$/, '');
      const mcpEndpoint = siteConfig.customFields?.mcpEndpoint || '';

      let totalPages = 0;
      for (const source of sources) {
        const {id, route, outputFile} = source;
        const sourceDir = resolveSourceFolder(source, lifecycle);
        const {content, count} = buildSectionSummary(sourceDir, route, siteUrl, baseUrl);
        const dest = containedOutputPath(outDir, path.join(safeOutputs.outputDir, `${outputFile}.txt`));
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, content, 'utf-8');
        totalPages += count;
        console.log(`[llms-txt] ${id}: ${dest} — ${count} pages (summary)`);
      }

      const rootContent = renderRoot(sources, outDirUrl, header, summary, mcpEndpoint);
      for (const rel of safeOutputs.outputPaths) {
        const dest = containedOutputPath(outDir, rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, rootContent, 'utf-8');
      }

      const writtenPaths = safeOutputs.outputPaths.map(rel => containedOutputPath(outDir, rel));
      console.log(
        `[llms-txt] Root index: ${writtenPaths.join(', ')} — ` +
        `${sources.length} sections, ${totalPages} total pages.`
      );
    },
  };
};
