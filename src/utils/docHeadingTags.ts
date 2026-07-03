const DOC_HEADING_TAGS = [
  'PRIVATE',
  'NEAR DEPRECATE',
  'CONTACT SALES',
  'PUBLIC',
  'BYOC',
  'DEPRECATED',
];

const DOC_HEADING_TAG_PATTERN = new RegExp(
  `\\s*\\|\\s*(?:${DOC_HEADING_TAGS.map(tag => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s*$`,
);

export function stripDocHeadingTag(value: string): string {
  return value.replace(DOC_HEADING_TAG_PATTERN, '').trimEnd();
}
