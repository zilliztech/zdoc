---
title: "Decay Ranker 概述 | BYOC"
slug: /decay-ranker-oveview
sidebar_label: "Decay Ranker 概述"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在传统的向量搜索中，结果纯粹是按照向量相似度来排序的，即向量在数学空间中的匹配程度。但在实际应用中，使内容真正相关的因素往往不仅仅取决于语义相似度。 | BYOC"
type: origin
token: QGEawcZDSiPZ1Mkoz0Zc6ZS0nKh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Decay Ranker 概述

在传统的向量搜索中，结果纯粹是按照向量相似度来排序的，即向量在数学空间中的匹配程度。但在实际应用中，使内容真正相关的因素往往不仅仅取决于语义相似度。

思考一下这些日常场景：

- 一个新闻搜索，其中昨天的文章应该比三年前的类似文章排名更高

- 一款餐厅查找器，优先推荐距离5分钟路程的场所，而非需要30分钟车程的场所

- 一个电子商务平台，即使热门产品与搜索查询的相似度略低，也能提升其热度

这些场景都有一个共同的需求：平衡向量相似度与其他数值因素，如时间、距离或受欢迎程度。

Zilliz Cloud 中的 Decay Ranker 通过根据数字类型字段的值调整搜索排名来满足这一需求。它们使您能够在向量相似度与数据的“新鲜度”、“接近度”或其他数值属性之间取得平衡，从而创造出更直观、与上下文相关的搜索体验。

## 使用说明\{#usage-notes}

- Decay Ranker 不能用于 Grouping Search。

- Decay Ranker 中引用的字段必须为数字类型（`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`或`DOUBLE`）。

- 每个 Decay Ranker 只能使用一个数字类型的字段。

- **时间单位一致性**：使用基于时间的 Decay Ranker 时，`origin`、`scale` 和 `offset` 等参数的单位必须与集合数据中使用的单位相匹配：

    - 如果您的集合以**秒**为单位存储时间戳，请对所有参数使用秒

    - 如果您的集合以**毫秒**为单位存储时间戳，请对所有参数使用毫秒

    - 如果您的集合以**微秒**为单位存储时间戳，请对所有参数使用微秒

## 工作原理\{#how-it-works}

Decay Ranker 通过将时间或地理距离等数值因素纳入排序过程，增强了传统向量搜索。整个过程遵循以下阶段：

### 阶段1：计算归一化相似度得分\{#stage-1-calculate-normalized-similarity-scores}

首先，Zilliz Cloud 计算并归一化向量相似度得分，以确保比较的一致性：

- 对于 **L2** 和 **JACCARD** 等基于距离的相似性度量类型（其中值越低表示相似度越高）：

    ```plaintext
    normalized_score = 1.0 - (2 × arctan(score))/π
    ```

    这将距离转换为 0 到 1 之间的相似度得分，得分越高越好。

- 对于 **IP**、**COSINE** 和 **BM25** 等基于得分的相似性度量类型（其中较高的分数已经表示更好的匹配）：分数直接使用，不进行归一化处理。

### 阶段2：计算衰减分数\{#stage-2-calculate-decay-scores}

接下来，Zilliz Cloud 会使用您选择的 Decay Ranker，根据指定的数字段的值（如时间戳或距离）计算衰减分数：

- 每个 Decay Ranker 将原始数值转换为 0 到 1 之间的归一化相关性得分

- 衰减得分表示一个项目基于其与理想点的“距离”的相关性

具体的计算公式因 Decay Ranker 类型而异。有关如何计算衰减分数的详细信息，请参考[高斯衰减](./gaussian-decay)、[指数衰减](./exponential-decay)、[线性衰减](./linear-decay)。

### 阶段3：计算最终得分\{#stage-3-calculate-final-scores}

最后，Zilliz Cloud 将归一化相似度得分和衰减得分相结合，得出最终排名得分：

```plaintext
final_score = normalized_similarity_score × decay_score
```

在混合搜索（结合多个向量字段）的情况下，Zilliz Cloud 会采用搜索请求中的最大归一化相似度得分：

```plaintext
final_score = max([normalized_score₁, normalized_score₂, ..., normalized_scoreₙ]) × decay_score
```

例如，在混合搜索中，如果一篇研究论文的向量相似度评分为 0.82，基于 BM25 的文本检索评分为0.91，Zilliz Cloud 在应用衰减因子之前会使用0.91作为基础相似度评分。

### 使用 Decay Ranker\{#decay-ranking-in-action}

让我们来看一个在实际场景中使用 Decay Ranker 的示例——以基于时间的衰减来搜索**"AI research papers"**：

<Admonition type="info" icon="📘" title="说明">

在这个示例中，衰减分数反映了相关性如何随时间减弱——较新的论文得分更接近1.0，较旧的论文得分较低。这些值是使用特定的 Decay Ranker 计算得出的。有关详细信息，请参阅[选择合适的 Decay Ranker](./decay-ranker-oveview#choose-the-right-decay-ranker)。

</Admonition>

| 论文 | 向量相似度 | 归一化相似度得分 | 出版日期 | 衰减得分 | 最终得分 | 最终排名 |
| --- | --- | --- | --- | --- | --- | --- |
| 论文 A | 高 | 0.85 (`COSINE`) | 两周前 | 0.80 | 0.68 | #2 |
| 论文 B | 非常高 | 0.92 (`COSINE`) | 6个月前 | 0.45 | 0.41 | #3 |
| 论文 C | 中等 | 0.75 (`COSINE`) | 1天前 | 0.98 | 0.74 | #1 |
| 文件 D | 中高 | 0.76 (`COSINE`) | 3周前 | 0.70 | 0.53 | #4 |

如果不使用 Decay Ranker，论文 B 将基于纯向量相似度（0.92）排名最高。然而，应用 Decay Ranker 后：

- 论文 C 尽管相似度中等，但因其非常新（昨天发表）而跃升至第 1 位

- 论文 B 尽管相似度极高，但由于相对较旧，仍降至第 3 位

- 论文 D 使用L2距离（数值越低越好），因此在应用衰减之前，其得分从 1.2 归一化为 0.76

## 选择合适的 Decay Ranker\{#choose-the-right-decay-ranker}

Milvus提供了不同的 Decay Ranker - 高斯（`gauss`）、指数（`exp`）、线性（`linear`），每个 Ranker 都针对特定用例设计：

<table>
   <tr>
     <th><p>衰减排序器</p></th>
     <th><p>特性</p></th>
     <th><p>理想用例</p></th>
     <th><p>示例场景</p></th>
   </tr>
   <tr>
     <td><p>高斯（<code>gauss</code>）</p></td>
     <td><p>自然的、适度延伸的渐进式衰退</p></td>
     <td><ul><li><p>需要平衡结果的常规搜索</p></li><li><p>用户对距离有直观感受的应用</p></li><li><p>当适度的距离不应严重影响结果时</p></li></ul></td>
     <td><p>在餐厅搜索中，距离3公里的优质场所仍可被发现，不过排名会低于附近的选项</p></td>
   </tr>
   <tr>
     <td><p>指数（<code>exp</code>）</p></td>
     <td><p>起初迅速下降，但保持长尾</p></td>
     <td><ul><li><p>时效性至关重要的新闻源</p></li><li><p>社交媒体中新鲜内容应占主导地位</p></li><li><p>当强烈倾向于近距离，但特殊的远距离项目仍应保持可见时</p></li></ul></td>
     <td><p>在新闻应用中，昨天的报道排名远高于一周前的内容，但高度相关的旧文章仍可能出现</p></td>
   </tr>
   <tr>
     <td><p>线性（<code>linear</code>）</p></td>
     <td><p>有明确界限的一致、可预测的下降</p></td>
     <td><ul><li><p>具有自然边界的应用</p></li><li><p>有距离限制的服务</p></li><li><p>有截止日期或明确阈值的内容</p></li></ul></td>
     <td><p>在活动查找器中，超过两周未来时间范围的活动根本不会显示</p></td>
   </tr>
</table>

有关每个 Decay Ranker 如何计算分数以及具体衰减模式的详细信息，请参考相关文档：

- [高斯衰减](./gaussian-decay)

- [指数衰减](./exponential-decay)

- [线性衰减](./linear-decay)

## 实施示例\{#implementation-example}

Decay Ranker 可应用于 Zilliz Cloud 中的标准向量搜索和混合搜索操作。以下是实现此功能的关键代码片段。

<Admonition type="info" icon="📘" title="说明">

在使用 Decay Ranker 之前，你必须首先创建一个包含适当数字类型字段（如时间戳、距离等）的集合，这些字段将用于衰减计算。有关包括 Collection 设置、 Schema 定义和数据插入的完整工作示例，请参考[教程：实现基于时间的搜索结果重排](./tutorial-implement-time-based-ranking)。

</Admonition>

### 创建一个衰减排序器\{#create-a-decay-ranker}

要实现衰减排序，首先定义一个 `Function` 对象，并进行适当的配置：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

# Create a decay function for timestamp-based decay
# Note: All time parameters must use the same unit as your collection data
rerank = Function(
    name="time_decay",                  # Function identifier
    input_field_names=["timestamp"],    # Numeric field to use for decay
    function_type=FunctionType.RERANK,  # Must be set to RERANK for decay rankers
    params={
        "reranker": "decay",            # Specify decay reranker. Must be "decay"
        "function": "gauss",            # Choose decay function type: "gauss", "exp", or "linear"
        "origin": int(datetime.datetime(2025, 1, 15).timestamp()),    # Reference point (seconds)
        "scale": 7 * 24 * 60 * 60,      # 7 days in seconds (must match collection data unit)
        "offset": 24 * 60 * 60,         # 1 day no-decay zone (must match collection data unit)
        "decay": 0.5                    # Half score at scale distance
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

import java.time.ZoneId;
import java.time.ZonedDateTime;

ZonedDateTime zdt = ZonedDateTime.of(2025, 1, 25, 0, 0, 0, 0, ZoneId.systemDefault());

DecayRanker rerank = DecayRanker.builder()
        .name("time_decay")
        .inputFieldNames(Collections.singletonList("timestamp"))
        .function("gauss")
        .origin(zdt.toInstant().toEpochMilli())
        .scale(7 * 24 * 60 * 60)
        .offset(24 * 60 * 60)
        .decay(0.5)
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import {FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "time_decay",
  input_field_names: ["timestamp"],
  function_type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "gauss",
    origin: new Date(2025, 1, 15).getTime(),
    scale: 7 * 24 * 60 * 60,
    offset: 24 * 60 * 60,
    decay: 0.5,
  },
};
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
auto rerank = std::make_shared<milvus::DecayRerank>("time_decay");
rerank->AddInputFieldName("timestamp");
rerank->SetFunction("gauss");
rerank->SetOrigin(1735689600);
rerank->SetScale(7 * 24 * 60 * 60);
rerank->SetOffset(24 * 60 * 60);
rerank->SetDecay(0.5);
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>参数</p></th>
     <th><p>是否必需？</p></th>
     <th><p>描述</p></th>
     <th><p>值/示例</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>是</p></td>
     <td><p>执行搜索时使用的函数标识符。选择一个与你的用例相关的描述性名称。</p></td>
     <td><p><code>"time_decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>是</p></td>
     <td><p>用于衰减分数计算的数字字段名称列表。确定将使用数据集的哪个属性来计算衰减（例如，基于时间的衰减使用时间戳，基于位置的衰减使用坐标）。</p><p>必须是 Collection 中包含相关数值的字段。支持INT8/16/32/64、FLOAT、DOUBLE。</p></td>
     <td><p><code>["timestamp"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>是</p></td>
     <td><p>指定正在创建的函数类型。</p><p>所有 Decay Ranker 都必须设置为 <code>RERANK</code>。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>是</p></td>
     <td><p>指定要使用的重排序方法。</p><p>必须设置为<code>"decay"</code>才能启用 Decay Ranker 功能。</p></td>
     <td><p><code>"decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function</code></p></td>
     <td><p>是</p></td>
     <td><p>指定要应用的 Decay Ranker 类型。确定相关性下降的曲线形状。</p><p>请参阅<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">选择合适的 Decay Ranker</a> 部分，以获取相关指导。</p></td>
     <td><p><code>"gauss"</code>, <code>"exp"</code>, or <code>"linear"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.origin</code></p></td>
     <td><p>是</p></td>
     <td><p>计算衰减分数的参考点。处于该值的项目将获得最大相关性分数。</p><p>对于基于时间的衰减，时间单位必须与您的集合数据相匹配。</p></td>
     <td><ul><li><p>对于时间戳：当前时间（例如，<code>int(time.time())</code>）</p></li><li><p>对于地理位置：用户当前坐标</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.scale</code></p></td>
     <td><p>是</p></td>
     <td><p>相关性降至 <code>decay</code> 值时的距离或时间。控制相关性下降的速度。</p><p>对于基于时间的衰减，时间单位必须与您的 Collection 中的数据相匹配。</p><p>较大的值会使相关性下降更为平缓；较小的值则会使相关性下降更为陡峭。</p></td>
     <td><ul><li><p>对于时间：周期以秒为单位（例如，<code>7 &ast; 24 &ast; 60 &ast; 60</code> 表示7天）</p></li><li><p>距离：米（例如，<code>5000</code> 表示 5 公里）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.offset</code></p></td>
     <td><p>否</p></td>
     <td><p>在 <code>origin</code> 周围创建一个“无衰减区域”，其中的 Entity 保持满分（衰减分数 = 1.0）。</p><p>对于基于时间的衰减，时间单位必须与您的 Collection 中的数据相匹配。</p><p>在 <code>origin</code> 这个范围内的项目保持最大相关性。</p></td>
     <td><ul><li><p>对于时间：周期以秒为单位（例如，<code>24 &ast; 60 &ast; 60</code> 表示1天）</p></li><li><p>距离：米（例如，<code>500</code> 表示 500 米）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.decay</code></p></td>
     <td><p>否</p></td>
     <td><p>在 <code>scale</code> 距离处的得分值，控制曲线的陡度。较低的值会产生更陡峭的下降曲线；较高的值会产生更平缓的下降曲线。</p><p>必须介于 0 和 1 之间。</p></td>
     <td><p><code>0.5</code>（默认值）</p></td>
   </tr>
</table>

### 在标准向量搜索中使用\{#apply-to-standard-vector-search}

定义 Decay Ranker 后，您可以在搜索请求中通过将其传递给 `ranker` 参数来应用它：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Use the decay function in standard vector search
results = milvus_client.search(
    collection_name,
    data=[your_query_vector], # Replace with your query vector
    anns_field="vector_field",
    limit=10,
    output_fields=["document", "timestamp"],  # Include the decay field in outputs to see values
    #  highlight-next-line
    ranker=rerank,                      # Apply the decay ranker here
    consistency_level="Strong"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddedText;

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("search query")))
        .annsField("vector_field")
        .limit(10)
        .outputFields(Arrays.asList("document", "timestamp"))
        .functionScore(FunctionScore.builder()
                .addFunction(rerank)
                .build())
        .build();
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const result = await milvusClient.search({
  collection_name: collection_name,
  data: [your_query_vector], // Replace with your query vector
  anns_field: "dense",
  limit: 10,
  output_fields: ["document", "timestamp"],
  rerank: rerank,
  consistency_level: "Strong",
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
auto function_score = std::make_shared<milvus::FunctionScore>();
function_score->AddFunction(rerank);

auto request = milvus::SearchRequest()
                   .WithCollectionName(collection_name)
                   .WithAnnsField("dense")
                   .WithRerank(function_score)
                   .AddOutputField("document")
                   .AddOutputField("timestamp")
                   .AddFloatVector(your_query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>