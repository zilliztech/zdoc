---
title: "search() | Node.js"
slug: /node/node/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作执行向量相似性搜索，并可选择附加标量过滤表达式。 | Node.js"
type: docx
token: HYv3d0NiRoc09Bx4rz0cIhqknb5
sidebar_position: 7
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
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

此操作执行向量相似性搜索，并可选择附加标量过滤表达式。

```javascript
await milvusClient.search(data)
```

## Request Syntax\{#request-syntax}

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

**PARAMETERS:**

- **db_name** (*string*) -

    目标集合所属数据库的名称。

- **collection_name** (*string*) -

    **[REQUIRED]**

    要搜索的集合名称

- **partition_names** (*string[]*) -

    要搜索的分区名称列表。

- **anns_field** (*string*) -

    此操作的目标向量字段名称。如果要在具有多个向量字段的集合中搜索，则此参数为必填项。

- **data** (*number[]* | *number[][]*) -

    向量嵌入列表。

    Zilliz Cloud 会搜索与指定向量嵌入最相似的向量嵌入。

- **output_fields** (*string[]*) -

    要包含在返回的每个实体中的字段名称列表。

    默认值为 **None**。如果未指定，则仅包含主字段。

- **limit** (*number*) - 

    要返回的实体总数。

    你可以将此参数与 **param** 中的 **offset** 结合使用，以启用分页。

    此值与 **param** 中 **offset** 的总和应小于 16,384。 

    不过，在分组搜索中，`limit` 指定的是要返回的最大组数，而不是单个实体数。每个组都基于指定的 `group_by_field` 形成。

- **offset** (*number*) - 

    搜索结果中要跳过的记录数。 

    你可以将此参数与 `limit` 结合使用，以启用分页。

    此值与 `limit` 的总和应小于 16,384。 

- **filter** (*string*) -

    用于过滤匹配实体的标量过滤条件。 

    默认值为空字符串，表示不应用任何条件。

    你可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参阅 [Boolean Expression Rules](https://milvus.io/docs/boolean.md)。 

- **exprValues** (*keyValueObj*) -

    如果你选择像 [Filtering Templating](/docs/filtering-templating) 中所述的那样在 `filter` 中使用占位符，则可以通过此参数以键值对形式指定这些占位符的实际值。

- **params** (*KeyValueObj*) -

    以键值对形式指定的附加搜索参数。

    - **radius** (*number*) -

        确定最低相似度阈值。当将 `metric_type` 设置为 `L2` 时，请确保此值大于 **range_filter** 的值。否则，此值应小于 **range_filter** 的值。 

    - **range_filter**  (*number*) -  

        将搜索限定为特定相似度范围内的向量。当将 `metric_type` 设置为 `IP` 或 `COSINE` 时，请确保此值大于 **radius** 的值。否则，此值应小于 **radius** 的值。

    - **level** (*number*)

        Zilliz Cloud 使用统一参数来简化搜索参数调优，而不是让你处理各种索引算法对应的一系列特定搜索参数。

        默认值为 **1**，取值范围为 **1** 到 **5**。值越大，召回率越高，但搜索性能会降低。

    - **page_retain_order** (*bool*) -

        在提供 `offset` 时，是否保留搜索结果的顺序。 

        此参数仅在你同时设置了 `radius` 时生效。

- **consistency_level** (*ConsistencyLevelEnum*) -

    目标集合的一致性级别。默认值为 **Bounded** (**1**)，可选值包括 **Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**) 和 **Eventually** (**3**)。

- **ignore_growing** (*boolean*) -

    一个布尔值，表示是否跳过对 growing segment 的搜索。

- **group_by_field** (*string*) -

    按指定字段对搜索结果进行分组，以确保结果多样性并避免从同一组返回多个结果。

- **group_size** (*number*) -

    在分组搜索中，每组内要返回的目标实体数量。例如，设置 `group_size=2` 表示系统将在每个组内最多返回 2 个最相似的实体（例如文档段落或向量表示）。如果未设置 `group_size`，系统默认每组仅返回 1 个实体。

- **strict_group_size** (*boolean*) -

    此布尔参数决定是否严格执行 `group_size`。当 `group_size=true` 时，只要每组中有足够的数据，系统将尝试为每个组精确填充 `group_size` 条结果。如果某个组中的实体数量不足，则仅返回可用实体，同时确保数据充足的组满足指定的 `group_size`。

- **hints** (*string*) -

    用于提升搜索性能的提示字符串。

- **round_decimal** (*number*) -

    最终结果中保留的小数位数。

- **transformers** (*OutputTransformers*) -

    用于转换以下数据类型数据的自定义函数：

    - BFloat16Vector (`(bf16bytes: Uint8Array) => BFloat16Vector;`)

    - Float16Vector (`(f16: Uint8Array) => Float16Vector;`)

    - SparseFloatVector (`(sparse: SparseVectorDic) => SparseFloatVector;`)

- **rerank** (*RerankerObj* | *FunctionObject \ FunctionScore*) -

    带有自定义参数的重排策略。你可以使用 **RerankerObj**、**FunctionObject** 或 **FunctionScore**。

    **RerankerObj** 具有以下参数：

    - **strategy** (*string*) -

        重排策略。可能的值包括：

        - **RRF** ("rrf")

            当没有特定侧重点时，推荐使用此策略。RRF 可以有效平衡各个向量字段的重要性。

        - **WEIGHTED** ("weighted")

            如果你希望结果更强调某个特定向量字段，建议使用此策略。WeightedRanker 允许你为某些向量字段分配更高权重，从而提高其重要性。例如，在多模态搜索中，图像的文本描述可能比图像颜色更重要。

    - **params** (*keyValueObj*) -

        这些参数因重排策略而异。

        - 使用 RRFRanker 策略时，需要向 RRFRanker 输入参数值 `k`。`k` 的默认值为 60。此参数有助于确定如何组合不同 ANN 搜索的排序，从而在所有搜索之间实现重要性的平衡与融合。

        - 使用 WeightedRanker 策略时，需要向 `WeightedRanker` 函数输入权重值。混合搜索中的基础 ANN 搜索数量对应需要输入的值的数量。输入值应位于 [0,1] 范围内，越接近 1 表示越重要。

    **FunctionObject** 具有以下结构。

    - **name** (*string*)

        函数名称。此标识符用于在查询和集合中引用该函数。

    - **description** (*string*)

        对函数用途的简要描述。这在文档编写或大型项目中提高清晰度时会很有用，默认值为空字符串。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        用于处理原始数据的函数类型。此参数的可能值为 `FunctionType.RERANK`。

    - **input_field_names** (*string[]*)

        将此参数保留为空数组。

    **FunctionScore** 具有以下结构。

    - **functions** (*FunctionObject[]*) -

        **FunctionObject** 对象列表。

    - **params** (*keyValueObj*) -  

        指定所设定的函数如何协同工作。其结构如下：

        - **boost_mode** (*string*) -

            指定设定的权重如何影响任意匹配实体的分数。可能的值包括：

            - `Multiply`

                表示加权值等于匹配实体的原始分数乘以指定权重。

                这是默认值。

            - `Sum`

                表示加权值等于匹配实体的原始分数与指定权重之和

        - **function_mode** (*string*) -

            指定如何处理来自各个 Boost Ranker 的加权值。可能的值包括：

            - `Multiply`

                表示匹配实体的最终分数等于所有 Boost Ranker 的加权值之积。

                这是默认值。

            - `Sum`

                表示匹配实体的最终分数等于所有 Boost Ranker 的加权值之和。

- **order_by_fields** (*OrderByFields*) -

    按其对搜索结果进行排序的字段。可选。

**RETURNS** *Promise&lt;SearchResults&lt;T&gt;&gt;*

此方法返回一个 Promise，该 Promise 解析为 **SearchResults&lt;T&gt;** 对象。

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

**PARAMETERS:**

- **results** (*SearchResultData[]* | *SearchResultData[][]*) -<br/>
  为每个查询向量返回的命中结果。当提供单个查询向量时，这是一个扁平的 **SearchResultData[]**。当提供一批查询向量时，这是一个嵌套的 **SearchResultData[][]**，其中每个内部列表对应一个查询。

    - **id** (*string*) -

        匹配行的主键。

    - **score** (*number*) -

        按所配置 metric type 缩放后的相似度分数。

    - **offset** (*number* | *string*) -

        此命中在其查询组内基于 0 的偏移量。

    - **group_by_field_values** (*Record&lt;string, FieldData&gt;*) -

        当提供了 **group_by_field** 时设置；包含该命中的分组字段值。

    - **highlight** (*HighlightResult*) -

        当请求中提供了 **highlighter** 时设置；包含匹配字段的高亮片段。

    - **&lt;output_field&gt;** (*FieldData*) -

        每个请求的 **output_fields** 条目都会作为命中的一个键添加，并携带匹配行中的对应值。

- **recalls** (*number[]*) -<br/>
  每个查询的估计召回分数，仅当搜索引擎生成该值时提供。

- **session_ts** (*number*) -<br/>
  Milvus 用于评估此次搜索的会话时间戳。

- **collection_name** (*string*) -<br/>
  被搜索的集合。

- **all_search_count** (*number*) -<br/>
  可选。当搜索报告了已检查的候选项总数时设置。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        指示操作结果的代码。如果此操作成功，则该值始终为 **0**。

    - **error_code** (*string* | *number*) -

        指示发生错误的错误代码。如果此操作成功，则该值始终为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的说明。如果此操作成功，则该值始终为空字符串。

## Example\{#example}

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

