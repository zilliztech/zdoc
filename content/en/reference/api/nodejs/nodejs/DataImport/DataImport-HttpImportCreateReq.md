---
title: "HttpImportCreateReq | Node.js"
slug: /node/node/DataImport-HttpImportCreateReq
sidebar_label: "HttpImportCreateReq"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This interface defines the request body for `createImportJobs()`. | Node.js"
type: docx
token: MUzJdvT3LoZz65xpAPMcnvo2nbb
sidebar_position: 3
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
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

This interface defines the request body for `createImportJobs()`.

```typescript
interface HttpImportCreateReq
```

**FIELDS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    Specifies the target collection name.

- **files** (*string[][]*) -

    **[REQUIRED]**

    Specifies file groups to import.

- **dbName** (*string*) -

    Specifies the database name.

- **options** (*object*) -

    Specifies import options.

## Example\{#example}

```javascript
const request = {
    collectionName: 'book_embeddings',
    files: [['s3://bucket/book_embeddings/part-0001.parquet']],
    options: { timeout: '600s' },
};
```
