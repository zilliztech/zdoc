# Documentation Card Report Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bounded report Markdown and immutable repository links to the final documentation card.

**Architecture:** Extend the existing report collector to merge base workflow notes, restore report files from the final target SHA in aggregate, and pass the merged JSON to `card-finish`.

**Tech Stack:** Node.js, GitHub Actions, Feishu `lark_md` cards.

---

- [ ] Add failing tests for merging base notes with collected reports.
- [ ] Implement merged note output.
- [ ] Materialize reports from the immutable final SHA during aggregation.
- [ ] Pass merged notes to the final card.
- [ ] Run focused and workflow-focused verification.
