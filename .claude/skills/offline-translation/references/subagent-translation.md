# Subagent Translation Production

Read this reference only when documents still need translation. Subagents are parallel producers of untrusted document bytes; the primary agent owns selection, integration, validation, cache generation, reconciliation, and publication.

## Preflight and selection

1. Refresh the relevant source and target baseline. Resolve each source file to its canonical target with the current repository mapping; do not infer paths from an older checkpoint.
2. Record for every assignment: repository, immutable source SHA, source path, source SHA-256, target locale, canonical target path, and whether an existing translation is available as terminology/style context.
3. Partition by complete document. Assign each target path to exactly one worker. Keep batches small enough to review and retry independently; do not split a single MDX document across workers.
4. Provide workers only the source documents, relevant existing translations/glossary/style rules, and a dedicated output directory or isolated worktree. Do not give them credentials or production refs.
5. Bind the assignment set to one source checkpoint. If Fetch changes any assigned source path, source hash, or canonical mapping before integration, invalidate that assignment's receipt and translate or review it again against the new checkpoint.

## Worker invocation

Use `spawn_agent` only when delegation is available and the user or active instructions authorize subagents. Use the smallest number of workers that gives useful parallelism. The task must be self-contained and name explicit writable paths. A suitable task message is:

```text
Translate only the documents listed below from English to <locale>.

Immutable source identity: <source SHA>
Writable output root: <absolute isolated path>
Assignments:
- <source path> -> <target path>, source sha256=<hash>

Preserve MDX structure, front matter, imports, JSX, code, commands, identifiers, URLs, anchors, image paths, placeholders, and product/API names unless the provided glossary says otherwise. Translate reader-facing prose naturally and consistently with the supplied locale examples. Do not edit source files, caches, manifests, sidebars, inventories, policies, workflows, or Git refs. Do not run publication or contact external systems.

For each document, write the target file and a JSON receipt containing sourceSha, sourcePath, sourceSha256, targetPath, outputSha256, status, and notes. If syntax or meaning is ambiguous, leave the source passage intact, set status=needs_review, and explain it. Return changed paths and receipt paths.
```

If workers share a filesystem, give each a disjoint output root. Never ask several workers to edit the same cache or integration branch. The primary agent may send follow-ups for a failed or incomplete assignment, but must not silently accept partial output.

## Worker acceptance

For every receipt, independently verify:

- immutable source identity and source SHA-256;
- output is a regular non-symlink file at the assigned canonical target path;
- no path traversal, extra file, deletion, or unassigned edit occurred;
- MDX/front matter/imports/JSX/code blocks/links/placeholders remain structurally valid;
- terminology and cross-document links are consistent;
- output SHA-256 matches the receipt and `needs_review` items are resolved explicitly.

Reject or reassign failures. Copy accepted targets into a fresh integration worktree based on the current publication baseline. Do not copy worker receipts into production content. Update cache through repository tooling or trusted deterministic assembly, never by merging independently edited worker caches.

The primary agent must write an integration inventory outside production content with exactly one accepted receipt per assigned source and target, plus rejected/missing counts. Do not proceed when assignments overlap, a receipt is missing, or any `needs_review` item remains unresolved.

## Handoff to the trusted flow

The translation phase ends with an inventory of accepted source-to-target pairs and hashes. Continue with [trusted-publication.md](trusted-publication.md): authenticate current baselines, assemble the candidate, compute cache/reconciliation state, run local validation and retained-artifact replay, then exercise `publish=false` before any production publication.
