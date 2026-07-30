---
title: "createImportJobs() | Node.js"
slug: /node/node/DataImport-createImportJobs
sidebar_label: "createImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an HTTP import job from file groups. Use it after preparing files in object storage or another location accessible to the Milvus import service. | Node.js"
type: docx
token: PGmQdpQ8roiLJVxJSZrcbnAVn1e
sidebar_position: 1
keywords: 
  - multimodal RAG
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

This operation creates an HTTP import job from file groups. Use it after preparing files in object storage or another location accessible to the Milvus import service.

```typescript
await milvusClient.createImportJobs(params: HttpImportCreateReq)
```

## Request Syntax\{#request-syntax}

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

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    Specifies the target collection name.

- **files** (*string[][]*) -

    **[REQUIRED]**

    Specifies file groups to import. Each inner array represents files that belong to one import group.

- **dbName** (*string*) -

    Specifies the database name.

- **options** (*object*) -

    Specifies import options such as timeout.

**RETURNS:**

*Promise&lt;HttpImportCreateResponse&gt;*

## Example\{#example}

```javascript
const job = await milvusClient.createImportJobs({
    collectionName: 'book_embeddings',
    files: [['s3://bucket/book_embeddings/part-0001.parquet']],
});
```
