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
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
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

    保存目标集合的数据库名称。

- **collection_name** (*string*) -

    **[必需]**

    已存在集合的名称。

- **partition_names** (*string[]*) -

    要查询的分区名称。

- **output_fields** (*string[]*) -

    返回的每个实体中要包含的字段名称列表。

    该值默认为 **None**。如果未指定，则选择所有字段作为输出字段。

- **ids** (*string[]* | *number[]*) - 

    要查询的实体 ID。

- **filter** (*string*) -

    用于筛选匹配实体的标量过滤条件。 

    你可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参见 [布尔表达式规则](https://milvus.io/docs/boolean.md)。 

- **offset** (*number*) -

    在查询结果中要跳过的记录数。 

    你可以将此参数与 `limit` 结合使用以启用分页。

    此值与 `limit` 之和应小于 16,384。 

- **limit** (*number*) -

    查询结果中要返回的记录数。

    你可以将此参数与 `offset` 结合使用以启用分页。

    此值与 `offset` 之和应小于 16,384。 

- **consistency_level** (*ConsistencyLevelEnum*) -

    目标集合的一致性级别。

    该值默认为创建当前集合时指定的值，可选项包括 **Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**) 和 **Eventually** (**3**)。

    <Admonition type="info" icon="📘" title="说明">

    什么是一致性级别？
    
        在分布式数据库中，一致性特指这样一种属性：在给定时间写入或读取数据时，确保每个节点或副本看到的数据视图相同。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认设置为 **Bounded Staleness**。
    
        在执行向量相似性搜索或查询时，你可以轻松调整一致性级别，以使其最适合你的应用程序。

    </Admonition>

- **timeout** (*number*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

- **order_by_fields** (*OrderByFields*) -

    用于对查询结果进行排序的字段。可选。

- **order_by** (*OrderByFields*) -

    `order_by_fields` 的别名。可选。

**返回值** *Promise&lt;QueryResults&gt;*

此方法返回一个 Promise，该 Promise 解析为一个 **QueryResults** 对象。

```typescript
{
    data: Record<string, any>[],
    status:  ResStatus
}
```

**参数：**

- **data** (*Record&lt;string, any&gt;[]*) -<br/>
  匹配到的行。每个条目都以字段名为键，并包含每个请求的 **output_fields** 条目的值以及主键。当集合上的 **enable_dynamic_field** 为 **true** 时，动态字段的值会与已声明字段一起以内联方式出现。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        指示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        指示发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的原因说明。如果此操作成功，则该值保持为空字符串。

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

