import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const allowedFiles = new Set([
  'apps/docs/docusaurus.config.ts',
  'packages/site-config/src/resolve.ts',
]);

const sourceExtension = /\.(?:js|ts|tsx)$/u;
function accessedName(node) {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (ts.isElementAccessExpression(node) && node.argumentExpression) {
    const argument = node.argumentExpression;
    if (ts.isStringLiteralLike(argument)) return argument.text;
  }
  return undefined;
}

function namedBindingProperty(element) {
  const property = element.propertyName ?? element.name;
  if (ts.isIdentifier(property) || ts.isStringLiteralLike(property)) return property.text;
  return undefined;
}

function isProcess(node) {
  return ts.isIdentifier(node) && node.text === 'process';
}

function isProcessEnv(node) {
  return (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))
    && isProcess(node.expression)
    && accessedName(node) === 'env';
}

function bindingPatternContains(pattern, propertyName) {
  return pattern.elements.some(element => namedBindingProperty(element) === propertyName);
}

function destructuresProfileSite(declaration) {
  if (!declaration.initializer || !ts.isObjectBindingPattern(declaration.name)) return false;
  if (isProcessEnv(declaration.initializer)) {
    return bindingPatternContains(declaration.name, 'ZDOC_SITE');
  }
  if (!isProcess(declaration.initializer)) return false;
  return declaration.name.elements.some(element =>
    namedBindingProperty(element) === 'env'
      && ts.isObjectBindingPattern(element.name)
      && bindingPatternContains(element.name, 'ZDOC_SITE'),
  );
}

function sourceReadsProfileSite(file, source) {
  const scriptKind = file.endsWith('.tsx') ? ts.ScriptKind.TSX
    : file.endsWith('.ts') ? ts.ScriptKind.TS
      : ts.ScriptKind.JS;
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind);
  let violation = false;
  function visit(node) {
    if (violation) return;
    if (
      (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))
      && accessedName(node) === 'ZDOC_SITE'
      && isProcessEnv(node.expression)
    ) {
      violation = true;
      return;
    }
    if (ts.isVariableDeclaration(node) && destructuresProfileSite(node)) {
      violation = true;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return violation;
}

export function findProfileEnvViolations(repositoryRoot) {
  const tracked = execFileSync('git', ['ls-files', '-z'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  }).split('\0').filter(Boolean);

  return tracked
    .filter(file => sourceExtension.test(file) && !allowedFiles.has(file))
    .filter(file => sourceReadsProfileSite(file, fs.readFileSync(path.join(repositoryRoot, file), 'utf8')))
    .sort();
}

export function checkProfileEnv(repositoryRoot = process.cwd()) {
  const violations = findProfileEnvViolations(repositoryRoot);
  if (violations.length > 0) {
    throw new Error(
      `ZDOC_SITE may only be read by the site-profile bootstrap:\n${violations.map(file => `- ${file}`).join('\n')}`,
    );
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    checkProfileEnv();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
