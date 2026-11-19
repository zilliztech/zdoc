// Matches IGNORE_FILES in milvus-io/milvus.io src/utils/docs.ts at 43e66d8.
const ignored = new Set(['README.md', 'Variables.json', '.DS_Store', 'fragments', 'menuStructure', '.git', 'home', 'template', '_md2md_demo', 'release_notes', 'Tips.json'])
export const isMilvusIgnoredPathComponent = (name: string) => ignored.has(name)
export const isMilvusPagePath = (path: string, sourceRoot = 'site/en'): boolean => path.startsWith(`${sourceRoot}/`) && path.endsWith('.md')
  && !path.split('/').some(isMilvusIgnoredPathComponent)
