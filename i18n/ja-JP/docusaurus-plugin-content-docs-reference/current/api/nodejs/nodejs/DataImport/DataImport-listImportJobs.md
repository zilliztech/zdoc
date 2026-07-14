---
title: "listImportJobs() | Node.js"
slug: /node/node/DataImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、HTTP import job API を通じて送信された import ジョブを一覧表示します。ジョブ ID、collection 名、進行状況、状態の確認に使用します。 | Node.js"
type: docx
token: CdK7dr8pyo36PZxpGFKcrZsjnEf
sidebar_position: 8
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - listImportJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listImportJobs()

この操作は、HTTP import job API を通じて送信された import ジョブを一覧表示します。ジョブ ID、collection 名、進行状況、状態の確認に使用します。

```typescript
await milvusClient.listImportJobs(params: HttpBaseReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.listImportJobs({
    dbName?: string,
})
```

**パラメーター:**

- **dbName** (*string*) -

    データベース名を指定します。

**戻り値:**

*Promise&lt;HttpImportListResponse&gt;*

## 例\{#example}

```javascript
const jobs = await milvusClient.listImportJobs({
    dbName: 'default',
});
```
