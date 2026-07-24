import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const allowedFiles = new Set([
  'apps/docs/docusaurus.config.ts',
  'packages/site-config/src/resolve.ts',
]);

const sourceExtension = /\.(?:cjs|js|jsx|mjs|ts|tsx)$/u;
const UNKNOWN = 'unknown';
const PROCESS = 'process';
const ENVIRONMENT = 'environment';
const GLOBAL_THIS = 'globalThis';

function stringState(value) {
  return `string:${value}`;
}

function isFunctionScope(node) {
  return ts.isFunctionDeclaration(node)
    || ts.isFunctionExpression(node)
    || ts.isArrowFunction(node)
    || ts.isMethodDeclaration(node)
    || ts.isConstructorDeclaration(node)
    || ts.isGetAccessorDeclaration(node)
    || ts.isSetAccessorDeclaration(node);
}

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

function expressionState(node, states) {
  const current = unwrapExpression(node);
  if (ts.isStringLiteralLike(current)) return stringState(current.text);
  if (ts.isIdentifier(current)) {
    if (states.has(current.text)) return states.get(current.text);
    if (current.text === 'process') return PROCESS;
    if (current.text === 'globalThis') return GLOBAL_THIS;
    return UNKNOWN;
  }
  if (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) {
    const owner = expressionState(current.expression, states);
    const property = accessedName(current, states);
    if (owner === GLOBAL_THIS && property === 'process') return PROCESS;
    if (owner === PROCESS && property === 'env') return ENVIRONMENT;
  }
  return UNKNOWN;
}

function accessedName(node, states) {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (ts.isElementAccessExpression(node) && node.argumentExpression) {
    const state = expressionState(node.argumentExpression, states);
    if (state.startsWith('string:')) return state.slice('string:'.length);
  }
  return undefined;
}

function bindingPropertyName(element, states) {
  const property = element.propertyName ?? element.name;
  if (ts.isIdentifier(property) || ts.isStringLiteralLike(property)) return property.text;
  if (ts.isComputedPropertyName(property)) {
    const state = expressionState(property.expression, states);
    if (state.startsWith('string:')) return state.slice('string:'.length);
  }
  return undefined;
}

function collectBindingNames(name, names) {
  if (ts.isIdentifier(name)) {
    names.add(name.text);
    return;
  }
  for (const element of name.elements) {
    if (!ts.isOmittedExpression(element)) collectBindingNames(element.name, names);
  }
}

function scopeChildren(node) {
  const children = [];
  ts.forEachChild(node, child => {
    children.push(child);
  });
  return children;
}

function isNestedScope(parent, child) {
  return isFunctionScope(child) || (ts.isBlock(child) && child !== parent);
}

function collectScopeDeclarations(scopeNode) {
  const declarations = [];
  const names = new Set();
  if (isFunctionScope(scopeNode)) {
    for (const parameter of scopeNode.parameters) collectBindingNames(parameter.name, names);
  }
  function visit(node) {
    if (node !== scopeNode && isNestedScope(scopeNode, node)) return;
    if (ts.isVariableDeclaration(node)) {
      declarations.push(node);
      collectBindingNames(node.name, names);
    }
    ts.forEachChild(node, visit);
  }
  visit(scopeNode);
  return {declarations, names};
}

function bindingReadsProfileSite(pattern, sourceState, states) {
  if (sourceState === ENVIRONMENT) {
    return pattern.elements.some(element => bindingPropertyName(element, states) === 'ZDOC_SITE');
  }
  if (sourceState !== PROCESS) return false;
  return pattern.elements.some(element =>
    bindingPropertyName(element, states) === 'env'
      && ts.isObjectBindingPattern(element.name)
      && bindingReadsProfileSite(element.name, ENVIRONMENT, states),
  );
}

function updateDeclarationState(declaration, states) {
  if (!declaration.initializer) return false;
  const sourceState = expressionState(declaration.initializer, states);
  if (ts.isIdentifier(declaration.name)) {
    if (sourceState === UNKNOWN || states.get(declaration.name.text) === sourceState) return false;
    states.set(declaration.name.text, sourceState);
    return true;
  }
  if (ts.isObjectBindingPattern(declaration.name) && sourceState === PROCESS) {
    let changed = false;
    for (const element of declaration.name.elements) {
      if (
        bindingPropertyName(element, states) === 'env'
        && ts.isIdentifier(element.name)
        && states.get(element.name.text) !== ENVIRONMENT
      ) {
        states.set(element.name.text, ENVIRONMENT);
        changed = true;
      }
    }
    return changed;
  }
  return false;
}

export function sourceReadsProfileSite(file, source) {
  const scriptKind = file.endsWith('.tsx') || file.endsWith('.jsx') ? ts.ScriptKind.TSX
    : file.endsWith('.ts') ? ts.ScriptKind.TS
      : ts.ScriptKind.JS;
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind);

  function analyzeScope(scopeNode, inheritedStates) {
    const states = new Map(inheritedStates);
    const {declarations, names} = collectScopeDeclarations(scopeNode);
    for (const name of names) states.set(name, UNKNOWN);
    let changed;
    let remainingPasses = declarations.length + 1;
    do {
      changed = false;
      for (const declaration of declarations) {
        if (updateDeclarationState(declaration, states)) changed = true;
      }
      remainingPasses -= 1;
      if (changed && remainingPasses === 0) {
        throw new Error(`Profile environment alias analysis did not converge in ${file}`);
      }
    } while (changed);

    let violation = false;
    function visit(node) {
      if (violation) return;
      if (node !== scopeNode && isNestedScope(scopeNode, node)) {
        violation = analyzeScope(node, states);
        return;
      }
      if (
        (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))
        && expressionState(node.expression, states) === ENVIRONMENT
        && accessedName(node, states) === 'ZDOC_SITE'
      ) {
        violation = true;
        return;
      }
      if (
        ts.isVariableDeclaration(node)
        && node.initializer
        && ts.isObjectBindingPattern(node.name)
        && bindingReadsProfileSite(node.name, expressionState(node.initializer, states), states)
      ) {
        violation = true;
        return;
      }
      for (const child of scopeChildren(node)) visit(child);
    }
    visit(scopeNode);
    return violation;
  }

  return analyzeScope(sourceFile, new Map());
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
