# Feishu Card JSON v2 Progress Card Design

## Goal

Render documentation workflow progress with native Feishu Card JSON 2.0 components instead of legacy rich-text approximations.

## Design

- Use a semantic v2 header: blue while running, green on success, and red on failure, with branch and elapsed time in the subtitle.
- Render aggregate phases in a responsive `column_set` using `flex_mode: flow`.
- Render multi-manual progress as one root-level native `table` with option-tag status cells. Single-manual cards omit the table.
- Render each report as a `collapsible_panel` containing a v2 `markdown` element so report Markdown tables remain native rich content.
- Collapse healthy reports by default. Expand reports whose headings or positive summary metrics indicate warnings, failures, errors, broken links, or broken references.
- Finish with a native divider and a compact Markdown footer containing start time, elapsed time, target branch, and workflow link.
- Keep committed report links intact; reports are not uploaded to Feishu Drive.

## Constraints

- Native tables remain root-level body elements and are never nested inside columns or collapsible panels.
- The final aggregate update uses the same structured manual state as live updates so the table is not lost at workflow completion.
- Legacy compact-row Markdown conversion is retired.
