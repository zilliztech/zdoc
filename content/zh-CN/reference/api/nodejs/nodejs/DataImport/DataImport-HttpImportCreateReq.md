---
title: "HttpImportCreateReq | Node.js"
slug: /node/node/DataImport-HttpImportCreateReq
sidebar_label: "HttpImportCreateReq"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此接口定义了 `createImportJobs()` 的请求体。 | Node.js"
type: docx
token: MUzJdvT3LoZz65xpAPMcnvo2nbb
sidebar_position: 3
keywords: 
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportCreateReq
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportCreateReq

此接口定义了 `createImportJobs()` 的请求体。

```typescript
interface HttpImportCreateReq
```

**字段：**

- **collectionName** (*string*) -

    **[必需]**

    指定目标 Collection 名称。

- **files** (*string[][]*) -

    **[必需]**

    指定要导入的文件组。

- **dbName** (*string*) -

    指定 Database 名称。

- **options** (*object*) -

    指定导入选项。

## 示例\{#example}

```javascript
const request = {
    collectionName: 'book_embeddings',
    files: [['s3://bucket/book_embeddings/part-0001.parquet']],
    options: { timeout: '600s' },
};
```
