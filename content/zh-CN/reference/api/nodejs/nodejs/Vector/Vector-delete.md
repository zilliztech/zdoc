---
title: "delete() | Node.js"
slug: /node/node/Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过实体 ID 或布尔表达式删除实体。 | Node.js"
type: docx
token: KOZHdyeQvo4htOxhO8BcbEudnNd
sidebar_position: 2
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# delete()

此操作通过实体 ID 或布尔表达式删除实体。

```javascript
await milvusClient.delete(data)
```

## 请求语法\{#request-syntax}

此方法有以下几种形式。

### 使用 DeleteByIdsReq\{#with-deletebyidsreq}

```javascript
await milvusClient.delete({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   ids: string[] | number[],
   consistency_level: string,
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    包含目标集合的数据库名称。

- **collection_name** (*string*) -

    **[REQUIRED]**

    已存在集合的名称。

- **partition_name** (*string*) -

    集合中已存在分区的名称。

- **ids** (*string[]* | *number[]*) -

    **[REQUIRED]**

    单个实体 ID 或实体 ID 列表。

    默认值为 **None**，表示应用标量过滤条件。

- **consistency_level** (*ConsistencyLevelEnum*) -

    目标集合的一致性级别。默认值为 **Bounded** (**1**)，可选值包括 **Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**) 和 **Eventually** (**3**)。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回值** *Promise&lt;MutationResult&gt;*

此方法返回一个 promise，该 promise 解析为一个 **MutationResult** 对象。

```typescript
{
    succ_index: number[],
    err_index: number[],
    acknowledged: boolean,
    insert_cnt: string,
    delete_cnt: string,
    upsert_cnt: string,
    timestamp: string,
    IDs: { int_id?: { data: number[] }, str_id?: { data: string[] }, id_field: 'int_id' | 'str_id' },
    status:  ResStatus
}
```

**参数：**

- **succ_index** (*number[]*) -<br/>
  与某一行匹配并被标记为已删除的输入 ID 的从零开始位置。

- **err_index** (*number[]*) -<br/>
  未与任何行匹配的输入 ID 的从零开始位置。

- **acknowledged** (*boolean*) -<br/>
  删除操作是否已被 Milvus 确认。

- **insert_cnt** (*string*) -<br/>
  对于 `delete()`，始终为 **"0"**。

- **delete_cnt** (*string*) -<br/>
  此操作逻辑删除的行数。

- **upsert_cnt** (*string*) -<br/>
  对于 `delete()`，始终为 **"0"**。

- **timestamp** (*string*) -<br/>
  删除操作变为可见时的混合时间戳。

- **IDs** (*StringArrayId* | *NumberArrayId*) -<br/>
  此次删除操作所针对的主键。完整字段说明请参见 `insert()` 文档。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则始终为空字符串。

## 示例\{#example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
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

```java
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
