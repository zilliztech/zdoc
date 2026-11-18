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
  - LLM 作为评判者
  - 混合向量搜索
  - 视频去重
  - Zilliz
  - Zilliz Cloud
  - 云
  - query()
  - nodejs30
displayed_sidebar: nodeSidebar

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
    expr?: string;
    offset?: number;
    limit?: number;
    consistency_level?: ConsistencyLevelEnum;
    exprValues?: keyValueObj;
    group_by_fields?: string[];
    transformers?: OutputTransformers;
    params?: keyValueObj;
})
```

**参数：**

- **db_name** （*string*） -

    包含目标 Collection 的 Database 的名称。

- **collection_name** （*string*） -

    **[必需]**

    现有 Collection 的名称。

- **partition_names** （*string[]*） -

    要查询的 Partition 名称。

- **output_fields** （*string[]*） -

    要在返回的每个 Entity 中包含的字段名列表。

    该值默认为 **None**。如果未指定，则会选择所有字段作为输出字段。

- **ids** （*string[]* | *number[]*） - 

    要查询的 Entity 的 ID。

- **filter** （*string*） -

    用于筛选匹配 Entity 的标量过滤条件。 

    您可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参见 [布尔表达式规则](https://milvus.io/docs/boolean.md)。 

- **expr** （*string*） -

    **filter** 的别名。请提供 **filter** 或 **expr**，不能同时提供两者。

- **exprValues** （*keyValueObj*） -

    如果您选择按照[过滤表达式模板](https://milvus.io/docs/filtering-templating.md)中所述，在 `filter` 中使用占位符，则可以将这些占位符的实际值以键值对的形式指定为此参数的值。

- **offset** （*number*） -

    查询结果中要跳过的记录数。 

    您可以将此参数与 `limit` 结合使用以启用分页。

    此值与 `limit` 的总和应小于或等于 16,384。 

- **limit** （*number*） -

    查询结果中要返回的记录数。

    您可以将此参数与 `offset` 结合使用以启用分页。

    此值与 `offset` 的总和应小于或等于 16,384。 

- **consistency_level** （*ConsistencyLevelEnum*） -

    目标 Collection 的一致性级别。请参见 ConsistencyLevelEnum。

    该值默认为您创建当前 Collection 时指定的值，可选值为 **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）和 **Eventually**（**3**）。

    <Admonition type="info" icon="📘" title="Notes">
    
    分布式 Database 中的一致性具体指这样一项特性：在给定时间写入或读取数据时，确保每个节点或副本对数据具有相同的视图。
    
    Milvus 支持四种一致性级别：**Strong**、**Bounded Staleness**、**Session** 和 **Eventually**。Milvus 中的默认一致性级别为 **Bounded Staleness**。
    
    您可以在执行向量相似度搜索或查询时轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **timeout** （*number*） -

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

- **order_by_fields** （*OrderByFields*） -

    用于对查询结果排序的字段。可选。

- **order_by** （*OrderByFields*） -

    order_by_fields 的别名。可选。

- **group_by_fields** （*string[]*） -

    用于对聚合结果进行分组的标量字段。可选。

- **transformers** （*OutputTransformers*） -

    用于转换特定数据类型的数据的自定义函数。可选。

- **params** （*keyValueObj*） -

    以键值对形式提供的其他查询参数。可选。

**返回：**

*Promise&lt;QueryResults&gt;*

此方法返回一个 Promise，该 Promise 解析为 **QueryResults** 对象。

```javascript
{
    data: Record<string, any>[],
    status:  ResStatus
}
```

**参数：**

- **data** （*Record&lt;string, any&gt;[]*） -
匹配的行。每个条目均以字段名作为键，并包含所请求的每个 **output_fields** 条目对应的值以及主键。当 Collection 上的 **enable_dynamic_field** 为 **true** 时，动态字段值会与已声明字段一起内联显示。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** （*number*） -

        指示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** （*string* | *number*） -

        指示所发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** （*string*） -

        用于说明所报告错误的原因。如果此操作成功，则该值为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
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
