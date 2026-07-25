---
title: "选择合适的集群类型 | BYOC"
slug: /cu-types-explained
sidebar_label: "选择合适的集群类型"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，为集群选择合适的类型是一个关键步骤。Query CU 提供了并行数据处理的基础计算资源，不同类型的集群结合了各异的 CPU、内存和存储配置。 | BYOC"
type: origin
token: DP6Fw8vkzi7pD7kAMB3cjunYn6g
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - cu 类型

---

import Admonition from '@theme/Admonition';


# 选择合适的集群类型

在 Zilliz Cloud 中，为集群选择合适的类型是一个关键步骤。Query CU 提供了并行数据处理的基础计算资源，不同类型的集群结合了各异的 CPU、内存和存储配置。

## 了解集群类型\{#understand-cluster-types}

Zilliz Cloud 提供以下集群类型：性能型、容量型、分层存储型。

下表从多个方面快速对比三种类型之间的差异。如需查看不同集群类型的具体容量和性能对比，请参考[选择最优的集群类型](./cu-types-explained#select-an-optimal-cluster-type)。

<table>
   <tr>
     <th><p>集群类型</p></th>
     <th><p>搜索 QPS</p></th>
     <th><p>搜索延时</p></th>
     <th><p>每 Query CU 容量</p></th>
     <th><p>每百万向量费用</p></th>
   </tr>
   <tr>
     <td><p>性能型</p></td>
     <td><p>500~1500</p></td>
     <td><p>毫秒级</p></td>
     <td><p>150 万 768 维向量</p></td>
     <td><p>每月￥504 起</p></td>
   </tr>
   <tr>
     <td><p>容量型</p></td>
     <td><p>100~300</p></td>
     <td><p>十毫秒级</p></td>
     <td><p>500 万 768 维向量</p></td>
     <td><p>每月￥151 起</p></td>
   </tr>
   <tr>
     <td><p>分层存储型</p></td>
     <td><p>5~20</p></td>
     <td><p>百毫秒级</p></td>
     <td><p>2000 万 768 维向量</p></td>
     <td><p>每月 ￥55 起</p></td>
   </tr>
</table>

### 性能型集群\{#performance-optimized-cluster}

- 专门为需要低时延和高吞吐的场景设计。

- 特别适用于实时应用场景，如生成型 AI、推荐系统、对话机器人等。

### 容量型集群\{#capacity-optimized-cluster}

- 适用于处理大量数据集，数据容量是性能型集群 的 **4** 倍，但搜索效率相对较低。

- 特别适合大规模的非结构化数据检索、版权识别和身份验证。

## 选择最优的集群类型\{#select-an-optimal-cluster-type}

在选定集群类型时，应综合考虑数据体量、性能要求和预算因素。向量数据的大小，包括向量数量和维度，是决定集群资源配置的关键。

### 容量评估\{#assess-capacity}

以下表格根据向量维度和总向量数，展示了各种集群类型的处理容量。

<table>
   <tr>
     <th><p>向量维度</p></th>
     <th><p>性能型集群（每 Query CU可容纳最大向量数）</p></th>
     <th><p>容量型集群（每 Query CU 可容纳最大向量数）</p></th>
     <th><p>存储扩展型集群 （（每  Query CU 可容纳最大向量数）</p></th>
   </tr>
   <tr>
     <td><p>128</p></td>
     <td><p>750 万</p></td>
     <td><p>2500 万</p></td>
     <td><p>1 亿</p></td>
   </tr>
   <tr>
     <td><p>256</p></td>
     <td><p>450 万</p></td>
     <td><p>1500 万</p></td>
     <td><p>6000 万</p></td>
   </tr>
   <tr>
     <td><p>512</p></td>
     <td><p>225 万</p></td>
     <td><p>750 万</p></td>
     <td><p>3000 万</p></td>
   </tr>
   <tr>
     <td><p>768</p></td>
     <td><p>150 万</p></td>
     <td><p>500 万</p></td>
     <td><p>2000 万</p></td>
   </tr>
   <tr>
     <td><p>1024</p></td>
     <td><p>112.5 万</p></td>
     <td><p>375 万</p></td>
     <td><p>1500 万</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

<p>上面的数据基于仅考虑主键和向量的测试。如果您的数据集包含其他标量字段（如 id、标签、关键词），实际的容量可能会有所不同。因此，建议进行个性化测试以获得更精确的评估。</p>

</Admonition>

### 性能评估\{#evaluate-performance}

性能指标，尤其是时延和每秒查询数（QPS），非常关键。性能型集群在时延和吞吐量方面显著超越其他类型，特别是在标准的 top-k 值（10 至 250）范围内。

下表显示了每种集群类型在 QPS 方面的测试结果。

<table>
   <tr>
     <th><p>top_k 值</p></th>
     <th><p>性能型集群的 QPS（768 维度，150万向量）</p></th>
     <th><p>容量型集群的 QPS（768 维度，500 万向量）</p></th>
   </tr>
   <tr>
     <td><p>10</p></td>
     <td><p>520</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p>100</p></td>
     <td><p>440</p></td>
     <td><p>80</p></td>
   </tr>
   <tr>
     <td><p>250</p></td>
     <td><p>270</p></td>
     <td><p>60</p></td>
   </tr>
   <tr>
     <td><p>1000</p></td>
     <td><p>150</p></td>
     <td><p>40</p></td>
   </tr>
</table>

下表显示了每种集群类型在时延方面的测试结果。

<table>
   <tr>
     <th><p>top_k</p></th>
     <th><p>性能型集群的时延（768 维度，150万向量）</p></th>
     <th><p>容量型集群的时延（768 维度，500 万向量）</p></th>
   </tr>
   <tr>
     <td><p>10</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>100</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>250</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>1000</p></td>
     <td><p>10 - 20 ms</p></td>
     <td><p>50 - 100 ms</p></td>
   </tr>
</table>

## 场景分析\{#scenario-breakdown}

设想您正在开发一个含有 800 万张图片的图像推荐应用程序。图库中的每张图像均由一个 768 维 Embedding 向量代表。您的目标是能迅速处理每秒 1000 次的推荐请求，并在 30 毫秒内返回前 100 张推荐图片。

为了选出符合此需求的适宜的集群类型和 Query CU 数量，请按以下步骤操作：

1. **时延评估**：性能型集群是唯一能满足 30 毫秒时延需求的类型。

1. **容量考量**：单个性能型集群 Query CU 能处理 150 万个 768 维向量。为容纳全部 800 万向量，您需配置至少 6 个此类 Query CU。

1. **吞吐量检验**：在 top-k 设置为100的情况下，性能型集群的每秒查询量（QPS）为 440。为维持 1000 QPS 的持续性能，需要将副本数量增加 3 倍。
综上所述，针对这一应用场景，选择性能型集群是最合适的。建议配置 3 套副本，每套包含 6 个 Query CU，以确保应用运行的完美性能。

总体而言，对于这种情况，性能型的集群是您的最佳选择。配置 3 个副本，每个副本包含 6 个 Query CU，应该能完全满足您的需求。