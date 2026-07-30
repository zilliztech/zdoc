---
title: "HttpImportListResponse | Node.js"
slug: /node/node/DataImport-HttpImportListResponse
sidebar_label: "HttpImportListResponse"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This interface describes the response returned by `listImportJobs()`. | Node.js"
type: docx
token: L709dd1mWo6CFjxi2ygczQmpn9e
sidebar_position: 5
keywords: 
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportListResponse
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportListResponse

This interface describes the response returned by `listImportJobs()`.

```typescript
interface HttpImportListResponse
```

**FIELDS:**

- **code** (*number*) -

    Specifies the HTTP API response code.

- **data.records** (*ImportJobType[]*) -

    Lists import jobs with collection name, job ID, progress, and state.

- **message** (*string*) -

    Specifies the response message.

## Example\{#example}

```javascript
const records = response.data.records;
```
