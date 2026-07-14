---
title: "createImportJobs() | Node.js"
slug: /node/node/DataImport-createImportJobs
sidebar_label: "createImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ファイルグループから HTTP インポートジョブを作成します。オブジェクトストレージまたは Milvus インポートサービスがアクセス可能な別の場所にファイルを準備した後に使用します。 | Node.js"
type: docx
token: PGmQdpQ8roiLJVxJSZrcbnAVn1e
sidebar_position: 1
keywords: 
  - マルチモーダル RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - createImportJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createImportJobs()

この操作は、ファイルグループから HTTP インポートジョブを作成します。オブジェクトストレージまたは Milvus インポートサービスがアクセス可能な別の場所にファイルを準備した後に使用します。

```typescript
await milvusClient.createImportJobs(params: HttpImportCreateReq)
```

## リクエスト構文\{#request-syntax}

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

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象のコレクション名を指定します。

- **files** (*string[][]*) -

    **[必須]**

    インポートするファイルグループを指定します。各内部配列は、1 つのインポートグループに属するファイルを表します。

- **dbName** (*string*) -

    データベース名を指定します。

- **options** (*object*) -

    timeout などのインポートオプションを指定します。

**戻り値:**

*Promise&lt;HttpImportCreateResponse&gt;*

## 例\{#example}

```javascript
const job = await milvusClient.createImportJobs({
    collectionName: 'book_embeddings',
    files: [['s3://bucket/book_embeddings/part-0001.parquet']],
});
```
