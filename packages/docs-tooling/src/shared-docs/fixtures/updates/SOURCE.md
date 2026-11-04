# Impact-analysis fixture provenance

`scenarios.json` is explicitly synthetic. Its opt-in history appends a real file
deletion, a filesystem rename (old path absent, new path present), and an explicit
write to the existing deterministic Milvus fixture. It contains no retained
production source and establishes no golden output or lifecycle evidence.

The legacy base, paragraph and image commits are unchanged, including their
commit IDs. `buildMilvusDocs(baseFixture, history)` returns those IDs and the
appended synthetic commit. Omitting `history` preserves the original history.

The update tests also mutate the existing synthetic build-pipeline fixture in
isolated local repositories. Paragraph, code-group, dependency, channel-rule and
anchor changes are labeled synthetic in their commit messages. Their master/dev
and source SHAs and input digests are fixed in each collected report. Real-source
and retained-publication evidence belongs in the task's separately retained
`.claude/` evidence root, not in this synthetic fixture.
