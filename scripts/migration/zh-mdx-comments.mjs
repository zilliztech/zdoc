export function normalizeZhMdxComments(input) {
  const lines = input.split(/(\r?\n)/); let frontmatter = input.startsWith('---\n') || input.startsWith('---\r\n'); let fenced = false;
  for (let index = 0; index < lines.length; index += 2) {
    const line = lines[index];
    if (frontmatter) { if (index > 0 && line === '---') frontmatter = false; continue; }
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced || line.includes('`') || /<[^>]+<!--/.test(line)) continue;
    lines[index] = line.replace(/<!--([\s\S]*?)-->/g, (_all, body) => `{/*${body}*/}`);
  }
  return lines.join('');
}
