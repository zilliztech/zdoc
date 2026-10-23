---
title: "removeFileResource() | Node.js"
slug: /node/node/FileResources-removeFileResource
sidebar_label: "removeFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从 Milvus 元数据中删除具名文件资源。 | Node.js"
type: docx
token: TfFQdwR7borsLfxiwdCcXoKvnth
sidebar_position: 3
keywords: 
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - RAG 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - removeFileResource()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# removeFileResource()

此操作会从 Milvus 元数据中删除具名文件资源。

## 请求语法\{#request-syntax}

```typescript
milvusClient.removeFileResource({ name, timeout? })
```

**参数：**

- **name**（*string*）-

    要删除的文件资源的名称。

- **timeout**（*number*）-

    允许 RPC 执行的可选持续时间，以毫秒为单位。默认值为 undefined。

**返回类型：**

*ResStatus*

**返回：**

一个 Promise，其解析结果为操作状态。

**参数：**

- **error_code**（*number*）-

    错误码编号：0 表示成功。

- **reason**（*string*）-

    错误原因（如有）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.removeFileResource({
  name: 'training_data',
});
```
