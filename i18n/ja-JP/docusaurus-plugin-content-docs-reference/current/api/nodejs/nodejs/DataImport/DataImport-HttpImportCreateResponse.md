---
title: "HttpImportCreateResponse | Node.js"
slug: /node/node/DataImport-HttpImportCreateResponse
sidebar_label: "HttpImportCreateResponse"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "`createImportJobs()` によって返されるレスポンスを説明するインターフェースです。 | Node.js"
type: docx
token: CZ3DduFXkoyoX9xJs9ic2HkRnqc
sidebar_position: 4
keywords: 
  - Chroma ベクトルデータベース
  - nlp search
  - hallucinations llm
  - マルチモーダル検索
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportCreateResponse
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportCreateResponse

このインターフェースは、`createImportJobs()` によって返されるレスポンスを説明します。

```typescript
interface HttpImportCreateResponse
```

**FIELDS:**

- **code** (*number*) -

    HTTP API のレスポンスコードを指定します。

- **data.jobId** (*string*) -

    作成されたインポートジョブ ID を指定します。

- **message** (*string*) -

    レスポンスメッセージを指定します。

## Example\{#example}

```javascript
const jobId = response.data.jobId;
```
