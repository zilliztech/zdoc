---
title: "deleteEntities() | Node.js"
slug: /node/node/Vector-deleteEntities
sidebar_label: "deleteEntities()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用布尔表达式或过滤器从 Collection 中删除 Entity。 | Node.js"
type: origin
token: shared-Vector-deleteEntities
keywords: 
  - 删除 Entity
  - 删除
  - 布尔表达式
  - zilliz
  - zilliz cloud
  - 云
  - deleteEntities()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# deleteEntities()

此操作使用布尔表达式或过滤器从 Collection 中删除 Entity。

```javascript
await milvusClient.deleteEntities(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.deleteEntities({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   expr?: string,
   filter?: string,
   exprValues?: keyValueObj,
   consistency_level: ConsistencyLevelEnum,
   timeout?: number
 })
```

**参数：**

- **db_name** （*string*） -

    保存目标 Collection 的 Database 名称。

- **collection_name** （*string*） -

    **[必需]**

    现有 Collection 的名称。

- **partition_name** （*string*） -

    Collection 中现有 Partition 的名称。

- **expr** （*string*） -

    用于筛选要删除的 Entity 的布尔表达式。请提供 `expr` 或 `filter`，但不要同时提供两者。

- **filter** （*string*） -

    过滤表达式。这是 `expr` 的别名，并且优先于此参数。

- **exprValues** （*keyValueObj*） -

    过滤表达式的模板值，例如 `{ key: 'value' }`。

- **consistency_level** （*ConsistencyLevelEnum*） -

    目标 Collection 的一致性级别。该值默认为 **Bounded**（**2**），可选值为 **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）和 **Eventually**（**3**）。请参见 [ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum)。

- **timeout** （*number*） -

    此操作的超时时长。

    将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

**返回：**

*Promise&lt;MutationResult&gt;*

此方法返回一个 Promise，该 Promise 会解析为 **MutationResult** 对象。

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

- **succ_index** （*number[]*） -
输入 Entity 中与表达式匹配并已标记为删除的从零开始的位置。

- **err_index** （*number[]*） -
输入 Entity 中未匹配任何行的从零开始的位置。

- **acknowledged** （*boolean*） -
Milvus 是否已确认此删除操作。

- **insert_cnt** （*string*） -
对于 `deleteEntities()`，始终为 **"0"**。

- **delete_cnt** （*string*） -
此操作逻辑删除的行数。

- **upsert_cnt** （*string*） -
对于 `deleteEntities()`，始终为 **"0"**。

- **timestamp** （*string*） -
该删除操作变为可见时的混合时间戳。

- **IDs** （*[StringArrayId](./Vector-StringArrayId)* | *[NumberArrayId](./Vector-NumberArrayId)*） -

此删除操作针对的主键。有关完整的字段参考，请参见 `insert()` 文档。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** （*number*） -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** （*string* | *number*） -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** （*string*） -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.deleteEntities({
    collection_name: 'my_collection',
    expr: 'id in [1, 2, 3]',
});
```
