---
title: "count() | Node.js"
slug: /node/node/Vector-count
sidebar_label: "count()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于统计与指定过滤表达式匹配的 Entity 数量。 | Node.js"
type: docx
token: NaOadUNSpo1EsIxPMSfc0R4Hnfb
sidebar_position: 1
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - zilliz
  - zilliz cloud
  - 云
  - count()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# count()

此操作用于统计与指定过滤表达式匹配的 Entity 数量。

```javascript
await milvusClient.count(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.count({
    db_name?: string,
    collection_name: string,
    expr?: string,
    filter?: string,
    exprValues?: keyValueObj,
    partition_names?: string[],
    consistency_level?: ConsistencyLevelEnum,
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    保存目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必填]**

    要统计的 Collection 的名称。

- **expr** (*string*) -

    用于筛选匹配 Entity 的标量过滤条件。 

    您可以将此参数设置为空字符串，以跳过标量过滤。要构建标量过滤条件，请参见 [布尔表达式规则](https://milvus.io/docs/boolean.md)。 

- **filter** (*string*) -

    **expr** 的别名，用于指定过滤条件。

- **exprValues** (*keyValueObj*) -

    如果您按照 [Filtering Templating](https://milvus.io/docs/filtering-templating.md) 中所述，选择在 `filter` 中使用占位符，则可以将这些占位符的实际值以键值对的形式指定为此参数的值。

- **partition_names** (*string[]*) -

    要统计的 Partition 名称列表。

- **consistency_level** (*ConsistencyLevelEnum*) -

    目标 Collection 的一致性级别。该值默认为 **Bounded**（**2**），可选值为 **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）和 **Eventually**（**3**）。请参见 [ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum)。

- **timeout** (*number*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回：**

*Promise&lt;CountResult&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **CountResult** 对象。

```javascript
{
    data: number,
    status:  ResStatus
}
```

**参数：**

- **data** (*number*) -
该 Collection 中与提供的过滤表达式匹配的行数。如果未提供表达式，则为总行数。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的状态码。如果此操作成功，则该值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则该值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则该值始终为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const num_entities = await milvusClient.count({
   collection_name: 'my_collection',
   expr: "age in [1,2,3,4,5,6,7,8]",
});

// 1000
```
