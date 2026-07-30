---
title: "Storage | Node.js"
slug: /node/node/DataImport-Storage
sidebar_label: "Storage"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "This interface stores files produced by `BulkWriter`. Use it to upload generated files to object storage or another remote location before calling `bulkInsert()`. | Node.js"
type: docx
token: DsLHde5AWomjFhxD3K7c4Yklnlh
sidebar_position: 16
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - zilliz
  - zilliz cloud
  - cloud
  - Storage
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# Storage

This interface stores files produced by `BulkWriter`. Use it to upload generated files to object storage or another remote location before calling `bulkInsert()`.

```typescript
interface Storage
```

**METHODS:**

- `write(localPath: string, remotePath: string): Promise<string>`

    Stores a generated local file and returns the final path that should be passed to Milvus import APIs.

## Example\{#example}

```javascript
class S3Storage {
    async write(localPath, remotePath) {
        await uploadToS3(localPath, remotePath);
        return `s3://bucket/${remotePath}`;
    }
}
```
