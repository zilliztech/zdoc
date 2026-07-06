---
title: "listImportJobs() | Node.js"
slug: /node/node/DataImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists import jobs submitted through the HTTP import job API. Use it to review job IDs, collection names, progress, and state. | Node.js"
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

This operation lists import jobs submitted through the HTTP import job API. Use it to review job IDs, collection names, progress, and state.

```typescript
await milvusClient.listImportJobs(params: HttpBaseReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.listImportJobs({
    dbName?: string,
})
```

**PARAMETERS:**

- **dbName** (*string*) -

    Specifies the database name.

**RETURNS:**

*Promise&lt;HttpImportListResponse&gt;*

## Example\{#example}

```javascript
const jobs = await milvusClient.listImportJobs({
    dbName: 'default',
});
```
