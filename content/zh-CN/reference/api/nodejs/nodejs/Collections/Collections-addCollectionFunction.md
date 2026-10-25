---
title: "addCollectionFunction() | Node.js"
slug: /node/node/Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 添加一个函数。 | Node.js"
type: docx
token: VyADdglU4ohvGTxHuwTc6yBRnTe
sidebar_position: 21
keywords: 
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - IVF
  - zilliz
  - Zilliz Cloud
  - 云
  - addCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# addCollectionFunction()

此操作会向现有 Collection 添加一个函数。

## 请求语法\{#request-syntax}

```typescript
milvusClient.addCollectionFunction({ collection_name, function, db_name?, timeout? })
```

**参数：**

- **collection_name** （*string*） -

    现有 Collection 的名称。

- **function** （*FunctionObject*） -

    要添加到 Collection 的函数对象。

- **db_name** （*string*） -

    包含该 Collection 的 Database 名称。

- **timeout** （*number*） -

    供 RPC 使用的可选时长，以毫秒为单位。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

**返回：**

*ResStatus*

此操作的响应状态采用 `{error_code, reason}` 的形式。

**参数：**

- **error_code** （*number*） -

    错误代码编号：0 表示成功。

- **reason** （*string*） -

    错误的原因（如果有）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息，以获取确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.addCollectionFunction({
  collection_name: 'my_collection',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
});
```
