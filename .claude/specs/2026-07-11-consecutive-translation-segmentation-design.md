# Consecutive Translation Segmentation Design

## Goal

Translate long MDX documents reliably without sending the complete document through every model request, while preserving source order, Markdown structure, and MDX component boundaries.

## Scope

This design changes the local and GitHub Actions translation runner. It does not change manifest generation, locale mappings, cache semantics, Lark reporting, or the generated translation directory layout.

## Chosen Approach

Use a position-aware linear scanner that divides a source document into exact, consecutive substrings. The scanner does not extract protected placeholders and does not serialize an AST. Reassembly is the concatenation of translated chunks in their original order.

Documents at or below the target size continue through the existing single-document path. Larger documents are divided using the following priorities:

1. Split at top-level heading boundaries.
2. Combine adjacent sections until the target size is reached.
3. If one section exceeds the maximum size, split it at safe, complete block boundaries.
4. If a single structural block exceeds the maximum size, keep it intact and allow that chunk to exceed the limit.

Default limits:

- Target chunk size: 24,000 characters.
- Maximum chunk size: 32,000 characters.

Both limits are configurable with `TRANSLATION_CHUNK_TARGET_CHARS` and `TRANSLATION_CHUNK_MAX_CHARS`.

## Structural Boundaries

The scanner processes the document from beginning to end and records safe boundaries only when it is outside protected structures. It must not split inside:

- YAML frontmatter.
- Backtick or tilde fenced code blocks.
- Markdown tables.
- Contiguous list blocks, including indented continuation lines.
- Blockquotes and admonitions.
- MDX ESM imports or exports.
- JSX/MDX component elements, including nested `Tabs`, `TabItem`, and custom components.

Blank-line-separated paragraphs are safe fallback boundaries when none of the protected structures are open. Heading lines are preferred boundaries. Frontmatter remains attached to the first content section.

Every source character belongs to exactly one chunk. Before translation, the chunker verifies that `chunks.map(chunk => chunk.source).join('')` equals the original source.

## Translation Data Flow

For a short document, the runner preserves the current behavior: translate the complete document, review it, correct it when needed, and validate the result.

For a segmented document:

1. Build consecutive chunks from the English source.
2. Translate chunks sequentially.
3. Review and correct each translated chunk before continuing.
4. Supply continuity metadata with each request:
   - Source path.
   - Locale.
   - One-based chunk index and total chunk count.
   - Document title when available.
   - Most recent translated heading from the preceding chunk when available.
5. Store each accepted translated chunk in memory.
6. Join translated chunks in order without inserting separators.
7. Run YAML, MDX compilation, and existing structural validation against the assembled document.
8. Write the target file and update the translation cache only when every chunk and the final document pass.

The complete assembled long document is not sent to the review model because doing so would recreate the context-window problem. Whole-document verification remains deterministic.

## Prompt Behavior

Chunk prompts explicitly state that the input is a consecutive section of a larger MDX document. The model must:

- Return only the translated chunk.
- Preserve the chunk's exact leading and trailing structural boundaries.
- Avoid adding document-level frontmatter, headings, imports, closing tags, or explanatory text not present in the chunk.
- Preserve incomplete document-level context when a chunk begins or ends adjacent to another section.

Review and correction prompts receive the source chunk and translated chunk, plus the same continuity metadata.

## Failure Handling

A failure in any chunk fails the complete file. The runner records:

- Chunk index and total chunks.
- Source character range.
- Translation, review, correction, timeout, or validation error.

No partial target file is written and no cache entry is added for a partially translated document. Other manifest files continue when `TRANSLATION_ALLOW_PARTIAL=true`.

Provider and file timeouts retain their existing behavior. The file timeout covers all chunks belonging to the file.

## Components

### `scripts/translation/chunker.js`

Owns structural scanning and chunk packing. Its public interface returns ordered chunks with source text, character offsets, and basic context such as the first heading.

### `scripts/translation/agentRunner.js`

Chooses the single-document or segmented path, translates chunks sequentially, assembles results, performs final validation, and records chunk-aware failures.

### Translation prompts

The existing prompt builders gain chunk metadata. The system prompts remain focused on translation quality and structural preservation.

## Testing

Unit tests cover:

- Short documents remain one chunk.
- Heading-first splitting and adjacent-section packing.
- Oversized-section fallback splitting.
- Frontmatter remains intact.
- Fenced code using backticks and tildes remains intact.
- Tables, lists, blockquotes, admonitions, imports, and nested JSX components are not split.
- Indivisible oversized blocks are retained.
- Source chunks concatenate byte-for-byte to the original source.
- Chunk translation requests are sequential and contain continuity metadata.
- Any failed chunk prevents file output and cache success.
- Successful chunks assemble in order and pass whole-document validation.
- Existing short-document behavior and provider retry tests remain green.

Integration verification runs the translation test suite and MDX validation against representative assembled fixtures.

## Success Criteria

- Long documents no longer require a single full-document model request.
- No chunk boundary occurs inside a protected Markdown or MDX structure.
- Source slicing is lossless and consecutive.
- Translated chunks are processed and assembled in deterministic order.
- A file is written and cached only after complete assembled-document validation.
- Existing incremental translation behavior remains unchanged.
