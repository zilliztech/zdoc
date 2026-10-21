# Shared docs agent rules

These rules apply together with the repository root AGENTS.md and reflect
section 5 of the implementation guide.

- Change only the paths allowed by the task card. Describe any additional scope
  in the PR and wait for reviewer approval before changing other paths.
- Do not read or write files, access the network or Git, or reference `lark/`
  from `core/`. Route external dependencies through `adapters/`.
- Do not hand-edit `spec/requirements.json`; copy it from the design repository.
- Do not change golden outputs unless the task card requires it. Explain each
  changed golden file in the PR description.
- Do not change product requirements or technical designs. Report problems,
  contradictions, or missing details in the PR for the project owner to decide.
- Use a separate worktree under `.claude/worktrees/` as required by the root
  AGENTS.md. Preserve uncommitted files in the main checkout, target `master`
  with PRs, and do not modify `dev`.
- Complete L1 validation before requesting review. Include commands and results
  in the PR description, explicitly identifying skipped or incomplete checks.
- Write all upstream-facing content in English: code, comments, test names,
  commit messages, AGENTS.md, PR titles, and descriptions. Use conventional
  commit PR titles, such as `feat(shared-docs): add test and layout skeleton`.
  PR comments and review discussion are in English as well. Do not link fork
  comments from PR descriptions; state decisions directly or link the design
  repository. Code must depend only on requirement IDs and `area_id`, never on
  the catalog's descriptive text.
