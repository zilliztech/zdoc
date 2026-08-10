---
title: "BulkWriterOptions | Node.js"
slug: /node/node/DataImport-BulkWriterOptions
sidebar_label: "BulkWriterOptions"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "此接口用于配置 `BulkWriter` 实例，包括 Schema 验证、存储行为、文件格式、分块大小和本地输出路径。 | Node.js"
type: docx
token: Q9UUdw8VWojtDtx2h00chPvRnqh
sidebar_position: 11
keywords: 
  - 深度学习
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - zilliz
  - zilliz cloud
  - 云
  - BulkWriterOptions
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# BulkWriterOptions

此接口用于配置 `BulkWriter` 实例，包括 Schema 验证、存储行为、文件格式、分块大小和本地输出路径。

```typescript
interface BulkWriterOptions
```

**字段：**

- **schema** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    **[必需]**

    定义由 `BulkWriter` 验证并序列化的字段。

- **[storage](./DataImport-Storage)** (*[Storage](./DataImport-Storage)*) -

    指定自定义存储适配器。如果省略，`LocalStorage` 会将生成的文件保留在磁盘上。

- **format** (*'json' | 'parquet'*) -

    指定生成的文件格式。默认为 `json`。

- **chunkSize** (*number*) -

    指定触发自动提交的近似缓冲字节大小。

- **localPath** (*string*) -

    指定创建分块文件夹的本地基础目录。

## 示例\{#example}

```javascript
const options = {
    schema,
    format: 'json',
    chunkSize: 64 * 1024 * 1024,
    localPath: '/tmp/milvus-bulk',
};
```
