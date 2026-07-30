---
title: "BulkWriterOptions | Node.js"
slug: /node/node/DataImport-BulkWriterOptions
sidebar_label: "BulkWriterOptions"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "This interface configures a `BulkWriter` instance, including schema validation, storage behavior, file format, chunk size, and local output path. | Node.js"
type: docx
token: Q9UUdw8VWojtDtx2h00chPvRnqh
sidebar_position: 11
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - BulkWriterOptions
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# BulkWriterOptions

This interface configures a `BulkWriter` instance, including schema validation, storage behavior, file format, chunk size, and local output path.

```typescript
interface BulkWriterOptions
```

**FIELDS:**

- **schema** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    **[REQUIRED]**

    Defines the fields that `BulkWriter` validates and serializes.

- **[storage](./DataImport-Storage)** (*[Storage](./DataImport-Storage)*) -

    Specifies a custom storage adapter. If omitted, `LocalStorage` keeps generated files on disk.

- **format** (*'json' | 'parquet'*) -

    Specifies the generated file format. Defaults to `json`.

- **chunkSize** (*number*) -

    Specifies the approximate buffered byte size that triggers automatic commit.

- **localPath** (*string*) -

    Specifies the local base directory where chunk folders are created.

## Example\{#example}

```javascript
const options = {
    schema,
    format: 'json',
    chunkSize: 64 * 1024 * 1024,
    localPath: '/tmp/milvus-bulk',
};
```
