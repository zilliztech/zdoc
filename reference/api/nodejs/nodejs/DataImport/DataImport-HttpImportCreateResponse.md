---
title: "HttpImportCreateResponse | Node.js"
slug: /node/node/DataImport-HttpImportCreateResponse
sidebar_label: "HttpImportCreateResponse"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This interface describes the response returned by `createImportJobs()`. | Node.js"
type: docx
token: CZ3DduFXkoyoX9xJs9ic2HkRnqc
sidebar_position: 4
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportCreateResponse
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportCreateResponse

This interface describes the response returned by `createImportJobs()`.

```typescript
interface HttpImportCreateResponse
```

**FIELDS:**

- **code** (*number*) -

    Specifies the HTTP API response code.

- **data.jobId** (*string*) -

    Specifies the created import job ID.

- **message** (*string*) -

    Specifies the response message.

## Example\{#example}

```javascript
const jobId = response.data.jobId;
```
