---
title: "alterCollectionSchema() | Node.js"
slug: /node/node/Collections-alterCollectionSchema
sidebar_label: "alterCollectionSchema()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向 Collection Schema 添加一个由函数支持的输出字段。 | Node.js"
type: docx
token: VD1AddhBlo14dnxad79cWBEinMe
sidebar_position: 30
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - 云
  - alterCollectionSchema()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionSchema()

此操作会向 Collection Schema 添加一个由函数支持的输出字段。

## 请求语法\{#request-syntax}

```typescript
milvusClient.alterCollectionSchema({ collection_name, field, function, db_name?, timeout? })
```

**参数：**

- **collection_name** (*string*) -

    现有 Collection 的名称。

- **field** (*FieldType*) -

    要添加的函数输出字段 Schema。

- **function** (*FunctionObject*) -

    要添加的函数 Schema。

- **db_name** (*string*) -

    包含该 Collection 的 Database 名称。

- **timeout** (*number*) -

    可选的 RPC 超时时间，单位为毫秒。

**返回类型：**

*AlterCollectionSchemaResponse*

**返回：**

Milvus 返回的响应。`index_status` 字段已从网络响应中移除，仅为兼容性而保留。

**参数：**

- **alter_status** (*ResStatus*) -

    Schema 变更的 alter 状态：`{error_code, reason}`。

- **index_status** (*ResStatus*) -

    已弃用并从网络响应中移除；仅为兼容性而保留。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.alterCollectionSchema({
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
});
```
