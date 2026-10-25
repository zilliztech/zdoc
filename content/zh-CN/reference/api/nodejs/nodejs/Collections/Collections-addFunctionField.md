---
title: "addFunctionField() | Node.js"
slug: /node/node/Collections-addFunctionField
sidebar_label: "addFunctionField()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 添加由函数支持的输出字段及其绑定索引。 | Node.js"
type: docx
token: BjKLdh2SFouRSbxELaqc9b4tnts
sidebar_position: 29
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - zilliz
  - zilliz cloud
  - 云
  - addFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# addFunctionField()

此操作会向现有 Collection 添加由函数支持的输出字段及其绑定索引。

## 请求语法\{#request-syntax}

```typescript
milvusClient.addFunctionField({ collection_name, field, function, extra_params, index_name?, db_name?, timeout? })
```

**参数：**

- **collection_name**（*string*）-

    现有 Collection 的名称。

- **field**（*FieldType*）-

    要添加的函数输出字段 Schema。

- **function**（*FunctionObject*）-

    要添加的函数 Schema。

- **extra_params**（*FunctionFieldIndexParams*）-

    绑定索引的索引参数。必须提供显式的 `index_type`，且不能使用 AUTOINDEX。

- **index_name**（*string*）-

    新字段绑定索引的名称。

- **db_name**（*string*）-

    包含该 Collection 的 Database 名称。

- **timeout**（*number*）-

    允许 RPC 执行的可选时长，以毫秒为单位。该值默认为 undefined。

**返回类型：**

*ResStatus*

**返回：**

Schema 更改的状态。

**参数：**

- **error_code**（*number*）-

    错误代码编号：0 表示成功。

- **reason**（*string*）-

    错误的原因（如有）。

**异常：**

- **MilvusError**

    当服务器拒绝该请求或 RPC 失败时引发。请检查服务器错误消息以了解确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.addFunctionField({
  collection_name: 'my_collection',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
  field: {
    name: 'sparse_vector',
    type: 'SparseFloatVector',
  },
  extra_params: {
    index_type: 'SPARSE_INVERTED_INDEX',
    metric_type: 'IP',
  },
});
```
