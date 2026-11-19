# 并行文档生产与受控提交实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 保持内容生成和翻译并行，只对共享媒体访问和最终 `dev` 写入实施最小范围的协调。

**Architecture:** Guides source 阶段生成只读 media manifest 并上传 S3，两个 render 并行消费；SDK/REST checkpoint 并行准备，publisher 使用快速 scoped validation 并按显式依赖链提交。

**Tech Stack:** Node.js、GitHub Actions、S3、Figma API、飞书 OpenAPI、现有 checkpoint artifact 工具。

---

### Task 1: Media Manifest Contract

**Files:**
- Create: `scripts/docs-workflow/guides-media-prefetch.js`
- Create: `scripts/docs-workflow/guides-media-prefetch.test.js`

- [ ] 编写失败测试，覆盖 image/board/Figma 扫描、去重、安全 schema 和稳定排序。
- [x] 实现 manifest 收集、校验和原子写入；artifact 只保存 S3 object 引用，不保存图片二进制。
- [ ] 运行 `node --test scripts/docs-workflow/guides-media-prefetch.test.js`。

### Task 2: Media Prefetch Execution

**Files:**
- Modify: `plugins/lark-docs/larkImageDownloader.js`
- Modify: `plugins/lark-docs/larkDocWriter.js`
- Modify: `scripts/docs-workflow/guides-media-prefetch.js`
- Test: `plugins/lark-docs/larkImageDownloader.test.js`

- [x] 编写 strict manifest 命中和 miss 测试。
- [x] 复用现有飞书/Figma/S3 下载器预取唯一媒体和 hash 比对上传。
- [x] 增加有限并发 worker，并按 full/incremental/single-doc 范围选择 source JSON。
- [x] render 命中 manifest 时跳过下载和上传；strict miss 直接失败。
- [x] 运行 downloader、writer 和 prefetch 聚焦测试。

### Task 3: Guides Workflow Wiring

**Files:**
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `.github/workflows/_render-guides-target.yml`
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `scripts/docs-workflow/guides-stage-artifact.js`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [x] 将 AWS 凭证传入 shared source workflow。
- [x] source fetch 后执行 media prefetch，并将 manifest 纳入 source artifact。
- [x] 两个 render 继续只依赖同一个 source artifact，保持并行。
- [x] render 设置 strict manifest 环境变量并移除直接 Figma/AWS 凭证需求。
- [x] 更新 artifact 和 workflow policy 测试。

### Task 4: Short Publication Queue

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `.github/workflows/_publish-content-group.yml`
- Modify: `.github/workflows/_translate-publish-batch.yml`
- Modify: `.github/workflows/translate-codex.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [x] 编写失败测试，证明 producer/translator 保持独立且 publisher 按固定顺序等待。
- [x] 将 translation publication validation 改为 sidebar + group coverage。
- [x] 将 publisher non-fast-forward 重试上限提高到 10。
- [x] 建立 source publisher、guides batches 和 translation publisher 的短提交队列。
- [x] 将 Python 与 Guides 放在 source 提交队列最后两位。
- [x] 验证 selected group 模式可通过 skipped predecessor。

### Task 5: Verification And Delivery

- [x] 运行 workflow policy、DAG 无环检查和相关单元测试。
- [x] 运行完整核心回归与 `git diff --check`。
- [ ] 提交并推送 `master`。
- [ ] 启动新的 `group=all` workflow，确认两个 guides render 并行且 publisher 不再发生长构建重试。
