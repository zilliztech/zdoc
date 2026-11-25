---
title: "search() | Node.js"
slug: /node/node/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用可选的标量过滤表达式执行向量相似度搜索。 | Node.js"
type: docx
token: HYv3d0NiRoc09Bx4rz0cIhqknb5
sidebar_position: 7
keywords: 
  - 多模态 RAG
  - LLM 幻觉
  - 混合搜索
  - 词法搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - search()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# search()

此操作使用可选的标量过滤表达式执行向量相似度搜索。

```javascript
await milvusClient.search(data)
```

## 请求语法\{#request-syntax}

<NextChannel action="exclude">

```javascript
await milvusClient.search({
  db_name?: string,
  collection_name: string,
  partition_names?: string[];
  anns_field?: string; 
  data?: SearchData | SearchData[];
  vector?: SearchData | SearchData[];
  output_fields?: string[];
  limit?: number;
  topk?: number;
  offset?: number;
  filter?: string;
  expr?: string;
  exprValues?: keyValueObj;
  params?: keyValueObj;
  metric_type?: string;
  consistency_level?: ConsistencyLevelEnum;
  ignore_growing?: boolean;
  group_by_field?: string;
  group_size?: number;
  strict_group_size?: boolean;
  hints?: string;
  round_decimal?: number;
  transformers?: OutputTransformers;
  rerank?: RerankerObj | FunctionObject | FunctionScore;
  search_aggregation?: SearchAggregation;
  nq?: number;
  ids?: number[] | string[];
  highlighter?: Highlighter;
  timeout?: number;
})
```

</NextChannel>

<NextChannel action="include">

```javascript
await milvusClient.search({
  db_name?: string,
  collection_name: string,
  partition_names?: string[];
  anns_field?: string; 
  data?: SearchData | SearchData[];
  vector?: SearchData | SearchData[];
  output_fields?: string[];
  limit?: number;
  topk?: number;
  offset?: number;
  filter?: string;
  expr?: string;
  exprValues?: keyValueObj;
  params?: keyValueObj;
  metric_type?: string;
  consistency_level?: ConsistencyLevelEnum;
  ignore_growing?: boolean;
  group_by_field?: string;
  group_size?: number;
  strict_group_size?: boolean;
  hints?: string;
  round_decimal?: number;
  transformers?: OutputTransformers;
  rerank?: RerankerObj | FunctionObject | FunctionScore;
  function_score?: FunctionScore;
  function_chains?: FunctionChains;
  search_aggregation?: SearchAggregation;
  nq?: number;
  ids?: number[] | string[];
  highlighter?: Highlighter;
  timeout?: number;
})
```

</NextChannel>

**参数：**

<NextChannel action="exclude">

- **db_name**（*string*） -

    目标 Collection 所属 Database 的名称。

- **collection_name**（*string*） -

    **[必需]**

    要搜索的 Collection 的名称。

- **partition_names**（*string[]*） -

    要搜索的 Partition 名称列表。

- **anns_field**（*string*） -

    此操作的目标向量字段名称。如果要在包含多个向量字段的 Collection 中搜索，则必须指定此参数。

- **data** (*[SearchData](./Vector-SearchData)* | *SearchData[]*) -

    向量嵌入列表。

    Milvus 会搜索与指定向量嵌入最相似的向量嵌入。

- **vector** (*[SearchData](./Vector-SearchData)* | *SearchData[]*) -

    查询向量对应的 **data** 别名。

- **output_fields**（*string[]*） -

    要在返回的每个 Entity 中包含的字段名称列表。

    该值默认为 **None**。如果未指定，则仅包含主字段。

- **limit**（*number*） - 

    要返回的 Entity 总数。

    您可以将此参数与 **param** 中的 **offset** 结合使用来启用分页。

    该值与 **param** 中 **offset** 的总和应小于或等于 16,384。 

    但是，在分组搜索中，`limit` 指定的是要返回的最大组数，而不是单个 Entity 的数量。每个组均基于指定的 `group_by_field` 构成。

- **topk**（*number*） -

    **limit** 的别名，用于指定要返回的 Entity 总数。

- **offset**（*number*） - 

    要从搜索结果中跳过的记录数。 

    您可以将此参数与 `limit` 结合使用来启用分页。

    该值与 `limit` 的总和应小于或等于 16,384。 

- **filter**（*string*） -

    用于筛选匹配 Entity 的标量过滤条件。 

    该值默认为空字符串，表示不应用任何条件。

    您可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参见 [布尔表达式规则](https://milvus.io/docs/boolean.md)。 

- **expr**（*string*） -

    **filter** 的别名。请提供 **filter** 或 **expr**，不要同时提供两者。

- **exprValues**（*keyValueObj*） -

    如果您选择按 [过滤模板](https://milvus.io/docs/filtering-templating.md) 中所述在 `filter` 中使用占位符，则可以将这些占位符的实际值以键值对形式指定为此参数的值。

- **params**（*KeyValueObj*） -

    以键值对形式提供的附加搜索参数。下面的键在搜索 `params` 中受支持；它们不是 `KeyValueObj` 的成员。

    - **radius**（*number*） -

        确定最小相似度阈值。将 `metric_type` 设置为 `L2` 时，请确保此值大于 **range_filter** 的值。否则，此值应小于 **range_filter** 的值。 

    - **range_filter**  （*number*） -  

        将搜索细化到特定相似度范围内的向量。将 `metric_type` 设置为 `IP` 或 `COSINE` 时，请确保此值大于 **radius** 的值。否则，此值应小于 **radius** 的值。

    - **max_empty_result_buckets**（*number*）

        此参数仅用于 IVF 系列索引的范围搜索，包括 **BIN_IVF_FLAT**、**IVF_FLAT**、**IVF_SQ8**、**IVF_PQ** 和 **SCANN**。该值默认为 1，范围为 1 到 65536。

        在范围搜索期间，如果没有有效范围搜索结果的桶数达到指定值，搜索过程会提前终止。增大此参数可提高范围搜索的召回率。

- **consistency_level**（*ConsistencyLevelEnum*） -

    目标 Collection 的一致性级别。该值默认为 **Bounded**（**2**），可选值为 **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）和 **Eventually**（**3**）。请参见 [ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum)。

- **metric_type**（*string*） -

    用于衡量向量之间相似度的度量类型。默认为已索引字段的度量类型。

- **ignore_growing**（*boolean*） -

    一个布尔值，指示是否跳过对增长中 Segment 的搜索。

- **group_by_field**（*string*） -

    按指定字段对搜索结果进行分组，以确保多样性并避免返回同一组中的多个结果。

- **group_size**（*number*） -

    分组搜索中每个组要返回的目标 Entity 数。例如，设置 `group_size=2` 会指示系统在每个组中最多返回 2 个最相似的 Entity（例如文档段落或向量表示）。如果未设置 `group_size`，系统默认每个组仅返回 1 个 Entity。

- **strict_group_size**（*boolean*） -

    此布尔参数决定是否应严格执行 `group_size`。当 `group_size=true` 时，只要每个组中存在足够的数据，系统将尝试用恰好 `group_size` 个结果填充每个组。如果某个组中的 Entity 数量不足，则仅返回可用的 Entity，从而确保数据充足的组满足指定的 `group_size`。

- **hints**（*string*） -

    用于提高搜索性能的提示字符串。

- **round_decimal**（*number*） -

    最终结果中要保留的小数位数。

- **transformers** (*[OutputTransformers](./Vector-OutputTransformers)*) -

    用于转换以下数据类型的自定义函数。

- **rerank** (*[RerankerObj](./Vector-RerankerObj)* | *[FunctionObject](./Collections-FunctionObject)* | *[FunctionScore](./Vector-FunctionScore)*) -

    带有自定义参数的重排序策略。您可以使用 **RerankerObj**、**FunctionObject** 或 **FunctionScore**。请参见 [RerankerObj](./Vector-RerankerObj) 和 [FunctionObject](./Collections-FunctionObject)。

- **order_by_fields**（*OrderByFields*） -

    用于对搜索结果排序的字段。可选。

- **search_aggregation**（*SearchAggregation*） -

    可选的桶聚合配置。它按一个或多个字段对匹配的 Entity 进行分组，可选地计算指标、对桶排序、返回顶部命中结果，并且可以包含嵌套的子聚合。以下成员属于 `SearchAggregation`：

    - **fields**（*string[]*） -

        **[必需]**

        分组依据字段名称。至少需要一个字段。

    - **size**（*number*） -

        **[必需]**

        要返回的桶数。必须为正整数。

    - **metrics**（*Record&lt;string, SearchAggregationMetric&gt;*） -

        按别名作为键的可选指标聚合。每个值都是一个 `SearchAggregationMetric`，包含以下成员：

        - **op**（*AggregationMetricOp*） -

            指标运算。可以是 **avg**、**sum**、**count**、**min** 或 **max**。

        - **field_name**（*string*） -

            要聚合的字段。

    - **order**（*SearchAggregationOrder[]*） -

        返回的桶的可选排序规则。每个条目都是一个 `SearchAggregationOrder`，包含以下成员：

        - **key**（*string*） -

            可作为指标别名、`_count` 或 `_key` 的键。

        - **direction**（*AggregationDirection*） -

            排序方向。可以是 **asc** 或 **desc**。

    - **top_hits**（*SearchAggregationTopHits*） -

        每个桶返回的可选顶部命中文档。`SearchAggregationTopHits` 对象包含以下成员：

        - **size**（*number*） -

            **[必需]**

            每个桶要返回的命中数。必须为正整数。

        - **sort**（*SearchAggregationSort[]*） -

            应用于每个桶中命中结果的可选排序规则。每个条目都是一个 `SearchAggregationSort`，包含 **field_name** 和 **direction** 成员。

    - **sub_aggregation**（*SearchAggregation*） -

        可选的嵌套子聚合。最多支持四个聚合层级。

    > **注意：**
    >
    > - 最多支持四个聚合层级。
    > - 总共最多支持十个分组依据字段。
    > - 不能与非零的 `offset`、混合搜索、搜索迭代器或查询迭代器、高亮器或 `group_by_field` 结合使用。

- **nq**（*number*） -

    查询向量的数量。

- **ids**（*number[]* | *string[]*） -

    用于按主键搜索查询的主键。

- **highlighter**（*Highlighter*） -

    用于搜索结果的高亮器。

- **timeout**（*number*） -

    此操作的超时持续时间。将此值设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

</NextChannel>

<NextChannel action="include">

- **db_name**（*string*） -

    目标 Collection 所属 Database 的名称。

- **collection_name**（*string*） -

    **[必需]**

    要搜索的 Collection 的名称。

- **partition_names**（*string[]*） -

    要搜索的 Partition 名称列表。

- **anns_field**（*string*） -

    此操作的目标向量字段名称。如果要在包含多个向量字段的 Collection 中搜索，则必须指定此参数。

- **data** (*[SearchData](./Vector-SearchData)* | *SearchData[]*) -

    向量嵌入列表。

    Milvus 会搜索与指定向量嵌入最相似的向量嵌入。

- **vector** (*[SearchData](./Vector-SearchData)* | *SearchData[]*) -

    查询向量对应的 **data** 别名。

- **output_fields**（*string[]*） -

    要在返回的每个 Entity 中包含的字段名称列表。

    该值默认为 **None**。如果未指定，则仅包含主字段。

- **limit**（*number*） - 

    要返回的 Entity 总数。

    您可以将此参数与 **param** 中的 **offset** 结合使用来启用分页。

    该值与 **param** 中 **offset** 的总和应小于或等于 16,384。 

    但是，在分组搜索中，`limit` 指定的是要返回的最大组数，而不是单个 Entity 的数量。每个组均基于指定的 `group_by_field` 构成。

- **topk**（*number*） -

    **limit** 的别名，用于指定要返回的 Entity 总数。

- **offset**（*number*） - 

    要从搜索结果中跳过的记录数。 

    您可以将此参数与 `limit` 结合使用来启用分页。

    该值与 `limit` 的总和应小于或等于 16,384。 

- **filter**（*string*） -

    用于筛选匹配 Entity 的标量过滤条件。 

    该值默认为空字符串，表示不应用任何条件。

    您可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参见 [布尔表达式规则](https://milvus.io/docs/boolean.md)。 

- **expr**（*string*） -

    **filter** 的别名。请提供 **filter** 或 **expr**，不要同时提供两者。

- **exprValues**（*keyValueObj*） -

    如果您选择按 [过滤模板](https://milvus.io/docs/filtering-templating.md) 中所述在 `filter` 中使用占位符，则可以将这些占位符的实际值以键值对形式指定为此参数的值。

- **params**（*KeyValueObj*） -

    以键值对形式提供的附加搜索参数。下面的键在搜索 `params` 中受支持；它们不是 `KeyValueObj` 的成员。

    - **radius**（*number*） -

        确定最小相似度阈值。将 `metric_type` 设置为 `L2` 时，请确保此值大于 **range_filter** 的值。否则，此值应小于 **range_filter** 的值。 

    - **range_filter**  （*number*） -  

        将搜索细化到特定相似度范围内的向量。将 `metric_type` 设置为 `IP` 或 `COSINE` 时，请确保此值大于 **radius** 的值。否则，此值应小于 **radius** 的值。

    - **max_empty_result_buckets**（*number*）

        此参数仅用于 IVF 系列索引的范围搜索，包括 **BIN_IVF_FLAT**、**IVF_FLAT**、**IVF_SQ8**、**IVF_PQ** 和 **SCANN**。该值默认为 1，范围为 1 到 65536。

        在范围搜索期间，如果没有有效范围搜索结果的桶数达到指定值，搜索过程会提前终止。增大此参数可提高范围搜索的召回率。

- **consistency_level**（*ConsistencyLevelEnum*） -

    目标 Collection 的一致性级别。该值默认为 **Bounded**（**2**），可选值为 **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）和 **Eventually**（**3**）。请参见 [ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum)。

- **metric_type**（*string*） -

    用于衡量向量之间相似度的度量类型。默认为已索引字段的度量类型。

- **ignore_growing**（*boolean*） -

    一个布尔值，指示是否跳过对增长中 Segment 的搜索。

- **group_by_field**（*string*） -

    按指定字段对搜索结果进行分组，以确保多样性并避免返回同一组中的多个结果。

- **group_size**（*number*） -

    分组搜索中每个组要返回的目标 Entity 数。例如，设置 `group_size=2` 会指示系统在每个组中最多返回 2 个最相似的 Entity（例如文档段落或向量表示）。如果未设置 `group_size`，系统默认每个组仅返回 1 个 Entity。

- **strict_group_size**（*boolean*） -

    此布尔参数决定是否应严格执行 `group_size`。当 `group_size=true` 时，只要每个组中存在足够的数据，系统将尝试用恰好 `group_size` 个结果填充每个组。如果某个组中的 Entity 数量不足，则仅返回可用的 Entity，从而确保数据充足的组满足指定的 `group_size`。

- **hints**（*string*） -

    用于提高搜索性能的提示字符串。

- **round_decimal**（*number*） -

    最终结果中要保留的小数位数。

- **transformers** (*[OutputTransformers](./Vector-OutputTransformers)*) -

    用于转换以下数据类型的自定义函数。

- **rerank** (*[RerankerObj](./Vector-RerankerObj)* | *[FunctionObject](./Collections-FunctionObject)* | *[FunctionScore](./Vector-FunctionScore)*) -

    带有自定义参数的重排序策略。您可以使用 **RerankerObj**、**FunctionObject** 或 **FunctionScore**。请参见 [RerankerObj](./Vector-RerankerObj) 和 [FunctionObject](./Collections-FunctionObject)。

- **function_score** (*[FunctionScore](./Vector-FunctionScore)*) -

    基于函数的重排序器。也可通过 **rerank** 传入。请参见 [FunctionScore](./Vector-FunctionScore)。

- **function_chains** (*FunctionChain* | *FunctionChainSpec* | *readonly (FunctionChain | FunctionChainSpec)[]*) -

    应用于搜索候选结果的服务器端处理链。可选。

- **order_by_fields**（*OrderByFields*） -

    用于对搜索结果排序的字段。可选。

- **search_aggregation**（*SearchAggregation*） -

    可选的桶聚合配置。它按一个或多个字段对匹配的 Entity 进行分组，可选地计算指标、对桶排序、返回顶部命中结果，并且可以包含嵌套的子聚合。以下成员属于 `SearchAggregation`：

    - **fields**（*string[]*） -

        **[必需]**

        分组依据字段名称。至少需要一个字段。

    - **size**（*number*） -

        **[必需]**

        要返回的桶数。必须为正整数。

    - **metrics**（*Record&lt;string, SearchAggregationMetric&gt;*） -

        按别名作为键的可选指标聚合。每个值都是一个 `SearchAggregationMetric`，包含以下成员：

        - **op**（*AggregationMetricOp*） -

            指标运算。可以是 **avg**、**sum**、**count**、**min** 或 **max**。

        - **field_name**（*string*） -

            要聚合的字段。

    - **order**（*SearchAggregationOrder[]*） -

        返回的桶的可选排序规则。每个条目都是一个 `SearchAggregationOrder`，包含以下成员：

        - **key**（*string*） -

            可作为指标别名、`_count` 或 `_key` 的键。

        - **direction**（*AggregationDirection*） -

            排序方向。可以是 **asc** 或 **desc**。

    - **top_hits**（*SearchAggregationTopHits*） -

        每个桶返回的可选顶部命中文档。`SearchAggregationTopHits` 对象包含以下成员：

        - **size**（*number*） -

            **[必需]**

            每个桶要返回的命中数。必须为正整数。

        - **sort**（*SearchAggregationSort[]*） -

            应用于每个桶中命中结果的可选排序规则。每个条目都是一个 `SearchAggregationSort`，包含 **field_name** 和 **direction** 成员。

    - **sub_aggregation**（*SearchAggregation*） -

        可选的嵌套子聚合。最多支持四个聚合层级。

    > **注意：**
    >
    > - 最多支持四个聚合层级。
    > - 总共最多支持十个分组依据字段。
    > - 不能与非零的 `offset`、混合搜索、搜索迭代器或查询迭代器、高亮器或 `group_by_field` 结合使用。

- **nq**（*number*） -

    查询向量的数量。

- **ids**（*number[]* | *string[]*） -

    用于按主键搜索查询的主键。

- **highlighter**（*Highlighter*） -

    用于搜索结果的高亮器。

- **timeout**（*number*） -

    此操作的超时持续时间。将此值设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

</NextChannel>

**返回：**

*Promise&lt;SearchResults&lt;T&gt;&gt;*

此方法返回一个 Promise，其解析结果为 **SearchResults&lt;T&gt;** 对象。

```javascript
{
    results: SearchResultData[] | SearchResultData[][],
    recalls: number[],
    session_ts: number,
    collection_name: string,
    all_search_count?: number,
    search_iterator_v2_results?: Record<string, any>,
    _search_iterator_v2_results?: string,
    status:  ResStatus
}
```

**参数：**

- **results**（*SearchResultData[]* | *SearchResultData[][]*） -
每个查询向量返回的命中结果。如果提供单个查询向量，则这是扁平的 **SearchResultData[]**；如果提供一批查询向量，则这是嵌套的 **SearchResultData[][]**，每个查询对应一个内部列表。

    - **id**（*string*） -

        匹配行的主键。

    - **score**（*number*） -

        相似度分数，按配置的度量类型进行缩放。

    - **offset**（*number* | *string*） -

        此命中结果在其查询组内从零开始的偏移量。

    - **group_by_field_values**（*Record&lt;string, FieldData&gt;*） -

        当提供了 **group_by_field** 时设置；包含该命中结果的分组字段值。

    - **highlight**（*HighlightResult*） -

        当请求中提供了 **highlighter** 时设置；包含匹配字段的高亮片段。

    - **&lt;output_field&gt;**（*FieldData*） -

        每个请求的 **output_fields** 条目都会作为键添加到命中结果中，其值为匹配行中的值。

- **recalls**（*number[]*） -
当搜索引擎生成召回分数时，每个查询的估计召回分数。

- **session_ts**（*number*） -
Milvus 用于评估搜索的会话时间戳。

- **collection_name**（*string*） -
被搜索的 Collection。

- **all_search_count**（*number*） -
可选。当搜索报告所检查的候选总数时设置。

- **agg_buckets**（*AggregationBucket[]* | *undefined*） -
可选。当提供了 **search_aggregation** 时设置；包含聚合桶、嵌套指标、顶部命中结果和子组。

- **search_iterator_v2_results**（*Record&lt;string, any&gt;*） -
可选。V2 搜索迭代器生成的内部结果。

- **_search_iterator_v2_results**（*string*） -
可选。V2 搜索迭代器生成的内部序列化结果。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code**（*number*） -

        表示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code**（*string* | *number*） -

        表示所发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason**（*string*） -

        指示所报告错误原因的说明。如果此操作成功，则该值为空字符串。

**异常：**

- **Error**

    当此操作期间发生任何错误时，会引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const searchResults = await milvusClient.search({
   collection_name: 'my_collection',
   vector: [1, 2, 3, 4],
});
```
