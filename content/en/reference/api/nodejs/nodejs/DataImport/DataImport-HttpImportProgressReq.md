---
title: "HttpImportProgressReq | Node.js"
slug: /node/node/DataImport-HttpImportProgressReq
sidebar_label: "HttpImportProgressReq"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This interface defines the request body for `getImportJobProgress()`. | Node.js"
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

This interface defines the request body for `getImportJobProgress()`.

```typescript
interface HttpImportProgressReq
```

**FIELDS:**

- **jobId** (*string*) -

    **[REQUIRED]**

    Specifies the import job ID.

- **dbName** (*string*) -

    Specifies the database name.

## Example\{#example}

```javascript
const request = {
    jobId: 'job-1234567890',
};
```
