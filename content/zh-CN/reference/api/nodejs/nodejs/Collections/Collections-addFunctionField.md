---
title: "addFunctionField() | Node.js"
slug: /node/node/Collections-addFunctionField
sidebar_label: "addFunctionField()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向 Collection Schema 添加一个字段以及一个函数。 | Node.js"
type: docx
token: BjKLdh2SFouRSbxELaqc9b4tnts
sidebar_position: 29
keywords: 
  - 添加字段
  - bm25
  - 函数
  - zilliz
  - zilliz cloud
  - 云
  - addFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# addFunctionField()

此操作会向现有 Collection 添加一个由函数支持的向量字段及其绑定索引。

```javascript
await milvusClient.addFunctionField(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.addFunctionField({
    collection_name: string,
    field: FieldType,
    function: FunctionObject,
    index_name?: string,
    extra_params: FunctionFieldIndexParams,
    db_name?: string,
    timeout?: number
})
```

**参数：**

- **collection_name** （*string*） -

    **[必需]**

    要在其中添加由函数支持的字段的 Collection 的名称。

- **field** （*[FieldType](./Collections-FieldType)*） -

    **[必需]**

    函数输出字段的 Schema。请参见 [FieldType](./Collections-FieldType)。

- **function** （*[FunctionObject](./Collections-FunctionObject)*） -

    **[必需]**

    函数 Schema。请参见 [FunctionObject](./Collections-FunctionObject)。

- **index_name** （*string*） -

    新字段绑定索引的名称。

- **extra_params** （*FunctionFieldIndexParams*） -

    **[必需]**

    绑定索引元数据，其中必须显式提供 `index_type`。不支持 `AUTOINDEX`。

- **db_name** （*string*） -

    Collection 所在 Database 的名称。

- **timeout** （*number*） -

    此操作的超时时长，单位为毫秒。

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 promise，该 promise 解析为 **ResStatus** 对象。

**异常：**

- **Error**

    在此操作期间发生任何错误时，都将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient, DataType, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.addFunctionField({
    collection_name: 'my_collection',
    field: {
        name: 'sparse_vector',
        data_type: DataType.SparseFloatVector,
        is_function_output: true,
    },
    function: {
        name: 'my_bm25_function',
        type: FunctionType.BM25,
        input_field_names: ['text'],
        output_field_names: ['sparse_vector'],
        params: {},
    },
    index_name: 'sparse_vector_index',
    extra_params: {
        index_type: 'SPARSE_INVERTED_INDEX',
        params: { metric_type: 'BM25' },
    },
});
```
