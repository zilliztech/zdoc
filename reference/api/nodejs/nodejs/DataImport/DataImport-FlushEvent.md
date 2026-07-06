---
title: "FlushEvent | Node.js"
slug: /node/node/DataImport-FlushEvent
sidebar_label: "FlushEvent"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "This interface describes a `BulkWriter` flush event. It reports the files generated for a chunk, the row count in that chunk, and the chunk index. | Node.js"
type: docx
token: RC5YdaKIhoRU0ZxU48OcJxn7nS2
sidebar_position: 13
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - zilliz
  - zilliz cloud
  - cloud
  - FlushEvent
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# FlushEvent

This interface describes a `BulkWriter` flush event. It reports the files generated for a chunk, the row count in that chunk, and the chunk index.

```typescript
interface FlushEvent
```

**FIELDS:**

- **files** (*string[]*) -

    **[REQUIRED]**

    Lists the files generated for the flushed chunk.

- **rowCount** (*number*) -

    **[REQUIRED]**

    Specifies how many rows were flushed.

- **chunkIndex** (*number*) -

    **[REQUIRED]**

    Specifies the zero-based chunk index.

## Example\{#example}

```javascript
const event = {
    files: ['/tmp/chunk_0/data.parquet'],
    rowCount: 10000,
    chunkIndex: 0,
};
```
