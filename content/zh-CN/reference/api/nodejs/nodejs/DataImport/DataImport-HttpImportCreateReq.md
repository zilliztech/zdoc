---
title: "HttpImportCreateReq | Node.js"
slug: /node/node/DataImport-HttpImportCreateReq
sidebar_label: "HttpImportCreateReq"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "`createImportJobs()` 的请求体由此接口定义。 | Node.js"
type: docx
token: MUzJdvT3LoZz65xpAPMcnvo2nbb
sidebar_position: 3
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
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

`createImportJobs()` 的请求体由此接口定义。

```typescript
interface HttpImportCreateReq
```

**字段：**

- **collectionName** (*string*) -

    **[必需]**

    指定目标集合名称。

- **files** (*string[][]*) -

    **[必需]**

    指定要导入的文件组。

- **dbName** (*string*) -

    指定数据库名称。

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
