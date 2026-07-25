const SIMPLE_BOLD_WITH_TRAILING_PUNCTUATION = /(?<!\\)\*\*([^*\\`_<>{}\[\]()~\r\n]+?)([：，；！？。])\*\*(?=[\p{L}\p{N}])/gu;
const MARKDOWN_CONTAINER_PREFIX = String.raw`(?: {0,3}> ?)*(?:(?: {0,3})(?:[-+*]|\d+[.)]) +)? {0,3}`;
const FENCE_RUN = String.raw`(\x60{3,}|~{3,})`;
const FENCE_START = new RegExp(`^${MARKDOWN_CONTAINER_PREFIX}${FENCE_RUN}`, 'u');
const FENCE_END = new RegExp(`^${MARKDOWN_CONTAINER_PREFIX}${FENCE_RUN}[ \\t]*$`, 'u');
const INDENTED_CODE = /^(?: {4}|\t)/u;

interface Fence {
  marker: '`' | '~';
  length: number;
}

function fenceAt(line: string): Fence | undefined {
  const match = line.match(FENCE_START);
  if (!match) return undefined;
  return {marker: match[1][0] as Fence['marker'], length: match[1].length};
}

function closesFence(line: string, fence: Fence): boolean {
  const match = line.match(FENCE_END);
  return Boolean(match && match[1][0] === fence.marker && match[1].length >= fence.length);
}

function htmlBlockTagAt(line: string): string | undefined {
  const match = line.match(/^\s*<([A-Za-z][\w.-]*)(?:\s[^>]*)?>\s*$/u);
  if (!match || /\/>\s*$/u.test(line)) return undefined;
  return match[1];
}

function braceDelta(line: string): number {
  let delta = 0;
  for (const character of line) {
    if (character === '{') delta += 1;
    else if (character === '}') delta -= 1;
  }
  return delta;
}

function isEscaped(line: string, index: number): boolean {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && line[cursor] === '\\'; cursor -= 1) backslashes += 1;
  return backslashes % 2 === 1;
}

function backtickRunLength(line: string, index: number): number {
  let end = index;
  while (line[end] === '`') end += 1;
  return end - index;
}

function findHtmlCommentOpening(line: string, start = 0): number {
  let codeSpanTicks = 0;
  let inTag = false;
  let tagQuote: '"' | "'" | undefined;
  let braceDepth = 0;
  let braceQuote: '"' | "'" | '`' | undefined;

  for (let index = start; index < line.length;) {
    const character = line[index];

    if (codeSpanTicks > 0) {
      if (character === '`' && !isEscaped(line, index)) {
        const ticks = backtickRunLength(line, index);
        if (ticks === codeSpanTicks) codeSpanTicks = 0;
        index += ticks;
      } else index += 1;
      continue;
    }

    if (inTag) {
      if (tagQuote) {
        if (character === tagQuote && !isEscaped(line, index)) tagQuote = undefined;
      } else if (character === '"' || character === "'") tagQuote = character;
      else if (character === '>') inTag = false;
      index += 1;
      continue;
    }

    if (braceDepth > 0) {
      if (braceQuote) {
        if (character === braceQuote && !isEscaped(line, index)) braceQuote = undefined;
      } else if (character === '"' || character === "'" || character === '`') braceQuote = character;
      else if (character === '{') braceDepth += 1;
      else if (character === '}') braceDepth -= 1;
      index += 1;
      continue;
    }

    if (line.startsWith('<!--', index)) return index;
    if (character === '`' && !isEscaped(line, index)) {
      codeSpanTicks = backtickRunLength(line, index);
      index += codeSpanTicks;
    } else if (character === '<') {
      inTag = true;
      index += 1;
    } else if (character === '{') {
      braceDepth = 1;
      index += 1;
    } else index += 1;
  }

  return -1;
}

function htmlCommentOpenAfterLine(line: string, initiallyOpen: boolean): boolean {
  let cursor = 0;
  if (initiallyOpen) {
    const closing = line.indexOf('-->');
    if (closing === -1) return true;
    cursor = closing + 3;
  }

  while (cursor < line.length) {
    const opening = findHtmlCommentOpening(line, cursor);
    if (opening === -1) return false;
    const closing = line.indexOf('-->', opening + 4);
    if (closing === -1) return true;
    cursor = closing + 3;
  }

  return false;
}

function repairLine(line: string): string {
  if (INDENTED_CODE.test(line) || line.includes('`') || /[<>{}\[\]()]/u.test(line)) return line;
  return line.replace(SIMPLE_BOLD_WITH_TRAILING_PUNCTUATION, '**$1**$2');
}

export function repairChineseBoldPunctuation(contents: string): string {
  let fence: Fence | undefined;
  let htmlBlockTag: string | undefined;
  let htmlCommentOpen = false;
  let mdxBraceDepth = 0;
  const parts = contents.split(/(\r\n|\n|\r)/u);

  for (let index = 0; index < parts.length; index += 2) {
    const line = parts[index];
    if (fence) {
      if (closesFence(line, fence)) fence = undefined;
      continue;
    }

    if (htmlBlockTag) {
      if (line.includes(`</${htmlBlockTag}>`)) htmlBlockTag = undefined;
      continue;
    }

    if (mdxBraceDepth > 0) {
      mdxBraceDepth = Math.max(0, mdxBraceDepth + braceDelta(line));
      continue;
    }

    if (htmlCommentOpen || findHtmlCommentOpening(line) !== -1) {
      htmlCommentOpen = htmlCommentOpenAfterLine(line, htmlCommentOpen);
      continue;
    }

    const openingFence = fenceAt(line);
    if (openingFence) {
      fence = openingFence;
      continue;
    }

    const openingHtmlBlockTag = htmlBlockTagAt(line);
    if (openingHtmlBlockTag) {
      htmlBlockTag = openingHtmlBlockTag;
      continue;
    }

    const openingBraceDepth = braceDelta(line);
    if (openingBraceDepth > 0) {
      mdxBraceDepth = openingBraceDepth;
      continue;
    }

    parts[index] = repairLine(line);
  }

  return parts.join('');
}
