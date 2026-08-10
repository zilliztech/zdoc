---
title: "query() | Node.js"
slug: /node/node/Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用指定的布尔表达式执行标量过滤。 | Node.js"
type: docx
token: Nle5dNFMuoy3MgxGIFGcJDWtnpg
sidebar_position: 6
keywords: 
  - 问答系统
  - llm-as-a-judge
  - 混合向量搜索
  - 视频去重
  - zilliz
  - zilliz cloud
  - cloud
  - query()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# query()

此操作使用指定的布尔表达式执行标量过滤。

```javascript
await milvusClient.query(data)
```

## 请求语法\{#request-syntax}

```javascript
 milvusClient.query({
    db_name: string,
    collection_name: string,
    partition_names?: string[];
    output_fields?: string[];
    ids?: string[] | number[];
    filter?: string;
    offset?: number;
    limit?: number;
    consistency_level?: ConsistencyLevelEnum;
    exprValues?: keyValueObj;
})
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **partition_names** (*string[]*) -

    要查询的 Partition 名称。

- **output_fields** (*string[]*) -

    返回的每个 Entity 中要包含的字段名称列表。

    该值默认为 **None**。如果未指定，则选择所有字段作为输出字段。

- **ids** (*string[]* | *number[]*) - 

    要查询的 Entity 的 ID。

- **filter** (*string*) -

    用于过滤匹配 Entity 的标量过滤条件。 

    您可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参见 [布尔表达式规则](https://milvus.io/docs/boolean.md)。 

- **offset** (*number*) -

    查询结果中要跳过的记录数。 

    您可以将此参数与 `limit` 结合使用以启用分页。

    此值与 `limit` 的总和应小于 16,384。 

- **limit** (*number*) -

    查询结果中要返回的记录数。

    您可以将此参数与 `offset` 结合使用以启用分页。

    此值与 `offset` 的总和应小于 16,384。 

- **consistency_level** (*ConsistencyLevelEnum*) -

    目标 Collection 的一致性级别。

    该值默认为您创建当前 Collection 时指定的值，可选项包括 **Strong**（**0**）、**Bounded**（**1**）、**Session**（**2**）和 **Eventually**（**3**）。

    <Admonition type="info" icon="📘" title="Note">

    什么是一致性级别？
    
        分布式 Database 中的一致性，特指在某一时刻写入或读取数据时，确保每个节点或副本对数据具有相同视图的特性。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认设置为 **Bounded Staleness**。
    
        在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **timeout** (*number*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

- **order_by_fields** (*OrderByFields*) -

    用于对查询结果进行排序的字段。可选。

- **order_by** (*OrderByFields*) -

    order_by_fields 的别名。可选。

**返回值** *Promise&lt;QueryResults&gt;*

此方法返回一个 promise，该 promise 会解析为 **QueryResults** 对象。

```typescript
{
    data: Record<string, any>[],
    status:  ResStatus
}
```

**参数：**

- **data** (*Record&lt;string, any&gt;[]*) -<br/>
  匹配到的行。每个条目都以字段名为键，并包含每个所请求 **output_fields** 条目的值以及主键。当 Collection 上的 **enable_dynamic_field** 为 **true** 时，动态字段值会与已声明字段一起内联显示。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const queryResults = await milvusClient.query({
   collection_name: 'my_collection',
   filter: "age in [1,2,3,4,5,6,7,8]",
   output_fields: ["age"],
 });
```

