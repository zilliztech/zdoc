---
title: "createImportJobs() | Node.js"
slug: /node/node/DataImport-createImportJobs
sidebar_label: "createImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作根据文件组创建一个 HTTP 导入任务。在对象存储或 Milvus 导入服务可访问的其他位置准备好文件后，您可以使用此操作。 | Node.js"
type: docx
token: PGmQdpQ8roiLJVxJSZrcbnAVn1e
sidebar_position: 1
keywords: 
  - 多模态 RAG
  - LLM 幻觉
  - 混合搜索
  - 词法搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - createImportJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createImportJobs()

此操作根据文件组创建一个 HTTP 导入任务。在对象存储或 Milvus 导入服务可访问的其他位置准备好文件后，您可以使用此操作。

```typescript
await milvusClient.createImportJobs(params: HttpImportCreateReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.createImportJobs({
    collectionName: string,
    files: string[][],
    dbName?: string,
    options?: {
        timeout: string,
    },
})
```

**参数：**

- **collectionName** (*string*) -

    **[必填]**

    指定目标 Collection 名称。

- **files** (*string[][]*) -

    **[必填]**

    指定要导入的文件组。每个内部数组表示属于一个导入组的文件。

- **dbName** (*string*) -

    指定 Database 名称。

- **options** (*object*) -

    指定导入选项，例如超时。

**返回：**

*Promise&lt;HttpImportCreateResponse&gt;*

## 示例\{#example}

```javascript
const job = await milvusClient.createImportJobs({
    collectionName: 'book_embeddings',
    files: [['s3://bucket/book_embeddings/part-0001.parquet']],
});
```
