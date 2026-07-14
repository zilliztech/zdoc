---
title: "FlushEvent | Node.js"
slug: /node/node/DataImport-FlushEvent
sidebar_label: "FlushEvent"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "`BulkWriter` の flush イベントを説明するインターフェースです。chunk に対して生成されたファイル、その chunk の行数、および chunk インデックスを報告します。 | Node.js"
type: docx
token: RC5YdaKIhoRU0ZxU48OcJxn7nS2
sidebar_position: 13
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - milvus はどのように動作するか
  - zilliz
  - zilliz cloud
  - cloud
  - FlushEvent
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# FlushEvent

このインターフェースは `BulkWriter` の flush イベントを説明します。chunk に対して生成されたファイル、その chunk の行数、および chunk インデックスを報告します。

```typescript
interface FlushEvent
```

**FIELDS:**

- **files** (*string[]*) -

    **[REQUIRED]**

    flush された chunk に対して生成されたファイルを一覧表示します。

- **rowCount** (*number*) -

    **[REQUIRED]**

    flush された行数を指定します。

- **chunkIndex** (*number*) -

    **[REQUIRED]**

    0 ベースの chunk インデックスを指定します。

## Example\{#example}

```javascript
const event = {
    files: ['/tmp/chunk_0/data.parquet'],
    rowCount: 10000,
    chunkIndex: 0,
};
```
