---
title: "HttpImportProgressReq | Node.js"
slug: /node/node/DataImport-HttpImportProgressReq
sidebar_label: "HttpImportProgressReq"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "`getImportJobProgress()` のリクエスト本文を定義するインターフェースです。 | Node.js"
type: docx
token: Yb27dGNgwoXKmHx0yyZc4n45nr9
sidebar_position: 6
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportProgressReq
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportProgressReq

このインターフェースは、`getImportJobProgress()` のリクエスト本文を定義します。

```typescript
interface HttpImportProgressReq
```

**FIELDS:**

- **jobId** (*string*) -

    **[REQUIRED]**

    インポートジョブ ID を指定します。

- **dbName** (*string*) -

    データベース名を指定します。

## 例\{#example}

```javascript
const request = {
    jobId: 'job-1234567890',
};
```
