---
title: "dropFunctionField() | Node.js"
slug: /node/node/Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从 Collection 中删除某个函数及其输出字段和绑定的索引。 | Node.js"
type: docx
token: MmABd2rdooxiLZxYzwEciyTanOg
sidebar_position: 32
keywords: 
  - 音频相似性搜索
  - Elastic 向量 Database
  - Pinecone 与 Milvus
  - Chroma 与 Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropFunctionField()

此操作会从 Collection 中删除某个函数及其输出字段和绑定的索引。

## 请求语法\{#request-syntax}

```typescript
milvusClient.dropFunctionField({ collection_name, function_name, timeout? })
```

**参数：**

- **collection_name** （*string*） -

    现有 Collection 的名称。

- **function_name** （*string*） -

    要删除的函数的名称。

- **timeout** （*number*） -

    允许执行 RPC 的可选时长，单位为毫秒。该值默认为 undefined。

**返回：**

*ResStatus*

由 Schema 变更返回的变更状态。

**参数：**

- **error_code** （*number*） -

    错误代码编号：0 表示成功。

- **reason** （*string*） -

    错误的原因（如有）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息，以了解确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.dropFunctionField({
  collection_name: 'my_collection',
  function_name: 'bm25_fn',
});
```
