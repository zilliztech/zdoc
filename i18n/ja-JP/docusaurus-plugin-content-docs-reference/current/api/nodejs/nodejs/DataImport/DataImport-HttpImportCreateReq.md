---
title: "HttpImportCreateReq | Node.js"
slug: /node/node/DataImport-HttpImportCreateReq
sidebar_label: "HttpImportCreateReq"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "`createImportJobs()` のリクエストボディを定義するインターフェースです。 | Node.js"
type: docx
token: MUzJdvT3LoZz65xpAPMcnvo2nbb
sidebar_position: 3
keywords: 
  - 動画重複排除
  - 動画類似検索
  - Vector retrieval
  - 音声類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportCreateReq
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportCreateReq

このインターフェースは、`createImportJobs()` のリクエストボディを定義します。

```typescript
interface HttpImportCreateReq
```

**FIELDS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    対象のコレクション名を指定します。

- **files** (*string[][]*) -

    **[REQUIRED]**

    インポートするファイルグループを指定します。

- **dbName** (*string*) -

    データベース名を指定します。

- **options** (*object*) -

    インポートオプションを指定します。

## Example\{#example}

```javascript
const request = {
    collectionName: 'book_embeddings',
    files: [['s3://bucket/book_embeddings/part-0001.parquet']],
    options: { timeout: '600s' },
};
```
