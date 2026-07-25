---
title: "线性衰减 | BYOC"
slug: /linear-decay
sidebar_label: "线性衰减"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "线性衰减会产生一条直线式的下降趋势，在搜索结果中终止于绝对零点。就像即将到来的活动倒计时，相关性会逐渐减弱，直到活动结束，线性衰减会随着项目偏离理想点而以可预测的、稳定的方式降低相关性，直到它们完全消失。当你希望有一个一致的衰减率和明确的截止点，确保超出一定边界的项目完全被排除在结果之外时，这种方法是理想的选择。 | BYOC"
type: origin
token: S745w3MiLialCBkd1sfcBnvLnHg
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - reranking
  - 重排
  - 搜索结果重排
  - 衰减
  - decay ranker
  - linear
  - 线性

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 线性衰减

线性衰减会产生一条直线式的下降趋势，在搜索结果中终止于绝对零点。就像即将到来的活动倒计时，相关性会逐渐减弱，直到活动结束，线性衰减会随着项目偏离理想点而以可预测的、稳定的方式降低相关性，直到它们完全消失。当你希望有一个一致的衰减率和明确的截止点，确保超出一定边界的项目完全被排除在结果之外时，这种方法是理想的选择。

与其他衰减函数不同：

- 高斯衰减遵循一条钟形曲线，该曲线逐渐趋近但永远不会达到零

- 指数衰减保持着一条具有极小相关性的长尾，该长尾无限延伸

线性衰减独特地创造了一个明确的终点，使其在具有自然边界或截止日期的应用中特别有效。

## 何时使用线性衰减\{#when-to-use-linear-decay}

线性衰减对以下情况特别有效：

<table>
   <tr>
     <th><p>用例</p></th>
     <th><p>示例</p></th>
     <th><p>线性方法为何效果良好</p></th>
   </tr>
   <tr>
     <td><p>活动列表</p></td>
     <td><p>演唱会票务平台</p></td>
     <td><p>为过于遥远的未来事件设定明确界限</p></td>
   </tr>
   <tr>
     <td><p>限时优惠</p></td>
     <td><p>限时抢购、促销活动</p></td>
     <td><p>确保过期或即将过期的优惠不会显示</p></td>
   </tr>
   <tr>
     <td><p>配送半径</p></td>
     <td><p>食品配送、快递服务</p></td>
     <td><p>实施严格的地理边界</p></td>
   </tr>
   <tr>
     <td><p>年龄限制内容</p></td>
     <td><p>交友平台、媒体服务</p></td>
     <td><p>设定企业年龄阈值</p></td>
   </tr>
</table>

在以下情况下选择线性衰减：

- 您的应用程序有自然边界、截止日期或阈值

- 超过某一点的项目应完全从结果中排除

- 你需要一个可预测、稳定的相关性下降率

- 用户应该能看到相关和不相关项目之间有清晰的界限

## 稳步下降原则\{#steady-decline-principle}

线性衰减会产生一条直线下降的趋势，以恒定速率递减，直至精确归零。这种模式出现在许多日常场景中，如倒计时器、库存耗尽和截止日期临近等，在这些场景中，相关性有明确的截止点。

<Admonition type="info" icon="📘" title="说明">

<p>所有时间参数（<code>origin</code>、<code>offset</code>、<code>scale</code>）必须使用与 Collection 数据相同的单位。如果您的集合以不同的单位（毫秒、微秒）存储时间戳，请相应地调整所有参数。</p>

</Admonition>

![Wll6bZ6c9o8W23xoTiIc7EqXnJb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Wll6bZ6c9o8W23xoTiIc7EqXnJb.png)

上图展示了线性衰减将如何影响票务平台上的活动列表：

- `origin`（当前日期）：又被称为原点，表示当前时刻，此时相关性达到最大值（1.0）。

- `offset`（1天）：又被称为偏移量，表示“即时事件窗口”——所有在次日内发生的事件都保持完整的相关性得分（1.0），确保非常临近的事件不会因细微的时间差异而受到惩罚。

- `decay` (0.5)：又被称为衰减值，表示在关注范围边缘的得分——此参数控制相关性的下降速率。

- `scale`（10天）：又被称为关注范围，表示相关性降至衰减值的时间段——10天前的事件，其相关性得分减半（0.5）。

从直线曲线可以看出，大约 16 天以后的活动完全没有相关性，根本不会出现在搜索结果中。这就形成了一个明确的界限，确保用户只能看到在规定时间范围内即将发生的相关活动。

这种行为反映了活动规划通常的运作方式——即将发生的活动最为相关，未来几周内的活动重要性逐渐降低，而过于遥远的未来（或已经过去）的活动则根本不应出现。

## 公式\{#formular}

计算线性衰减分数的数学公式为：

$$
S(doc) = \max\left( \frac\{s - \max(0, |fieldvalue_{doc} - origin| - offset)}{s}, 0 \right)
$$

其中：

$$
s = \frac {scale}{(1.0 - decay)}
$$

用通俗易懂的语言来解释一下：

1. 计算字段值离原点的距离：$|fieldvalue_{doc} - origin|$。

1. 减去偏移量（如果有的话），但结果永远不能小于零：$\max(0, distance - offset)$。

1. 根据您的比例和衰减值确定参数$s$。

1. 从$s$中减去调整后的距离，然后除以$s$。

1. 确保结果永远不低于零：$\max(result, 0)$。

该$s$计算将您的缩放和衰减参数转换为分数达到零的点。例如，当衰减值为0.5且缩放值为7时，分数将在距离为14（缩放值的两倍）时恰好达到零。

## 使用线性衰减\{#use-linear-decay}

线性衰减可应用于 Zilliz Cloud 中的标准向量搜索和混合搜索操作。以下是实现此功能的关键代码片段。

<Admonition type="info" icon="📘" title="说明">

<p>在使用 Decay Ranker 之前，你必须首先创建一个包含适当数字类型字段（如时间戳、距离等）的集合，这些字段将用于衰减计算。有关包括 Collection 设置、 Schema 定义和数据插入的完整工作示例，请参考<a href="./tutorial-implement-time-based-ranking">教程：实现基于时间的搜索结果重排</a>。</p>

</Admonition>

### 创建一个衰减排序器

在您的集合设置了一个数字字段（在本示例中，`event_date` 表示从现在起的秒数）之后，创建一个线性衰减排序器：

<Admonition type="info" icon="📘" title="说明">

<p><strong>时间单位一致性</strong>：使用基于时间的衰减时，确保 <code>origin</code>、<code>scale</code> 和 <code>offset</code> 参数使用与您的 Collection 中的数据使用相同的时间单位。如果您的 Collection 中的数据以秒为单位存储时间戳，则所有参数都使用秒。如果使用毫秒，则所有参数都使用毫秒。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import time

# Calculate current time
current_time = int(time.time())

# Create a linear decay ranker for event listings
# Note: All time parameters must use the same unit as your collection data
rerank = Function(
    name="event_relevance",               # Function identifier
    input_field_names=["event_date"],     # Numeric field to use
    function_type=FunctionType.RERANK,    # Function type. Must be RERANK
    params={
        "reranker": "decay",              # Specify decay reranker
        "function": "linear",             # Choose linear decay
        "origin": current_time,           # Current time (seconds, matching collection data)
        "offset": 12 * 60 * 60,           # 12 hour immediate events window (seconds)
        "decay": 0.5,                     # Half score at scale distance
        "scale": 7 * 24 * 60 * 60         # 7 days (in seconds, matching collection data)
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

DecayRanker rerank = DecayRanker.builder()
        .name("event_relevance")
        .inputFieldNames(Collections.singletonList("event_date"))
        .function("linear")
        .origin(System.currentTimeMillis())
        .offset(12 * 60 * 60)
        .decay(0.5)
        .scale(7 * 24 * 60 * 60)
        .build();

```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "event_relevance",
  input_field_names: ["event_date"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "linear",
    origin: new Date(2025, 1, 15).getTime(),
    offset: 12 * 60 * 60,
    decay: 0.5,
    scale: 7 * 24 * 60 * 60,
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
</Tabs>

### 在标准向量搜索中使用\{#apply-to-standard-vector-search}

定义 Decay Ranker 后，您可以在搜索请求中将其传递给 `ranker` 参数来应用它：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Apply decay ranker to vector search
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],              # Replace with your query vector
    anns_field="dense",                   # Vector field to search
    limit=10,                             # Number of results
    output_fields=["title", "venue", "event_date"], # Fields to return
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
import io.milvus.v2.service.vector.request.data.FloatVec;

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new FloatVec(embedding)))
        .annsField("dense")
        .limit(10)
        .outputFields(Arrays.asList("title", "venue", "event_date"))
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
const result = await milvusClient.search({
  collection_name: collection_name,
  data: [your_query_vector], // Replace with your query vector
  anns_field: "dense",
  limit: 10,
  output_fields: ["title", "venue", "event_date"],
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
</Tabs>

