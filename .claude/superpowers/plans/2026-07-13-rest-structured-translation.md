# Structured REST Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe Japanese localization for embedded REST specifications while leaving all non-locale schema data unchanged.

**Architecture:** Parse endpoint documents into Markdown shell, specification JSON, and immutable endpoint suffix. Translate approved prose fields as structured entries and merge them into `x-i18n.ja-JP` before reassembly.

**Tech Stack:** Node.js, JSON, MDX, existing translation agents, `node:test`.

---

### Task 1: Structural specification localization

**Files:**
- Create: `scripts/translation/restSpecLocalization.js`
- Create: `scripts/translation/restSpecLocalization.test.js`
- Create: `.github/prompts/codex-rest-spec-translation-agent.md`

- [x] Extract only supported prose fields and exclude examples, defaults, enums, values, and existing locales.
- [x] Validate exact response IDs and protected tokens.
- [x] Merge translations under `x-i18n.ja-JP` and prove locale removal reproduces the source specification.
- [x] Assemble the translated shell with `lang="ja-JP"` and the immutable endpoint suffix.

### Task 2: Translation-runner integration

**Files:**
- Modify: `scripts/translation/agentRunner.js`
- Modify: `scripts/translation/agentRunner.test.js`

- [x] Detect REST endpoint source paths containing embedded specs.
- [x] Translate and review the Markdown shell through the existing pipeline.
- [x] Invoke the structured specification translator and write one validated target document.
- [x] Report the number of localized specification entries in the file result.

### Task 3: Verification

- [ ] Run REST localization and translation-runner tests.
- [ ] Run the complete translation and workflow-focused suites.
- [ ] Validate workflow policy and review the final diff before committing.
