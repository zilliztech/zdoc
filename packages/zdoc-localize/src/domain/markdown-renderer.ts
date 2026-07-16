import type {SemanticDocument, SemanticNode} from './model.js';

function unsupported(node: SemanticNode): string {
  const block = node.remote.blockId ? ` block=${node.remote.blockId}` : '';
  const token = node.remote.token ? ` token=${node.remote.token}` : '';
  return `<!-- unsupported:${node.kind}${block}${token} -->`;
}

function renderNode(node: SemanticNode): string {
  if (!node.writable && node.kind !== 'code') return unsupported(node);
  if (node.kind === 'heading') {
    return `${'#'.repeat(Math.max(1, node.headingPath.length))} ${node.text}`;
  }
  if (node.kind === 'list') {
    return node.text;
  }
  if (node.kind === 'quote') return `> ${node.text}`;
  if (node.kind === 'callout') return `> [!NOTE]\n> ${node.text.replaceAll('\n', '\n> ')}`;
  if (node.kind === 'code') {
    const language = node.remote.attributes.lang ?? '';
    return `\`\`\`${language}\n${node.text}\n\`\`\``;
  }
  return node.text;
}

export function renderDiagnosticMarkdown(document: SemanticDocument): string {
  const body = document.nodes.filter((node) => node.kind !== 'title').map(renderNode).join('\n\n');
  return `# ${document.title}\n\n${body}\n`;
}
