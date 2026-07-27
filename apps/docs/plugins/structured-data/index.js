'use strict';

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

function resolveSourceFolder(siteDir, folder) {
  return path.isAbsolute(folder) ? folder : path.resolve(siteDir, folder);
}

function validateSources(sources) {
  const ids = new Set();
  for (const source of sources) {
    for (const field of ['id', 'folder', 'route']) {
      if (typeof source[field] !== 'string' || source[field].length === 0) {
        throw new Error(`[structured-data] Source ${field} must be a non-empty string`);
      }
    }
    if (ids.has(source.id)) {
      throw new Error(`[structured-data] Duplicate source id: ${source.id}`);
    }
    ids.add(source.id);
  }
  return sources;
}

/**
 * Parse YAML frontmatter from a markdown file.
 * @param {string} filePath
 * @returns {Record<string, any>}
 */
function parseFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};
    return /** @type {Record<string, any>} */ (yaml.load(match[1])) || {};
  } catch {
    return {};
  }
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
    py: 'Python', python: 'Python',
    java: 'Java',
    javascript: 'JavaScript', js: 'JavaScript', typescript: 'TypeScript', ts: 'TypeScript',
    go: 'Go', golang: 'Go',
    curl: 'cURL', http: 'cURL',
  };
  let m;
  while ((m = re.exec(rawContent)) !== null) {
    const lang = m[1].toLowerCase();
    if (map[lang]) langs.add(map[lang]);
  }
  return [...langs];
}

/**
 * Determine genre from URL path.
 * @param {string} urlPath
 * @returns {string}
 */
function getGenre(urlPath) {
  if (/^\/reference(\/|$)/.test(urlPath)) return 'API Reference';
  return 'Guide';
}

/**
 * Build a JSON-LD object for a single doc page.
 */
function buildJsonLd({ title, url, genre, dateModified, proficiencyLevel, languages, prerequisites }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'name': title,
    'url': url,
    'genre': genre,
    'dateModified': dateModified || new Date().toISOString(),
    'publisher': {
      '@type': 'Organization',
      'name': 'Zilliz',
    },
  };

  if (proficiencyLevel) {
    ld.proficiencyLevel = proficiencyLevel;
  }
  if (languages && languages.length) {
    ld.programmingLanguage = languages;
  }
  if (prerequisites && prerequisites.length) {
    ld.dependencies = prerequisites.join(', ');
  }

  return ld;
}

/**
 * Recursively walk all .md/.mdx files in a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function walkMdFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const result = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkMdFiles(fullPath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      result.push(fullPath);
    }
  }
  return result;
}

/**
 * Docusaurus plugin: injects Schema.org JSON-LD structured data into doc pages.
 */
module.exports = function pluginStructuredData(context, options) {
  const { sources: configuredSources = [] } = options || {};
  const sources = validateSources(configuredSources);

  return {
    name: 'structured-data',

    async postBuild({ siteDir, outDir, siteConfig }) {
      const siteUrl = siteConfig.url;
      const defaultLocale = siteConfig.i18n?.defaultLocale;
      const configuredLocales = siteConfig.i18n?.locales || [];
      const locales = configuredLocales.length > 0 ? configuredLocales : [defaultLocale].filter(Boolean);
      const outputLocales = locales.length > 0 ? locales : [undefined];
      let injected = 0;

      for (const { folder, route } of sources) {
        const sourceDir = resolveSourceFolder(siteDir, folder);

        const mdFiles = walkMdFiles(sourceDir);

        for (const mdPath of mdFiles) {
          const fm = parseFrontmatter(mdPath);
          const title = fm.sidebar_label || fm.title;
          if (!title) continue;

          const rel = path.relative(sourceDir, mdPath)
            .replace(/\.mdx?$/, '')
            .replace(/\\/g, '/');
          const slug = String(fm.slug || rel).replace(/^\//, '');

          const rawContent = fs.readFileSync(mdPath, 'utf-8');
          const genre = getGenre(route);

          // Get file modification time as dateModified fallback
          let dateModified;
          try {
            const stat = fs.statSync(mdPath);
            dateModified = stat.mtime.toISOString();
          } catch {
            dateModified = new Date().toISOString();
          }

          const rawLevel = fm.proficiencyLevel
            ? String(fm.proficiencyLevel).toLowerCase()
            : 'beginner';
          const proficiencyLevel = rawLevel.charAt(0).toUpperCase() + rawLevel.slice(1);

          const languages = fm.languages
            ? [].concat(fm.languages).map(String)
            : detectLanguages(rawContent);
          const prerequisites = fm.prerequisites
            ? [].concat(fm.prerequisites).map(String)
            : undefined;

          for (const locale of outputLocales) {
            const localePrefix = locale && locale !== defaultLocale ? locale : '';
            const htmlDir = path.join(outDir, localePrefix, route.replace(/^\//, ''));
            const htmlPath = [
              path.join(htmlDir, `${slug}.html`),
              path.join(htmlDir, slug, 'index.html'),
            ].find(candidate => fs.existsSync(candidate));
            if (!htmlPath) continue;

            const pageUrl = `${siteUrl}/${localePrefix}${route}/${slug}`.replace(/([^:])\/+/g, '$1/');
            const jsonLd = buildJsonLd({
              title, url: pageUrl, genre, dateModified, proficiencyLevel,
              languages: languages.length ? languages : undefined,
              prerequisites,
            });

            // Inject JSON-LD script tag before </head>
            let html = fs.readFileSync(htmlPath, 'utf-8');
            const scriptTag = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
            html = html.replace('</head>', `${scriptTag}\n</head>`);
            fs.writeFileSync(htmlPath, html, 'utf-8');
            injected++;
          }
        }
      }

      console.log(`[structured-data] Injected JSON-LD into ${injected} pages`);
    },
  };
};
