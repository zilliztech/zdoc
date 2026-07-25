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

function repairLine(line: string): string {
  if (INDENTED_CODE.test(line) || line.includes('`') || /[<>{}\[\]()]/u.test(line)) return line;
  return line.replace(SIMPLE_BOLD_WITH_TRAILING_PUNCTUATION, '**$1**$2');
}

export function repairChineseBoldPunctuation(contents: string): string {
  let fence: Fence | undefined;
  let htmlBlockTag: string | undefined;
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
