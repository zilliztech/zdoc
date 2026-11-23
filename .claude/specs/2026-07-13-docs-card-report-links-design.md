# Documentation Card Report Links Design

## Goal

Render concise report Markdown in the final Feishu card and link to complete report files in the exact published repository commit.

## Design

The aggregate job materializes report directories from `resolve_final.final_dev_sha`, runs the existing bounded report summarizer, and prepends the workflow terminal summary. Repository URLs use the immutable final SHA. Missing or stale reports are ignored, and report collection remains non-fatal.

No files are uploaded to Feishu. The repository remains the authoritative report store.
