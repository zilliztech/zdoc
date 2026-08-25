---
title: "IndexType | Cloud"
slug: /cpp/cpp/Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "该枚举用于选择索引算法。调用 `CreateIndex()` 时，请将 `IndexType` 值传递给 `IndexDesc`。可用选项取决于字段的数据类型。 | Cloud"
type: docx
token: FTlxddhTlorM8hxprlsc3RUEnnb
sidebar_position: 12
keywords: 
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - zilliz
  - zilliz cloud
  - cloud
  - IndexType
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# IndexType

该枚举用于选择索引算法。调用 `CreateIndex()` 时，请将 `IndexType` 值传递给 `IndexDesc`。可用选项取决于字段的数据类型。

```c++
enum class IndexType {
    INVALID = 0,
    // Dense float — CPU
    FLAT = 1, IVF_FLAT = 2, IVF_SQ8 = 3, IVF_PQ = 4,
    HNSW = 5, DISKANN = 6, AUTOINDEX = 7, SCANN = 8,
    HNSW_SQ = 9, HNSW_PQ = 10, HNSW_PRQ = 11, IVF_RABITQ = 12,
    // Dense float — GPU
    GPU_IVF_FLAT = 201, GPU_IVF_PQ = 202,
    GPU_BRUTE_FORCE = 203, GPU_CAGRA = 204,
    // Binary vectors
    BIN_FLAT = 1001, BIN_IVF_FLAT = 1002, MINHASH_LSH = 1003,
    // Scalar fields
    TRIE = 1101, STL_SORT = 1102, INVERTED = 1103,
    BITMAP = 1104, NGRAM = 1105,
    // Sparse vectors
    SPARSE_INVERTED_INDEX = 1201, SPARSE_WAND = 1202,
};
```

**取值：**

*稠密浮点向量 — CPU（`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`）：*

- **FLAT** (1) - 暴力精确搜索。召回率 100%，无需训练。最适合小规模数据集（< 1M 向量）。

- **IVF_FLAT** (2) - 倒排文件索引。将向量聚类为 `nlist` 个桶，并搜索最近的 `nprobe` 个桶。额外参数：`nlist`（必填）。

- **IVF_SQ8** (3) - 结合标量量化 (int8) 的 IVF。相比 `IVF_FLAT` 内存占用更低，但召回率略有损失。额外参数：`nlist`（必填）。

- **IVF_PQ** (4) - 结合乘积量化的 IVF。压缩比最高。额外参数：`nlist`、`m`、`nbits`。

- **HNSW** (5) - 分层可导航小世界图。在内存驻留数据集中能实现速度与召回率的最佳平衡。额外参数：`M`（必填）、`efConstruction`（必填）。

- **DISKANN** (6) - 基于磁盘的 ANN 索引，适用于无法完全载入内存的大型数据集。内存占用低且召回率良好。

- **AUTOINDEX** (7) - Milvus 会根据数据自动选择最佳索引类型及参数。推荐快速入门时使用。

- **SCANN** (8) - ScaNN (Scalable Nearest Neighbors) 算法。兼具高召回率与出色的查询速度。

- **HNSW_SQ** (9) - 结合标量量化的 HNSW。相比 `HNSW` 可降低内存占用，且召回率损失极小。

- **HNSW_PQ** (10) - 结合乘积量化的 HNSW。进一步降低内存占用，但会牺牲部分召回率。

- **HNSW_PRQ** (11) - 结合乘积残差量化的 HNSW。在 HNSW 量化变体中召回率最高。

- **IVF_RABITQ** (12) - 结合 RaBitQ 二值量化的 IVF。内存占用极低，召回率具有竞争力。

*稠密浮点向量 — GPU：*

- **GPU_IVF_FLAT** (201) - GPU 加速版 `IVF_FLAT`。需要支持 CUDA 的 NVIDIA GPU。

- **GPU_IVF_PQ** (202) - GPU 加速版 `IVF_PQ`。GPU 端内存占用最低。

- **GPU_BRUTE_FORCE** (203) - GPU 精确暴力搜索。召回率 100%，是 GPU 上小批量查询的最快选项。

- **GPU_CAGRA** (204) - 基于图的 GPU CAGRA 索引。GPU 查询吞吐量最高，最适合大规模 GPU 工作负载。

*二值向量（`BINARY_VECTOR`）：*

- **BIN_FLAT** (1001) - 针对二值向量的暴力精确搜索。

- **BIN_IVF_FLAT** (1002) - 针对二值向量的 IVF 精确搜索。额外参数：`nlist`。

- **MINHASH_LSH** (1003) - 基于 MinHash 的 LSH 索引。专为二值向量的 Jaccard 相似度计算而设计。

*标量字段（INT*、FLOAT、DOUBLE、VARCHAR、BOOL、ARRAY）：*

- **TRIE** (1101) - 前缀树索引。**仅适用于 VARCHAR。**支持前缀过滤，在字符串等值匹配和前缀查询中速度最快。

- **STL_SORT** (1102) - 排序数组索引。**仅适用于数值型标量字段。**最适合低基数数值字段的范围查询。

- **INVERTED** (1103) - 倒排索引。支持除 JSON 外的所有标量类型。作为通用标量索引，其类型覆盖范围最广。

- **BITMAP** (1104) - 位图索引。支持除 JSON、FLOAT 和 DOUBLE 外的所有标量类型。最适合低基数字段（如状态码、类布尔整数）。

- **NGRAM** (1105) - N-gram 索引。**仅适用于 VARCHAR 或 JSON 路径。**支持快速中缀（`LIKE '%keyword%'`）及分词文本搜索。

*稀疏向量（`SPARSE_FLOAT_VECTOR`）：*

- **SPARSE_INVERTED_INDEX** (1201) - 针对稀疏浮点向量的倒排索引。召回率最高，推荐作为稀疏向量的默认索引。

- **SPARSE_WAND** (1202) - 针对稀疏向量的 Weak AND (WAND) 算法。处理大型结果集时速度优于 `SPARSE_INVERTED_INDEX`，但召回率略有损失。

*内部使用：*

- **INVALID** (0) - 未初始化状态，请勿直接使用。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/IndexType.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

// HNSW for float vector (most common choice)
IndexDesc idx_hnsw("vec", "vec_idx", IndexType::HNSW, MetricType::COSINE);
idx_hnsw.AddExtraParam("M", "16");
idx_hnsw.AddExtraParam("efConstruction", "200");

// INVERTED for a VARCHAR scalar field
IndexDesc idx_inv("name", "name_idx", IndexType::INVERTED);

// SPARSE_INVERTED_INDEX for full-text search
IndexDesc idx_sparse("sparse_vec", "sparse_idx",
                     IndexType::SPARSE_INVERTED_INDEX, MetricType::BM25);

client->CreateIndex(
    CreateIndexRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .AddIndex(std::move(idx_hnsw))
        .AddIndex(std::move(idx_inv))
        .AddIndex(std::move(idx_sparse)));
```
