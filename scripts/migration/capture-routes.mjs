import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const compareText = (left, right) => Buffer.from(left).compare(Buffer.from(right));

function routeForHtml(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return `/${normalized.slice(0, -'/index.html'.length)}`;
  return `/${normalized.slice(0, -'.html'.length)}`;
}

function extractAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function htmlBehavior(html) {
  let canonical;
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = extractAttribute(match[0], 'rel')?.toLowerCase().split(/\s+/) ?? [];
    if (rel.includes('canonical')) canonical = extractAttribute(match[0], 'href');
  }

  let redirectTo;
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (extractAttribute(match[0], 'http-equiv')?.toLowerCase() !== 'refresh') continue;
    const content = extractAttribute(match[0], 'content') ?? '';
    const target = content.match(/(?:^|;)\s*url\s*=\s*(.+?)\s*$/i)?.[1];
    if (target) redirectTo = target.replace(/^['"]|['"]$/g, '');
  }
  return {canonical, redirectTo};
}

function walkHtml(root, current = root, files = [], excludedPathPrefixes = []) {
  const relative = path.relative(root, current).split(path.sep).join('/');
  if (relative && excludedPathPrefixes.some(prefix => relative === prefix || relative.startsWith(`${prefix}/`))) return files;
  const stat = fs.lstatSync(current);
  if (stat.isSymbolicLink()) throw new Error(`Build tree contains symlink: ${path.relative(root, current)}`);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(current).sort(compareText)) {
      walkHtml(root, path.join(current, child), files, excludedPathPrefixes);
    }
  } else if (stat.isFile() && current.endsWith('.html')) {
    files.push(current);
  } else if (!stat.isFile()) {
    throw new Error(`Build tree contains unsupported entry: ${path.relative(root, current)}`);
  }
  return files;
}

export function captureRoutes({buildDirectory, site, excludePathPrefixes = []}) {
  if (site !== 'en' && site !== 'zh-CN') throw new Error(`Unsupported site: ${site}`);
  const exclusions = [...new Set(excludePathPrefixes)].sort(compareText);
  for (const prefix of exclusions) {
    if (typeof prefix !== 'string' || prefix === '' || path.isAbsolute(prefix) || prefix.split('/').includes('..') || prefix.includes('\\')) {
      throw new Error(`Excluded path prefix must be a safe relative path: ${prefix}`);
    }
  }
  const root = path.resolve(buildDirectory);
  const rootStat = fs.lstatSync(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error(`Build path must be a non-symlink directory: ${buildDirectory}`);

  const sources = new Map();
  const routes = walkHtml(root, root, [], exclusions).map(file => {
    const relative = path.relative(root, file).split(path.sep).join('/');
    const route = routeForHtml(relative);
    const existing = sources.get(route);
    if (existing) throw new Error(`Route collision for ${route}: ${existing} and ${relative}`);
    sources.set(route, relative);
    const {canonical, redirectTo} = htmlBehavior(fs.readFileSync(file, 'utf8'));
    return {
      route,
      kind: redirectTo ? 'redirect' : 'page',
      ...(redirectTo ? {redirectTo} : {}),
      ...(canonical ? {canonical} : {}),
    };
  }).sort((left, right) => compareText(left.route, right.route));
  return {schemaVersion: 1, site, routes, ...(exclusions.length > 0 ? {excludedPathPrefixes: exclusions} : {})};
}

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) throw new Error(`Invalid arguments: ${argv.join(' ')}`);
    values[key.slice(2)] = value;
  }
  if (!values.build || !values.output) throw new Error('Usage: capture-routes.mjs --build <directory> --output <file> [--site en|zh-CN]');
  return {
    buildDirectory: values.build,
    output: values.output,
    site: values.site ?? 'en',
    excludePathPrefixes: values.exclude ? values.exclude.split(',').filter(Boolean) : [],
  };
}

function writeCanonicalJson(output, value) {
  const target = path.resolve(output);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const {output, ...options} = parseArguments(process.argv.slice(2));
  const inventory = captureRoutes(options);
  writeCanonicalJson(output, inventory);
  process.stdout.write(`Captured ${inventory.routes.length} ${inventory.site} routes in ${output}\n`);
}
