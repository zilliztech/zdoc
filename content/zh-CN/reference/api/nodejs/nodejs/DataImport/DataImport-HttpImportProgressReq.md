---
title: "HttpImportProgressReq | Node.js"
slug: /node/node/DataImport-HttpImportProgressReq
sidebar_label: "HttpImportProgressReq"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此接口定义了 `getImportJobProgress()` 的请求体。| Node.js"
type: docx
token: Yb27dGNgwoXKmHx0yyZc4n45nr9
sidebar_position: 6
keywords: 
  - 幻觉 llm
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - zilliz
  - zilliz cloud
  - 云
  - HttpImportProgressReq
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportProgressReq

此接口定义了 `getImportJobProgress()` 的请求体。

```typescript
interface HttpImportProgressReq
```

**字段：**

- **jobId** (*string*) -

    **[必需]**

    指定导入作业 ID。

- **dbName** (*string*) -

    指定 Database 名称。

## 示例\{#example}

```javascript
const request = {
    jobId: 'job-1234567890',
};
```
