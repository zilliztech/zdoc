# Structured REST Translation Design

## Goal

Translate Japanese REST reference pages without allowing a language model to rewrite endpoint schema, examples, defaults, or executable specification data.

## Design

REST endpoint MDX files are split at `export const specs =`. The Markdown/frontmatter shell is translated with the existing translation-review pipeline. The specification JSON is parsed structurally and only string values named `summary`, `description`, `title`, `label`, `prompt`, or `content` are extracted. Subtrees named `example`, `examples`, `default`, `enum`, `enums`, or `value`, plus existing `x-i18n` data, are never submitted for translation.

The specialized model receives bounded JSON arrays of `{id,text}` entries and must return the same IDs. Translations are merged into the owning object's `x-i18n["ja-JP"]` object. The English base value remains unchanged. Inline code, HTML tags, placeholders, and URLs must be identical between source and translation. Removing only `ja-JP` from the localized specification must reproduce the original parsed specification exactly.

The translated page sets `RestSpecs` to `lang="ja-JP"`. Endpoint and method exports are copied byte-for-byte from the source suffix.

## Feishu Rate Limits

Run `29224995254` produced 188 Feishu frequency-limit responses across five parallel manual producers. 187 recovered after retry one and one reached retry two; no request exhausted the five-attempt policy. The server-provided one-second reset was honored. Parallel fetching remains enabled. A global producer concurrency cap is deferred until logs show attempt three or later, exhausted retries, or unacceptable wall-time growth.

## Verification

Tests cover field extraction, example exclusion, locale merging, source-spec equivalence, protected-token validation, document assembly, and integration with the translation runner.
