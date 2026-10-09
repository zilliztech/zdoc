import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const validator = require('./validate.cjs');

export const {
  applyMdxPatches,
  validateMdxStructure,
  normalizeNestedPlaintextFences,
  createFenceTracker,
  getFencedCodeRanges,
  createFencedCodeBlock,
  selectCodeFence,
  removeTabsHallucinations,
  unescapeKnownJsxTags,
  normalizeCodeTagContent,
  convertHtmlCommentsToMdx,
  findUnnormalizedCodeTags,
  findMalformedProceduresBlocks,
  findUnmatchedOpeningBraces,
  escapeHtmlElementBraces,
  escapePlainTextBraces,
  escapeNonHtmlTags,
  escapeCppNamespaceTypes,
} = validator;
