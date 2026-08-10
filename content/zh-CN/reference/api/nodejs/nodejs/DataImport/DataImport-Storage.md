---
title: "Storage | Node.js"
slug: /node/node/DataImport-Storage
sidebar_label: "Storage"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "此接口存储由 `BulkWriter` 生成的文件。您可以使用它在调用 `bulkInsert()` 之前，将生成的文件上传到对象存储或其他远程位置。 | Node.js"
type: docx
token: DsLHde5AWomjFhxD3K7c4Yklnlh
sidebar_position: 16
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless 向量 Database
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

此接口存储由 `BulkWriter` 生成的文件。您可以使用它在调用 `bulkInsert()` 之前，将生成的文件上传到对象存储或其他远程位置。

```typescript
interface Storage
```

**方法：**

- `write(localPath: string, remotePath: string): Promise<string>`

    存储生成的本地文件，并返回应传递给 Milvus 导入 API 的最终路径。

## 示例\{#example}

```javascript
class S3Storage {
    async write(localPath, remotePath) {
        await uploadToS3(localPath, remotePath);
        return `s3://bucket/${remotePath}`;
    }
}
```
