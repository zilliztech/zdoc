---
title: "alterCollectionSchema() | Node.js"
slug: /node/node/Collections-alterCollectionSchema
sidebar_label: "alterCollectionSchema()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会修改现有 Collection 的 Schema。 | Node.js"
type: docx
token: VD1AddhBlo14dnxad79cWBEinMe
sidebar_position: 30
keywords: 
  - 修改 Schema
  - 函数
  - Schema
  - Zilliz
  - Zilliz Cloud
  - 云
  - alterCollectionSchema()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# alterCollectionSchema()

此操作通过添加一个由函数支持的输出字段来修改 Collection Schema。对于向量函数输出，请提供包含显式 `index_type` 的绑定索引元数据；Milvus 会在修改 Schema 的同时原子性地创建绑定索引。

```javascript
await milvusClient.alterCollectionSchema(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.alterCollectionSchema({
    collection_name: string,
    field: FieldType,
    function: FunctionObject,
    index_name?: string,
    extra_params?: Record<string, any>,
    db_name?: string,
    timeout?: number
})
```

**参数：**

- **collection_name** （*string*） -

    **[必需]**

    要修改的 Collection 的名称。

- **field** （*[FieldType](./Collections-FieldType)*） -

    **[必需]**

    要添加的函数输出字段的 Schema。

- **function** （*[FunctionObject](./Collections-FunctionObject)*） -

    **[必需]**

    要添加的函数 Schema。

- **index_name** （*string*） -

    新字段的绑定索引的名称。

- **extra_params** （*Record&lt;string, any&gt;*） -

    附加字段元数据。

- **db_name** （*string*） -

    Collection 所在的 Database 的名称。

- **timeout** （*number*） -

    此操作的超时时间，单位为毫秒。

**返回：**

*Promise&lt;AlterCollectionSchemaResponse&gt;*

此方法返回一个 Promise，其解析结果为 **AlterCollectionSchemaResponse** 对象。

```javascript
{
    alter_status: ResStatus,
    index_status?: ResStatus
}
```

**参数：**

- **alter_status** （*ResStatus*） -

    一个 **ResStatus** 对象，用于报告 Schema 修改是否成功。

    - **code** （*number*） -

        指示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** （*string* | *number*） -

        指示所发生错误的错误码。如果此操作成功，则该值保持为 **Success**。

    - **reason** （*string*） -

        指示所报告错误原因的说明。如果此操作成功，则该值为空字符串。

- **index_status** （*ResStatus*） -

    已弃用。此成员已从 `AlterCollectionSchema` 的响应报文中移除。请改用 **alter_status**。

**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient, DataType, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.alterCollectionSchema({
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
});
```
