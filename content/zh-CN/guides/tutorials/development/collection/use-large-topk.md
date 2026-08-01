---
title: "使用大 TopK | Cloud"
slug: /use-large-topk
sidebar_label: "使用大 TopK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 的 Collection 在一次搜索或查询结果中最多可返回 16,384 个实体。若需要突破该 topK 上限，您可以设置查询模式，让 Zilliz Cloud 在单次搜索或查询中返回数百万实体，而无需使用复杂且耗时的迭代器方案。 | Cloud"
type: origin
token: CdhvwcPwdikA7ak3bNTcfjMInde
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 使用大 TopK

Zilliz Cloud 的 Collection 在一次搜索或查询结果中最多可返回 16,384 个实体。若需要突破该 topK 上限，您可以设置查询模式，让 Zilliz Cloud 在单次搜索或查询中返回数百万实体，而无需使用复杂且耗时的迭代器方案。

<Admonition type="info" icon="📘" title="说明">

该功能适用于与 Milvus v2.6.x 兼容的 Zilliz Cloud 集群。如需体验此功能，请[联系我们](https://support.zilliz.com.cn/hc/zh-cn)。

</Admonition>

## 概览\{#overview}

默认情况下，Zilliz Cloud Collection 在搜索或查询操作中的最大 topK 为 **16,384**。当您需要在单次请求中返回更多实体（例如批量相似性检索或数据挖掘场景），可以在 Collection 上将 `query_mode` 属性设置为 `large_topk` 以开启**大 TopK**模式。这样可将 topK 上限提升至 **1,000,000**（一百万）个实体。

启用大 TopK 后，底层索引策略会从默认 Auto Index 切换为 **IVF（倒排文件索引）** + **RaBitQ** 深度压缩。该组合针对高召回、大范围检索进行了优化，但会牺牲小 K 查询性能。

## 何时使用大 TopK\{#when-to-use-large-topk}

大 TopK 适用于需要在单次搜索中返回大量相似实体的场景，例如：

- **批量相似性检索**：针对一个查询向量返回 top 100,000 或 top 1,000,000 的最相似项。

- **数据挖掘与分析**：抽取大规模候选集，用于后续处理、过滤或模型训练。

- **回归测试准备**：检索大结果集，构建仿真团队使用的测试语料。

对于交互式、时延敏感且 topK 较小（如 top 10 或 top 100）的在线查询，建议使用默认查询模式。

## 前置条件与权衡\{#prerequisites-and-trade-offs}

启用大 TopK 前，请注意以下权衡：

- **小 K 性能下降**：切换到 `large_topk` 后，小 K 查询（K < 16,384）相比默认模式会出现更高时延和更低召回。

- **查询时延**：大 TopK 查询时延明显高于标准查询。topK=100,000 可能需要数秒，topK=1,000,000 可能需要数分钟。

- **资源占用**：单次大 TopK 查询在结果排序阶段可能消耗数 GB 内存。在 Perf 集群上，这可能影响同集群内其他查询。

- **更适合离线场景**：对于批处理负载，建议使用 On-demand Compute 数据库。数据库按需消耗 CU，不会影响在线服务。

- **需要重建索引**：若 Collection 已有向量索引，需先 release 并删除现有索引后再启用大 TopK。重建期间Collection 搜索不可用。

## 启用大 TopK\{#enable-large-topk}

### 在创建 Collection 时启用（推荐）\{#during-collection-creation-recommended}

如果您已确定 Collection 需要大 TopK，建议在创建时直接指定，避免后续切换成本：

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="your_uri", token="your_token")

client.create_collection(
    collection_name="scenarios_corpus",
    schema=schema,
    index_params=index_params,
    properties={"query_mode": "large_topk"}
)
```

### 在已有 Collection 上启用\{#on-an-existing-collection}

对于尚未创建向量索引的已有 Collection，可直接启用大 TopK：

```python
client.alter_collection_properties(
    collection_name="scenarios_corpus",
    properties={"query_mode": "large_topk"}
)
```

对于**已创建**向量索引的 Collection，需先删除索引，再启用模式，最后重建索引：

```python
# 1. Release 并删除现有索引
client.release_collection(collection_name="scenarios_corpus")
client.drop_index(collection_name="scenarios_corpus", index_name="vector_idx")

# 2. 启用 Large TopK
client.alter_collection_properties(
    collection_name="scenarios_corpus",
    properties={"query_mode": "large_topk"}
)

# 3. 重建索引（会自动使用 IVF + RaBitQ）
client.create_index(
    collection_name="scenarios_corpus",
    index_params=index_params
)
client.load_collection(collection_name="scenarios_corpus")
```

### 查看当前查询模式\{#check-current-query-mode}

```python
info = client.describe_collection(collection_name="scenarios_corpus")
query_mode = info["properties"].get("query_mode")  # None 表示默认模式
```

### 关闭大 TopK\{#disable-large-topk}

若需恢复默认查询模式，可删除 `query_mode` 属性。注意这同样需要先 release 并删除现有索引：

```python
client.drop_collection_properties(
    collection_name="scenarios_corpus",
    property_keys=["query_mode"]
)
```

## 执行大 TopK 搜索\{#perform-a-large-topk-search}

启用大 TopK 后，仍使用标准 `search` 方法，只需传入更大的 `limit` 值：

### 在线搜索（Serving Cluster）\{#online-search-serving-cluster}

```python
results = client.search(
    collection_name="scenarios_serving",
    data=[query_vector],
    limit=500000
)
```

### 离线搜索（On-demand Compute）\{#offline-search-on-demand-compute}

```python
results = client.search(
    collection_name="scenarios_corpus",
    data=[query_vector],
    limit=500000
)
```

## 导出搜索结果\{#export-search-results}

大 TopK 结果没有专用导出 API。您可以组合现有能力，将结果写入 Managed Volume：

```python
import pyarrow as pa
import pyarrow.parquet as pq

writer = None
try:
    for i, qvec in enumerate(query_vectors):
        results = client.search(
            collection_name="corpus",
            data=[qvec],
            limit=100000,
            output_fields=["scenario_id", "title"]
        )

        table = pa.Table.from_pylist([
            {"query_id": i, "rank": j, **r}
            for j, r in enumerate(results)
        ])

        if writer is None:
            writer = pq.ParquetWriter("/tmp/results.parquet", table.schema)
        writer.write_table(table)
finally:
    if writer is not None:
        writer.close()

volume_file_manager.upload_file_to_volume(
    source_file_path="/tmp/results.parquet",
    target_volume_path="results/batch.parquet"
)
```

## 性能预期\{#performance-expectations}

下表汇总了大 TopK 查询的性能特征：

| 指标 | 默认模式 | 大 TopK 模式 |
| --- | --- | --- |
| TopK 上限 | 16,384 | 1,000,000 |
| 小 K 时延 | 毫秒级 | 更高（有退化） |
| 大 K 时延 | 不支持 | 秒级到分钟级 |
| 单次查询内存占用 | 低 | 最高可达数 GB |
| 并发能力 | 高 | 受限（排队） |
| 最佳适用场景 | 在线交互 | 批处理、数据挖掘 |

Zilliz Cloud 会对大 TopK 查询施加并发控制，以防资源耗尽。超过并发阈值的请求会排队，待资源可用后再执行。

## 限制\{#limitations}

- 切换查询模式需要重建向量索引。重建期间该 Collection 搜索不可用。

- 大 TopK 是 Collection 级设置，Collection 上的所有索引都会受到影响。

- 三类集群（Performance-optimized、Capacity-optimized、Tiered Storage）均支持大 TopK。

## 常见问题\{#faq}

**问：我可以频繁来回切换吗？**

技术上可以，但不建议。每次切换都需要 release、删除并重建索引，期间搜索不可用。在按需集群上，每次重建还会产生 Index Build CU 费用。