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
    throw new Error('[embed-markdown] localizationDir must be absolute for localized builds');
  }
  return path.join(lifecycle.localizationDir, pluginTranslationDirectoryName(source.id), 'current');
}

function walkCanonicalMarkdownFiles(root, directory = root) {
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
      files.push(...walkCanonicalMarkdownFiles(root, fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      files.push(path.relative(root, fullPath));
    }
  }
  return files;
}

function sourceFileEntries(source, lifecycle) {
  const localizedFolder = resolveSourceFolder(source, lifecycle);
  return walkCanonicalMarkdownFiles(source.folder).map(relativePath => {
    const localizedPath = path.join(localizedFolder, relativePath);
    return {
      relativePath,
      filePath: localizedFolder !== source.folder && fs.existsSync(localizedPath)
        ? localizedPath
        : path.join(source.folder, relativePath),
    };
  });
}

function localizedRoute(baseUrl, route) {
  return `${baseUrl || '/'}${route.replace(/^\//, '')}`.replace(/\/+/g, '/');
}

function routeWithinBase(routePath, baseUrl) {
  if (!baseUrl || baseUrl === '/') return routePath;
  const basePrefix = `/${baseUrl.replace(/^\/|\/$/g, '')}`;
  return routePath === basePrefix ? '/' : routePath.startsWith(`${basePrefix}/`)
    ? routePath.slice(basePrefix.length)
    : routePath;
}

function containedDestination(outDir, routePath) {
  const root = path.resolve(outDir);
  const destination = path.resolve(root, routePath.replace(/^\//, ''));
  const relative = path.relative(root, destination);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`[embed-markdown] Output route must stay within outDir: ${routePath}`);
  }
  return destination;
}

function validateSources(sources) {
  const ids = new Set();
  for (const source of sources) {
    for (const field of ['id', 'folder', 'route']) {
      if (typeof source[field] !== 'string' || source[field].length === 0) {
        throw new Error(`[embed-markdown] Source ${field} must be a non-empty string`);
      }
    }
    if (ids.has(source.id)) {
      throw new Error(`[embed-markdown] Duplicate source id: ${source.id}`);
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(source.id)) {
      throw new Error(`[embed-markdown] Source id must be a stable safe token: ${source.id}`);
    }
    if (!path.isAbsolute(source.folder)) {
      throw new Error(`[embed-markdown] Source folder must be absolute: ${source.folder}`);
    }
    ids.add(source.id);
  }
  return sources;
}

// Helper function to extract slug from markdown frontmatter
function getSlugFromMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const slugMatch = frontmatter.match(/^slug:\s*(.+)$/m);
      if (slugMatch) {
        return slugMatch[1].trim();
      }
    }
  } catch (e) {
    // Ignore errors reading frontmatter
  }
  return null;
}

module.exports = function (context, options) {
  // Extract configurable options
  const {
    cursorMcpCommand = 'npx @zilliz/claude-context-mcp@latest',
    enableSourceView = true,
    sources: customSources = [],
  } = options || {};

  const sources = validateSources(customSources);

  return {
    name: 'embed-markdown',

    async contentLoaded({ actions }) {
      const { setGlobalData } = actions;
      const baseUrl = context.baseUrl || context.siteConfig?.baseUrl || '/';

      // Keep repository paths on the server; clients need only stable source IDs and routes.
      setGlobalData({
        cursorMcpCommand,
        enableSourceView,
        sources: sources.map(({ id, route }) => ({ id, route: localizedRoute(baseUrl, route) })),
      });
    },

    configureWebpack(_config, isServer) {
      // Add dev server middleware to serve .md files from source directories
      if (!isServer) {
        return {
          devServer: {
            setupMiddlewares: (middlewares, devServer) => {
              const baseUrl = context.baseUrl || context.siteConfig?.baseUrl || '/';
              const pathMap = {};

              // Build path map for dev server
              for (const source of sources) {
                const { route } = source;
                for (const {filePath, relativePath} of sourceFileEntries(source, context)) {
                  const slug = getSlugFromMarkdown(filePath);
                  let fullUrlPath;

                  if (slug) {
                    fullUrlPath = `${route}/${slug.replace(/^\//, '')}.md`;
                  } else {
                    const urlPath = relativePath.replace(/\.mdx?$/, '');
                    fullUrlPath = `${route}/${urlPath}.md`;
                  }

                  fullUrlPath = localizedRoute(baseUrl, fullUrlPath);
                  pathMap[fullUrlPath] = filePath;
                }
              }


              // Serve .md files as raw markdown
              const markdownMiddleware = (req, res, next) => {
                if (!req.path.endsWith('.md')) {
                  return next();
                }

                const fsPath = pathMap[req.path];

                if (fsPath && fs.existsSync(fsPath)) {
                  const content = fs.readFileSync(fsPath, 'utf-8');
                  res.set('Content-Type', 'text/markdown; charset=utf-8');
                  res.setHeader('Content-Disposition', 'inline');
                  res.send(content);
                } else {
                  next();
                }
              };

              devServer.app.use(markdownMiddleware);
              middlewares.unshift(markdownMiddleware);

              return middlewares;
            },
          },
        };
      }
    },

    async postBuild(lifecycle) {
      const {outDir, routesPaths, siteConfig} = lifecycle;
      const baseUrl = lifecycle.baseUrl || siteConfig.baseUrl || '/';
      let totalCopied = 0;

      // Build slug-based lookup: slug -> filesystem path
      const slugToFileMap = {};

      for (const source of sources) {
        const {route} = source;
        for (const {filePath, relativePath} of sourceFileEntries(source, lifecycle)) {
          const slug = getSlugFromMarkdown(filePath);

          if (slug) {
            slugToFileMap[slug] = filePath;
            const routeSlug = `${route}/${slug.replace(/^\//, '')}`.replace(/\/+/g, '/');
            slugToFileMap[routeSlug] = filePath;
          } else {
            const urlPath = relativePath.replace(/\.mdx?$/, '');
            const fullUrlPath = `${route}/${urlPath}`.replace(/\/+/g, '/');
            slugToFileMap[fullUrlPath] = filePath;
          }
        }
      }

      // Build a reverse map from filesystem paths to URL paths
      const sourceToUrlMap = [];

      for (const routePath of routesPaths) {
        // Remove trailing slash
        const cleanPath = routePath.replace(/\/$/, '');
        const sourceRoutePath = routeWithinBase(cleanPath, baseUrl);

        // Try to find the file using the slug map
        const fullPath = slugToFileMap[sourceRoutePath];

        if (fullPath) {
          sourceToUrlMap.push([fullPath, cleanPath + '.md']);
        }
      }

      // Copy files using the URL map
      for (const [sourcePath, urlPath] of sourceToUrlMap) {
        if (!fs.existsSync(sourcePath)) {
          continue;
        }

        const destPath = routeWithinBase(urlPath, baseUrl);
        const fullDestPath = containedDestination(outDir, destPath);

        // Ensure destination directory exists
        const destDir = path.dirname(fullDestPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(sourcePath, fullDestPath);
        totalCopied++;
      }

      console.log(`[embed-markdown] Copied ${totalCopied} markdown files to build directory.\n`);
    },
  };
};
