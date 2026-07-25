---
title: "成本优化 | Cloud"
slug: /cost-optimization
sidebar_key: cost-optimization
sidebar_label: "成本优化"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "向量数据库正在成为 AI 应用的核心基础设施。随着数据规模增长和查询量攀升，成本控制变得至关重要。本文从部署选型、索引调优、弹性伸缩、折扣获取和账单分析五个维度，系统梳理 Zilliz Cloud 的成本优化策略。 | Cloud"
type: origin
token: ObcZwiYelidyeTk8HGaclpWTnFe
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 成本优化

---

import Admonition from '@theme/Admonition';


# 成本优化

向量数据库正在成为 AI 应用的核心基础设施。随着数据规模增长和查询量攀升，成本控制变得至关重要。本文从部署选型、索引调优、弹性伸缩、折扣获取和账单分析五个维度，系统梳理 Zilliz Cloud 的成本优化策略。

## 理解您的账单\{#understand-your-bill}

在优化成本之前，需要先搞清楚钱花在了哪里。Zilliz Cloud 的费用由五个部分组成：

<table>
   <tr>
     <th><p><strong>计费项</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>是否可优化</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./dedicated-cluster-cost">计算 (CU)</a></p></td>
     <td><p>Dedicated 集群按 CU 时长计费</p></td>
     <td><p>选型 + 伸缩</p></td>
   </tr>
   <tr>
     <td><p><a href="./serverless-cluster-cost">读写操作</a></p></td>
     <td><p>Serverless 集群按操作量计费</p></td>
     <td><p>查询优化</p></td>
   </tr>
   <tr>
     <td><p><a href="./storage-cost">存储</a></p></td>
     <td><p>数据和备份存储，无论集群是否运行</p></td>
     <td><p>Build level + 数据清理</p></td>
   </tr>
   <tr>
     <td><p><a href="./data-transfer-cost">数据传输</a></p></td>
     <td><p>数据进出和跨区域传输</p></td>
     <td><p>架构规划</p></td>
   </tr>
   <tr>
     <td><p><a href="./audit-log-cost">审计日志</a></p></td>
     <td><p>审计日志消耗额外资源</p></td>
     <td><p>按需开启</p></td>
   </tr>
</table>

大多数用户 70% 以上的费用来自计算。这也是优化空间最大的地方。

如需预估您的计算费用，可以使用 [Zilliz Cloud 价格计算器](https://zilliz.com.cn/pricing)。您只需要输入向量维度、数据量和 QPS 即可得到月度费用预估。实际使用成本往往低于计算器的报价——计算器是按峰值估算的，而实际业务很少持续跑满。

## 选对部署方式\{#choose-the-right-deployment-mode}

部署方式的选择是影响成本最大的单一决策。选错部署方式，后续所有优化加起来都弥补不了差距。

### 各模式一览\{#deployment-methods-at-a-glance}

<table>
    <tr>
        <th><p>部署方式</p></th>
        <th><p>单价参考 (768维)</p></th>
        <th><p>每 CU 容量</p></th>
        <th><p>Search QPS</p></th>
        <th><p>延时（Latency）</p></th>
        <th><p>适用场景</p></th>
    </tr>
    <tr>
        <td><p>Free</p></td>
        <td><p>¥0</p></td>
        <td><p>5 GB，最多 5  个 Collection</p></td>
        <td><p>—</p></td>
        <td><p>—</p></td>
        <td><p>学习、原型验证</p></td>
    </tr>
    <tr>
        <td><p>Serverless</p></td>
        <td><p>按操作付费</p></td>
        <td><p>自动伸缩</p></td>
        <td><p>自动</p></td>
        <td><p>中等</p></td>
        <td><p>流量不稳定、开发测试、小规模生产</p></td>
    </tr>
    <tr>
        <td><p>Dedicated-性能型</p></td>
        <td><p>约 ¥504<br/>每百万向量 / 月</p></td>
        <td><p>150 万向量</p></td>
        <td><p>500–1,500</p></td>
        <td><p>低 (&lt;10 ms p99)</p></td>
        <td><p>低延时关键业务</p></td>
    </tr>
    <tr>
        <td><p>Dedicated-容量型</p></td>
        <td><p>约 ¥151<br/>每百万向量 / 月</p></td>
        <td><p>500 万向量</p></td>
        <td><p>100–300</p></td>
        <td><p>中等</p></td>
        <td><p>大规模生产、成本敏感</p></td>
    </tr>
    <tr>
        <td><p>Dedicated-分层存储型</p></td>
        <td><p>约 ¥55<br/>每百万向量 / 月</p></td>
        <td><p>2000 万向量 (如需选择分层存储型，需至少 ≥8 CU)</p></td>
        <td><p>100–150 (热数据)</p></td>
        <td><p>较高</p></td>
        <td><p>海量数据、冷热分离</p></td>
    </tr>
    <tr>
        <td><p>BYOC</p></td>
        <td><p>自定义</p></td>
        <td><p>自定义</p></td>
        <td><p>自定义</p></td>
        <td><p>自定义</p></td>
        <td><p>合规需求、利用自有云折扣</p></td>
    </tr>
</table>

### 选型决策树\{#selection-decision-tree}

- **数据量 < 100 万向量，QPS < 50？**
→ 用 Serverless。按操作付费，空闲时零成本。不要为"万一流量上来了"提前买 Dedicated。

- **数据量 100 万–5000 万向量，需要稳定低延时？**
→ Dedicated 容量型是性价比最优解。比性能型便宜 3 倍，延时在百毫秒级别对大多数 RAG、推荐场景完全够用。只有对延时有极端要求（&lt;10 ms p99）的实时搜索、在线推理场景才推荐性能型。

- **数据量 > 5000 万向量，大量数据低频访问？**
→ 选择分层存储型。比容量型再便宜 3 倍，适合"大数据量 + 只有一部分热数据被频繁查询"的场景。典型案例：历史日志向量化分析、全量商品库搜索（热门商品占 20%）。

- **有合规需求或想用自有云 RI/SP 折扣？**
→ BYOC (Bring Your Own Cloud)。在您自己的 VPC 里直接运行集群，计算资源用您自己采购的云资源，可以叠加企业级云折扣。适合金融、医疗等有数据主权要求的场景。

### 重点推荐：容量型集群——大多数场景的最优解\{#recommendation-capacity-optimized-the-best-fit-for-most-scenarios}

很多用户对容量型集群存在误解，认为它只是"便宜但慢"的低配版本。事实恰恰相反，**容量型是 Zilliz Cloud 在向量数据库架构上最具技术深度的产品形态。**

传统向量数据库把索引和原始数据全部放在内存中，这是最简单粗暴的做法——用内存换速度。容量型集群采用了完全不同的技术路线：

- **分层存储架构：** 向量索引常驻内存保证搜索速度，原始数据和标量索引使用 Mmap 映射到磁盘，通过智能缓存策略实现接近内存的访问速度。这套架构让每个 CU 承载的数据量达到性能型集群的 3 倍以上。

- **DiskANN 级别的索引优化：** 容量型集群的 IVF 索引经过专门调优，在磁盘友好的访问模式下最大化吞吐。配合 NVMe SSD，实际搜索延时在 10–50 ms 范围内——对于 RAG、推荐、内容审核等绝大多数 AI 应用来说，这个延时完全无感知。

- **更高的资源利用率：** 性能型集群的内存利用率通常在 60–70%（要留 headroom 给突发负载和 compaction），而容量型集群通过分层存储设计，可以把有效数据密度提升到 90% 以上。

**一句话总结：性能型是用钱买延时，容量型是用技术换效率。** 除非您的场景对 p99 延时有个位数毫秒的硬性要求（如实时竞价、在线反欺诈），否则容量型都是更优选择。

以一个真实场景为例：某 SaaS 公司有 5000 万 768 维向量，查询延时要求 &lt;100 ms，QPS 峰值约 200。如果选性能型集群需要约 36 CU（约 ¥32000/月），选容量型集群只需要 12 CU（约 ¥11000月），**节省近 70%**，延时完全满足要求。

### 常见误区\{#common-pitfalls}

- **误区一：一上来就选性能型。** 我们见过太多用户在 PoC 阶段选了性能型集群，然后按这个标准做预算。实际上容量型集群不是"降级版的性能型集群"——它是一套完全不同的、为成本效率专门设计的技术架构，QPS 对大多数场景绰绰有余，单位成本只有性能型的 1/3。

- **误区二：忽略分层存储型。** 分层存储型的单价只有性能型的 1/9。如果您的数据有明显的冷热分层——大部分数据很少被查询，只有一小部分活跃数据需要低延时——分层存储型可以把成本压缩一个数量级。

- **误区三：小规模就上 Dedicated。** 数据量不大、流量不稳定的场景，Serverless 按操作付费远比 Dedicated 划算。不要为了"看起来专业"而多花钱。

## 索引与存储优化\{#index-and-storage-optimization}

选好了部署模式之后，下一步是让每个 CU 发挥最大价值。Zilliz Cloud 提供三个关键调优参数。

### Index Build Level——存储容量 vs 召回率\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ 参数](./tune-index-build-level)控制索引的精度和存储密度。对于不需要极致召回率的场景，降低 build level 可以显著增加每个 CU 的存储容量。

- **性能型集群 (768维, 每 CU)：**

    <table>
        <tr>
            <th><p>Build Level</p></th>
            <th><p>容量</p></th>
            <th><p>对比默认增幅</p></th>
            <th><p>Recall</p></th>
            <th><p>QPS</p></th>
        </tr>
        <tr>
            <td><p>容量优先(0)</p></td>
            <td><p>210 万</p></td>
            <td><p>0.4</p></td>
            <td><p>90–95%</p></td>
            <td><p>~2,850</p></td>
        </tr>
        <tr>
            <td><p>平衡型(1)</p></td>
            <td><p>150 万</p></td>
            <td><p>基准</p></td>
            <td><p>91–97%</p></td>
            <td><p>~3,500</p></td>
        </tr>
        <tr>
            <td><p>精度优先 (2)</p></td>
            <td><p>100 万</p></td>
            <td><p>-0.33</p></td>
            <td><p>92–98%</p></td>
            <td><p>~3,000</p></td>
        </tr>
    </table>

- **容量型集群 (768维, 每 CU)：**

    <table>
        <tr>
            <th><p>Build Level</p></th>
            <th><p>容量</p></th>
            <th><p>对比默认增幅</p></th>
            <th><p>Recall</p></th>
            <th><p>QPS</p></th>
        </tr>
        <tr>
            <td><p>容量优先(0)</p></td>
            <td><p>700 万</p></td>
            <td><p>0.4</p></td>
            <td><p>89–97%</p></td>
            <td><p>~300</p></td>
        </tr>
        <tr>
            <td><p>平衡型(1)</p></td>
            <td><p>500 万</p></td>
            <td><p>基准</p></td>
            <td><p>93–98%</p></td>
            <td><p>~350</p></td>
        </tr>
        <tr>
            <td><p>精度优先 (2)</p></td>
            <td><p>300 万</p></td>
            <td><p>-0.4</p></td>
            <td><p>94–98%</p></td>
            <td><p>~345</p></td>
        </tr>
    </table>

**实际案例：** 假设您有一个 16 CU 的容量型集群，默认平衡型模式可存储 8000 万向量。切换到容量优先后可存储 1.12 亿向量——同样的数据量只需要 12 CU 就够了，**节省 25% 的 CU 成本**。如果您的场景对 recall 要求在 90% 以上就可以接受（大多数推荐、日志分析场景），这就是白送的优化。

<Admonition type="info" icon="📘" title="**说明**">

Build level 设置后不可修改，需要 drop 并重建索引。建议在创建集合前做好评估。仅支持浮点向量类型 (FLOAT_VECTOR, FLOAT16_VECTOR, BFLOAT16_VECTOR)。

</Admonition>

### Search Level——查询性能 vs 计算成本\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ 参数](./tune-recall-rate)（1–10）控制搜索时的精度，默认值 1 即可达到约 90% 的召回率。

- **level 1–3：** 适合大多数场景。推荐、RAG、日志分析等对 recall 要求在 90–95% 的场景完全够用。

- **level 4–7：** 高精度场景。以约 2–3 倍的延时换取 95–98% 的 recall。

- **level 8–10：** 极致精度。延时会显著增加，仅用于对准确率有极端要求的场景（如金融风控、医学影像检索）。

**优化建议：** 不要凭感觉调高 level。使用 `enable_recall_calculation=true` 参数实测不同 level 下的 recall，找到满足业务需求的最低值。level 每提高一级，搜索耗费的计算资源都在增加——在 Serverless 模式下直接体现为 Read vCU 成本增加，在 Dedicated 模式下体现为同等 CU 下能支撑的 QPS 降低。

### Mmap 配置——内存与磁盘的平衡\{#mmap-configuration-balancing-memory-and-disk}

[Memory Mapping (mmap) ](./use-mmap)允许将部分数据从内存卸载到磁盘，用适度的延时换取更大的存储容量。

<table>
    <tr>
        <th><p>集群类型</p></th>
        <th><p>默认 MMAP 策略</p></th>
        <th><p>效果</p></th>
    </tr>
    <tr>
        <td><p>Dedicated-性能型</p></td>
        <td><p>仅向量原始数据 使用 mmap；标量数据和所有索引在内存</p></td>
        <td><p>保障低延时</p></td>
    </tr>
    <tr>
        <td><p>Dedicated-容量型</p></td>
        <td><p>标量索引 + 所有原始数据使用 mmap；仅向量索引在内存</p></td>
        <td><p>最大化容量</p></td>
    </tr>
    <tr>
        <td><p>Free / Serverless</p></td>
        <td><p>所有字段和索引均 使用 mmap</p></td>
        <td><p>依赖系统缓存</p></td>
    </tr>
</table>

**优化建议：**

- 对于性能型集群，如果标量过滤不是瓶颈，可以考虑将标量字段配置 mmap 以释放内存给向量索引。

- 对于容量型集群，默认策略已经是存储优先，一般不需要额外调整。

<Admonition type="info" icon="📘" title="**说明**">

修改 mmap 设置前需要释放 Collection，修改后再重新加载 Collection。**配置不当可能导致性能下降甚至 OOM**，建议在测试环境验证。

</Admonition>

## 优化您的查询\{#query-optimization}

索引和存储决定了集群能存多少数据，而查询方式决定了每次请求消耗多少资源。对于 Serverless 用户，查询优化直接降低 Read vCU 费用；对于 Dedicated 用户，优化查询意味着同样的 CU 能支撑更高的 QPS。

### 标量字段加索引\{#index-scalar-fields}

很多用户只关注[向量索引](./index-vector-fields)，忽略了[标量字段索引](./index-scalar-fields)。如果您的查询带有过滤条件（比如 `category == "electronics"` 或 `timestamp > 1700000000`），没有标量索引意味着**每次查询都要全表扫描标量字段**，代价极高。您可以在创建 collection 时为常用过滤字段添加索引。

```python
collection.create_index(
    field_name="category",
    index_name="idx_category"
)
collection.create_index(
    field_name="timestamp",
    index_name="idx_timestamp"
)
```

**优化建议：**

- 对所有出现在 `filter` 表达式中的标量字段建立索引。Zilliz Cloud 会自动选择合适的索引类型（字符串用倒排索引，数值用排序索引等）。

- 标量索引的内存开销很小，但对过滤性能的提升是数量级的——从全表扫描变成索引查找。

- 特别注意：如果您在容量型集群上做带过滤的向量搜索，标量索引的有无会直接决定查询延时是毫秒级还是秒级。

### 选择合适的 TopK\{#select-appropriate-topk}

[TopK](./single-vector-search) 直接影响搜索的计算量和网络传输量。很多用户习惯性地设置 `top_k=100` 甚至 `top_k=1000`，但实际只用前 10 条结果。

<table>
    <tr>
        <th><p>TopK</p></th>
        <th><p>相对延时</p></th>
        <th><p>相对 RU 成本 (Serverless)</p></th>
        <th><p>典型场景</p></th>
    </tr>
    <tr>
        <td><p>1–10</p></td>
        <td><p>基准</p></td>
        <td><p>1x</p></td>
        <td><p>RAG（通常取 3–5 条上下文）</p></td>
    </tr>
    <tr>
        <td><p>10–50</p></td>
        <td><p>1.2–1.5x</p></td>
        <td><p>1.5–2x</p></td>
        <td><p>推荐系统、搜索结果页</p></td>
    </tr>
    <tr>
        <td><p>50–200</p></td>
        <td><p>1.5–3x</p></td>
        <td><p>2–4x</p></td>
        <td><p>候选集生成、重排序输入</p></td>
    </tr>
    <tr>
        <td><p>200–1000</p></td>
        <td><p>3–10x</p></td>
        <td><p>4–10x</p></td>
        <td><p>批量分析、聚类</p></td>
    </tr>
</table>

**优化建议：**

- **RAG 场景：** TopK 设为 3–10 即可。更多的上下文不一定提升 LLM 回答质量，反而增加 token 成本和向量搜索成本，双倍浪费。

- **推荐场景：** 如果后续有重排序环节，TopK 设为重排序模型能处理的上限即可（通常 20–50）。

- **如果您需要大 TopK：** 考虑用[分页](./single-vector-search#use-limit)（`offset` + `limit`）代替一次性大量返回，或者使用 [Iterator](./with-iterators) 方式逐步获取。

### 精简 Output Fields\{#refine-output-fields}

默认情况下，搜索结果会返回所有标量字段。如下所示：

```python
results = collection.search(vectors, "embedding", search_params, limit=10)
```

如果您的 Collection 包含大文本字段（如文档原文、HTML 内容），每次查询都传输这些数据会显著增加延时和网络成本。因此，您可以在搜索时指定需要返回的字段。如下所示：

```python
results = collection.search(
    vectors, "embedding", search_params, limit=10,
    output_fields=["id", "title", "category"]  # 不要返回 "content" 等大字段
)
```

详情请参考[使用 Output Fields 参数](./single-vector-search#use-output-fields)。

**优化建议：**

- 始终显式指定 `output_fields`，只返回业务逻辑需要的字段。

- 对于 RAG 场景，如果需要原文内容，可以先用向量搜索拿到 ID，再从外部存储（如 Redis、数据库）按 ID 查原文。这样向量搜索更快，外部存储也能利用缓存。

- 在 Serverless 模式下，返回数据量直接影响 Read vCU 计费——减少不必要的字段是最简单的降本手段。

### 用好 Partition Key\{#utilize-partition-keys}

[Partition Key](./use-partition-key) 是经常被低估的优化利器。它根据某个标量字段的值自动将数据分到不同分区，查询时只扫描相关分区，跳过无关数据。

以下示例展示了如何在创建 Collection 时指定 Partition Key:

```python
schema.add_field("tenant_id", DataType.VARCHAR, max_length=128, is_partition_key=True)
```

**适用场景：**

- **多租户 SaaS：** 以 `tenant_id` 为 partition key，每个租户的查询只扫描自己的数据分区，QPS 和延时都大幅优化。

- **分类过滤：** 以 `category` 为 partition key，搜索特定类别时无需扫描全量数据。

**性能提升：** 假设有 100 个租户，数据均匀分布，使用 partition key 后每次查询的扫描量降低约 99%。即使分布不均匀，通常也能减少 50–90% 的扫描量。

## 弹性伸缩\{#elastic-scaling}

Dedicated 集群最大的成本陷阱是"按峰值配置，全天候运行"。Zilliz Cloud 提供三种伸缩策略来打破这个局面。

### 动态扩缩容\{#dynamic-scaling}

设定 CU 的最小值和最大值，系统根据实时负载自动伸缩。

- **Query CU** 根据 CU 容量型 指标自动调整（数据量驱动）

- **Replica** 根据 CU Computation 指标自动调整（QPS 驱动）

**典型场景：** 一个电商搜索服务，白天峰值需要 32 CU，凌晨只需要 8 CU。在动态扩缩容设置中选择 min=8, max=32，系统在低峰时自动缩到 8 CU。假设每天有 10 小时低峰期，**月度计算成本可节省约 30–40%**。

详情请参考[动态扩缩容](./scale-query-cu#dynamic-scaling)。

### 定时扩缩容\{#scheduled-scaling}

适合流量模式可预测的业务。支持基础模式（简单选择器）和高级模式（使用Unix cron 表达式）。

**典型配置：**

- 工作日 9:00 扩容到 32 CU，22:00 缩容到 8 CU

- 周末全天维持 8 CU

- 每月月底促销期提前扩容

详情请参考[定时扩缩容](./scale-query-cu#scheduled-scaling)。

### 手动扩缩容\{#manual-scaling}

不要忽略最简单的操作——当业务进入低谷期（如项目间歇、淡季），主动降低 CU 配置。很多用户在 PoC 结束后忘了缩容，白白多付几周甚至几个月的费用。

详情请参考[手动扩缩容](./scale-query-cu#manual-scaling)。

### 扩缩容限制\{#scaling-constraints}

- Query CU × Replica ≤ 20480

- Replica > 1 时，集群不能缩到 12 CU 以下

- 缩容时数据量需低于新 CU 容量的 80%

- 12 CU 以下只能调整 Query CU；12 CU 以上可独立调整 Query CU 或 Replica

**建议：** 对于流量不可预测的场景优先用动态扩缩容；对于有规律的流量用定时扩缩容；两者可以组合使用。

## 获取优惠券与更多折扣\{#get-more-credits-and-discounts}

除了技术优化，充分利用 Zilliz 提供的优惠计划同样重要。

### 优惠券\{#credits}

<table>
    <tr>
        <th><p>渠道</p></th>
        <th><p>优惠券</p></th>
        <th><p>有效期</p></th>
        <th><p>说明</p></th>
    </tr>
    <tr>
        <td><p>新用户使用企业邮箱注册</p></td>
        <td><p>300</p></td>
        <td><p>30 天</p></td>
        <td><p>开箱即用，无需绑定支付方式</p></td>
    </tr>
    <tr>
        <td><p>添加支付方式</p></td>
        <td><p>--</p></td>
        <td><p>优惠券有效期延长至 1 年</p></td>
        <td><p>绑定支付方式后未用完的优惠券自动延长有效期至 1 年</p></td>
    </tr>
    <tr>
        <td><p>回收站</p></td>
        <td><p>免费</p></td>
        <td><p>—</p></td>
        <td><p>删除的数据在回收站中不产生任何费用</p></td>
    </tr>
</table>

**建议：**首次注册后请尽早添加支付方式，将¥300 优惠券的有效期从 30 天延长到 1 年，以便充分做技术评估。

### 专项计划\{#dedicated-programs}

<table>
    <tr>
        <th><p>计划</p></th>
        <th><p>面向人群</p></th>
        <th><p>如何申请</p></th>
    </tr>
    <tr>
        <td><p>Zilliz AI 初创计划</p></td>
        <td><p>早期创业公司</p></td>
        <td><p>通过<a href="https://zilliz.com.cn/rag-collaborate-plan">官网</a>申请，获取额外优惠券和技术支持</p></td>
    </tr>
    <tr>
        <td><p>AI Agent Program</p></td>
        <td><p>AI Agent 开发者</p></td>
        <td><p>面向构建 AI Agent 应用的开发者，提供专属优惠券。敬请期待。</p></td>
    </tr>
</table>

### 企业和大客户\{#enterprise-customers}

- **联系销售获取自定义报价。**企业客户可以通过包年订阅获取折扣，具体价格请[联系销售](https://zilliz.com.cn/contact-sales)。

- **云市场订阅：** 通过[阿里云](/docs/subscribe-on-aliyun-marketplace)、[亚马逊云科技](/docs/subscribe-on-amazon-marketplace)的云市场订阅，可以将 Zilliz Cloud 费用合并到云账单中，使用企业在公有云已享受的折扣。

- **现金充值：** 通过银行对公转账进行[现金充值](/docs/advance-pay)，扣费优先级为优惠券 > 现金充值> 云市场订阅，适合有预算管理需求的企业。

## 用量页面\{#monitor-usage-page}

优化不是一次性工作。Zilliz Cloud 提供多维度的成本分析工具，帮助您持续追踪和优化。

### 可视化成本分析\{#}

在**账单>用量**页面，可以按以下五个维度拆解账单：

<table>
    <tr>
        <th><p>维度</p></th>
        <th><p>用途</p></th>
    </tr>
    <tr>
        <td><p>项目</p></td>
        <td><p>对比不同业务线/部门的用量</p></td>
    </tr>
    <tr>
        <td><p>集群</p></td>
        <td><p>定位哪个集群是费用大头</p></td>
    </tr>
    <tr>
        <td><p>时间段</p></td>
        <td><p>查看日级别趋势，发现异常波动</p></td>
    </tr>
    <tr>
        <td><p>费用类型</p></td>
        <td><p>区分不同计费项</p></td>
    </tr>
    <tr>
        <td><p>云地域</p></td>
        <td><p>跨区域部署时对比各区域成本</p></td>
    </tr>
</table>

多个维度可以组合过滤。比如选择某个项目最近 7 天的CU 费用，就能精确看到这个业务线的计算费用趋势。

详情请参考[分析成本](./analyze-cost)。

### RESTful API\{#restful-api}

[查询日用量](/reference/restful/query-daily-usage-v2) API 提供精确到 8 位小数的用量数据，可以编程化接入内部 FinOps 流程：

- 自动生成成本报告

- 与内部预算系统对接

- 设置自定义告警规则

### 费用告警\{#usage-alerts}

建议监控[费用指标](/docs/metrics-alerts-reference#organization-level-metrics)，设置费用告警阈值，及时发现异常消费。尤其是在以下场景：

- 新上线的集群，验证实际成本是否符合预期

- 动态扩缩容配置后，观察伸缩是否正常工作

- 团队新成员可能创建了不必要的资源

## 成本优化检查清单\{#cost-optimization-checklist}

最后，给出一份可以直接对照执行的成本优化检查清单：

**选型阶段**

**索引配置**

**查询优化**

**运维阶段**

**账务优化**

## 总结\{#summary}

Zilliz Cloud 的成本优化不是某一个参数的调整，而是从选型、配置、查询、运维到账务的系统工程。最大的优化杠杆在于：

1. **优先选容量型**——这不是"降级"，而是一套为成本效率专门设计的分层存储架构，单位成本只有性能型 的 1/3，覆盖 90% 以上的生产场景

1. **优化查询方式**——标量加索引、控制 TopK、精简返回字段、用好 Partition Key，每一项都能显著降低单次查询成本

1. **用好弹性伸缩**——不为空闲资源买单，节省 30–40%

1. **调优 build level**——同样的 CU 多存 40% 数据

做好这几件事，大多数用户都能在满足业务需求的前提下，将成本控制在合理范围内——同时享受到 Zilliz Cloud 在存储分层、索引优化和弹性调度上的技术红利。