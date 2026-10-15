---
title: "BulkWriter | Node.js"
slug: /node/node/DataImport-BulkWriter
sidebar_label: "BulkWriter"
beta: false
added_since: v2.6.12
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A BulkWriter instance converts Milvus schema rows into columnar batches and flushes them to local object storage. | Node.js"
type: docx
token: XTa5d642Aotj7GxLmwSc66xOnUc
sidebar_position: 10
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - BulkWriter
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# BulkWriter

A BulkWriter instance converts Milvus schema rows into columnar batches and flushes them to local object storage.

## Request Syntax\{#request-syntax}

```typescript
new BulkWriter({ schema, storage?, format?, chunkSize?, localPath? })
```

**PARAMETERS:**

- **schema** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    The Milvus collection schema the writer validates rows against. BulkWriter deep-clones the schema at construction time, so later caller edits do not affect the writer.

- **format** (*string*) -

    The output format of the formatted chunk files: `json` or `parquet`. Defaults to `json`.

- **storage** (*[Storage](./DataImport-Storage)*) -

    The storage backend that persists the formatted files. Defaults to LocalStorage.

- **chunkSize** (*number*) -

    The byte threshold at which the buffered rows flush to a new chunk. Defaults to 128 MB.

- **localPath** (*string*) -

    The base directory for local chunk output. Defaults to the current working directory; each writer instance writes under a random subdirectory.

## Example\{#example}

```javascript
const writer = new BulkWriter({
  schema,
  format: 'parquet',
});
await writer.append({ id: 1, vector: [0.1, 0.2] });
await writer.commit();
```
