import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const ignoredFiles = new Set([
  'apps/docs/docusaurus.config.ts',
  'packages/site-config/src/resolve.ts',
  'scripts/build/run-with-publication-read-fence.mjs',
  'scripts/migration/check-profile-env.mjs',
  // Publication-unit environment contract: `ZDOC_SITE` is a structured data key
  // injected per unit (not an ambient process.env read), defined and consumed here.
  'scripts/docs-workflow/checkpoint-publication.js',
  'scripts/docs-workflow/fetch-publication-adapter.js',
  'scripts/docs-workflow/fetch-publication-selection.js',
  'scripts/docs-workflow/translation-publication-selection.js',
]);

const sourceExtension = /\.(?:cjs|js|jsx|mjs|ts|tsx)$/u;
const testFile = /\.test\.(?:cjs|js|jsx|mjs|ts|tsx)$/u;

function unwrapExpression(node) {
  let current = node;
  while (
    ts.isParenthesizedExpression(current)
    || ts.isAsExpression(current)
    || ts.isTypeAssertionExpression(current)
    || ts.isNonNullExpression(current)
  ) current = current.expression;
  return current;
}

function evaluateStaticString(node) {
  const current = unwrapExpression(node);
  if (ts.isStringLiteralLike(current)) return current.text;
  if (
    ts.isBinaryExpression(current)
    && current.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = evaluateStaticString(current.left);
    const right = evaluateStaticString(current.right);
    return left === undefined || right === undefined ? undefined : left + right;
  }
  if (ts.isTemplateExpression(current)) {
    let value = current.head.text;
    for (const span of current.templateSpans) {
      const expression = evaluateStaticString(span.expression);
      if (expression === undefined) return undefined;
      value += expression + span.literal.text;
    }
    return value;
  }
  return undefined;
}

function isTypeOnlyNode(node) {
  return ts.isTypeNode(node)
    || ts.isInterfaceDeclaration(node)
    || ts.isTypeAliasDeclaration(node)
    || ts.isTypeParameterDeclaration(node)
    || (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly)
    || (ts.isImportSpecifier(node) && node.isTypeOnly)
    || (ts.isExportDeclaration(node) && node.isTypeOnly)
    || (ts.isExportSpecifier(node) && node.isTypeOnly);
}

function isNamedPropertyNode(node) {
  return ts.isBindingElement(node)
    || ts.isPropertyAssignment(node)
    || ts.isPropertyDeclaration(node)
    || ts.isMethodDeclaration(node)
    || ts.isGetAccessorDeclaration(node)
    || ts.isSetAccessorDeclaration(node)
    || ts.isEnumMember(node);
}

function isForbiddenPropertyName(node) {
  const parent = node.parent;
  if (!parent || !isNamedPropertyNode(parent)) return false;
  const name = parent.propertyName ?? parent.name;
  if (name !== node) return false;
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) return node.text === 'ZDOC_SITE';
  return ts.isComputedPropertyName(node) && evaluateStaticString(node.expression) === 'ZDOC_SITE';
}

export function sourceReadsProfileSite(file, source) {
  const scriptKind = file.endsWith('.tsx') || file.endsWith('.jsx') ? ts.ScriptKind.TSX
    : file.endsWith('.ts') ? ts.ScriptKind.TS
      : ts.ScriptKind.JS;
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind);
  let violation = false;

  function visit(node) {
    if (violation || isTypeOnlyNode(node)) return;
    if (ts.isIdentifier(node) && node.text === 'ZDOC_SITE') {
      violation = true;
      return;
    }
    if (ts.isStringLiteralLike(node) && node.text === 'ZDOC_SITE') {
      violation = true;
      return;
    }
    if (isForbiddenPropertyName(node)) {
      violation = true;
      return;
    }
    if (
      ts.isElementAccessExpression(node)
      && node.argumentExpression
      && evaluateStaticString(node.argumentExpression) === 'ZDOC_SITE'
    ) {
      violation = true;
      return;
    }
    if (
      ts.isComputedPropertyName(node)
      && evaluateStaticString(node.expression) === 'ZDOC_SITE'
    ) {
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
    .filter(file => sourceExtension.test(file) && !testFile.test(file) && !ignoredFiles.has(file))
    .filter(file => sourceReadsProfileSite(file, fs.readFileSync(path.join(repositoryRoot, file), 'utf8')))
    .sort();
}

export function checkProfileEnv(repositoryRoot = process.cwd()) {
  const violations = findProfileEnvViolations(repositoryRoot);
  if (violations.length > 0) {
    throw new Error(
      `ZDOC_SITE may only be used by controlled site-profile boundaries:\n${violations.map(file => `- ${file}`).join('\n')}`,
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
