---
title: "alterCollectionFunction() | Node.js"
slug: /node/node/Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会修改 Collection 中的现有函数。 | Node.js"
type: docx
token: McjWdWlspoubE4x3atYc4Fn9n3c
sidebar_position: 22
keywords: 
  - knn
  - 图像搜索
  - LLMs
  - 机器学习
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionFunction()

此操作会修改 Collection 中的现有函数。

## 请求语法\{#request-syntax}

```typescript
milvusClient.alterCollectionFunction({ collection_name, function_name, function, db_name?, timeout? })
```

**参数：**

- **collection_name** （*string*） -

    现有 Collection 的名称。

- **function_name** （*string*） -

    要修改的函数名称。

- **function** （*FunctionObject*） -

    替换后的函数 Schema。

- **db_name** （*string*） -

    该 Collection 所在的 Database 名称。

- **timeout** （*number*） -

    允许 RPC 的可选时长，以毫秒为单位。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

**返回：**

*ResStatus*

此操作的响应状态具有 `{error_code, reason}` 的结构。

**参数：**

- **error_code** （*number*） -

    错误码编号：0 表示成功。

- **reason** （*string*） -

    错误原因（如有）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息，以确认确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.alterCollectionFunction({
  collection_name: 'my_collection',
  function_name: 'bm25_fn',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
});
```
