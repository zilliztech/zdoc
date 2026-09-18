'use strict';

const fs = require('node:fs');
const path = require('node:path');

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
    throw new Error('[release-channel-routes] localizationDir must be absolute for localized builds');
  }
  return path.join(lifecycle.localizationDir, pluginTranslationDirectoryName(source.id), 'current');
}

function walkMarkdownFiles(root, directory = root) {
  let entries;
  try {
    entries = fs.readdirSync(directory, {withFileTypes: true});
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(root, fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      files.push(fullPath);
    }
  }
  return files;
}

function channelAndTokenFromMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) return {channel: null, token: null};
    const frontmatter = frontmatterMatch[1];
    const channelMatch = frontmatter.match(/^channel:\s*(\S+)\s*$/m);
    const tokenMatch = frontmatter.match(/^token:\s*['"]?([^'"\r\n]+)['"]?\s*$/m);
    return {
      channel: channelMatch ? channelMatch[1].trim().toLowerCase() : null,
      token: tokenMatch ? tokenMatch[1].trim() : null,
    };
  } catch {
    return {channel: null, token: null};
  }
}

function slugFromMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) return null;
    const slugMatch = frontmatterMatch[1].match(/^slug:\s*(.+)$/m);
    return slugMatch ? slugMatch[1].trim() : null;
  } catch {
    return null;
  }
}

function validateSources(sources) {
  const ids = new Set();
  for (const source of sources) {
    for (const field of ['id', 'folder', 'route']) {
      if (typeof source[field] !== 'string' || source[field].length === 0) {
        throw new Error(`[release-channel-routes] Source ${field} must be a non-empty string`);
      }
    }
    if (ids.has(source.id)) {
      throw new Error(`[release-channel-routes] Duplicate source id: ${source.id}`);
    }
    if (!path.isAbsolute(source.folder)) {
      throw new Error(`[release-channel-routes] Source folder must be absolute: ${source.folder}`);
    }
    ids.add(source.id);
  }
  return sources;
}

/**
 * Docusaurus plugin: emits release-channel-routes.txt into the build output,
 * one NEXT-channel URL path per line. The container entrypoint turns these
 * into nginx 404 rules for CURRENT deployments, so unreleased pages are
 * blocked server-side instead of relying only on client-side gating.
 */
module.exports = function pluginReleaseChannelRoutes(context, options) {
  const sources = validateSources((options && options.sources) || []);
  const outputFile = (options && options.outputFile) || 'release-channel-routes.txt';
  if (path.isAbsolute(outputFile) || outputFile.split('/').includes('..')) {
    throw new Error(`[release-channel-routes] Output file must be a safe relative path: ${outputFile}`);
  }

  return {
    name: 'release-channel-routes',

    async postBuild(lifecycle) {
      const {outDir, routesPaths, baseUrl, siteConfig} = lifecycle;
      const basePrefix = baseUrl && baseUrl !== '/'
        ? `/${baseUrl.replace(/^\/|\/$/g, '')}`
        : '';
      // Localized build passes (for example ja-JP on the English site) prefix
      // every route with the locale; strip base and locale prefixes so a NEXT
      // page is gated in every locale it was built for.
      const locales = (siteConfig?.i18n?.locales || [])
        .filter(locale => locale !== siteConfig?.i18n?.defaultLocale)
        .map(locale => `/${locale}`);

      const stripPrefixes = routePath => {
        let stripped = routePath;
        if (basePrefix && stripped.startsWith(`${basePrefix}/`)) stripped = stripped.slice(basePrefix.length);
        for (const localePrefix of locales) {
          if (stripped.startsWith(`${localePrefix}/`)) {
            stripped = stripped.slice(localePrefix.length);
            break;
          }
        }
        return stripped.replace(/^\/+/, '');
      };

      // Map every markdown file's route-relative path to its file. A page is
      // NEXT when its own front matter says so, or when it shares the Feishu
      // document token with a NEXT page — localized translations only gain the
      // channel front matter the next time they are regenerated, so the token
      // keeps every locale of an unreleased page gated in the meantime.
      const nextRoutesByPath = new Map();
      const nextTokens = new Set();
      const fileRoutes = [];
      for (const source of sources) {
        const localizedFolder = resolveSourceFolder(source, lifecycle);
        for (const canonicalPath of walkMarkdownFiles(source.folder)) {
          const relativePath = path.relative(source.folder, canonicalPath);
          const localizedPath = path.join(localizedFolder, relativePath);
          const hasLocalized = localizedFolder !== source.folder && fs.existsSync(localizedPath);
          const filePath = hasLocalized ? localizedPath : canonicalPath;
          const slug = slugFromMarkdown(filePath);
          const routeRelative = (slug != null
            ? `${source.route}/${slug.replace(/^\//, '')}`
            : `${source.route}/${relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/')}`
          ).replace(/\/+/g, '/').replace(/^\/+/, '');
          const localizedInfo = hasLocalized ? channelAndTokenFromMarkdown(localizedPath) : null;
          const canonicalInfo = channelAndTokenFromMarkdown(canonicalPath);
          // The localized pass must still see the canonical source's channel:
          // a stale translation without the field would otherwise un-gate the
          // page in its locale.
          const isNext = localizedInfo?.channel === 'next' || canonicalInfo.channel === 'next';
          const token = localizedInfo?.token ?? canonicalInfo.token;
          if (isNext) {
            nextRoutesByPath.set(routeRelative, true);
            if (token) nextTokens.add(token);
          }
          fileRoutes.push({routeRelative, token});
        }
      }
      for (const {routeRelative, token} of fileRoutes) {
        if (token && nextTokens.has(token)) nextRoutesByPath.set(routeRelative, true);
      }

      const routes = [...new Set(
        routesPaths
          .map(routePath => ({urlPath: routePath.replace(/\/+$/, ''), matchPath: stripPrefixes(routePath)}))
          .filter(({matchPath}) => matchPath && nextRoutesByPath.has(matchPath))
          .map(({urlPath}) => urlPath),
      )].sort();

      const dest = path.join(outDir, outputFile);
      if (path.relative(outDir, dest).startsWith('..')) {
        throw new Error('[release-channel-routes] Output must stay within outDir');
      }
      fs.mkdirSync(path.dirname(dest), {recursive: true});
      fs.writeFileSync(dest, routes.length > 0 ? `${routes.join('\n')}\n` : '', 'utf-8');
      console.log(`[release-channel-routes] ${routes.length} NEXT-channel route(s) listed in ${outputFile}`);
    },
  };
};
