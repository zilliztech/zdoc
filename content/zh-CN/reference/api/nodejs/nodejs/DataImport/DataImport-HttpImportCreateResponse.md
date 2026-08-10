---
title: "HttpImportCreateResponse | Node.js"
slug: /node/node/DataImport-HttpImportCreateResponse
sidebar_label: "HttpImportCreateResponse"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此接口描述了 `createImportJobs()` 返回的响应。| Node.js"
type: docx
token: CZ3DduFXkoyoX9xJs9ic2HkRnqc
sidebar_position: 4
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - 幻觉 LLM
  - 多模态搜索
  - zilliz
  - zilliz cloud
  - 云
  - HttpImportCreateResponse
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportCreateResponse

此接口描述了 `createImportJobs()` 返回的响应。

```typescript
interface HttpImportCreateResponse
```

**字段：**

- **code** (*number*) -

    指定 HTTP API 响应代码。

- **data.jobId** (*string*) -

    指定创建的导入作业 ID。

- **message** (*string*) -

    指定响应消息。

## 示例\{#example}

```javascript
const jobId = response.data.jobId;
```
