---
title: "为 StructArray Field 创建 Index | BYOC"
slug: /index-struct-array
sidebar_label: "为 StructArray Field 创建 Index"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在运行 Vector Search 或加速 Scalar Filtering 前，请先在 StructArray subfield 上创建 Index。对于 StructArray Field，Index 目标是 `chunks[emblistvector]`、`chunks[emb]` 或 `chunks[section]` 等 subfield path。 | BYOC"
type: origin
token: RjibwxCbFiucxgkldyWcoAgknCc
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 为 StructArray Field 创建 Index

在运行 Vector Search 或加速 Scalar Filtering 前，请先在 StructArray subfield 上创建 Index。对于 StructArray Field，Index 目标是 `chunks[emb_list_vector]`、`chunks[emb]` 或 `chunks[section]` 等 subfield path。

本文使用 [创建 StructArray Field](./create-struct-array) 中的 `tech_articles` Collection。`chunks` StructArray Field 包含用于 Filtering 的 Scalar subfield，以及用于 Search 的 Vector subfield。

## 开始之前 \{#before-you-begin}

确保 Collection Schema 已包含 `chunks` StructArray Field，并且已经插入数据。

| Subfield path | 类型 | Index 用途 |
| --- | --- | --- |
| `chunks[emb_list_vector]` | `FLOAT_VECTOR` | 基于 `MAX_SIM*` metric 的 EmbeddingList Search。 |
| `chunks[emb]` | `FLOAT_VECTOR` | 基于常规 Vector metric 的 Element-level Search。 |
| `chunks[section]` | `VARCHAR` | 分类过滤。 |
| `chunks[quality_score]` | `FLOAT` | 数值过滤和范围类 predicate。 |
| `chunks[has_code]` | `BOOL` | 布尔值过滤。 |

<Admonition type="info" icon="📘" title="说明">

一个 Vector Field 或 Vector subfield 只能接受一个 Index。如果同时需要 EmbeddingList Search 和 Element-level Search，请创建两个独立的 Vector subfield 并分别创建 Index。在本文中，`chunks[emb_list_vector]` 为 EmbeddingList Search 创建 Index，`chunks[emb]` 为 Element-level Search 创建 Index。

</Admonition>

## 选择 Index \{#choose-indexes}

使用搜索模式选择 Vector metric 类型族。

| Search 或 Filter 目标 | 目标路径 | 选择内容 |
| --- | --- | --- |
| EmbeddingList Search | `chunks[emb_list_vector]` | `MAX_SIM*` metric 类型族。 |
| Element-level Vector Search | `chunks[emb]` | 常规 Vector metric 类型族，例如 `COSINE`、`IP` 或 `L2`。 |
| 按字符串或分类过滤 | `chunks[section]` | 目标支持的 Scalar Index。 |
| 按数值范围过滤 | `chunks[quality_score]`、`chunks[page]` | 目标支持的 Scalar Index。 |
| 按布尔值过滤 | `chunks[has_code]` | 目标支持的 Scalar Index。 |

EmbeddingList Search 会把 StructArray Vector subfield 中的 Vector 视为 EmbeddingList，并返回 Entity 级结果。Element-level Search 会独立搜索每个 Struct 元素，并且可以返回匹配元素的偏移量。

## 创建 Vector Index \{#create-vector-indexes}

以下示例创建两个 Vector Index。第一个 Index 为 EmbeddingList Search 使用 `MAX_SIM*` metric。第二个 Index 为 Element-level Search 使用常规 Vector metric。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

index_params = client.prepare_index_params()

# Index for EmbeddingList search.
index_params.add_index(
    field_name="chunks[emb_list_vector]",
    index_name="chunks_emb_list_max_sim",
    index_type="HNSW",
    metric_type="MAX_SIM_COSINE",
    params={
        "M": 16,
        "efConstruction": 200,
    },
)

# Index for element-level search.
index_params.add_index(
    field_name="chunks[emb]",
    index_name="chunks_emb_cosine",
    index_type="HNSW",
    metric_type="COSINE",
    params={
        "M": 16,
        "efConstruction": 200,
    },
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

对 StructArray Vector subfield 使用 `AUTOINDEX`。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="chunks[emb_list_vector]",
    index_name="chunks_emb_list_auto",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE",
)

index_params.add_index(
    field_name="chunks[emb]",
    index_name="chunks_emb_auto",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

<Admonition type="warning" icon="🚧" title="警告">

不要在同一个 Vector subfield 上同时创建 `MAX_SIM*` Index 和常规 Vector-metric Index。如果同时需要两种搜索模式，请将 Vector 写入两个独立的 Vector subfield，并在每个 subfield 上分别创建一个 Index。

</Admonition>

## 创建 Scalar Index \{#create-scalar-indexes}

当你在 Filter 中使用 StructArray Scalar subfield 时，请在这些 subfield 上创建 Scalar Index。使用相同的 `structArray[subfield]` 路径语法。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="chunks[section]",
    index_name="chunks_section_inverted",
    index_type="INVERTED",
)

index_params.add_index(
    field_name="chunks[has_code]",
    index_name="chunks_has_code_inverted",
    index_type="INVERTED",
)

index_params.add_index(
    field_name="chunks[quality_score]",
    index_name="chunks_quality_score_sort",
    index_type="STL_SORT",
)

index_params.add_index(
    field_name="chunks[page]",
    index_name="chunks_page_sort",
    index_type="STL_SORT",
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

对 StructArray Scalar subfield 使用 `AUTOINDEX`。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="chunks[section]",
    index_name="chunks_section_auto",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[has_code]",
    index_name="chunks_has_code_auto",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[quality_score]",
    index_name="chunks_quality_score_auto",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[page]",
    index_name="chunks_page_auto",
    index_type="AUTOINDEX",
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

Scalar Index 是可选的，但当 StructArray Scalar subfield 经常出现在 Filter 中时很有用，例如 `element_filter(chunks, $[quality_score] > 0.9)` 或 `MATCH_ANY(chunks, $[section] == "index")`。

## Index metric 兼容性 \{#index-metric-compatibility}

使用以下表格为 StructArray Vector subfield 选择 Index type 和 metric type。先从目标开始，再根据搜索模式选择 metric 类型族。

从以下兼容性表中选择 Milvus Index type 和 metric type。

### EmbeddingList Search\{#embeddinglist-search}

EmbeddingList Search 使用 `MAX_SIM*` metric。它会把 StructArray Vector subfield 中的 Vector 视为 EmbeddingList，并返回 Entity 级结果。

| Vector subfield data type | Index type | Metric type |
| --- | --- | --- |
| `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR` | `IVF_FLAT`, `IVF_FLAT_CC`, `HNSW`, `HNSW_SQ`, `HNSW_PQ`, `HNSW_PRQ`, `DISKANN` | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2` |
| `INT8_VECTOR` | `HNSW`, `HNSW_SQ`, `HNSW_PQ`, `HNSW_PRQ` | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2` |
| `BINARY_VECTOR` | `HNSW` | `MAX_SIM_HAMMING`, `MAX_SIM_JACCARD` |

### Element-level Search\{#element-level-search}

Element-level Search 使用常规 Vector metric。它会独立搜索每个 Struct 元素，并且可以返回匹配元素的偏移量。

| Vector subfield data type | Index type | Metric type |
| --- | --- | --- |
| `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR` | `FLAT`, `IVF_FLAT`, `IVF_FLAT_CC`, `IVF_SQ8`, `IVF_SQ_CC`, `IVF_PQ`, `SCANN`, `IVF_RABITQ`, `IVF_RABITQ_FASTSCAN`, `HNSW`, `HNSW_SQ`, `HNSW_PQ`, `HNSW_PRQ`, `DISKANN` | `L2`, `IP`, `COSINE` |
| `INT8_VECTOR` | `HNSW`, `HNSW_SQ`, `HNSW_PQ`, `HNSW_PRQ` | `L2`, `IP`, `COSINE` |
| `BINARY_VECTOR` | `HNSW` | `HAMMING`, `JACCARD` |
| `BINARY_VECTOR` | `BIN_FLAT` | `HAMMING`, `JACCARD`, `SUBSTRUCTURE`, `SUPERSTRUCTURE`, `MHJACCARD` |
| `BINARY_VECTOR` | `BIN_IVF_FLAT` | `HAMMING`, `JACCARD` |

对 StructArray Vector subfield 使用 `AUTOINDEX`。根据搜索模式所需的 metric 类型族选择 metric type。

| Search mode | Vector subfield data type | Index type | Metric type |
| --- | --- | --- | --- |
| EmbeddingList Search | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2` |
| EmbeddingList Search | `BINARY_VECTOR` | `AUTOINDEX` | `MAX_SIM_HAMMING`, `MAX_SIM_JACCARD` |
| Element-level Search | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `L2`, `IP`, `COSINE` |
| Element-level Search | `BINARY_VECTOR` | `AUTOINDEX` | `HAMMING`, `JACCARD` |

关于特定版本支持和其他限制，请参阅 [StructArray 限制](./struct-array-limits)。

## 验证 Index \{#verify-indexes}

创建 Index 后，可以 describe Collection 或列出 Index，以确认预期的 subfield path 已创建 Index。

```python
indexes = client.list_indexes(
    collection_name="tech_articles",
)

print(indexes)
```

如果你的 SDK 版本暴露了 Index description API，也可以 describe 某个具体 Index。

```python
index = client.describe_index(
    collection_name="tech_articles",
    index_name="chunks_emb_cosine",
)

print(index)
```

## Index 规则 \{#index-rules}

| 规则 | 说明 |
| --- | --- |
| 对 subfield Index 使用路径语法。 | 创建 `chunks[emb]` 的 Index，而不是 `emb` 或 `chunks.emb`。 |
| 一个 Vector subfield 接受一个 Index。 | 如果需要不同 metric 类型族，请使用独立的 Vector subfield。 |
| 对 EmbeddingList Search 使用 `MAX_SIM*` metric。 | EmbeddingList 查询数据需要使用 `MAX_SIM*` metric 构建的 Index。 |
| 对 Element-level Search 使用常规 Vector metric。 | Element-level Search 使用常规 Vector 查询数据和 `COSINE`、`IP` 或 `L2` 等 metric。 |
| 为出现在 Filter 中的 Scalar subfield 创建 Index。 | 使用目标支持的 Scalar Index type。 |
| 注意 Vector Field 限制。 | Vector Field 和 Vector subfield 的总数有限。在添加多个 Vector subfield 前，请参阅 StructArray 限制。 |

## 常见错误 \{#common-mistakes}

- 在 `chunks.emb` 上创建 Index，而不是 `chunks[emb]`。

- 只创建 `MAX_SIM*` Index，然后尝试在同一 subfield 上运行 Element-level Search。

- 只创建常规 Vector Index，然后尝试在同一 subfield 上运行 EmbeddingList Search。

- 为 `MAX_SIM*` 和常规 Vector metric 复用同一个 Vector subfield。

- 忘记为高频使用的 StructArray Filter 创建 Scalar Index。

- 为 Struct Schema 中不存在的 StructArray subfield 创建 Index。

## 下一步 \{#next-steps}

1. 要运行 Entity 级 EmbeddingList Search 或 Element-level Vector Search，请阅读 [使用 StructArray 进行基础向量搜索](./search-with-struct-array)。

1. 要在 Search 期间过滤 StructArray Scalar subfield，请阅读 [使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays)。

1. 要查看 Index 和 metric 限制，请阅读 [StructArray 限制](./struct-array-limits)。

