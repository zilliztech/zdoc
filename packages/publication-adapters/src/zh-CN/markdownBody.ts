export function transformMarkdownBody(contents: string, transform: (body: string) => string): string {
  const start = contents.startsWith('\uFEFF') ? 1 : 0;
  let cursor: number;
  if (contents.startsWith('---\r\n', start)) cursor = start + 5;
  else if (contents.startsWith('---\n', start)) cursor = start + 4;
  else return transform(contents);

  while (cursor <= contents.length) {
    const newline = contents.indexOf('\n', cursor);
    const lineEnd = newline === -1 ? contents.length : newline;
    const rawLine = contents.slice(cursor, lineEnd);
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
    if (line === '---') {
      const bodyStart = newline === -1 ? contents.length : newline + 1;
      return contents.slice(0, bodyStart) + transform(contents.slice(bodyStart));
    }
    if (newline === -1) return contents;
    cursor = newline + 1;
  }
  return contents;
}
