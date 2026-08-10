---
title: "HttpImportProgressResponse | Node.js"
slug: /node/node/DataImport-HttpImportProgressResponse
sidebar_label: "HttpImportProgressResponse"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此接口描述了由 `getImportJobProgress()` 返回的响应。 | Node.js"
type: docx
token: WadbddIBYoC4GcxDzORcjMQYnmW
sidebar_position: 7
keywords: 
  - 句子转换器
  - 推荐系统
  - 信息检索
  - 降维
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportProgressResponse
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportProgressResponse

此接口描述了由 `getImportJobProgress()` 返回的响应。

```typescript
interface HttpImportProgressResponse
```

**字段：**

- **code** (*number*) -

    指定 HTTP API 响应代码。

- **data.jobId** (*string*) -

    指定导入作业 ID。

- **data.progress** (*number*) -

    指定作业进度。

- **data.state** (*string*) -

    指定当前作业状态。

- **data.totalRows** (*number*) -

    在可用时，指定总行数。

- **data.importedRows** (*number*) -

    在可用时，指定已导入行数。

- **data.details** (*ImportJobDetailType[]*) -

    在可用时，列出每个文件的导入进度详情。

- **data.reason** (*string*) -

    指定作业失败时的失败原因。

## 示例\{#example}

```javascript
const state = response.data.state;
const progress = response.data.progress;
```
