---
title: "delete() | Node.js"
slug: /node/node/Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过 Entity ID 或布尔表达式删除 Entity。 | Node.js"
type: docx
token: KOZHdyeQvo4htOxhO8BcbEudnNd
sidebar_position: 2
keywords: 
  - 低成本向量 Database
  - 托管式向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - zilliz
  - zilliz cloud
  - 云
  - delete()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# delete()

此操作通过 Entity ID 或布尔表达式删除 Entity。

```javascript
await milvusClient.delete(data)
```

## 请求语法\{#request-syntax}

此方法具有以下几种形式。

### 使用 DeleteByIdsReq\{#with-deletebyidsreq}

```javascript
await milvusClient.delete({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   ids: string[] | number[],
   consistency_level: ConsistencyLevelEnum,
   exprValues?: keyValueObj,
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    保存目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **partition_name** (*string*) -

    Collection 中现有 Partition 的名称。

- **ids** (*string[]* | *number[]*) -

    **[必需]**

    特定的 Entity ID 或 Entity ID 列表。

    该值默认为 **None**，表示应用标量过滤条件。

- **consistency_level** (*ConsistencyLevelEnum*) -

    目标 Collection 的一致性级别。该值默认为 **Bounded**（**2**），可选值为 **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）和 **Eventually**（**3**）。请参见 ConsistencyLevelEnum。

- **exprValues** (*keyValueObj*) -

    如果在过滤表达式中使用占位符，您可以将这些占位符的实际值指定为键值对。

- **timeout** (*number*) -

    此操作的超时时长。

    将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

### 使用 DeleteByFilterReq\{#with-deletebyfilterreq}

```javascript
await milvusClient.delete({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   filter: string,
   consistency_level: ConsistencyLevelEnum,
   exprValues?: keyValueObj,
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    保存目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **partition_name** (*string*) -

    Collection 中现有 Partition 的名称。

- **filter** (*string*) -

    **[必需]**

    用于匹配要删除的 Entity 的标量过滤条件。

- **consistency_level** (*ConsistencyLevelEnum*) -

    目标 Collection 的一致性级别。该值默认为 **Bounded**（**2**），可选值为 **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）和 **Eventually**（**3**）。请参见 ConsistencyLevelEnum。

- **exprValues** (*keyValueObj*) -

    如果在过滤表达式中使用占位符，您可以将这些占位符的实际值指定为键值对。

- **timeout** (*number*) -

    此操作的超时时长。

    将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

**返回：**

*Promise&lt;MutationResult&gt;*

此方法返回一个 promise，解析为 **MutationResult** 对象。

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
匹配到一行并已标记为删除的输入 ID 的从零开始的位置。

- **err_index** (*number[]*) -
未匹配到任何行的输入 ID 的从零开始的位置。

- **acknowledged** (*boolean*) -
Milvus 是否已确认此删除操作。

- **insert_cnt** (*string*) -
对于 `delete()`，始终为 **"0"**。

- **delete_cnt** (*string*) -
此操作逻辑删除的行数。

- **upsert_cnt** (*string*) -
对于 `delete()`，始终为 **"0"**。

- **timestamp** (*string*) -
该删除操作变为可见时的混合时间戳。

- **IDs** (*StringArrayId* | *NumberArrayId*) -

此删除操作针对的主键。有关完整的字段参考，请参见 `insert()` 文档。

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

## 示例\{#examples}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.delete({
   collection_name: 'my_collection',
   ids: [1,2,3,4]
 });
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

// Delete by IDs
const resStatus1 = await milvusClient.delete({
    collection_name: 'my_collection',
    ids: [1, 2, 3, 4],
});

// Delete by filter
const resStatus2 = await milvusClient.delete({
    collection_name: 'my_collection',
    filter: 'id in [5, 6, 7, 8]',
});
```

</TabItem>
</Tabs>
