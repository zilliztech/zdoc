const fs = require('node:fs');
const path = require('node:path');

function resolveSourceFolder(siteDir, folder) {
  return path.isAbsolute(folder) ? folder : path.resolve(siteDir, folder);
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

      // Keep repository paths on the server; clients need only stable source IDs and routes.
      setGlobalData({
        cursorMcpCommand,
        enableSourceView,
        sources: sources.map(({ id, route }) => ({ id, route })),
      });
    },

    configureWebpack(_config, isServer) {
      // Add dev server middleware to serve .md files from source directories
      if (!isServer) {
        return {
          devServer: {
            setupMiddlewares: (middlewares, devServer) => {
              const { siteDir = process.cwd() } = context;
              const pathMap = {};

              // Build path map for dev server
              for (const source of sources) {
                const { folder, route } = source;
                const srcPath = resolveSourceFolder(siteDir, folder);

                if (!fs.existsSync(srcPath)) {
                  continue;
                }

                const readFiles = (dir, relativePath = '') => {
                  const entries = fs.readdirSync(dir, { withFileTypes: true });
                  for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relPath = path.join(relativePath, entry.name);

                    if (entry.isDirectory()) {
                      readFiles(fullPath, relPath);
                    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
                      // Try to get slug from frontmatter first
                      const slug = getSlugFromMarkdown(fullPath);
                      let fullUrlPath;

                      if (slug) {
                        // Use the slug from frontmatter
                        fullUrlPath = `${route}/${slug.replace(/^\//, '')}.md`;
                      } else {
                        // Fall back to file-based path
                        const relativeToFile = path.relative(srcPath, fullPath);
                        const urlPath = relativeToFile.replace(/\.mdx?$/, '');
                        fullUrlPath = `${route}/${urlPath}.md`;
                      }

                      // Normalize URL path (remove double slashes)
                      fullUrlPath = fullUrlPath.replace(/\/+/g, '/');

                      if (fullUrlPath) {
                        pathMap[fullUrlPath] = fullPath;
                      }
                    }
                  }
                };
                readFiles(srcPath);
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

    async postBuild({ outDir, routesPaths, siteConfig }) {

      const baseUrl = siteConfig.baseUrl || '/';
      const siteDir = context.siteDir || process.cwd();
      let totalCopied = 0;

      // Build slug-based lookup: slug -> filesystem path
      const slugToFileMap = {};

      for (const source of sources) {
        const { folder, route } = source;
        const srcPath = resolveSourceFolder(siteDir, folder);

        if (!fs.existsSync(srcPath)) {
          continue;
        }

        const readFiles = (dir, relativePath = '') => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.join(relativePath, entry.name);

            if (entry.isDirectory()) {
              readFiles(fullPath, relPath);
            } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
              const slug = getSlugFromMarkdown(fullPath);

              if (slug) {
                // Use the slug from frontmatter
                // Map: slug -> file
                slugToFileMap[slug] = fullPath;

                // Also map with route prefix for lookup
                const routeSlug = `${route}/${slug.replace(/^\//, '')}`.replace(/\/+/g, '/');
                slugToFileMap[routeSlug] = fullPath;
              } else {
                // Fall back to file-based path
                const relativeToFile = path.relative(srcPath, fullPath);
                const urlPath = relativeToFile.replace(/\.mdx?$/, '');
                const fullUrlPath = `${route}/${urlPath}`.replace(/\/+/g, '/');

                slugToFileMap[fullUrlPath] = fullPath;
              }
            }
          }
        };
        readFiles(srcPath);
      }

      // Build a reverse map from filesystem paths to URL paths
      const sourceToUrlMap = [];
      const defaultLocale = siteConfig.i18n?.defaultLocale;
      const localizedLocales = (siteConfig.i18n?.locales || [])
        .filter(locale => locale !== defaultLocale);

      for (const routePath of routesPaths) {
        // Remove trailing slash
        const cleanPath = routePath.replace(/\/$/, '');
        const sourceRoutePath = localizedLocales.reduce((candidate, locale) => (
          candidate.startsWith(`/${locale}/`) ? candidate.slice(locale.length + 1) : candidate
        ), cleanPath);

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

        // Remove baseUrl prefix if present
        let destPath = urlPath;
        if (baseUrl !== '/' && destPath.startsWith(baseUrl)) {
          destPath = destPath.substring(baseUrl.length);
        }

        const fullDestPath = path.join(outDir, destPath);

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
