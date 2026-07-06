---
title: "HttpImportProgressResponse | Node.js"
slug: /node/node/DataImport-HttpImportProgressResponse
sidebar_label: "HttpImportProgressResponse"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This interface describes the response returned by `getImportJobProgress()`. | Node.js"
type: docx
token: WadbddIBYoC4GcxDzORcjMQYnmW
sidebar_position: 7
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportProgressResponse
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportProgressResponse

This interface describes the response returned by `getImportJobProgress()`.

```typescript
interface HttpImportProgressResponse
```

**FIELDS:**

- **code** (*number*) -

    Specifies the HTTP API response code.

- **data.jobId** (*string*) -

    Specifies the import job ID.

- **data.progress** (*number*) -

    Specifies the job progress.

- **data.state** (*string*) -

    Specifies the current job state.

- **data.totalRows** (*number*) -

    Specifies the total row count when available.

- **data.importedRows** (*number*) -

    Specifies the imported row count when available.

- **data.details** (*ImportJobDetailType[]*) -

    Lists per-file import progress details when available.

- **data.reason** (*string*) -

    Specifies the failure reason when the job fails.

## Example\{#example}

```javascript
const state = response.data.state;
const progress = response.data.progress;
```
