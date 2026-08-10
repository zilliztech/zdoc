---
title: "search() | Node.js"
slug: /node/node/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作执行向量相似性搜索，并可选择使用标量过滤表达式。 | Node.js"
type: docx
token: HYv3d0NiRoc09Bx4rz0cIhqknb5
sidebar_position: 7
keywords: 
  - 多模态 RAG
  - llm 幻觉
  - 混合搜索
  - 词法搜索
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# search()

此操作执行向量相似性搜索，并可选择使用标量过滤表达式。

```javascript
await milvusClient.search(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.search({
  db_name?: string,
  collection_name: string,
  partition_names?: string[];
  anns_field?: string; 
  data?: SearchDataType;
  output_fields?: string[];
  limit?: number;
  offset?: number;
  filter?: string;
  exprValues?: keyValueObj;
  params?: keyValueObj;
  consistency_level?: ConsistencyLevelEnum;
  ignore_growing?: boolean;
  group_by_field?: string;
  group_size?: number;
  strict_group_size?: boolean;
  hints?: string;
  round_decimal?: number;
  transformers?: OutputTransformers;
  rerank?: RankerObj | FunctionObject | FunctionScore;
})
```

**参数：**

- **db_name** (*string*) -

    目标 Collection 所属的 Database 名称。

- **collection_name** (*string*) -

    **[必填]**

    要搜索的 Collection 名称

- **partition_names** (*string[]*) -

    要搜索的 Partition 名称列表。

- **anns_field** (*string*) -

    此操作的目标向量字段名称。如果您在具有多个向量字段的 Collection 中进行搜索，则此参数为必填。

- **data** (*number[]* | *number[][]*) -

    向量嵌入列表。

    Zilliz Cloud 会搜索与指定向量嵌入最相似的结果。

- **output_fields** (*string[]*) -

    返回时包含在每个 Entity 中的字段名称列表。

    默认值为 **None**。如果未指定，则仅包含主字段。

- **limit** (*number*) - 

    返回的 Entity 总数。

    您可以将此参数与 **param** 中的 **offset** 结合使用，以启用分页。

    此值与 **param** 中 **offset** 的总和应小于 16,384。 

    但是，在分组搜索中，`limit` 指定的是要返回的最大组数，而不是单个 Entity 的数量。每个组都基于指定的 `group_by_field` 形成。

- **offset** (*number*) - 

    搜索结果中要跳过的记录数。 

    您可以将此参数与 `limit` 结合使用，以启用分页。

    此值与 `limit` 的总和应小于 16,384。 

- **filter** (*string*) -

    用于筛选匹配 Entity 的标量过滤条件。 

    默认值为空字符串，表示不应用任何条件。

    您可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参见 [布尔表达式规则](https://milvus.io/docs/boolean.md)。 

- **exprValues** (*keyValueObj*) -

    如果您选择按照 [过滤模板](/docs/filtering-templating) 中所述，在 `filter` 中使用占位符，则可以将这些占位符的实际值以键值对形式指定为此参数的值。

- **params** (*KeyValueObj*) -

    附加搜索参数，采用键值对形式。

    - **radius** (*number*) -

        确定最低相似度阈值。当将 `metric_type` 设置为 `L2` 时，请确保该值大于 **range_filter** 的值。否则，该值应小于 **range_filter** 的值。 

    - **range_filter**  (*number*) -  

        将搜索范围细化为特定相似度区间内的向量。当将 `metric_type` 设置为 `IP` 或 `COSINE` 时，请确保该值大于 **radius** 的值。否则，该值应小于 **radius** 的值。

    - **level** (*number*)

        Zilliz Cloud 使用统一参数来简化搜索参数调优，而无需您处理各种索引算法特有的大量搜索参数。

        默认值为 **1**，取值范围为 **1** 到 **5**。增大该值会提高召回率，但会降低搜索性能。

    - **page_retain_order** (*bool*) -

        当提供 `offset` 时，是否保留搜索结果的顺序。 

        此参数仅在您同时设置了 `radius` 时适用。

- **consistency_level** (*ConsistencyLevelEnum*) -

    目标 Collection 的一致性级别。默认值为 **Bounded**（**1**），可选值包括 **Strong**（**0**）、**Bounded**（**1**）、**Session**（**2**）和 **Eventually**（**3**）。

- **ignore_growing** (*boolean*) -

    布尔值，指示是否跳过在 growing Segment 中的搜索。

- **group_by_field** (*string*) -

    按指定字段对搜索结果进行分组，以确保结果多样性并避免从同一组返回多个结果。

- **group_size** (*number*) -

    在分组搜索中，每个组内目标返回的 Entity 数量。例如，设置 `group_size=2` 会指示系统在每个组内最多返回 2 个最相似的 Entity（例如文档段落或向量表示）。如果未设置 `group_size`，系统默认每组仅返回 1 个 Entity。

- **strict_group_size** (*boolean*) -

    此布尔参数决定是否严格执行 `group_size`。当 `group_size=true` 时，只要每组内存在足够的数据，系统就会尝试为每个组精确填充 `group_size` 个结果。如果某个组中的 Entity 数量不足，则仅返回可用的 Entity，同时确保数据充足的组满足指定的 `group_size`。

- **hints** (*string*) -

    用于提升搜索性能的 hints 字符串。

- **round_decimal** (*number*) -

    最终结果中保留的小数位数。

- **transformers** (*OutputTransformers*) -

    用于转换以下数据类型数据的自定义函数：

    - BFloat16Vector（`(bf16bytes: Uint8Array) => BFloat16Vector;`）

    - Float16Vector（`(f16: Uint8Array) => Float16Vector;`）

    - SparseFloatVector（`(sparse: SparseVectorDic) => SparseFloatVector;`）

- **rerank** (*RerankerObj* | *FunctionObject \ FunctionScore*) -

    带有自定义参数的重排序策略。您可以使用 **RerankerObj**、**FunctionObject** 或 **FunctionScore**。

    **RerankerObj** 具有以下参数：

    - **strategy** (*string*) -

        重排序策略。可选值包括：

        - **RRF** ("rrf")

            当没有特定侧重点时，建议使用此策略。RRF 可以有效平衡各个向量字段的重要性。

        - **WEIGHTED** ("weighted")

            如果您希望结果突出某个特定向量字段，建议使用此策略。WeightedRanker 允许您为某些向量字段分配更高权重，从而增强其重要性。例如，在多模态搜索中，图像的文本描述可能比图像颜色更重要。

    - **params** (*keyValueObj*) -

        这些参数因重排序策略而异。

        - 使用 RRFRanker 策略时，您需要将参数值 `k` 输入到 RRFRanker 中。`k` 的默认值为 60。此参数有助于确定如何组合不同 ANN 搜索的排名，旨在平衡并融合所有搜索的重要性。

        - 使用 WeightedRanker 策略时，您需要将权重值输入到 `WeightedRanker` 函数中。Hybrid Search 中基础 ANN 搜索的数量对应需要输入的值的数量。输入值应位于 [0,1] 范围内，越接近 1 表示重要性越高。

    **FunctionObject** 具有以下结构。

    - **name** (*string*)

        函数名称。该标识符用于在查询和 Collection 中引用该函数。

    - **description** (*string*)

        对函数用途的简要说明。这对于文档编写或大型项目中的说明很有帮助，默认值为空字符串。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        用于处理原始数据的函数类型。此参数的可选值为`FunctionType.RERANK`。

    - **input_field_names** (*string[]*)

        将此参数值保留为空数组。

    **FunctionScore** 具有以下结构。

    - **functions** (*FunctionObject[]*) -

        **FunctionObject** 对象列表。

    - **params** (*keyValueObj*) -  

        指定这些函数如何协同工作。其结构如下：

        - **boost_mode** (*string*) -

            指定权重如何影响任意匹配 Entity 的得分。可选值包括：

            - `Multiply`

                表示加权值等于匹配 Entity 的原始得分乘以指定权重。

                这是默认值。

            - `Sum`

                表示加权值等于匹配 Entity 的原始得分与指定权重之和

        - **function_mode** (*string*) -

            指定如何处理来自各个 Boost Ranker 的加权值。可选值包括：

            - `Multiply`

                表示匹配 Entity 的最终得分等于所有 Boost Ranker 加权值的乘积。

                这是默认值。

            - `Sum`

                表示匹配 Entity 的最终得分等于所有 Boost Ranker 加权值之和。

- **order_by_fields** (*OrderByFields*) -

    用于对搜索结果排序的字段。可选。

**返回值** *Promise&lt;SearchResults&lt;T&gt;&gt;*

此方法返回一个 promise，该 promise 会解析为 **SearchResults&lt;T&gt;** 对象。

```typescript
{
    results: SearchResultData[] | SearchResultData[][],
    recalls: number[],
    session_ts: number,
    collection_name: string,
    all_search_count?: number,
    status:  ResStatus
}
```

**参数：**

- **results** (*SearchResultData[]* | *SearchResultData[][]*) -<br/>
  每个查询向量返回的命中结果。当提供单个查询向量时，这是一个平铺的 **SearchResultData[]**。当提供一批查询向量时，这是一个嵌套的 **SearchResultData[][]**，每个查询对应一个内部列表。

    - **id** (*string*) -

        匹配行的主键。

    - **score** (*number*) -

        相似度分数，按配置的度量类型缩放。

    - **offset** (*number* | *string*) -

        此命中结果在其查询组中的从 0 开始的偏移量。

    - **group_by_field_values** (*Record&lt;string, FieldData&gt;*) -

        当提供了 **group_by_field** 时设置；携带该命中结果对应分组字段的值。

    - **highlight** (*HighlightResult*) -

        当请求中提供了 **highlighter** 时设置；携带匹配字段的高亮片段。

    - **&lt;output_field&gt;** (*FieldData*) -

        每个请求的 **output_fields** 条目都会作为命中结果上的一个键添加，并携带匹配行中的对应值。

- **recalls** (*number[]*) -<br/>
  当搜索引擎生成该值时，表示每个查询的预估召回率分数。

- **session_ts** (*number*) -<br/>
  Milvus 用于评估此次搜索的会话时间戳。

- **collection_name** (*string*) -<br/>
  被搜索的 Collection。

- **all_search_count** (*number*) -<br/>
  可选。当搜索报告已检查的候选总数时设置。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示发生错误的错误代码。如果此操作成功，则始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则始终为空字符串。

## 示例\{#example}

```markdown
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const searchResults = await milvusClient.search({
   collection_name: 'my_collection',
   vector: [1, 2, 3, 4],
});
```

