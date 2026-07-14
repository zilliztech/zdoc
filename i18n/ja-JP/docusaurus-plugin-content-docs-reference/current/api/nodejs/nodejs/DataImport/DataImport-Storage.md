---
title: "Storage | Node.js"
slug: /node/node/DataImport-Storage
sidebar_label: "Storage"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "`BulkWriter` によって生成されたファイルを保存するインターフェースです。`bulkInsert()` を呼び出す前に、生成されたファイルをオブジェクトストレージまたは別のリモート場所へアップロードするために使用します。 | Node.js"
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

このインターフェースは `BulkWriter` によって生成されたファイルを保存します。`bulkInsert()` を呼び出す前に、生成されたファイルをオブジェクトストレージまたは別のリモート場所へアップロードするために使用します。

```typescript
interface Storage
```

**メソッド:**

- `write(localPath: string, remotePath: string): Promise<string>`

    生成されたローカルファイルを保存し、Milvus の import API に渡すべき最終パスを返します。

## Example\{#example}

```javascript
class S3Storage {
    async write(localPath, remotePath) {
        await uploadToS3(localPath, remotePath);
        return `s3://bucket/${remotePath}`;
    }
}
```
