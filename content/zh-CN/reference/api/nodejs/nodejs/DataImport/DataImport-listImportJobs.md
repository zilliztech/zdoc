---
title: "listImportJobs() | Node.js"
slug: /node/node/DataImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出通过 HTTP 导入任务 API 提交的导入任务。您可以使用它查看任务 ID、Collection 名称、进度和状态。 | Node.js"
type: docx
token: CdK7dr8pyo36PZxpGFKcrZsjnEf
sidebar_position: 8
keywords: 
  - k 近邻算法
  - ANNS
  - 向量搜索
  - knn 算法
  - zilliz
  - zilliz cloud
  - 云
  - listImportJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listImportJobs()

此操作会列出通过 HTTP 导入任务 API 提交的导入任务。您可以使用它查看任务 ID、Collection 名称、进度和状态。

```typescript
await milvusClient.listImportJobs(params: HttpBaseReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.listImportJobs({
    dbName?: string,
})
```

**参数：**

- **dbName** (*string*) -

    指定 Database 名称。

**返回：**

*Promise&lt;HttpImportListResponse&gt;*

## 示例\{#example}

```javascript
const jobs = await milvusClient.listImportJobs({
    dbName: 'default',
});
```
