# Upload On-Demand Cluster Board Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-off script that downloads Feishu whiteboard `M2XMwoWoih17BRbqhGhcb6i9njg` and uploads it to S3 as `M2XMwoWoih17BRbqhGhcb6i9njg.png`.

**Architecture:** A focused CommonJS script will instantiate the existing `larkImageDownloader`, call its board-download method, validate the HTTP response, and pass the PNG buffer to its existing S3 upload method. The exported function accepts the downloader class as a test seam while the command-line entry point uses the real implementation and `.env` configuration.

**Tech Stack:** Node.js 18+, CommonJS, `node:assert`, existing Feishu downloader and AWS SDK integration.

---

### Task 1: One-off board upload command

**Files:**
- Create: `scripts/upload-on-demand-cluster-board.test.js`
- Create: `scripts/upload-on-demand-cluster-board.js`

- [ ] **Step 1: Write the failing test**

Create `scripts/upload-on-demand-cluster-board.test.js` with a fake downloader that records the board token and S3 key. Assert that the exported function downloads `M2XMwoWoih17BRbqhGhcb6i9njg`, uploads the returned buffer as `M2XMwoWoih17BRbqhGhcb6i9njg.png`, and rejects unsuccessful Feishu responses.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/upload-on-demand-cluster-board.test.js`

Expected: FAIL because `scripts/upload-on-demand-cluster-board.js` does not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `scripts/upload-on-demand-cluster-board.js` with:

```js
const LarkImageDownloader = require('../plugins/lark-docs/larkImageDownloader.js');

const BOARD_TOKEN = 'M2XMwoWoih17BRbqhGhcb6i9njg';
const S3_KEY = `${BOARD_TOKEN}.png`;

async function uploadOnDemandClusterBoard(Downloader = LarkImageDownloader) {
  const downloader = new Downloader({}, '.');
  const response = await downloader.__downloadBoardPreview(BOARD_TOKEN);

  if (!response.ok) {
    throw new Error(`Board ${BOARD_TOKEN} download failed: HTTP ${response.status} ${response.statusText || ''}`.trim());
  }

  const buffer = await response.buffer();
  await downloader.__uploadToS3(buffer, S3_KEY);
  console.log(`Uploaded board image to ${S3_KEY}`);
}

if (require.main === module) {
  uploadOnDemandClusterBoard().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { BOARD_TOKEN, S3_KEY, uploadOnDemandClusterBoard };
```

- [ ] **Step 4: Run focused tests**

Run: `node scripts/upload-on-demand-cluster-board.test.js`

Expected: PASS with `upload on-demand cluster board tests passed`.

- [ ] **Step 5: Run the existing downloader regression test**

Run: `node plugins/lark-docs/larkImageDownloader.test.js`

Expected: PASS with `lark image downloader tests passed`.

- [ ] **Step 6: Check the final diff without committing**

Run: `git diff --check -- scripts/upload-on-demand-cluster-board.js scripts/upload-on-demand-cluster-board.test.js`

Expected: no output and exit status 0. Leave both files uncommitted.
