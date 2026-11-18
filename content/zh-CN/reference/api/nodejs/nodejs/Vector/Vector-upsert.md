---
title: "upsert() | Node.js"
slug: /node/node/Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在指定 Collection 中插入或更新数据。 | Node.js"
type: docx
token: LEptdqqfcoqdtCx0LO1c3yxvnBo
sidebar_position: 8
keywords: 
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - zilliz
  - zilliz cloud
  - 云
  - upsert()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# upsert()

此操作会在指定 Collection 中插入或更新数据。

```javascript
await milvusClient.upsert(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.upsert({
    db_name?: string,
    collection_name: string,
    data: RowData[],
    fields_data?: RowData[],
    hash_keys?: number[],
    transformers?: InsertTransformers,
    skip_check_schema?: boolean,
    partial_update?: boolean,
    field_ops?: FieldPartialUpdateOp[],
    partition_name?: string,
    timeout?: number,
})
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **data** (*RowData[]*) -

    要 upsert 的数据。每个元素都是一个普通 JavaScript 对象，其键与 Collection Schema 的字段名称匹配。主键与现有记录匹配的 Entity 会被更新；否则会插入新的 Entity。请通过 **data** 或 **fields_data** 之一提供数据。

- **db_name** (*string*) -

    包含目标 Collection 的 Database 名称。

- **hash_keys** (*number[]*) -

    保留供内部使用。除非明确要求，否则请勿设置此参数。

- **fields_data** (*RowData[]*) -

    **data** 的别名。您可以通过其中任一键传入这些行；请勿同时设置两者。

- **transformers** (*InsertTransformers*) -

    用于 `BFloat16Vector` 和 `Float16Vector` 数据的自定义数据转换器。可选。

- **skip_check_schema** (*boolean*) -

    是否在 upsert 前跳过 Schema 检查。可选。

- **partial_update** (*boolean*) -

    是否启用部分更新。设置为 `true` 时，您只需在 `data` 中包含需要更新的字段；未包含的字段会保留其现有值。

- **partition_name** (*string*) -

    当前 Collection 中某个 Partition 的名称。如果指定，数据将 upsert 到该 Partition 中。

- **timeout** (*number*) -

    此操作的超时时长。将其设置为 `None` 表示当收到任意响应或发生任意错误时，此操作即超时。

- **field_ops** (*FieldPartialUpdateOp[]*) -

    数组字段的部分更新操作。可选。

**返回：**

*Promise&lt;MutationResult&gt;*

此方法返回一个 promise，该 promise 会解析为 **MutationResult** 对象。

```javascript
{
    succ_index: number[],
    err_index: number[],
    acknowledged: boolean,
    insert_cnt: string,
    delete_cnt: string,
    upsert_cnt: string,
    timestamp: string,
    IDs: { int_id?: { data: number[] }, str_id?: { data: string[] } },
    status:  ResStatus
}
```

**参数：**

- **succ_index** (*number[]*) -
成功 upsert 的各行在输入数据中的从零开始位置。

- **err_index** (*number[]*) -
被拒绝的各行的从零开始位置。当所有行都成功时，此列表为空。

- **acknowledged** (*boolean*) -
写入是否已由 Milvus 确认。

- **insert_cnt** (*string*) -
此操作新插入的行数，以字符串格式表示。

- **delete_cnt** (*string*) -
为给替换项腾出空间而逻辑删除的行数。

- **upsert_cnt** (*string*) -
此操作执行 upsert 的总行数。

- **timestamp** (*string*) -
写入变为可见时的混合时间戳。

- **IDs** (*StringArrayId* | *NumberArrayId*) -

已 upsert 的各行所携带的主键。有关完整的字段参考，请参见 `insert()` 文档。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

// Upsert a single entity
const result = await milvusClient.upsert({
    collection_name: 'my_collection',
    data: [
        { id: 0, vector: [0.62, 0.59, 0.85, 0.93, -0.42], color: 'grass-green' },
    ],
});

// Upsert multiple entities
const result2 = await milvusClient.upsert({
    collection_name: 'my_collection',
    data: [
        { id: 1, vector: [0.37, -0.94, 0.92, 0.50, -0.56], color: 'mud-brown' },
        { id: 2, vector: [0.47, -0.53, -0.83, 0.98, 0.63], color: 'violet-purple' },
    ],
});

console.log(result2.upsert_cnt);
```
