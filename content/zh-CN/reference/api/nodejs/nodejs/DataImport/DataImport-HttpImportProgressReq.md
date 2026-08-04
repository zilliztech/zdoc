---
title: "HttpImportProgressReq | Node.js"
slug: /node/node/DataImport-HttpImportProgressReq
sidebar_label: "HttpImportProgressReq"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "`getImportJobProgress()` 的请求体由此接口定义。 | Node.js"
type: docx
token: Yb27dGNgwoXKmHx0yyZc4n45nr9
sidebar_position: 6
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportProgressReq
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportProgressReq

`getImportJobProgress()` 的请求体由此接口定义。

```typescript
interface HttpImportProgressReq
```

**字段：**

- **jobId** (*string*) -

    **[必需]**

    指定导入任务 ID。

- **dbName** (*string*) -

    指定数据库名称。

## 示例\{#example}

```javascript
const request = {
    jobId: 'job-1234567890',
};
```
