---
title: "指数衰减 | Cloud"
slug: /exponential-decay
sidebar_label: "指数衰减"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "指数衰减会使搜索结果呈现出初始阶段急剧下降，随后是长尾的特征。就像突发新闻周期一样，相关性起初迅速减弱，但有些报道随着时间的推移仍保持重要性，指数衰减对刚刚超出理想范围的项目大举罚分，同时仍让距离较远的项目仍可以被发现。当你希望高度优先考虑接近程度或时效性，但又不想完全排除距离较远的选项时，这种方法是理想的选择。 | Cloud"
type: origin
token: T9XBwGwawiC5awkP210cc779nUb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 指数衰减

指数衰减会使搜索结果呈现出初始阶段急剧下降，随后是长尾的特征。就像突发新闻周期一样，相关性起初迅速减弱，但有些报道随着时间的推移仍保持重要性，指数衰减对刚刚超出理想范围的项目大举罚分，同时仍让距离较远的项目仍可以被发现。当你希望高度优先考虑接近程度或时效性，但又不想完全排除距离较远的选项时，这种方法是理想的选择。

与其他衰减函数不同：

- 高斯衰减产生了更渐进的钟形衰减

- 线性衰减以恒定速率减小，直到精确地达到零

指数衰减独特地“前置”罚分，在衰减早期就开始大举罚分，但仍保持最小但非零的相关性得分长尾。

## 何时使用指数衰减\{#when-to-use-exponential-decay}

指数衰减对以下情况特别有效：

| 用例 | 示例 | 为什么指数衰减运作良好 |
| --- | --- | --- |
| 新闻提要 | 突发新闻门户网站 | 在仍展示几天前重要报道的同时，迅速降低旧新闻的相关性 |
| 社交媒体时间线 | 动态更新、状态更新 | 强调新鲜内容，但允许热门的旧内容浮出水面 |
| 通知系统 | 告警优先级排序 | 在保持重要警报可见性的同时，为近期警报营造紧迫感 |
| 限时抢购 | 限时优惠 | 随着截止日期临近，能见度迅速降低 |

在以下情况下选择指数衰减：

- 用户期望非常近期或附近的项目在结果中占据主导地位

- 如果较旧或较久远的项目具有极高的相关性，那么它们仍应是可被发现的

- 相关性衰减应前置（开始时更陡峭，随后更平缓）

## 急剧下降原则\{#sharp-drop-off-principle}

指数衰减形成的曲线起初下降迅速，随后逐渐趋于平缓，形成一条趋近但永远不会达到零的长尾。这种数学模式在自然现象中频繁出现，如放射性衰变、人口减少以及信息相关性随时间的变化。

<Admonition type="info" icon="📘" title="说明">

所有时间参数（`origin`、`offset`、`scale`）必须使用与 Collection 中数据相同的单位。如果您的 Collection 以不同的单位（毫秒、微秒）存储时间戳，请相应地调整所有参数。

</Admonition>

![Vg4mbHAc1oyPUqx6Q4lcyElTn4b](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/vg4mbhac1oypuqx6q4lcyeltn4b.png "Vg4mbHAc1oyPUqx6Q4lcyElTn4b")

上图展示了指数衰减如何影响数字新闻平台中新闻文章的排名：

- `origin`（当前时间）：又被称为原点，表示当前时刻，相关性达到最大值（1.0）。

- `offset`（3小时）：又被称为偏移量，表示“突发新闻窗口”——所有在过去3小时内发布的报道都保持完整的相关性得分（1.0），确保非常近期的新闻不会因微小的时间差异而被不必要地扣分。

- `decay` (0.5)：又被称衰减值，表示在关注范围边缘处的得分——此参数控制得分随时间衰减的剧烈程度。

- `scale`（24小时）：又称为关注范围，表示相关性降至衰减值的时间段——恰好24小时前的新闻文章，其相关性得分减半（0.5）。

从曲线中可以看出，超过 24 小时的新闻文章的相关性持续下降，但永远不会完全降至零。即使是几天前的报道也保留了一定的最低相关性，这使得重要但较旧的新闻仍能出现在你的信息流中（尽管排名较低）。

这种行为模仿了新闻相关性通常的运作方式——非常新的报道占据主导地位，但如果较旧的重要报道与用户的兴趣特别相关，它们仍然可以脱颖而出。

## 公式\{#formula}

计算指数衰减得分的数学公式为：

$$
S(doc) = \exp\left( \lambda \cdot \max\left(0, \left|fieldvalue_\{doc\} - origin\right| - offset \right) \right)
$$

其中：

$$
\lambda = \frac\{\ln(decay)\}\{scale\}
$$

用通俗易懂的语言来解释一下：

1. 计算字段值离原点的距离：$|fieldvalue_\{doc\} - origin|$。

1. 减去偏移量（如果有的话），但结果永远不能小于零：$\max(0, distance - offset)$。

1. 乘以$\lambda$，该值由您的缩放和衰减参数计算得出。

1. 取指数，它会给出一个介于0和1之间的值：$\exp(\lambda \cdot value)$。

该$\lambda$计算将您的缩放和衰减参数转换为指数函数的速率参数。更负的$\lambda$会导致更陡峭的初始下降。

## 使用指数衰减\{#use-exponential-decay}

指数衰减可应用于 Zilliz Cloud 中的标准向量搜索和混合搜索操作。以下是实现此功能的关键代码片段。

<Admonition type="info" icon="📘" title="说明">

在使用 Decay Ranker 之前，你必须首先创建一个包含适当数字类型字段（如时间戳、距离等）的集合，这些字段将用于衰减计算。有关包括 Collection 设置、 Schema 定义和数据插入的完整工作示例，请参考[教程：实现基于时间的搜索结果重排](./tutorial-implement-time-based-ranking)。

</Admonition>

### 创建一个 Decay Ranker\{#use-exponential-decay}

在您的 Collection 中设置了一个数字字段（在本示例中为`publish_time`）之后，创建一个指数衰减 Decay Ranker：

<Admonition type="info" icon="📘" title="说明">

**时间单位一致性**：使用基于时间的衰减时，确保 `origin`、`scale` 和 `offset` 参数使用与您的 Collection 中的数据使用相同的时间单位。如果您的 Collection 中的数据以秒为单位存储时间戳，则所有参数都使用秒。如果使用毫秒，则所有参数都使用毫秒。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import datetime

# Create an exponential decay ranker for news recency
# Note: All time parameters must use the same unit as your collection data
rerank = Function(
    name="news_recency",                  # Function identifier
    input_field_names=["publish_time"],   # Numeric field to use
    function_type=FunctionType.RERANK,    # Function type. Must be RERANK
    params={
        "reranker": "decay",              # Specify decay reranker
        "function": "exp",                # Choose exponential decay
        "origin": int(datetime.datetime.now().timestamp()),  # Current time (seconds, matching collection data)
        "offset": 3 * 60 * 60,            # 3 hour breaking news window (seconds)
        "decay": 0.5,                     # Half score at scale distance
        "scale": 24 * 60 * 60             # 24 hours (in seconds, matching collection data)
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

DecayRanker rerank = DecayRanker.builder()
        .name("news_recency")
        .inputFieldNames(Collections.singletonList("publish_time"))
        .function("exp")
        .origin(System.currentTimeMillis())
        .offset(3 * 60 * 60)
        .decay(0.5)
        .scale(24 * 60 * 60)
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "news_recency",
  input_field_names: ["publish_time"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "exp",
    origin: new Date(2025, 1, 15).getTime(),
    offset: 3 * 60 * 60,
    decay: 0.5,
    scale: 24 * 60 * 60,
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
auto rerank = std::make_shared<milvus::DecayRerank>("news_recency");
rerank->AddInputFieldName("publish_time");
rerank->SetFunction("exp");
rerank->SetOrigin(1736870400);
rerank->SetScale(24 * 60 * 60);
rerank->SetOffset(3 * 60 * 60);
rerank->SetDecay(0.5);
```

</TabItem>
</Tabs>

### 在标准向量搜索中使用\{#apply-to-standard-vector-search}

定义 Decay Ranker 后，您可以在搜索请求中通过将其传递给 `ranker` 参数来应用它：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Apply decay ranker to vector search
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],             # Replace with your query vector
    anns_field="dense",                   # Vector field to search
    limit=10,                             # Number of results
    output_fields=["title", "publish_time"], # Fields to return
    #  highlight-next-line
    ranker=rerank,                        # Apply the decay ranker
    consistency_level="Strong"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddedText;

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("market analysis")))
        .annsField("vector_field")
        .limit(10)
        .outputFields(Arrays.asList("title", "publish_time"))
        .functionScore(FunctionScore.builder()
                .addFunction(rerank)
                .build())
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build();
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType MilvusClient } from "@zilliz/milvus2-sdk-node";

const milvusClient = new MilvusClient("YOUR_CLUSTER_ENDPOINT");

const result = await milvusClient.search({
  collection_name: collection_name,
  data: [your_query_vector], // Replace with your query vector
  anns_field: "dense",
  limit: 10,
  output_fields: ["title", "publish_time"],
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
                   .WithLimit(10)
                   .AddOutputField("title")
                   .AddOutputField("publish_time")
                   .AddFloatVector(your_query_vector)
                   .WithConsistencyLevel(milvus::ConsistencyLevel::STRONG);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>