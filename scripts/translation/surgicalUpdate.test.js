'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  assertChangeCoverage,
  buildSurgicalTaskPrompt,
  classifyIncrementalChange,
  runSurgicalUpdate,
  splitHeadingSections,
  unifiedSourceDiffPreview,
} = require('./surgicalUpdate');
const {stylePromptPathFor} = require('./agenticProvider');

const GE = 'content/en/guides';
const GJ = 'i18n/ja-JP/docusaurus-plugin-content-docs/current';

function write(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content);
}

async function withSite(run) {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'surgical-'));
  try {
    return await run(siteDir);
  } finally {
    fs.rmSync(siteDir, {recursive: true, force: true});
  }
}

const OLD_EN = `---\ntitle: Spark Jobs\nslug: /spark-jobs\n---\n\n# Spark Jobs\n\n## Overview\n\nThe scheduler starts jobs on the target cluster.\n\n## Limits\n\nEach project may run at most five concurrent jobs.\n`;
const NEW_EN = OLD_EN.replace('at most five concurrent jobs', 'at most ten concurrent jobs');
const REWRITTEN_EN = `---\ntitle: Spark Jobs\nslug: /spark-jobs\n---\n\n# Spark Jobs\n\n## Architecture\n\nCompletely different content about architecture.\n\n## Quotas\n\nDifferent quota content.\n`;
const OLD_JA = `---\ntitle: Spark ジョブ\nslug: /spark-jobs\n---\n\n# Spark ジョブ\n\n## 概要\n\nスケジューラはターゲットクラスターでジョブを開始します。\n\n## 制限\n\n各プロジェクトで同時に実行できるジョブは最大 5 個です。\n`;
const UPDATED_JA = OLD_JA.replace('最大 5 個です', '最大 10 個です');

const ITEM = {sourcePath: `${GE}/dev/spark-jobs.md`, targetPath: `${GJ}/dev/spark-jobs.md`, sourceHash: 'a'.repeat(64), locale: 'ja-JP', type: 'guides'};

test('classifyIncrementalChange routes unchanged, surgical, and full lanes deterministically', () => {
  assert.equal(classifyIncrementalChange({oldSource: OLD_EN, newSource: OLD_EN}).lane, 'unchanged')
  const surgical = classifyIncrementalChange({oldSource: OLD_EN, newSource: NEW_EN})
  assert.equal(surgical.lane, 'surgical')
  assert.equal(surgical.totalSections, 3)
  assert.equal(surgical.unchangedSections, 2)
  const full = classifyIncrementalChange({oldSource: OLD_EN, newSource: REWRITTEN_EN})
  assert.equal(full.lane, 'full')
  assert.equal(full.unchangedRatio, 0.3333)
});

test('splitHeadingSections ignores heading-like lines inside fences', () => {
  const sections = splitHeadingSections('# T\n\n## A\n\nBody.\n\n```text\n## Not A Heading\n```\n\n## B {#b}\n\nMore.\n')
  assert.deepEqual(sections.map(section => section.text), ['T', 'A', 'B'])
  assert.equal(sections[1].anchor, null)
  assert.equal(sections[2].anchor, 'b')
});

test('assertChangeCoverage flags a target that ignored the source change', () => {
  const missed = assertChangeCoverage({oldSource: OLD_EN, newSource: NEW_EN, oldTarget: OLD_JA, newTarget: OLD_JA})
  assert.equal(missed.length, 1)
  assert.match(missed[0], /possible missed update/)
  const covered = assertChangeCoverage({oldSource: OLD_EN, newSource: NEW_EN, oldTarget: OLD_JA, newTarget: UPDATED_JA})
  assert.deepEqual(covered, [])
});

test('assertChangeCoverage matches protected tokens instead of demanding arbitrary change', () => {
  // Link-only source change, target already current: zero obligation.
  const LINK_OLD_EN = '## Overview\n\nSee [roles](./project-users#invite) for details.\n'
  const LINK_NEW_EN = '## Overview\n\nSee [roles](./manage-platform-roles#manage-project-roles) for details.\n'
  const CURRENT_JA = '## 概要\n\n詳細は [ロール](./manage-platform-roles#manage-project-roles) を参照してください。\n'
  assert.deepEqual(
    assertChangeCoverage({oldSource: LINK_OLD_EN, newSource: LINK_NEW_EN, oldTarget: CURRENT_JA, newTarget: CURRENT_JA}),
    [],
  )
  // Same source change but the target still carries the stale link: violation.
  const STALE_JA = '## 概要\n\n詳細は [ロール](./project-users#invite) を参照してください。\n'
  const violations = assertChangeCoverage({oldSource: LINK_OLD_EN, newSource: LINK_NEW_EN, oldTarget: STALE_JA, newTarget: STALE_JA})
  assert.equal(violations.length, 2)
  assert.match(violations[0], /does not contain it/)
  assert.match(violations[1], /still contains it/)
});

test('unifiedSourceDiffPreview lists removed and added source lines', () => {
  const preview = unifiedSourceDiffPreview(OLD_EN, NEW_EN)
  assert.match(preview, /- Each project may run at most five concurrent jobs\./)
  assert.match(preview, /\+ Each project may run at most ten concurrent jobs\./)
});

test('surgical task prompt carries the diff, the old-source path, and the style guide reference', () => {
  const prompt = buildSurgicalTaskPrompt({
    item: ITEM, target: 'ja-JP', siteDir: '/site',
    oldSource: OLD_EN, newSource: NEW_EN, oldTargetPath: ITEM.targetPath,
    validatorCommand: 'node v.js', stylePromptPath: stylePromptPathFor('ja-JP'),
  })
  assert.match(prompt, /surgical edit, not a retranslation/)
  assert.match(prompt, /byte-identical/)
  assert.match(prompt, /spark-jobs\.md\.surgical-old/)
  assert.match(prompt, /at most ten concurrent jobs/)
  assert.match(prompt, /codex-style-guide\.ja-JP\.md/)
  assert.match(prompt, /<locale_contract>/)
});

test('runSurgicalUpdate returns already-current targets byte-identical without calling the agent', async () => {
  await withSite(async siteDir => {
    const LINK_OLD_EN = `---
title: Access
title_slug: /access
---

# Access

## Overview

Manage user [roles](./project-users#invite-a-user-to-a-project) with moderate isolation.
`
    const LINK_NEW_EN = LINK_OLD_EN.replace('./project-users#invite-a-user-to-a-project', './manage-platform-roles#manage-project-roles')
    const LINK_CURRENT_JA = `---
title: アクセス
title_slug: /access
---

# アクセス

## 概要

中程度の分離レベルでユーザーの [ロール](./manage-platform-roles#manage-project-roles) を管理する場合。
`
    let calls = 0
    const result = await runSurgicalUpdate({
      item: ITEM, target: 'ja-JP', siteDir,
      oldSourceContent: LINK_OLD_EN,
      oldTargetContent: LINK_CURRENT_JA,
      newSourceContent: LINK_NEW_EN,
      callCodex: async () => { calls += 1; throw new Error('agent must not be called') },
    });
    assert.equal(result.status, 'translated')
    assert.deepEqual(result.attempts, ['verified-current'])
    assert.equal(calls, 0)
    assert.equal(fs.readFileSync(path.join(siteDir, ITEM.targetPath), 'utf8'), LINK_CURRENT_JA)
  });
});

test('runSurgicalUpdate translates with untouched bytes passing through exactly', async () => {
  await withSite(async siteDir => {
    const turns = []
    const result = await runSurgicalUpdate({
      item: ITEM, target: 'ja-JP', siteDir,
      oldSourceContent: OLD_EN,
      oldTargetContent: OLD_JA,
      newSourceContent: NEW_EN,
      callCodex: async () => {
        turns.push(1)
        write(siteDir, ITEM.targetPath, UPDATED_JA)
        return 'DONE'
      },
    })
    assert.equal(result.status, 'translated')
    assert.deepEqual(result.attempts, ['surgical-translate'])
    assert.equal(result.lane, 'surgical')
    assert.equal(turns.length, 1)
    assert.equal(fs.readFileSync(path.join(siteDir, ITEM.targetPath), 'utf8'), UPDATED_JA)
    assert.equal(fs.readFileSync(path.join(siteDir, `${ITEM.sourcePath}.surgical-old`), 'utf8'), OLD_EN)
  });
});

test('runSurgicalUpdate repairs a missed update through a bounded extra round', async () => {
  await withSite(async siteDir => {
    let turn = 0
    const result = await runSurgicalUpdate({
      item: ITEM, target: 'ja-JP', siteDir,
      oldSourceContent: OLD_EN,
      oldTargetContent: OLD_JA,
      newSourceContent: NEW_EN,
      callCodex: async ({phase}) => {
        turn += 1
        if (turn === 1) return 'DONE' // forgot to edit
        write(siteDir, ITEM.targetPath, UPDATED_JA)
        return 'DONE'
      },
      maxRepairTurns: 2,
    });
    assert.equal(result.status, 'translated')
    assert.deepEqual(result.attempts, ['surgical-translate', 'surgical-repair1'])
  });
});

test('runSurgicalUpdate fails closed when the target never reflects the change', async () => {
  await withSite(async siteDir => {
    const result = await runSurgicalUpdate({
      item: ITEM, target: 'ja-JP', siteDir,
      oldSourceContent: OLD_EN,
      oldTargetContent: OLD_JA,
      newSourceContent: NEW_EN,
      callCodex: async () => 'DONE',
      maxRepairTurns: 1,
    });
    assert.equal(result.status, 'failed')
    assert.equal(result.attempts.length, 2)
    assert.ok(result.error.length <= 2000)
    assert.ok(result.validationErrors.some(violation => /possible missed update/.test(violation)))
    assert.equal(result.failureCategory, 'unknown')
  });
});
